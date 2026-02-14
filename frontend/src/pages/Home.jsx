import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import MolecularBackground from '../components/MolecularBackground'

const Home = () => {
    const { user } = useAuth();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="relative w-full isolate">
            <MolecularBackground />

            <motion.div
                className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 mb-8 backdrop-blur-sm">
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold tracking-wide uppercase">Introducing Molecular Analysis</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-8">
                    Eat what, suits <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">YOU</span>.
                </motion.h1>

                <motion.p id="about" variants={itemVariants} className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-12 leading-relaxed mx-auto scroll-mt-24">
                    EatInSync goes beyond calories to predict how your body will physically react to a meal.
                    We analyze molecular compounds to flag invisible triggers.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    {user ? (
                        <>
                            <Link to="/analyze" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 text-center">
                                Start Analysis
                            </Link>
                            <Link to="/how-it-works" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm hover:shadow-md text-center">
                                Learn More
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/auth"
                                state={{ signup: true }}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 text-center"
                            >
                                Get Started
                            </Link>
                            <Link to="/how-it-works" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm hover:shadow-md text-center">
                                Learn More
                            </Link>
                        </>
                    )}
                </motion.div>

                <motion.div
                    id="how-it-works"
                    variants={itemVariants}
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left scroll-mt-24"
                >
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300">🧬</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Molecular Parsing</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">We decompose recipes into chemical compounds to find hidden triggers like Tyramine.</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300">📊</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bio-Compatibility Score</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Get a personalized 0-100 score predicting how well a dish matches your biology.</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300">✨</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Smart Swaps</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Find flavor-matched alternatives that keep the taste but drop the triggers.</p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Home
