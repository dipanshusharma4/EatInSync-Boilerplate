import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    return (
        <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">EatInSync</span>
                    <span className="text-emerald-500 text-xs font-semibold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Beta</span>
                </Link>
                <nav className="hidden md:flex gap-8">
                    <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">Home</Link>
                    <Link to="/how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">How it Works</Link>
                    <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">About</Link>
                    <Link to="/faqs" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">FAQs</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === 'light' ? '🌚' : '🌞'}
                    </button>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-slate-600 dark:text-slate-300 font-medium hidden sm:block">
                                Hello, {user.full_name?.split(' ')[0]}
                            </span>
                            <div className="relative group">
                                <Link to="/profile">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-400 transition-colors">
                                        {user.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                </Link>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50 border border-slate-100 dark:border-slate-700">
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">My Profile</Link>
                                    <Link to="/analyze" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">Quick Check (Dish)</Link>
                                    <Link to="/scan-menu" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-emerald-600 dark:text-emerald-400">Scan Full Menu ✨</Link>
                                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">Sign Out</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/auth" className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors hidden sm:block">
                                Sign In
                            </Link>
                            <Link to="/auth" state={{ signup: true }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
