import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';
import { motion } from 'framer-motion';

const Profile = () => {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(true);
    
    // Taste Profile State
    const [taste, setTaste] = useState({
        sweet: 5, spicy: 5, bitter: 5, sour: 5, umami: 5, creamy: 5
    });

    // Sensitivity State
    const [allergies, setAllergies] = useState('');
    const [intolerances, setIntolerances] = useState('');
    const [spiceTolerance, setSpiceTolerance] = useState('Medium');
    const [fermentedSensitivity, setFermentedSensitivity] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if(!token) return setLocation('/auth');

                const res = await axios.get('http://localhost:5000/api/profile', {
                    headers: { 'x-auth-token': token }
                });

                if(res.data) {
                    setTaste(res.data.taste || { sweet: 5, spicy: 5, bitter: 5, sour: 5, umami: 5, creamy: 5 });
                    setAllergies((res.data.sensitivity?.allergies || []).join(', '));
                    setIntolerances((res.data.sensitivity?.intolerances || []).join(', '));
                    setSpiceTolerance(res.data.sensitivity?.spiceTolerance || 'Medium');
                    setFermentedSensitivity(res.data.sensitivity?.fermentedSensitivity || false);
                }
            } catch (err) {
                console.error(err);
                // If 404, maybe just let them create it
            }
            setLoading(false);
        };
        fetchProfile();
    }, [setLocation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const allergyList = allergies.split(',').map(s => s.trim()).filter(s => s);
        const intoleranceList = intolerances.split(',').map(s => s.trim()).filter(s => s);

        const profileData = {
            taste,
            sensitivity: {
                allergies: allergyList,
                intolerances: intoleranceList,
                spiceTolerance,
                fermentedSensitivity
            }
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/profile', profileData, {
                headers: { 'x-auth-token': token }
            });
            alert("Profile Updated Successfully!");
        } catch (err) {
            console.error(err);
            alert("Error saving profile");
        }
    };

    const handleRangeChange = (flavor, val) => {
        setTaste(prev => ({ ...prev, [flavor]: parseInt(val) }));
    };

    if (loading) return <div className="full-height flex-center">Loading Profile...</div>;

    return (
        <div className="container full-height" style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <motion.div 
                className="glass" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                    padding: '2rem', width: '100%', maxWidth: '800px', borderRadius: '1.5rem', margin: '0 auto',
                    background: 'rgba(255, 255, 255, 0.8)', // Clearer white for profile
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
                }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Your Food Profile</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        
                        {/* Taste Profile Section */}
                        <div>
                            <h3 style={{ color: 'var(--primary)' }}>Taste Preferences</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Rate how much you enjoy each flavor (1-10)
                            </p>
                            
                            {Object.keys(taste).map(flavor => (
                                <div key={flavor} style={{ marginBottom: '1.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ textTransform: 'capitalize', fontWeight: 'bold', color: '#334155' }}>{flavor}</label>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{taste[flavor]}</span>
                                    </div>
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={taste[flavor]} 
                                        onChange={(e) => handleRangeChange(flavor, e.target.value)}
                                        style={{ width: '100%', accentColor: 'var(--primary)', height: '6px' }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Sensitivity Section */}
                        <div>
                            <h3 style={{ color: 'var(--accent)' }}>Safety & Constraints</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Use comma-separated values for lists.
                            </p>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Allergies</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Peanuts, Shellfish (Strictly Avoided)" 
                                    value={allergies}
                                    onChange={e => setAllergies(e.target.value)}
                                    style={{ 
                                        borderColor: allergies ? 'var(--accent)' : 'rgba(0,0,0,0.1)',
                                        background: 'white', color: '#1e293b', padding: '0.8rem', borderRadius: '0.5rem', width: '100%', border: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)',fontWeight: 'bold' }}>Intolerances</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Gluten, Lactose (Monitoring)" 
                                    value={intolerances}
                                    onChange={e => setIntolerances(e.target.value)}
                                    style={{ background: 'white', color: '#1e293b', padding: '0.8rem', borderRadius: '0.5rem', width: '100%', border: '1px solid rgba(0,0,0,0.1)' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)',fontWeight: 'bold' }}>Spice Tolerance</label>
                                <select 
                                    value={spiceTolerance} 
                                    onChange={e => setSpiceTolerance(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', background: 'white', color: '#1e293b', border: '1px solid rgba(0,0,0,0.1)' }}
                                >
                                    <option value="Low">Low (No heat)</option>
                                    <option value="Medium">Medium (Jalapeno)</option>
                                    <option value="High">High (Ghost Pepper)</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input 
                                    type="checkbox" 
                                    checked={fermentedSensitivity}
                                    onChange={e => setFermentedSensitivity(e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label style={{ color: 'black', fontWeight: '500' }}>Sensitive to Fermented Foods / Alcohol?</label>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                            Update Profile
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
