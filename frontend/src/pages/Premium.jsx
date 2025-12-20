import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function Premium() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "/ forever",
            features: [
                { name: "Daily Matches", value: "10 per day", included: true },
                { name: "Founder Details", value: "YC Jobs Only", included: true },
                { name: "Email Tracker", value: "Basic", included: true },
                { name: "Resume Storage", value: "1 Resume", included: true },
                { name: "AI Optimization", value: "No", included: false },
                { name: "Priority Support", value: "No", included: false },
            ],
            button: "Current Plan",
            featured: false
        },
        {
            name: "Founder Pro",
            price: "$19",
            period: "/ month",
            description: "Everything you need to land your next big role.",
            features: [
                { name: "Daily Matches", value: "Unlimited", included: true },
                { name: "Founder Details", value: "All Jobs", included: true },
                { name: "Email Tracker", value: "Advanced (Open Track)", included: true },
                { name: "Resume Storage", value: "Unlimited Versions", included: true },
                { name: "AI Optimization", value: "Unlimited", included: true },
                { name: "Priority Support", value: "Yes", included: true },
            ],
            button: "Upgrade to Pro",
            featured: true
        }
    ];

    const testimonials = [
        {
            name: "Sarah Chen",
            role: "Product Manager @ Linear",
            text: "The direct founder contact was a game changer. I got interviews at 3 YC companies in the first week.",
            avatar: "👤"
        },
        {
            name: "Marc Andre",
            role: "Engineering Lead @ Vercel",
            text: "Best resume optimization tool I've used. It actually understood the nuances of technical roles.",
            avatar: "👤"
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Premium Access
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                            Land your dream role at a <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">top startup</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                            Unlock exclusive data, founder direct lines, and AI-powered tools designed for high-signal candidates.
                        </p>
                    </div>
                </section>

                {/* Pricing Plan */}
                <section className="max-w-6xl mx-auto px-6 -mt-10 mb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                        {plans.map((plan, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={plan.name}
                                className={`relative p-8 rounded-[2rem] border-2 flex flex-col ${plan.featured
                                        ? "border-indigo-600 shadow-2xl shadow-indigo-100 bg-white"
                                        : "border-gray-100 bg-gray-50"
                                    }`}
                            >
                                {plan.featured && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                                        Recommended
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                                        <span className="text-gray-500 font-medium">{plan.period}</span>
                                    </div>
                                    {plan.description && <p className="mt-4 text-gray-600 text-sm leading-relaxed">{plan.description}</p>}
                                </div>

                                <div className="flex-1 space-y-6 mb-10">
                                    {plan.features.map((feature, fidx) => (
                                        <div key={fidx} className="flex items-center justify-between">
                                            <span className={`text-sm ${feature.included ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                                                {feature.name}
                                            </span>
                                            <span className={`text-sm ${feature.included ? 'text-indigo-600 font-bold' : 'text-gray-300'}`}>
                                                {feature.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${plan.featured
                                        ? "bg-black text-white hover:bg-gray-800 hover:scale-[1.02] shadow-indigo-100"
                                        : "bg-white text-gray-400 border border-gray-200 cursor-not-allowed"
                                    }`}>
                                    {plan.button}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Benefits Comparison Table */}
                <section className="bg-gray-50 py-24 px-6 border-y border-gray-100">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Features</h2>
                            <p className="text-gray-500">See exactly why Pro is the right choice for serious builders.</p>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Feature</th>
                                        <th className="p-6 text-xs font-bold text-gray-900 uppercase tracking-widest text-center">Free</th>
                                        <th className="p-6 text-xs font-bold text-indigo-600 uppercase tracking-widest text-center">Pro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[
                                        ["Unlimited Job Swiping", "✕", "✓"],
                                        ["Direct Founder Emails", "YC Only", "Included"],
                                        ["AI Resume Optimization", "Limited", "Unlimited"],
                                        ["Email Open Tracking", "✕", "Included"],
                                        ["Premium Batch Exclusives", "✕", "✓"],
                                        ["Daily Analytics Report", "✕", "✓"],
                                    ].map((row, ridx) => (
                                        <tr key={ridx} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="p-6 text-sm font-medium text-gray-700">{row[0]}</td>
                                            <td className="p-6 text-sm text-gray-400 text-center">{row[1]}</td>
                                            <td className="p-6 text-sm font-bold text-indigo-600 text-center">{row[2]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {testimonials.map((t, idx) => (
                                <div key={idx} className="bg-gray-50 p-10 rounded-[2.5rem] relative">
                                    <div className="text-5xl text-indigo-200 absolute top-6 right-10 opacity-50 font-serif">"</div>
                                    <p className="text-lg text-gray-800 leading-relaxed italic mb-8 relative z-10">
                                        {t.text}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-gray-100">{t.avatar}</div>
                                        <div>
                                            <p className="font-bold text-gray-900">{t.name}</p>
                                            <p className="text-sm text-gray-500">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 px-6 bg-black text-white text-center">
                    <h2 className="text-4xl font-extrabold mb-8">Ready to skip the queue?</h2>
                    <button className="px-10 py-5 bg-white text-black font-extrabold rounded-2xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                        Upgrade to Premium Now
                    </button>
                    <p className="mt-6 text-gray-400 text-sm">Join 2,500+ candidates already scaling their careers.</p>
                </section>
            </main>
        </div>
    );
}
