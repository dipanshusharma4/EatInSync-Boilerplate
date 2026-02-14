import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-8 animate-fade-in-up">
                <span className="text-emerald-600 text-sm font-semibold tracking-wide uppercase">Introducing Molecular Analysis</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight tracking-tight mb-8 animate-fade-in-up delay-100">
                Eat smarter, not just <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">lighter</span>.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mb-12 animate-fade-in-up delay-200 leading-relaxed mx-auto">
                EatInSync goes beyond calories to predict how your body will physically react to a meal.
                We analyze molecular compounds to flag invisible triggers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300 justify-center w-full">
                <Link to="/analyze" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 text-center">
                    Start Analysis
                </Link>
                <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm hover:shadow-md">
                    Learn More
                </button>
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full animate-fade-in-up delay-500 text-left">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-2xl">🧬</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Molecular Parsing</h3>
                    <p className="text-slate-500 leading-relaxed">We decompose recipes into chemical compounds to find hidden triggers like Tyramine.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">📊</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Bio-Compatibility Score</h3>
                    <p className="text-slate-500 leading-relaxed">Get a personalized 0-100 score predicting how well a dish matches your biology.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">✨</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Swaps</h3>
                    <p className="text-slate-500 leading-relaxed">Find flavor-matched alternatives that keep the taste but drop the triggers.</p>
                </div>
            </div>
        </div>
    )
}

export default Home
