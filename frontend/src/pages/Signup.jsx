import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            await register(email, password);
            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        <Link to="/" className="hover:opacity-80 transition">
                            Kord AI
                        </Link>
                    </h1>
                    <Link
                        to="/login"
                        className="text-sm px-5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                    >
                        Login
                    </Link>
                </div>
            </header>

            {/* Signup Form */}
            <div className="flex items-center justify-center px-6 py-20">
                <div className="w-full max-w-md">
                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-semibold tracking-tight">
                                    Create your account
                                </h2>
                                <p className="mt-3 text-gray-600">
                                    Join thousands of job seekers using Kord AI
                                </p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Must be at least 6 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Creating account...
                                        </span>
                                    ) : (
                                        "Create account"
                                    )}
                                </button>

                                <p className="text-center text-sm text-gray-600 mt-6">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="text-black font-medium hover:underline"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-center text-xs text-gray-500">
                                    By creating an account, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">
                                Account created successfully! 🎉
                            </h3>
                            <p className="text-gray-600">
                                Redirecting you to login...
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t py-8 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Kord AI
            </footer>
        </div>
    );
}
