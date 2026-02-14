import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const Analysis = () => {
    const [dish, setDish] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleAnalyze = async () => {
        setLoading(true)
        // Simulating API call for demonstration. Real backend integration would trigger here.
        try {
            const response = await axios.post('http://localhost:8000/api/v1/analyze_dish', {
                dish_name: dish,
                user_profile: {
                    user_id: "demo_user",
                    sensitivities: ["Tyramine", "Histamine"],
                    taste_preferences: ["Spicy"]
                }
            });

            const data = response.data;
            const isSafe = data.bcs_score >= 70;

            setResult({
                score: data.bcs_score,
                risk: isSafe ? 'Safe Choice' : 'High Risk',
                riskClass: isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800',
                scoreColor: isSafe ? 'text-emerald-600' : 'text-red-600',
                scoreBorder: isSafe ? 'border-emerald-100' : 'border-red-100',
                triggers: data.triggers_found.length > 0 ? data.triggers_found : ['No significant triggers found'],
                swaps: data.smart_swaps.map(s => ({
                    name: s.suggested_replacement,
                    reason: s.reason,
                    score: Math.round(s.pairing_score) // Ensure integer
                }))
            });
        } catch (error) {
            console.error("Analysis Error:", error);
            alert("Backend connection failed. Is the server running?");
        }
        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Analyze Menu Item</h1>
                <p className="text-slate-500">Enter a dish to scan for invisible chemical triggers.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl mx-auto">
                <label className="block text-sm font-medium text-slate-700 mb-2">Dish Name</label>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={dish}
                        onChange={(e) => setDish(e.target.value)}
                        placeholder="e.g. Aged Cheese Platter, Red Wine Risotto..."
                        className="flex-grow px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={!dish || loading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Scanning...
                            </span>
                        ) : 'Analyze'}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Score Card Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 col-span-1 md:col-span-1 flex flex-col items-center justify-center text-center">
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold mb-4 border-8 ${result.scoreBorder} ${result.scoreColor}`}>
                                    {result.score}
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 mb-1">Compatibility Score</h2>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${result.riskClass}`}>
                                    {result.risk}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 col-span-1 md:col-span-2">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    Molecular Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {result.triggers.map((trigger, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${result.score < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-slate-700 font-medium">{trigger}</span>
                                            </div>
                                            {result.score < 50 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">TRIGGER</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Smart Swaps */}
                        {result.swaps.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-emerald-500">✨</span> Smart Swaps (Chemically Safe)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.swaps.map((swap, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors group cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">{swap.name}</h4>
                                                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-sm">BCS {swap.score}</span>
                                            </div>
                                            <p className="text-slate-500 text-sm leading-relaxed">{swap.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Analysis
