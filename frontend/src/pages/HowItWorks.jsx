import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HowItWorks = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 mb-6">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold tracking-wide uppercase">The Science</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">How EatInSync Works</h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    We use advanced molecular parsing to understand food beyond just calories and macros.
                </p>
            </motion.div>

            <div className="space-y-24">
                {/* Step 1 */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row gap-12 items-center"
                >
                    <div className="flex-1">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center mb-6 text-3xl">🧬</div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Molecular Decomposition</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            When you input a recipe, our engine breaks down each ingredient into its constituent chemical compounds. We look for specific triggers like Tyramine, Histamine, and other bioactive amines that often cause adverse reactions but are invisible on standard nutrition labels.
                        </p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center gap-4">
                                <span className="text-2xl">🧀</span>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">Aged Cheese</div>
                                    <div className="text-sm text-red-500 font-medium">Contains: Tyramine</div>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center gap-4">
                                <span className="text-2xl">🍷</span>
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">Red Wine</div>
                                    <div className="text-sm text-red-500 font-medium">Contains: Histamine</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row-reverse gap-12 items-center"
                >
                    <div className="flex-1">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-6 text-3xl">📊</div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Bio-Compatibility Scoring</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            We calculate a personalized score from 0-100 based on your unique sensitivity profile. A high score means the meal is chemically safe for you, while a low score indicates potential triggers. This isn't just about allergies—it's about how your body metabolizes specific compounds.
                        </p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#e2e8f0"
                                    className="dark:stroke-slate-700"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    strokeDasharray="85, 100"
                                />
                                <text x="18" y="20.35" className="text-3xl font-bold fill-slate-900 dark:fill-white" textAnchor="middle">85</text>
                            </svg>
                            <div className="text-center mt-2 font-medium text-emerald-600 dark:text-emerald-400">Excellent Match</div>
                        </div>
                    </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row gap-12 items-center"
                >
                    <div className="flex-1">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-6 text-3xl">✨</div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Smart Swaps & Optimization</h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            If a recipe scores low, we don't just tell you "don't eat it." We provide molecularly similar ingredient swaps that preserve the flavor profile but remove the chemical triggers. Enjoy your favorite meals without the headache (literally).
                        </p>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-100 dark:border-red-800 opacity-60">
                                <span className="font-medium text-slate-700 dark:text-slate-300 line-through">Soy Sauce</span>
                                <span className="text-sm text-red-500 dark:text-red-400">Hi-Tyramine</span>
                            </div>
                            <div className="flex justify-center text-slate-400 dark:text-slate-500">
                                ↓
                            </div>
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                <span className="font-medium text-slate-900 dark:text-white">Coconut Aminos</span>
                                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Safe Swap</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="mt-24 text-center">
                <Link to="/auth" state={{ signup: true }} className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1">
                    Try it Yourself
                </Link>
            </div>
        </div>
    )
}

export default HowItWorks
