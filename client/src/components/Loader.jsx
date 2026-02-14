import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ text = "Checking ingredients..." }) => {
    return (
        <div style={styles.container}>
            <motion.div
                style={styles.spinner}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <div style={styles.textContainer}>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
                    style={styles.text}
                >
                    {text}
                </motion.span>
                <div style={styles.dots}>
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            style={styles.dot}
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    },
    spinner: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTop: '4px solid var(--primary)',
        marginBottom: '1rem',
    },
    textContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    text: {
        fontSize: '1.1rem',
        color: 'var(--text-muted)',
    },
    dots: {
        display: 'flex',
        gap: '4px',
    },
    dot: {
        width: '6px',
        height: '6px',
        backgroundColor: 'var(--primary)',
        borderRadius: '50%',
    }
};

export default Loader;
