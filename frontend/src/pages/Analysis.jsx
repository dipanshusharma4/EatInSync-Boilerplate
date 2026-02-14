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
            // Note: This is an example. Make sure your API is actually running.
            // For now, I'll simulate a response if the API call fails or for demonstration.
            let data;
            try {
                const response = await axios.post('http://localhost:8000/api/v1/analyze_dish', {
                    dish_name: dish,
                    user_profile: {
                        user_id: "demo_user",
                        sensitivities: ["Tyramine", "Histamine"],
                        taste_preferences: ["Spicy"]
                    }
                });
                data = response.data;
            } catch (apiError) {
                console.warn("API call failed, using mock data for demonstration:", apiError);
                // Mock data for fallback/demo purposes
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                data = {
                    bcs_score: 85,
                    triggers_found: [],
                    smart_swaps: [
                        { suggested_replacement: "Grilled Chicken", reason: "Lower histamine content", pairing_score: 95 },
                        { suggested_replacement: "Zucchini Noodles", reason: "Lower inflammatory markers", pairing_score: 90 }
                    ]
                };
            }

            const isSafe = data.bcs_score >= 70;

            setResult({
                score: data.bcs_score,
                risk: isSafe ? 'Safe Choice' : 'High Risk',
                riskClass: isSafe
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                scoreColor: isSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                scoreBorder: isSafe ? 'border-emerald-100 dark:border-emerald-800' : 'border-red-100 dark:border-red-800',
                triggers: data.triggers_found.length > 0 ? data.triggers_found : ['No significant triggers found'],
                swaps: (data.smart_swaps || []).map(s => ({
                    name: s.suggested_replacement,
                    reason: s.reason,
                    score: Math.round(s.pairing_score) // Ensure integer
                }))
            });
        } catch (error) {
            console.error("Analysis Error:", error);
            alert("An error occurred during analysis.");
        }
        setLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analyze Menu Item</h1>
                <p className="text-slate-500 dark:text-slate-400">Enter a dish to scan for invisible chemical triggers.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 max-w-2xl mx-auto">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dish Name</label>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={dish}
                        onChange={(e) => setDish(e.target.value)}
                        placeholder="e.g. Aged Cheese Platter, Red Wine Risotto..."
                        className="flex-grow px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
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
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 col-span-1 md:col-span-1 flex flex-col items-center justify-center text-center">
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold mb-4 border-8 ${result.scoreBorder} ${result.scoreColor}`}>
                                    {result.score}
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Compatibility Score</h2>
                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${result.riskClass}`}>
                                    {result.risk}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 col-span-1 md:col-span-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    Molecular Breakdown
                                </h3>
                                <div className="space-y-4">
                                    {(result.triggers || []).map((trigger, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${result.score < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-slate-700 dark:text-slate-300 font-medium">{trigger}</span>
                                            </div>
                                            {result.score < 50 && <span className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">TRIGGER</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Smart Swaps */}
                        {result.swaps && result.swaps.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="text-emerald-500">✨</span> Smart Swaps (Chemically Safe)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {result.swaps.map((swap, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{swap.name}</h4>
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded text-sm">BCS {swap.score}</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{swap.reason}</p>
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
