import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Analysis from './pages/Analysis'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/analyze" element={<Analysis />} />
                    </Routes>
                </main>
                <footer className="text-center py-6 text-slate-400 text-sm border-t border-slate-100 bg-white">
                    &copy; {new Date().getFullYear()} EatInSync. Molecular Nutrition Engine.
                </footer>
            </div>
        </Router>
    )
}

export default App
