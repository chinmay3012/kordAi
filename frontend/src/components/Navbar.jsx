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
    setShowDropdown(false);
    navigate("/");
  };

  const isAuthPage = ["/login", "/signup", "/activate"].includes(
    location.pathname
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-semibold tracking-tight hover:opacity-80 transition"
        >
          Kord AI
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <Link
                  to="/app"
                  className={`text-sm transition ${
                    location.pathname === "/app"
                      ? "text-black font-medium"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Jobs
                </Link>
                <Link
                  to="/saved"
                  className={`text-sm transition ${
                    location.pathname === "/saved"
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
                  onClick={() => setShowDropdown((v) => !v)}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {user?.email}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showDropdown ? "rotate-180" : ""
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

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Free Plan
                        </p>
                      </div>

                      <Link
                        to="/app"
                        onClick={() => setShowDropdown(false)}
                        className="md:hidden block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Jobs
                      </Link>

                      <Link
                        to="/saved"
                        onClick={() => setShowDropdown(false)}
                        className="md:hidden block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Saved Jobs
                      </Link>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                        >
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
              {/* Public CTA */}
              <div className="flex items-center gap-3">
                {!isAuthPage && (
                  <Link
                    to="/login"
                    className="text-sm px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Login
                  </Link>
                )}

                <Link
                  to="/#waitlist"
                  className="text-sm px-5 py-2 rounded-full bg-black text-white hover:opacity-90 transition"
                >
                  Join Waitlist
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
