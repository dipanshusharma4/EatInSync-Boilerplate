import React, { useRef } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Global Background Manager ---
const GlobalBackground = () => {
    const { scrollYProgress } = useScroll(); // Global 0-1
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

    const op1 = useTransform(smoothProgress, [0, 0.2], [1, 0]); // Deep Slate
    const op2 = useTransform(smoothProgress, [0.1, 0.4, 0.6], [0, 1, 0]); // Amber Glow
    const op3 = useTransform(smoothProgress, [0.5, 0.8, 1], [0, 1, 0]); // Emerald 
    const op4 = useTransform(smoothProgress, [0.9, 1], [0, 1]); // Final 

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: 'var(--bg-primary)' }}>
             {/* Base Gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #020617 100%)' }} />

            {/* Dynamic Layers */}
             <motion.div style={{ position: 'absolute', inset: 0, opacity: op2, background: 'radial-gradient(circle at 80% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)' }} />
             <motion.div style={{ position: 'absolute', inset: 0, opacity: op3, background: 'radial-gradient(circle at 20% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)' }} />
             <motion.div style={{ position: 'absolute', inset: 0, opacity: op4, background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' }} />
            
             {/* Noise Texture for Premium Feel */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/200' filter='contrast(150%25)'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
        </div>
    );
};

// --- The Traveler (Glowing Orb) ---
const ScrollTraveler = () => {
    const { scrollYProgress } = useScroll();
    const springProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 15 });

    const x = useTransform(springProgress, [0, 0.25, 0.5, 0.75, 1], ["80vw", "20vw", "80vw", "50vw", "50vw"]);
    const y = useTransform(springProgress, [0, 0.25, 0.5, 0.75, 1], ["15vh", "40vh", "60vh", "80vh", "50vh"]);
    const scale = useTransform(springProgress, [0, 0.5, 1], [1, 2, 0.5]);
    const glow = useTransform(springProgress, [0, 0.5, 1], ["0px 0px 20px var(--primary)", "0px 0px 60px var(--accent)", "0px 0px 40px #fff"]);
    const color = useTransform(springProgress, [0, 0.5, 1], ["#f59e0b", "#10b981", "#fff"]);

    return (
        <motion.div 
            style={{ 
                position: 'fixed', 
                top: 0, left: 0,
                x, y, scale,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: color,
                boxShadow: glow,
                zIndex: 50,
                pointerEvents: 'none'
            }}
        />
    );
};

// --- Section Component ---
const ScrollSection = ({ children, height = "150vh" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

  return (
    <div ref={ref} style={{ height, position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children(smoothProgress)}
      </div>
    </div>
  );
};

// --- VFX ---
const ParticleExplosion = ({ color }) => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
       {[...Array(15)].map((_, i) => (
         <motion.div
           key={i}
           style={{
             position: 'absolute', left: '50%', top: '50%', width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, borderRadius: '50%', background: color,
           }}
           animate={{ 
               x: (Math.random() - 0.5) * 800, 
               y: (Math.random() - 0.5) * 800, 
               opacity: [0, 1, 0],
               scale: [0, 1, 0]
           }}
           transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeOut", delay: Math.random() * 2 }}
         />
       ))}
    </div>
);

const Home = () => {
  return (
    <div style={{ color: 'var(--text-primary)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <GlobalBackground />
      <ScrollTraveler />

      {/* 1. HERO */}
      <ScrollSection height="200vh">
        {(progress) => {
           const scale = useTransform(progress, [0, 0.5], [1, 0.8]);
           const opacity = useTransform(progress, [0.3, 0.6], [1, 0]);
           const y = useTransform(progress, [0, 0.5], [0, -100]);
           
           return (
             <motion.div style={{ scale, opacity, y, textAlign: 'center', zIndex: 10, position: 'relative' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 800, lineHeight: 0.9, marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                        Eat In <span style={{ 
                            background: 'linear-gradient(135deg, var(--primary) 0%, #d97706 100%)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            fontStyle: 'italic'
                        }}>Sync.</span>
                    </h1>
                </motion.div>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    style={{ fontSize: '1.5rem', fontWeight: 300, maxWidth: '600px', margin: '0 auto' }}
                >
                    Food that understands your biology.
                </motion.p>
                
                <ParticleExplosion color="var(--primary)" />
             </motion.div>
           );
        }}
      </ScrollSection>

      {/* 2. BIO SYNC */}
      <ScrollSection height="200vh">
        {(progress) => {
           const x = useTransform(progress, [0, 0.3, 0.7, 1], [1000, 0, 0, -1000]);
           const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
           const rotate = useTransform(progress, [0, 0.3], [10, 0]);

           return (
             <motion.div style={{ x, opacity, rotate, zIndex: 10 }}>
                <div 
                    className="glass"
                    style={{ 
                        padding: '4rem', 
                        borderRadius: '2rem', 
                        maxWidth: '800px', 
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        textAlign: 'center'
                    }}
                >
                    <h2 style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '1rem' }}>Bio Sync.</h2>
                    <p style={{ fontSize: '1.8rem', lineHeight: 1.4, opacity: 0.9 }}>
                        Stop guessing. <br/>
                        Align your diet with your unique DNA and health data.
                    </p>
                </div>
                <ParticleExplosion color="var(--accent)" />
             </motion.div>
           );
        }}
      </ScrollSection>

      {/* 3. TASTE MATCH */}
      <ScrollSection height="200vh">
        {(progress) => {
           const scale = useTransform(progress, [0, 0.5], [0.5, 1]);
           const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
           
           return (
             <motion.div style={{ scale, opacity, zIndex: 10 }}>
                 <div
                    className="glass" 
                    style={{
                        padding: '4rem',
                        borderRadius: '2rem',
                        maxWidth: '800px',
                        textAlign: 'center',
                        background: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                 >
                    <h2 style={{ fontSize: '4rem', color: '#60a5fa', marginBottom: '1rem' }}>Taste Match.</h2>
                    <p style={{ fontSize: '1.8rem', lineHeight: 1.4, opacity: 0.9 }}>
                        Delicious shouldn't mean dangerous. <br/>
                        Find safer alternatives that taste just as good.
                    </p>
                 </div>
                 <ParticleExplosion color="#60a5fa" />
             </motion.div>
           );
        }}
      </ScrollSection>

      {/* 4. CTA */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
         <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center' }}
         >
             <h2 style={{ fontSize: '5rem', marginBottom: '2rem' }}>Ready?</h2>
             <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                <Link href="/auth">
                    <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>Get Started</button>
                </Link>
                <Link href="/dashboard">
                    <button className="btn-outline" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>Live Demo</button>
                </Link>
             </div>
         </motion.div>
      </div>

    </div>
  );
};

export default Home;
