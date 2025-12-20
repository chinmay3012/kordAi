import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing tokens on mount
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userEmail = localStorage.getItem("userEmail");

        if (accessToken && refreshToken) {
            setUser({ email: userEmail, accessToken, refreshToken });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login failed");
        }

        // Store tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("userEmail", email);

        setUser({ email, accessToken: data.accessToken, refreshToken: data.refreshToken });
        return data;
    };

    const register = async (email, password) => {
        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Registration failed");
        }

        return data;
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        try {
            await fetch(
                `${import.meta.env.VITE_API_URL}/api/v1/auth/logout`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                }
            );
        } catch (err) {
            console.error("Logout request failed:", err);
        }

        // Clear local storage regardless
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        setUser(null);
    };

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            throw new Error("No refresh token");
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            // Refresh token expired - logout
            await logout();
            throw new Error("Session expired");
        }

        localStorage.setItem("accessToken", data.accessToken);
        setUser(prev => ({ ...prev, accessToken: data.accessToken }));
        return data.accessToken;
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshAccessToken,
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
