import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const { login, register, error: authError, clearErrors, isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [localError, setLocalError] = useState('');

    const { name, email, password } = formData;

    useEffect(() => {
        if (isAuthenticated) {
            setLocation('/dashboard');
        }
        if (authError) {
            setLocalError(authError);
            clearErrors();
        }
    }, [isAuthenticated, authError, setLocation, clearErrors]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLocalError('');
        
        try {
            if (isLogin) {
                await login({ email, password });
            } else {
                await register({ name, email, password });
            }
        } catch (err) {
            // Errors handled in context/reducer, but we can keep local catch if needed
            console.error(err);
        }
    };

    return (
        <div className="container full-height flex-center">
            <motion.div 
                className="glass" 
                style={{ padding: '3rem', borderRadius: '1rem', width: '100%', maxWidth: '400px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {isLogin ? 'Welcome Back' : 'Join EatInSync'}
                </h2>
                
                {localError && <div style={{ color: 'var(--accent)', marginBottom: '1rem', textAlign: 'center' }}>{localError}</div>}

                <form onSubmit={onSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: '1rem' }}>
                            <input 
                                type="text" 
                                placeholder="Name" 
                                name="name" 
                                value={name} 
                                onChange={onChange}
                                required 
                            />
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            name="email" 
                            value={email} 
                            onChange={onChange} 
                            required
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <span 
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setLocalError('');
                        }}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
