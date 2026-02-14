import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import FAQs from './pages/FAQs'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-200">
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 py-8">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/analyze" element={<Analysis />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/onboarding" element={<Onboarding />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/faqs" element={<FAQs />} />
                            </Routes>
                        </main>
                        <footer className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-200">
                            &copy; {new Date().getFullYear()} EatInSync. Molecular Nutrition Engine.
                        </footer>
                    </div>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    )
}

export default App
