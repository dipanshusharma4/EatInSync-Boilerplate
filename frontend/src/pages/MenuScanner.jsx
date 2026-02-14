import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCamera, FiCheck, FiAlertTriangle, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MenuScanner = () => {
    const [image, setImage] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanStage, setScanStage] = useState('');
    const [results, setResults] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result;
                setImage(imageData);
                startScanning(imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    const startScanning = async (imgData = null) => {
        // Use the passed imgData if available, otherwise fallback to state (for sample buttons)
        const currentImage = imgData || image;

        if (!currentImage) {
            console.error("No image to scan");
            return;
        }

        setScanning(true);
        setResults(null);

        // Stages
        setScanStage('Locating menu items...');

        try {
            // Upload to backend
            const formData = new FormData();

            // Check if image is base64 (from sample) or blob (from upload)
            if (currentImage.startsWith('data:image')) {
                // Convert base64 to blob
                const res = await fetch(currentImage);
                const blob = await res.blob();
                formData.append('image', blob, 'menu.jpg');
            } else if (currentImage.startsWith('http')) {
                // Handle sample URLs if needed
                setScanStage('Downloading sample...');
                const res = await fetch(currentImage);
                const blob = await res.blob();
                formData.append('image', blob, 'sample.jpg');
            } else {
                // Should be covered above
            }

            setScanStage('Reading text (OCR)...');
            // Artificial delay for UX so user sees the stage
            await new Promise(r => setTimeout(r, 1000));

            setScanStage('Analyzing chemical composition...');

            // axios is already configured with baseURL and headers
            const response = await axios.post('/api/v1/scan-menu', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setScanStage('Calculating Body Compatibility Scores...');
            await new Promise(r => setTimeout(r, 8000)); // Short delay for effect

            const data = response.data;
            console.log("Scan Results:", data); // Debug log
            if (data.dishes) {
                if (data.dishes.length === 0) {
                    alert("No clearly compatible dishes found in the text. Try a clearer image.");
                }
                setResults(data.dishes);
            } else {
                setResults([]);
            }

        } catch (error) {
            console.error("Scanning failed:", error);
            if (error.response?.status === 401) {
                alert("Your session has expired. Please Log Out and Log In again to continue.");
            } else {
                const errorMsg = error.response?.data?.detail || "Failed to analyze menu. Please try again.";
                alert(errorMsg);
            }
        } finally {
            setScanning(false);
        }
    };

    // Remove generateMockResults and keep helper inputs


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 pt-8 pb-12 px-4 shadow-sm mb-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Menu Decoder
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Upload a photo of any menu. Our engine will analyze every dish to tell you what fits your unique biology.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <AnimatePresence mode="wait">
                    {!image ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto"
                        >
                            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 text-3xl group-hover:scale-110 transition-transform">
                                        <FiCamera />
                                    </div>
                                    <p className="mb-2 text-xl font-medium text-slate-700 dark:text-slate-200">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">SVG, PNG, JPG or WEBP (MAX. 800x400px)</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-4">Or try a sample menu</p>
                                <div className="flex justify-center gap-4">
                                    <button onClick={() => { setImage('https://cdn.dribbble.com/users/189859/screenshots/16380695/media/1b2b8d0c6f5d8a0f5a7a9f8f2e2d8d8b.png'); startScanning(); }} className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:border-emerald-500 transition-colors">Italian Dinner</button>
                                    <button onClick={() => { setImage('https://cdn.dribbble.com/users/1615584/screenshots/14605937/media/5b1b3d7b7e3e3b7b3b7b7b7b7b7b7b7b.jpg'); startScanning(); }} className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium hover:border-emerald-500 transition-colors">Brunch Cafe</button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left Column: Image Area */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-black min-h-[400px] flex items-center justify-center sticky top-24"
                            >
                                <img src={image} alt="Menu" className={`w-full h-auto object-contain max-h-[80vh] transition-all duration-700 ${scanning ? 'opacity-50 blur-sm scale-110' : 'opacity-100 scale-100'}`} />

                                {scanning && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
                                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-white rounded-full animate-spin mb-6"></div>
                                        <p className="text-white text-xl font-bold animate-pulse text-center">{scanStage}</p>
                                    </div>
                                )}

                                {!scanning && (
                                    <button
                                        onClick={resetScan}
                                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-colors"
                                    >
                                        <FiX size={20} />
                                    </button>
                                )}
                            </motion.div>

                            {/* Right Column: Results */}
                            <div className="space-y-6">
                                {scanning ? (
                                    <div className="space-y-4 animate-pulse">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                                        ))}
                                    </div>
                                ) : results ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Detected Dishes ({results.length})</h2>
                                            <div className="flex gap-2">
                                                <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Safe
                                                </span>
                                                <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Avoid
                                                </span>
                                            </div>
                                        </div>

                                        {results.map((dish, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`p-6 rounded-2xl bg-white dark:bg-slate-800 border-l-4 shadow-sm hover:shadow-md transition-all ${dish.score >= 80
                                                    ? 'border-l-emerald-500 border-slate-100 dark:border-slate-700'
                                                    : dish.score >= 50
                                                        ? 'border-l-amber-500 border-slate-100 dark:border-slate-700'
                                                        : 'border-l-red-500 border-slate-100 dark:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{dish.name}</h3>
                                                    <div className={`px-3 py-1 rounded-full font-bold text-sm ${dish.score >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        dish.score >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        BCS {dish.score}
                                                    </div>
                                                </div>

                                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{dish.description}</p>

                                                <div className="flex items-start gap-2 mb-3">
                                                    {dish.score >= 80 ? (
                                                        <FiCheck className="text-emerald-500 mt-0.5 shrink-0" />
                                                    ) : (
                                                        <FiAlertTriangle className={`${dish.score >= 50 ? 'text-amber-500' : 'text-red-500'} mt-0.5 shrink-0`} />
                                                    )}
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {dish.reason}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {dish.tags.map((tag, t) => (
                                                        <span key={t} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}

                                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                                            <p className="text-sm text-slate-500">
                                                * Analysis based on molecular breakdown of typical ingredients. Actual preparation may vary.
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MenuScanner;
