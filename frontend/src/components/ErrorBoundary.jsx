import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}>
                    <h1 style={{ color: "#e11d48" }}>Something went wrong.</h1>
                    <p style={{ color: "#555" }}>
                        The application crashed. Check the console for more details.
                    </p>
                    <div style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#f9fafb",
                        borderRadius: "0.5rem",
                        textAlign: "left",
                        overflow: "auto",
                        maxHeight: "300px",
                        border: "1px solid #e5e7eb"
                    }}>
                        <p style={{ fontWeight: "bold", color: "#374151" }}>{this.state.error && this.state.error.toString()}</p>
                        <pre style={{ fontSize: "0.80rem", color: "#6b7280" }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: "1.5rem",
                            padding: "0.5rem 1rem",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            borderRadius: "0.25rem",
                            cursor: "pointer"
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
