import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const STEPS = [
    { id: 1, title: 'Nationality' },
    { id: 2, title: 'Diet Type' },
    { id: 3, title: 'Lactose Intolerance' },
    { id: 4, title: 'Dietary Conditions' },
    { id: 5, title: 'Taste Preferences' },
    { id: 6, title: 'Avoided Ingredients' },
    { id: 7, title: 'Review' }
];

const DIETARY_CONDITIONS = [
    { label: 'Migraines', detail: '(Maps to Tyramine, Histamine)' },
    { label: 'Acid Reflux / GERD', detail: '(Maps to Acidity, Caffeine, Spices)' },
    { label: 'IBS / Gut Health', detail: '(Maps to FODMAPs, Gluten)' },
    { label: 'Diabetes', detail: '(Maps to Glycemic Index)' },
    { label: 'None', detail: 'Just eating healthy' }
];

const Onboarding = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        nationality: '',
        diet_type: 'non-veg',
        lactose_intolerant: false,
        dietary_conditions: [],
        taste_likes: [],
        taste_dislikes: [],
        avoided_ingredients: []
    });

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.put('/onboarding', formData);
            setUser(response.data); // Update context with new profile
            navigate('/analyze');
        } catch (error) {
            console.error("Onboarding failed:", error);
            // Handle error (show toast etc)
        }
    };

    const updateFormData = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const toggleArrayItem = (field, item) => {
        const currentArray = formData[field];
        if (currentArray.includes(item)) {
            updateFormData(field, currentArray.filter(i => i !== item));
        } else {
            updateFormData(field, [...currentArray, item]);
        }
    };

    // Check if 'None' is selected, clear others
    const handleDietaryConditionParams = (item) => {
        if (item === 'None') {
            updateFormData('dietary_conditions', ['None']);
            return;
        }

        let currentConditions = [...formData.dietary_conditions];
        if (currentConditions.includes('None')) {
            currentConditions = []; // Clear 'None' if selecting something else
        }

        if (currentConditions.includes(item)) {
            updateFormData('dietary_conditions', currentConditions.filter(i => i !== item));
        } else {
            updateFormData('dietary_conditions', [...currentConditions, item]);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 dark:bg-slate-700">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-white">
                        {STEPS[currentStep - 1].title}
                    </h2>

                    <div className="min-h-[300px]">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentStep}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col items-center justify-center space-y-6"
                            >
                                {/* Step 1: Nationality */}
                                {currentStep === 1 && (
                                    <div className="w-full max-w-md space-y-4">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Where are you from?
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nationality}
                                            onChange={(e) => updateFormData('nationality', e.target.value)}
                                            placeholder="e.g. India, USA, Italy"
                                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                )}

                                {/* Step 2: Diet Type */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                        {['Veg', 'Non-Veg', 'Vegan', 'Other'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => updateFormData('diet_type', type.toLowerCase())}
                                                className={`p-6 rounded-xl border-2 transition-all ${formData.diet_type === type.toLowerCase()
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                                                    }`}
                                            >
                                                <span className="font-semibold text-lg">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Step 3: Lactose Intolerance */}
                                {currentStep === 3 && (
                                    <div className="w-full max-w-md space-y-6 text-center">
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Lactose intolerance is the inability to fully digest sugar (lactose) in dairy products.
                                        </p>
                                        <div className="flex justify-center gap-6">
                                            <button
                                                onClick={() => updateFormData('lactose_intolerant', true)}
                                                className={`px-8 py-4 rounded-xl border-2 transition-all ${formData.lactose_intolerant
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                                                    : 'border-slate-200 dark:border-slate-700'
                                                    }`}
                                            >
                                                Yes, I am
                                            </button>
                                            <button
                                                onClick={() => updateFormData('lactose_intolerant', false)}
                                                className={`px-8 py-4 rounded-xl border-2 transition-all ${!formData.lactose_intolerant
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                                    : 'border-slate-200 dark:border-slate-700'
                                                    }`}
                                            >
                                                No, I'm not
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Dietary Conditions */}
                                {currentStep === 4 && (
                                    <div className="w-full max-w-md space-y-3">
                                        {DIETARY_CONDITIONS.map((condition) => (
                                            <div
                                                key={condition.label}
                                                onClick={() => handleDietaryConditionParams(condition.label)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.dietary_conditions.includes(condition.label)
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                                                    }`}
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{condition.label}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{condition.detail}</p>
                                                </div>
                                                {formData.dietary_conditions.includes(condition.label) && (
                                                    <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Step 5: Taste Preferences */}
                                {currentStep === 5 && (
                                    <div className="w-full max-w-md space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Flavors you Love (Comma separated)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Spicy, Sweet, Umami"
                                                className="w-full p-3 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                                                onBlur={(e) => updateFormData('taste_likes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {formData.taste_likes.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Flavors you Dislike</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Bitter, Sour"
                                                className="w-full p-3 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                                                onBlur={(e) => updateFormData('taste_dislikes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {formData.taste_dislikes.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Avoided Ingredients */}
                                {currentStep === 6 && (
                                    <div className="w-full max-w-md space-y-4">
                                        <label className="block text-sm font-medium">Ingredients you strictly avoid (Allergies etc)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Peanuts, Shellfish, Mushrooms"
                                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (e.target.value.trim()) {
                                                        toggleArrayItem('avoided_ingredients', e.target.value.trim());
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-slate-500">Press Enter to add</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.avoided_ingredients.map(ing => (
                                                <span
                                                    key={ing}
                                                    onClick={() => toggleArrayItem('avoided_ingredients', ing)}
                                                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1"
                                                >
                                                    {ing} <span>×</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 7: Review */}
                                {currentStep === 7 && (
                                    <div className="w-full max-w-md space-y-4 text-sm">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl space-y-3">
                                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                                <span className="text-slate-500">Nationality</span>
                                                <span className="font-medium">{formData.nationality}</span>
                                            </div>
                                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                                <span className="text-slate-500">Diet Type</span>
                                                <span className="font-medium capitalize">{formData.diet_type}</span>
                                            </div>
                                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                                <span className="text-slate-500">Lactose Intolerant</span>
                                                <span className="font-medium">{formData.lactose_intolerant ? 'Yes' : 'No'}</span>
                                            </div>
                                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                                <span className="text-slate-500">Conditions</span>
                                                <span className="font-medium text-right">{formData.dietary_conditions.join(', ') || 'None'}</span>
                                            </div>
                                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                                <span className="text-slate-500">Likes</span>
                                                <span className="font-medium text-right">{formData.taste_likes.join(', ') || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b dark:border-slate-700 pb-2">
                                                <span className="text-slate-500">Must Avoid</span>
                                                <span className="font-medium text-right">{formData.avoided_ingredients.join(', ') || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={handleBack}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            disabled={currentStep === 1}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                        >
                            {currentStep === STEPS.length ? 'Finish Profile' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
