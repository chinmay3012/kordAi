import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/");
        setShowDropdown(false);
    };

    // Check if we're on a public page (home, login, signup, activate)
    const isPublicPage = ["/", "/login", "/signup", "/activate"].includes(
        location.pathname
    );

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <h1 className="text-2xl font-semibold tracking-tight">
                    <Link to="/" className="hover:opacity-80 transition">
                        Kord AI
                    </Link>
                </h1>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            {/* Navigation Links (when logged in) */}
                            <nav className="hidden md:flex items-center gap-6 mr-4">
                                <Link
                                    to="/app"
                                    className={`text-sm transition ${location.pathname === "/app"
                                            ? "text-black font-medium"
                                            : "text-gray-600 hover:text-black"
                                        }`}
                                >
                                    Jobs
                                </Link>
                                <Link
                                    to="/saved"
                                    className={`text-sm transition ${location.pathname === "/saved"
                                            ? "text-black font-medium"
                                            : "text-gray-600 hover:text-black"
                                        }`}
                                >
                                    Saved
                                </Link>
                            </nav>

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                                >
                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {user?.email?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span className="hidden sm:block max-w-[120px] truncate">
                                        {user?.email || "User"}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user?.email}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Free Plan
                                                </p>
                                            </div>

                                            <Link
                                                to="/app"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 md:hidden"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Jobs
                                            </Link>

                                            <Link
                                                to="/saved"
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 md:hidden"
                                                onClick={() => setShowDropdown(false)}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                                Saved Jobs
                                            </Link>

                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Not logged in */}
                            {!isPublicPage && (
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-600 hover:text-black transition"
                                >
                                    Login
                                </Link>
                            )}
                            {location.pathname !== "/signup" && (
                                <Link
                                    to={location.pathname === "/login" ? "/signup" : "/login"}
                                    className="text-sm px-5 py-2 rounded-full bg-black text-white hover:opacity-90 transition"
                                >
                                    {location.pathname === "/login" ? "Sign up" : "Get started"}
                                </Link>
                            )}
                            {location.pathname === "/signup" && (
                                <Link
                                    to="/login"
                                    className="text-sm px-5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                                >
                                    Login
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
