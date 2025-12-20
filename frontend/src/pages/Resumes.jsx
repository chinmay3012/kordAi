import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Resumes() {
    const { user } = useAuth();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBuilder, setShowBuilder] = useState(false);

    // Mock data
    const mockResumes = [
        {
            _id: "1",
            name: "Standard Resume",
            version: "2.1",
            isPrimary: true,
            createdAt: new Date(Date.now() - 604800000).toISOString()
        },
        {
            _id: "2",
            name: "Startup Focused",
            version: "1.0",
            isPrimary: false,
            createdAt: new Date(Date.now() - 2592000000).toISOString()
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setResumes(mockResumes);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
                        <p className="text-gray-500 mt-2">Manage and optimize your professional profiles.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white border border-gray-200 text-sm font-bold rounded-2xl hover:bg-gray-50 transition shadow-sm">
                            Upload PDF
                        </button>
                        <button
                            onClick={() => setShowBuilder(true)}
                            className="px-6 py-3 bg-black text-white text-sm font-bold rounded-2xl hover:opacity-90 transition shadow-lg"
                        >
                            Build Resume
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-black transition-colors cursor-pointer group">
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                            <p className="font-bold text-gray-900">Add New</p>
                            <p className="text-xs text-gray-500 mt-1">Upload or Create</p>
                        </div>

                        {resumes.map((resume) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={resume._id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group"
                            >
                                <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center relative">
                                    <div className="text-5xl opacity-20 group-hover:opacity-40 transition-opacity">📝</div>
                                    {resume.isPrimary && (
                                        <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                                            Active
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform">👁️</button>
                                        <button className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform">⚙️</button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 truncate">{resume.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] font-bold text-gray-400">v{resume.version}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(resume.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {showBuilder && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowBuilder(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden relative z-10 flex flex-col shadow-2xl"
                            >
                                <div className="p-6 border-b flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Resume Builder</h2>
                                    <button onClick={() => setShowBuilder(false)} className="text-gray-400 hover:text-black">✕</button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-12 bg-gray-100/50 flex flex-col md:flex-row gap-8">
                                    {/* Form Editor */}
                                    <div className="flex-1 space-y-6">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Personal Info</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-600">Full Name</label>
                                                    <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" placeholder="John Doe" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-600">Job Title</label>
                                                    <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" placeholder="Software Engineer" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Experience</h3>
                                            <textarea className="w-full h-32 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" placeholder="Describe your experience..."></textarea>
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="flex-1 hidden lg:block">
                                        <div className="w-full aspect-[1/1.4] bg-white shadow-2xl p-10 flex flex-col gap-6 sticky top-0 scale-90 origin-top">
                                            <header className="border-b-2 border-black pb-4 text-center">
                                                <h1 className="text-2xl font-black uppercase tracking-tighter">John Doe</h1>
                                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Software Engineer</p>
                                            </header>
                                            <section className="space-y-4">
                                                <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block">Experience</h2>
                                                <div className="space-y-2">
                                                    <div className="h-2.5 bg-gray-100 w-full rounded"></div>
                                                    <div className="h-2.5 bg-gray-100 w-full rounded"></div>
                                                    <div className="h-2.5 bg-gray-100 w-3/4 rounded"></div>
                                                </div>
                                            </section>
                                            <div className="flex justify-center flex-1 items-end italic text-[10px] text-gray-300">
                                                Kord AI Builder Interface
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t flex justify-end gap-3">
                                    <button className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-black transition">Save Draft</button>
                                    <button className="px-6 py-2 text-sm font-bold bg-black text-white rounded-xl hover:opacity-90 transition">Download PDF</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
