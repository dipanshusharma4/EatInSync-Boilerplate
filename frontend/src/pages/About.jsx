import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const About = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 mb-6">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-wide uppercase">Our Mission</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Redefining Nutrition</h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    EatInSync is built on the belief that one size does not fit all. We empower you to understand your unique bio-chemistry.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 mb-24">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Wait?</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        Standard dietary advice fails millions. "Healthy" foods like spinach, aged cheese, and avocados can trigger debilitating migraines or inflammation in susceptible individuals. We bridge the gap between clinical nutrition and daily eating.
                    </p>
                    <div className="flex -space-x-2 overflow-hidden">
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://ui-avatars.com/api/?name=Dr+X&background=0D9488&color=fff" alt="" />
                        <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://ui-avatars.com/api/?name=Nu+Y&background=0284C7&color=fff" alt="" />
                    </div>
                </div>
                <div className="bg-slate-900 dark:bg-slate-950 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-transparent dark:border-slate-800">
                    <div>
                        <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
                        <p className="text-slate-300 leading-relaxed">
                            A world where everyone eats in sync with their biology. No more guessing games, no more "mystery" symptoms. Just data-driven, delicious meals that fuel you properly.
                        </p>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-700 flex justify-between items-center text-sm font-medium text-emerald-400">
                        <span>Founded 2024</span>
                        <span>Global Impact</span>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-12 text-center border border-emerald-100 dark:border-emerald-900/30">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Join the Movement</h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8">
                    We are currently in Beta. Sign up now to get early access to our full suite of molecular analysis tools.
                </p>
                <Link to="/auth" state={{ signup: true }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-all">
                    Get Early Access
                </Link>
            </div>
        </div>
    )
}

export default About
