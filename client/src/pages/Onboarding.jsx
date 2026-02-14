import React, { useState } from 'react';
import { useLocation } from 'wouter';
import axios from 'axios';

const Onboarding = () => {
    const [, setLocation] = useLocation();
    
    // Taste Profile State
    const [taste, setTaste] = useState({
        sweet: 5, spicy: 5, bitter: 5, sour: 5, umami: 5, creamy: 5
    });

    // Sensitivity State
    const [allergies, setAllergies] = useState('');
    const [intolerances, setIntolerances] = useState('');
    const [spiceTolerance, setSpiceTolerance] = useState('Medium');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Convert comma-sep strings to arrays
        const allergyList = allergies.split(',').map(s => s.trim()).filter(s => s);
        const intoleranceList = intolerances.split(',').map(s => s.trim()).filter(s => s);

        const profileData = {
            taste,
            sensitivity: {
                allergies: allergyList,
                intolerances: intoleranceList,
                spiceTolerance
            }
        };

        try {
            const token = localStorage.getItem('token'); // Assuming token is stored here
            if(!token) {
                alert("Please login first!"); // Simple fallback
                setLocation('/auth');
                return;
            }

            await axios.post('http://localhost:5000/api/profile', profileData, {
                headers: { 'x-auth-token': token }
            });

            alert("Profile Saved!");
            setLocation('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Error saving profile");
        }
    };

    const handleRangeChange = (flavor, val) => {
        setTaste(prev => ({ ...prev, [flavor]: parseInt(val) }));
    };

    return (
        <div className="container full-height flex-center" style={{ paddingTop: '80px' }}>
            <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '800px', borderRadius: '1rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Personalize Your Palate</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        
                        {/* Taste Profile Section */}
                        <div>
                            <h3>Taste Preferences (1-10)</h3>
                            {Object.keys(taste).map(flavor => (
                                <div key={flavor} style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                                        {flavor}: <span style={{ color: 'var(--primary)' }}>{taste[flavor]}</span>
                                    </label>
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={taste[flavor]} 
                                        onChange={(e) => handleRangeChange(flavor, e.target.value)}
                                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Sensitivity Section */}
                        <div>
                            <h3>Body Sensitivities</h3>
                            
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Allergies (comma separated)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Peanuts, Shellfish" 
                                    value={allergies}
                                    onChange={e => setAllergies(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>Intolerances</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Gluten, Lactose" 
                                    value={intolerances}
                                    onChange={e => setIntolerances(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label>Spice Tolerance</label>
                                <select 
                                    value={spiceTolerance} 
                                    onChange={e => setSpiceTolerance(e.target.value)}
                                    style={{ marginTop: '0.5rem' }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                        Save Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
