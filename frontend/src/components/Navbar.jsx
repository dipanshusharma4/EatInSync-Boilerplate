import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <header className="bg-slate-50 border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">EatInSync</span>
                    <span className="text-emerald-500 text-xs font-semibold uppercase tracking-wider border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full">Beta</span>
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Home</Link>
                    <Link to="/analyze" className="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Analyze Meal</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link to="/analyze" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95">
                        Start Analysis
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Navbar
