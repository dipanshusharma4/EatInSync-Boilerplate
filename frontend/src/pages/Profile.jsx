import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiUser, FiActivity } from 'react-icons/fi';
import axios from 'axios';

const Profile = () => {
    const { user, setUser } = useAuth();
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);

    // Local state for editing fields
    const [formData, setFormData] = useState({
        full_name: '',
        nationality: '',
        diet_type: '',
        lactose_intolerant: false,
        dietary_conditions: [],
        taste_likes: [],
        taste_dislikes: [],
        avoided_ingredients: []
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                nationality: user.nationality || '',
                diet_type: user.diet_type || 'non-veg',
                lactose_intolerant: user.lactose_intolerant || false,
                dietary_conditions: user.dietary_conditions || [],
                taste_likes: user.taste_likes || [],
                taste_dislikes: user.taste_dislikes || [],
                avoided_ingredients: user.avoided_ingredients || []
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            // Re-use the onboarding endpoint for updates as it handles all profile fields
            const response = await axios.put('/onboarding', formData);
            setUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, value) => {
        // Expecting comma separated string from input
        const array = value.split(',').map(item => item.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, [field]: array }));
    };

    if (!user) return <div className="text-center p-10">Loading profile...</div>;

    const inputClass = "w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none";
    const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider";

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <FiUser /> User Profile
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your personal information and dietary preferences.</p>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${isEditing
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                            : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500'
                        }`}
                >
                    {isEditing ? <><FiSave /> Save Changes</> : <><FiEdit2 /> Edit Profile</>}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:col-span-1 h-fit"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-3xl text-white font-bold mb-4 shadow-inner">
                            {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.full_name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>

                        <div className="w-full border-t border-slate-100 dark:border-slate-700 pt-4 mt-2 grid grid-cols-2 gap-4 text-left">
                            <div>
                                <span className={labelClass}>Status</span>
                                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">Active</span>
                            </div>
                            <div>
                                <span className={labelClass}>Member Since</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Details Form Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 md:col-span-2 space-y-6"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Nationality */}
                        <div>
                            <label className={labelClass}>Nationality</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.nationality}
                                    onChange={(e) => handleChange('nationality', e.target.value)}
                                    className={inputClass}
                                />
                            ) : (
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{user.nationality || 'Not specified'}</p>
                            )}
                        </div>

                        {/* Diet Type */}
                        <div>
                            <label className={labelClass}>Diet Type</label>
                            {isEditing ? (
                                <select
                                    value={formData.diet_type}
                                    onChange={(e) => handleChange('diet_type', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="veg">Veg</option>
                                    <option value="non-veg">Non-Veg</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="other">Other</option>
                                </select>
                            ) : (
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-200 capitalize">{user.diet_type || 'Not specified'}</p>
                            )}
                        </div>

                        {/* Lactose Intolerant */}
                        <div>
                            <label className={labelClass}>Lactose Intolerance</label>
                            {isEditing ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.lactose_intolerant === true}
                                            onChange={() => handleChange('lactose_intolerant', true)}
                                            className="text-emerald-500 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm dark:text-white">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.lactose_intolerant === false}
                                            onChange={() => handleChange('lactose_intolerant', false)}
                                            className="text-emerald-500 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm dark:text-white">No</span>
                                    </label>
                                </div>
                            ) : (
                                <p className={`text-lg font-medium ${user.lactose_intolerant ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {user.lactose_intolerant ? 'Yes' : 'No'}
                                </p>
                            )}
                        </div>

                        {/* Dietary Conditions */}
                        <div>
                            <label className={labelClass}>Dietary Conditions</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    placeholder="Comma separated (e.g. Migraines, IBS)"
                                    value={formData.dietary_conditions.join(', ')}
                                    onChange={(e) => handleArrayChange('dietary_conditions', e.target.value)}
                                    className={inputClass}
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {user.dietary_conditions?.length > 0 ? (
                                        user.dietary_conditions.map(cond => (
                                            <span key={cond} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600">
                                                {cond}
                                            </span>
                                        ))
                                    ) : <span className="text-slate-400 italic">None</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiActivity className="text-emerald-500" /> Preferences & Avoidances
                        </h3>

                        <div className="space-y-4">
                            {/* Likes */}
                            <div>
                                <label className={labelClass}>Flavor Likes</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.taste_likes.join(', ')}
                                        onChange={(e) => handleArrayChange('taste_likes', e.target.value)}
                                        className={inputClass}
                                        placeholder="Spicy, Sweet, Umami..."
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {user.taste_likes?.map(t => (
                                            <span key={t} className="px-2 py-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-100 dark:border-emerald-800">
                                                {t}
                                            </span>
                                        ))}
                                        {!user.taste_likes?.length && <span className="text-slate-400 italic text-sm">-</span>}
                                    </div>
                                )}
                            </div>

                            {/* Dislikes */}
                            <div>
                                <label className={labelClass}>Flavor Dislikes</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.taste_dislikes.join(', ')}
                                        onChange={(e) => handleArrayChange('taste_dislikes', e.target.value)}
                                        className={inputClass}
                                        placeholder="Bitter, Sour..."
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {user.taste_dislikes?.map(t => (
                                            <span key={t} className="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full border border-red-100 dark:border-red-800">
                                                {t}
                                            </span>
                                        ))}
                                        {!user.taste_dislikes?.length && <span className="text-slate-400 italic text-sm">-</span>}
                                    </div>
                                )}
                            </div>

                            {/* Avoided Ingredients */}
                            <div>
                                <label className={labelClass}>Must Avoid Ingredients</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.avoided_ingredients.join(', ')}
                                        onChange={(e) => handleArrayChange('avoided_ingredients', e.target.value)}
                                        className={inputClass}
                                        placeholder="Peanuts, Shellfish..."
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {user.avoided_ingredients?.map(ing => (
                                            <span key={ing} className="px-2 py-1 text-xs bg-slate-800 text-white rounded-md flex items-center gap-1 shadow-sm">
                                                🚫 {ing}
                                            </span>
                                        ))}
                                        {!user.avoided_ingredients?.length && <span className="text-slate-400 italic text-sm">-</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
