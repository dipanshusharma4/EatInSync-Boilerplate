
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Ensure this matches your project structure

// --- Background for consistency ---
const GlobalBackground = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: 'var(--bg-primary)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)' }} />
        <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 30%, rgba(245, 158, 11, 0.05) 0%, transparent 60%)' }}
        />
    </div>
);

const MenuScanner = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [, setLocation] = useLocation();
    const { token } = useAuth(); // Get auth token

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
            setResults(null);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResults(null);
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!file) return;
        if (!token) {
            setError("Please login to scan menus.");
            return;
        }

        setScanning(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', file); // 'image' key as assumed from generic backend handling

        try {
            // Using localhost:5000 as inferred from backend usage. 
            // In production, this should be relative or env var.
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const res = await axios.post(`${API_URL}/api/v1/scan-menu`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token
                }
            });

            if (res.data && res.data.dishes) {
                setResults(res.data.dishes);
            } else {
                setError("No dishes detected or invalid response format.");
            }

        } catch (err) {
            console.error("Scan failed:", err);
            setError(err.response?.data?.detail || err.message || "Failed to analyze menu. Ensure backend is running.");
        } finally {
            setScanning(false);
        }
    };

    return (
        <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '120px' }}>
            <GlobalBackground />

            <div className="container" style={{ maxWidth: '800px', paddingBottom: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                        Scan Your <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Menu.</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '500px', margin: '0 auto' }}>
                        Upload a photo of any restaurant menu. We'll analyze it for allergens and compatibility with your bio-profile.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <form
                        className="glass"
                        style={{
                            padding: '3rem',
                            borderRadius: '2rem',
                            border: `2px dashed ${dragActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                            background: dragActive ? 'rgba(245, 158, 11, 0.05)' : 'var(--glass-bg)',
                            transition: 'all 0.3s',
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => !scanning && document.getElementById('file-upload').click()}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleChange}
                            accept="image/*"
                            disabled={scanning}
                        />

                        <AnimatePresence mode="wait">
                            {scanning ? (
                                <motion.div
                                    key="scanning"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Analyzing Menu...</h3>
                                    <p style={{ opacity: 0.6 }}>Identifying dishes and checking your profile...</p>
                                </motion.div>
                            ) : file ? (
                                <motion.div
                                    key="file-selected"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>{file.name}</h3>
                                    <p style={{ opacity: 0.6 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                                    <button
                                        className="btn-primary"
                                        style={{ marginTop: '2rem', padding: '1rem 3rem' }}
                                        onClick={handleScan}
                                    >
                                        Analyze Menu
                                    </button>
                                    <button
                                        className="btn-outline"
                                        style={{ marginTop: '1rem', marginLeft: '1rem', padding: '1rem 2rem' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            setError(null);
                                            setResults(null);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload-prompt"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                        margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2rem'
                                    }}>
                                        📸
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Click or Drag Image Here</h3>
                                    <p style={{ opacity: 0.5 }}>Supports JPG, PNG, WEBP</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {dragActive && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <h3 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Drop it here!</h3>
                            </div>
                        )}
                    </form>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '1rem', color: '#f87171', textAlign: 'center' }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ marginTop: '3rem' }}
                    >
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Analysis Results</h2>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {results.map((dish, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass"
                                    style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{dish.name}</h3>
                                        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>{dish.reason || dish.description}</p>
                                        {dish.tags && dish.tags.length > 0 && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                {dish.tags.map((tag, tIdx) => (
                                                    <span key={tIdx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)' }}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '1.5rem', fontWeight: 'bold',
                                            color: dish.score >= 80 ? '#4ade80' : dish.score >= 50 ? '#facc15' : '#f87171'
                                        }}>
                                            {dish.score}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Compatibility</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default MenuScanner;
