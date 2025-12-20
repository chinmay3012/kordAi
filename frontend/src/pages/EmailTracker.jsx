import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function EmailTracker() {
    const { user } = useAuth();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data for initial UI display if backend is empty
    const mockTracks = [
        {
            _id: "1",
            companyName: "TechFlow",
            position: "Full Stack Engineer",
            founderEmail: "founder@techflow.io",
            status: "opened",
            sentAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            _id: "2",
            companyName: "Nexus AI",
            position: "Product Designer",
            founderEmail: "ceo@nexus.ai",
            status: "sent",
            sentAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
            _id: "3",
            companyName: "CloudScale",
            position: "Frontend Developer",
            founderEmail: "cto@cloudscale.com",
            status: "replied",
            sentAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    useEffect(() => {
        // In a real app, we'd fetch from API
        // fetch('/api/v1/email-tracker').then(...)
        setTimeout(() => {
            setTracks(mockTracks);
            setLoading(false);
        }, 800);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "sent": return "bg-blue-100 text-blue-700";
            case "opened": return "bg-yellow-100 text-yellow-700";
            case "replied": return "bg-green-100 text-green-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Email Tracker</h1>
                    <p className="text-gray-500 mt-2">Monitor your outreach to startup founders.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tracks.map((track) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={track._id}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                                        🏢
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getStatusColor(track.status)}`}>
                                        {track.status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 truncate">{track.companyName}</h3>
                                <p className="text-sm text-gray-500 font-medium mb-4 truncate">{track.position}</p>

                                <div className="space-y-3 pb-4 border-b border-gray-50 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-gray-400">📧</span>
                                        <span className="truncate">{track.founderEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="text-gray-400">📅</span>
                                        <span>{new Date(track.sentAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 text-xs font-bold bg-black text-white rounded-lg hover:opacity-90 transition">
                                        View Details
                                    </button>
                                    <button className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                        🔗
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && tracks.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-4">📉</div>
                        <p className="text-gray-500">No emails tracked yet. Start applying to jobs!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
