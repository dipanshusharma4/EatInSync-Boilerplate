import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [location] = useLocation();
    const { isAuthenticated, logout, user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    // Scroll detection for future enhancements (e.g., shrinking)
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        ...(isAuthenticated ? [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Profile', path: '/profile' },
            { name: 'Menu Scanner', path: '/menu-scanner' }
        ] : [])
    ];

    return (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{
                position: 'fixed',
                top: '2rem',
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none' // Allow clicks through the empty space
            }}
        >
            <div 
                className="glass"
                style={{
                    pointerEvents: 'auto',
                    padding: '0.75rem 2rem',
                    borderRadius: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3rem',
                    background: 'rgba(15, 23, 42, 0.6)', // Slightly darker for contrast
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                }}
            >
                {/* Logo */}
                <Link href="/">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ 
                            fontFamily: '"Playfair Display", serif', 
                            fontSize: '1.5rem', 
                            fontWeight: 700, 
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        EatInSync.
                    </motion.div>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {navLinks.map((link) => {
                        const isActive = location === link.path;
                        return (
                            <Link key={link.path} href={link.path}>
                                <div style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem 0' }}>
                                    <span style={{ 
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        fontWeight: 500,
                                        transition: 'color 0.3s'
                                    }}>
                                        {link.name}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '2px',
                                                background: 'var(--primary)',
                                                borderRadius: '2px',
                                                boxShadow: '0 0 10px var(--primary)'
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Auth Actions */}
                <div style={{ paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                style={{ 
                                    width: '32px', height: '32px', borderRadius: '50%', 
                                    background: 'var(--primary)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b'
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </motion.div>
                            <button 
                                onClick={logout} 
                                style={{ 
                                    background: 'transparent', 
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    padding: '0.5rem 1rem',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                className="glass-hover"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                style={{
                                    fontSize: '0.9rem',
                                    padding: '0.6rem 1.5rem'
                                }}
                            >
                                Login
                            </motion.button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Navbar;
