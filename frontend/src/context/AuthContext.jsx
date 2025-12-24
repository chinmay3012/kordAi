import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "";

    // Check for existing session on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const headers = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/v1/auth/me`, {
                credentials: 'include',
                headers
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else if (res.status === 401) {
                // If 401, try to refresh
                await refreshAccessToken();
            }
        } catch (err) {
            console.error("Auth check failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch(
            `${API_URL}/api/v1/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login failed");
        }

        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
        }
        if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
        }

        setUser(data.user);
        return data;
    };

    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/api/v1/auth/google`;
    };

    const register = async (email, password) => {
        const res = await fetch(
            `${API_URL}/api/v1/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }

        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
        }
        if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
        }

        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const headers = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            await fetch(
                `${API_URL}/api/v1/auth/logout`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers
                }
            );
        } catch (err) {
            console.error("Logout request failed:", err);
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    };

    const refreshAccessToken = async () => {
        try {
            const rfToken = localStorage.getItem("refreshToken");
            const res = await fetch(
                `${API_URL}/api/v1/auth/refresh`,
                {
                    method: "POST",
                    credentials: 'include',
                    headers: rfToken ? { "Authorization": `Bearer ${rfToken}` } : {}
                }
            );

            if (!res.ok) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setUser(null);
                return false;
            }

            const data = await res.json();
            if (data.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
            }
            return true;
        } catch (err) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
            return false;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshAccessToken,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
