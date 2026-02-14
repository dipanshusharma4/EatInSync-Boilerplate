import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from '../context/ThemeContext';

const Auth = () => {

    const location = useLocation();
    const [isLogin, setIsLogin] = useState(!location.state?.signup);
    const { login, signup, googleLogin } = useAuth();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                // Basic validation for signup
                if (!formData.name.trim()) {
                    setError("Full Name is required.");
                    return;
                }
                await signup(formData.email, formData.password, formData.name);
            }
        } catch (err) {
            // Check if err.response and err.response.data exist
            setError(err.response?.data?.detail || err.message || "Authentication failed. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
            >
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {isLogin ? 'Sign in to access your personalized nutrition insights.' : 'Join us to start analyzing your meals on a molecular level.'}
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); setFormData({ ...formData, name: '' }); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isLogin ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${!isLogin ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md text-sm text-center border border-red-100 dark:border-red-800">
                                {error}
                            </div>
                        )}
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {!isLogin && (
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all shadow-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all shadow-sm"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm transition-all shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLogin ? 'Sign in' : 'Create Account'}
                            </button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    googleLogin(credentialResponse.credential);
                                }}
                                onError={() => {
                                    setError("Google Login Failed");
                                }}
                                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default Auth
