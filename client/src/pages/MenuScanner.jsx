import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

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
    const [, setLocation] = useLocation();

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
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--text-primary)', minHeight: '100vh', paddingTop: '120px' }}>
            <GlobalBackground />

            <div className="container" style={{ maxWidth: '800px' }}>
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
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <input 
                            type="file" 
                            id="file-upload" 
                            style={{ display: 'none' }} 
                            onChange={handleChange} 
                            accept="image/*"
                        />
                        
                        <AnimatePresence mode="wait">
                            {file ? (
                                <motion.div
                                    key="file-selected"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>{file.name}</h3>
                                    <p style={{ opacity: 0.6 }}>Ready to analyze</p>
                                    <button 
                                        className="btn-primary" 
                                        style={{ marginTop: '2rem', padding: '1rem 3rem' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            alert("Analysis Logic Coming Soon!");
                                        }}
                                    >
                                        Analyze Menu
                                    </button>
                                     <button 
                                        className="btn-outline" 
                                        style={{ marginTop: '1rem', marginLeft: '1rem', padding: '1rem 2rem' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
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
            </div>
        </div>
    );
};

export default MenuScanner;
