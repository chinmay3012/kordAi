import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || "";

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                await checkAuth(token);
            } else {
                await checkAuth(); // Try cookies
            }
        };
        checkSession();
    }, []);

    const checkAuth = async (token = null) => {
        try {
            const headers = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/api/v1/auth/me`, {
                headers,
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                }
                setUser(data.user);
            } else {
                localStorage.removeItem("token");
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
            localStorage.setItem("token", data.accessToken);
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
            localStorage.setItem("token", data.accessToken);
        }
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await fetch(
                `${API_URL}/api/v1/auth/logout`,
                {
                    method: "POST",
                    credentials: 'include',
                }
            );
        } catch (err) {
            console.error("Logout request failed:", err);
        }

        localStorage.removeItem("token");
        setUser(null);
    };

    const refreshAccessToken = async () => {
        const currentToken = localStorage.getItem("token");
        const res = await fetch(
            `${API_URL}/api/v1/auth/refresh`,
            {
                method: "POST",
                headers: currentToken ? { "Authorization": `Bearer ${currentToken}` } : {},
                credentials: 'include',
            }
        );

        if (!res.ok) {
            localStorage.removeItem("token");
            setUser(null);
            throw new Error("Session expired");
        }

        const data = await res.json();
        if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
        }
        return true;
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
