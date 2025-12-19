import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadResume, completeOnboarding } from "../api/jobs";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [resumeAnalysis, setResumeAnalysis] = useState(null);

    // Form State
    const [selections, setSelections] = useState({
        objectives: [],
        positionType: "",
        roleInterests: [],
        experienceYears: "",
    });

    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleNext = () => {
        if (validateStep()) {
            setStep((s) => s + 1);
            setError("");
        }
    };

    const handleBack = () => {
        setStep((s) => s - 1);
        setError("");
    };

    const validateStep = () => {
        if (step === 1 && selections.objectives.length === 0) {
            setError("Please select at least one objective.");
            return false;
        }
        if (step === 2 && !selections.positionType) {
            setError("Please select a position type.");
            return false;
        }
        if (step === 3 && selections.roleInterests.length === 0) {
            setError("Please select at least one role.");
            return false;
        }
        if (step === 4 && !selections.experienceYears) {
            setError("Please select your experience level.");
            return false;
        }
        return true;
    };

    const toggleMultiSelect = (key, value) => {
        setSelections((prev) => {
            const current = prev[key];
            const updated = current.includes(value)
                ? current.filter((i) => i !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(file.type)) {
            setError("Please upload a PDF, DOCX, or TXT file.");
            return;
        }

        setUploadedFile(file);
        setLoading(true);
        setError("");

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(",")[1];
                const res = await uploadResume(base64, file.name, file.type);
                setResumeAnalysis(res.data.analysis);
                setLoading(false);
                // Automatically go to step 7 after processing
                setStep(7);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error(err);
            setError("Failed to process resume. Please try again.");
            setLoading(false);
        }
    };

    const finalizeOnboarding = async () => {
        setLoading(true);
        try {
            await completeOnboarding({
                onboarding: {
                    objectives: selections.objectives,
                    positionType: selections.positionType.toLowerCase(),
                    roleInterests: selections.roleInterests,
                    yearsOfExperience: selections.experienceYears,
                },
                preferences: {
                    skills: resumeAnalysis?.skills || [],
                    desiredRoles: selections.roleInterests,
                    experienceLevel: resumeAnalysis?.experienceLevel || mapExpToLevel(selections.experienceYears),
                },
                finalize: true
            });
            navigate("/app");
        } catch (err) {
            console.error(err);
            setError("Failed to save your profile.");
            setLoading(false);
        }
    };

    const mapExpToLevel = (years) => {
        if (years === "0") return "entry";
        if (years === "1-2") return "entry";
        if (years === "3-5") return "mid";
        if (years === "5-10") return "senior";
        if (years === "10+") return "executive";
        return "mid";
    };

    if (authLoading) return null;

    const progressPercentage = (step / 7) * 100;

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
                <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="max-w-3xl mx-auto w-full px-6 pt-16 pb-12 flex-1 flex flex-col">
                <div className="mb-8 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-400">Step {step} of 7</span>
                    {step > 1 && step < 7 && (
                        <button
                            onClick={handleBack}
                            className="text-sm font-medium text-gray-500 hover:text-black transition flex items-center gap-1"
                        >
                            ← Back
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                    >
                        {/* STEP 1: WELCOME / OBJECTIVES */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">What brings you to Kord?</h1>
                                    <p className="text-xl text-gray-500">Select all that apply to help us personalize your feed.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {["Find my next internship", "Work at a Startup", "Transition to AI", "Remote opportunities", "High-growth companies", "Leadership roles"].map((obj) => (
                                        <button
                                            key={obj}
                                            onClick={() => toggleMultiSelect("objectives", obj)}
                                            className={`p-6 text-left rounded-2xl border-2 transition-all ${selections.objectives.includes(obj)
                                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                    : "border-gray-100 hover:border-gray-300 bg-white"
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-medium">{obj}</span>
                                                {selections.objectives.includes(obj) && (
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: POSITION TYPE */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Preferred position type</h1>
                                    <p className="text-xl text-gray-500">Choose the type of role that fits your current needs.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: "full-time", label: "Full-Time", desc: "Standard 40h/week career path roles" },
                                        { id: "part-time", label: "Part-Time", desc: "Flexible hours, lower time commitment" },
                                        { id: "internship", label: "Internship", desc: "Learning focused, usually 3-6 months" },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelections({ ...selections, positionType: type.label })}
                                            className={`p-6 text-left rounded-2xl border-2 transition-all ${selections.positionType === type.label
                                                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                    : "border-gray-100 hover:border-gray-300 bg-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selections.positionType === type.label ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                                                    {selections.positionType === type.label && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="text-lg font-bold block">{type.label}</span>
                                                    <span className="text-gray-500 text-sm">{type.desc}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: ROLE INTERESTS */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Roles you're interested in</h1>
                                    <p className="text-xl text-gray-500">Pick at least one role to jumpstart your matches.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        "Product Manager", "Software Engineer", "AI Engineer", "Data Scientist",
                                        "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
                                        "Product Designer", "Marketing Lead", "Sales Executive", "Operations Manager"
                                    ].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => toggleMultiSelect("roleInterests", role)}
                                            className={`p-4 text-center rounded-xl border-2 transition-all text-sm font-medium ${selections.roleInterests.includes(role)
                                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                                    : "border-gray-100 hover:border-gray-200 bg-white text-gray-600"
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: EXPERIENCE */}
                        {step === 4 && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Years of experience</h1>
                                    <p className="text-xl text-gray-500">This helps us match the seniority level of jobs.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {["0", "1-2", "3-5", "5-10", "10+"].map((exp) => (
                                        <button
                                            key={exp}
                                            onClick={() => setSelections({ ...selections, experienceYears: exp })}
                                            className={`p-8 text-center rounded-2xl border-2 transition-all ${selections.experienceYears === exp
                                                    ? "border-blue-600 bg-blue-50 shadow-sm"
                                                    : "border-gray-100 hover:border-gray-300 bg-white"
                                                }`}
                                        >
                                            <span className="text-2xl font-bold">{exp}</span>
                                            <span className="block text-gray-500 text-sm mt-1">{exp === "0" ? "No experience" : "Years"}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: VALUE PROP */}
                        {step === 5 && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">How Kord works</h1>
                                    <p className="text-xl text-gray-500">We don't just find jobs; we get you interviews.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Automated Outreach</h3>
                                        <p className="opacity-90">Kord identifies founder emails and drafts personalized reaching-out messages so you don't have to.</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-sm">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-4xl font-bold text-gray-300">2%</div>
                                                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mt-1">Traditional</div>
                                            </div>
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full relative overflow-hidden">
                                                <motion.div
                                                    className="absolute left-0 top-0 h-full bg-blue-600"
                                                    initial={{ width: "2%" }}
                                                    animate={{ width: "25%" }}
                                                    transition={{ duration: 2, delay: 0.5 }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <div className="text-4xl font-bold text-blue-600">25%</div>
                                                <div className="text-xs text-blue-400 uppercase tracking-wider font-bold mt-1">Kord AI</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 mt-6 text-center italic">"Direct outreach to founders boosts reply rates by up to 12x compared to job boards."</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: RESUME UPLOAD */}
                        {step === 6 && (
                            <div className="space-y-8">
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Finally, your resume</h1>
                                    <p className="text-xl text-gray-500">We'll use this to build your AI profile and match skills.</p>
                                </div>

                                <div
                                    onClick={() => !loading && fileInputRef.current?.click()}
                                    className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${loading ? "bg-gray-50 border-gray-200" : "hover:bg-blue-50/30 border-gray-200 hover:border-blue-400"
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFile}
                                        className="hidden"
                                        accept=".pdf,.docx,.txt"
                                    />
                                    {loading ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                            <p className="font-bold text-xl">Analyzing your potential...</p>
                                            <p className="text-gray-400">This usually takes about 30 seconds. Don't close this window.</p>
                                        </div>
                                    ) : uploadedFile ? (
                                        <div className="space-y-2">
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="font-bold text-lg">{uploadedFile.name}</p>
                                            <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </div>
                                            <p className="text-xl font-bold">Tap to upload your resume</p>
                                            <p className="text-gray-400">Supports PDF, Word, and TXT</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                    <span className="text-2xl">💡</span>
                                    <p className="text-sm text-amber-800">
                                        <strong>Note:</strong> We store your resume securely so you can access it from any device. Our AI scans for keywords to give you a 10x better match rate.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 7: COMPLETION */}
                        {step === 7 && (
                            <div className="space-y-8 flex flex-col items-center justify-center text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200"
                                >
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 tracking-tight">You're all set!</h1>
                                    <p className="text-xl text-gray-500 max-w-md mx-auto">
                                        We've curated the best {selections.roleInterests[0] || "startup"} roles for you based on your background.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 w-full mt-8">
                                    <button
                                        onClick={finalizeOnboarding}
                                        className="p-8 bg-blue-600 text-white rounded-3xl font-bold text-xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-between group"
                                    >
                                        <span>View your matches</span>
                                        <span className="group-hover:translate-x-1 transition">→</span>
                                    </button>
                                    <button
                                        onClick={() => navigate("/app")}
                                        className="p-6 bg-white border-2 border-gray-100 rounded-3xl font-bold text-gray-600 hover:border-gray-300 transition"
                                    >
                                        Go to dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Actions */}
                {step < 7 && step !== 6 && (
                    <div className="mt-12">
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm font-medium mb-4 text-center"
                            >
                                {error}
                            </motion.p>
                        )}
                        <button
                            onClick={handleNext}
                            className="w-full py-6 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                        >
                            Continue
                        </button>
                        <p className="text-center text-gray-400 text-sm mt-4">Press Enter to continue</p>
                    </div>
                )}
            </div>
        </div>
    );
}
