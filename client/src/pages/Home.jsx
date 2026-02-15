// import React, { useRef } from 'react';
// import { Link } from 'wouter';
// import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// // --- Global Background Manager ---
// const GlobalBackground = () => {
//     const { scrollYProgress } = useScroll(); // Global 0-1
//     const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

//     const op1 = useTransform(smoothProgress, [0, 0.2], [1, 0]); // Deep Slate
//     const op2 = useTransform(smoothProgress, [0.1, 0.4, 0.6], [0, 1, 0]); // Amber Glow
//     const op3 = useTransform(smoothProgress, [0.5, 0.8, 1], [0, 1, 0]); // Emerald 
//     const op4 = useTransform(smoothProgress, [0.9, 1], [0, 1]); // Final 

//     return (
//         <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: 'var(--bg-primary)' }}>
//              {/* Base Gradient */}
//             <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, #ffffff 0%, #f0fdf4 100%)' }} />

//             {/* Dynamic Layers */}
//              <motion.div style={{ position: 'absolute', inset: 0, opacity: op2, background: 'radial-gradient(circle at 80% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 60%)' }} />
//              <motion.div style={{ position: 'absolute', inset: 0, opacity: op3, background: 'radial-gradient(circle at 20% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)' }} />
//              <motion.div style={{ position: 'absolute', inset: 0, opacity: op4, background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 70%)' }} />
            
//              {/* Noise Texture for Premium Feel */}
//             <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/200' filter='contrast(150%25)'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />
//         </div>
//     );
// };

// // --- The Traveler (Glowing Orb) ---
// const ScrollTraveler = () => {
//     const { scrollYProgress } = useScroll();
//     const springProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 15 });

//     const x = useTransform(springProgress, [0, 0.25, 0.5, 0.75, 1], ["80vw", "20vw", "80vw", "50vw", "50vw"]);
//     const y = useTransform(springProgress, [0, 0.25, 0.5, 0.75, 1], ["15vh", "40vh", "60vh", "80vh", "50vh"]);
//     const scale = useTransform(springProgress, [0, 0.5, 1], [1, 2, 0.5]);
//     const glow = useTransform(springProgress, [0, 0.5, 1], ["0px 0px 20px var(--primary)", "0px 0px 60px var(--accent)", "0px 0px 40px rgba(99, 102, 241, 0.4)"]);
//     const color = useTransform(springProgress, [0, 0.5, 1], ["#f59e0b", "#10b981", "#6366f1"]);

//     return (
//         <motion.div 
//             style={{ 
//                 position: 'fixed', 
//                 top: 0, left: 0,
//                 x, y, scale,
//                 width: '20px',
//                 height: '20px',
//                 borderRadius: '50%',
//                 background: color,
//                 boxShadow: glow,
//                 zIndex: 50,
//                 pointerEvents: 'none'
//             }}
//         />
//     );
// };

// // --- Section Component ---
// const ScrollSection = ({ children, height = "150vh" }) => {
//   const ref = useRef(null);
//   const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
//   const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

//   return (
//     <div ref={ref} style={{ height, position: 'relative' }}>
//       <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         {children(smoothProgress)}
//       </div>
//     </div>
//   );
// };

// // --- VFX ---
// const ParticleExplosion = ({ color }) => (
//     <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
//        {[...Array(15)].map((_, i) => (
//          <motion.div
//            key={i}
//            style={{
//              position: 'absolute', left: '50%', top: '50%', width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, borderRadius: '50%', background: color,
//            }}
//            animate={{ 
//                x: (Math.random() - 0.5) * 800, 
//                y: (Math.random() - 0.5) * 800, 
//                opacity: [0, 1, 0],
//                scale: [0, 1, 0]
//            }}
//            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeOut", delay: Math.random() * 2 }}
//          />
//        ))}
//     </div>
// );

// const Home = () => {
//   return (
//     <div style={{ color: '#1e293b', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
//       <GlobalBackground />
//       <ScrollTraveler />

//       {/* 1. HERO */}
//       <ScrollSection height="200vh">
//         {(progress) => {
//            const scale = useTransform(progress, [0, 0.5], [1, 0.8]);
//            const opacity = useTransform(progress, [0.3, 0.6], [1, 0]);
//            const y = useTransform(progress, [0, 0.5], [0, -100]);
           
//            return (
//              <motion.div style={{ scale, opacity, y, textAlign: 'center', zIndex: 10, position: 'relative' }}>
//                 <motion.div 
//                     initial={{ opacity: 0, y: 50 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 1, ease: 'easeOut' }}
//                 >
//                     <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 800, lineHeight: 0.9, marginBottom: '1rem', letterSpacing: '-0.04em', color: 'black' }}>
//                         Eat In <span style={{ 
//                             background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)', 
//                             WebkitBackgroundClip: 'text', 
//                             WebkitTextFillColor: 'transparent',
//                             fontStyle: 'italic'
//                         }}>Sync.</span>
//                     </h1>
//                 </motion.div>
                
//                 <motion.p 
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 0.8 }}
//                     transition={{ delay: 0.5, duration: 1 }}
//                     style={{ fontSize: '1.5rem', fontWeight: 300, maxWidth: '600px', margin: '0 auto' }}
//                 >
//                     Food that understands your biology.
//                 </motion.p>
                
//                 <ParticleExplosion color="var(--primary)" />
//              </motion.div>
//            );
//         }}
//       </ScrollSection>

//       {/* 2. BIO SYNC */}
//       <ScrollSection height="200vh">
//         {(progress) => {
//            const x = useTransform(progress, [0, 0.3, 0.7, 1], [1000, 0, 0, -1000]);
//            const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
//            const rotate = useTransform(progress, [0, 0.3], [10, 0]);

//            return (
//              <motion.div style={{ x, opacity, rotate, zIndex: 10 }}>
//                 <div 
//                     className="glass"
//                     style={{ 
//                         padding: '4rem', 
//                         borderRadius: '2rem', 
//                         maxWidth: '800px', 
//                         background: 'rgba(255, 255, 255, 0.6)',
//                         border: '1px solid rgba(16, 185, 129, 0.1)',
//                         boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.1)',
//                         textAlign: 'center'
//                     }}
//                 >
//                     <h2 style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '1rem' }}>Bio Sync.</h2>
//                     <p style={{ fontSize: '1.8rem', lineHeight: 1.4, opacity: 0.9 }}>
//                         Stop guessing. <br/>
//                         Align your diet with your unique DNA and health data.
//                     </p>
//                 </div>
//                 <ParticleExplosion color="var(--accent)" />
//              </motion.div>
//            );
//         }}
//       </ScrollSection>

//       {/* 3. TASTE MATCH */}
//       <ScrollSection height="200vh">
//         {(progress) => {
//            const scale = useTransform(progress, [0, 0.5], [0.5, 1]);
//            const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
           
//            return (
//              <motion.div style={{ scale, opacity, zIndex: 10 }}>
//                  <div
//                     className="glass" 
//                     style={{
//                         padding: '4rem',
//                         borderRadius: '2rem',
//                         maxWidth: '800px',
//                         textAlign: 'center',
//                         background: 'rgba(255, 255, 255, 0.6)',
//                         border: '1px solid rgba(59, 130, 246, 0.1)',
//                         boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.1)'
//                     }}
//                  >
//                     <h2 style={{ fontSize: '4rem', color: '#60a5fa', marginBottom: '1rem' }}>Taste Match.</h2>
//                     <p style={{ fontSize: '1.8rem', lineHeight: 1.4, opacity: 0.9 }}>
//                         Delicious shouldn't mean dangerous. <br/>
//                         Find safer alternatives that taste just as good.
//                     </p>
//                  </div>
//                  <ParticleExplosion color="#60a5fa" />
//              </motion.div>
//            );
//         }}
//       </ScrollSection>

//       {/* 4. CTA */}
//       <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
//          <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//             style={{ textAlign: 'center' }}
//          >
//              <h2 style={{ fontSize: '5rem', marginBottom: '2rem', color: '#1e293b' }}>Ready?</h2>
//              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
//                 <Link href="/auth">
//                     <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>Get Started</button>
//                 </Link>
//                 <Link href="/dashboard">
//                     <button className="btn-outline" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>Live Demo</button>
//                 </Link>
//              </div>
//          </motion.div>
//       </div>

//     </div>
//   );
// };

// export default Home;

/* 
  ================================================================
  MANCHURIAN 3D EXPERIENCE - MASTER CONSOLIDATED HOME (JSX)
  ================================================================
  INSTRUCTIONS:
  1. PASTE THIS ENTIRE FILE into your 'home.jsx'.
  2. INSTALL DEPENDENCIES: npm install framer-motion lenis lucide-react clsx
  3. ASSETS: Copy 'public/exploded-frames/' to your new public folder.
  4. FONTS: If you have Google Fonts 'Inter', it will look even better.
  ================================================================
*/


import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import clsx from 'clsx';
import { AlertTriangle, User, Brain, Flame, Droplets, Zap, Heart, Sparkles } from 'lucide-react';

const styles = {
    main: {
        position: 'relative', width: '100%', backgroundColor: '#050505', color: '#fff',
        fontFamily: "'Inter', sans-serif", overflowX: 'hidden'
    },
    // Changed to fixed to ensure it stays pinned while scrolling
    sceneSticky: { position: 'fixed', top: 0, left: 0, height: '100vh', width: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' },
    canvas: { width: '100%', height: '100%', objectFit: 'cover' },
    overlay: { position: 'relative', zIndex: 10, width: '100%', pointerEvents: 'auto' }, // Ensure content is clickable
    section: {
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 10%', pointerEvents: 'auto'
    },
    content: { maxWidth: '45rem', width: '100%' },
    alignLeft: { textAlign: 'left', marginRight: 'auto' },
    alignRight: { textAlign: 'right', marginLeft: 'auto' },
    alignCenter: { textAlign: 'center', margin: '0 auto' },
    hudCard: {
        background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px',
        padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    },
    headingMain: { fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 },
    subText: { fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 300, color: 'rgba(255,255,255,0.7)', marginTop: '2rem' },
    accentText: { color: '#00D6FF' },
    gaugeContainer: { position: 'relative', width: '200px', height: '200px', margin: '0 auto 2rem' },
    gradientText: {
        background: 'linear-gradient(135deg, #00D6FF 0%, #00ff88 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    }
};

// --- SUB-COMPONENTS ---

const HUDSection = ({ children, align = "left" }) => (
    <motion.section
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.6 }}
    >
        <motion.div
            variants={{
                hidden: { opacity: 0.3, x: align === "left" ? -50 : 50, scale: 0.95, filter: 'blur(10px)' },
                visible: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            style={{ ...styles.content, ...(align === "left" ? styles.alignLeft : styles.alignRight) }}
        >
            <div style={styles.hudCard}>{children}</div>
        </motion.div>
    </motion.section>
);

const CircularGauge = ({ value, label }) => (
    <div style={styles.gaugeContainer}>
        <svg style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke="#00D6FF" strokeWidth="6" strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                whileInView={{ strokeDashoffset: 283 - (283 * (value / 100)) }}
                transition={{ duration: 2, delay: 0.3 }}
                strokeLinecap="round"
            />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 900 }}>{value}%</div>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#00D6FF', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
        </div>
    </div>
);

// --- MAIN COMPONENTS ---

function Scene() {
    const canvasRef = useRef(null);
    // Removed containerRef as we are using window scroll
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const whiskImagesRef = useRef([]);
    const { scrollYProgress } = useScroll(); // Track global window scroll
    const whiskFrameIndex = useTransform(scrollYProgress, [0, 1], [1, 240]); // Map 0-1 to 1-240 frames

    useEffect(() => {
        let count = 0;
        const imgs = [];
        // Loop 1 to 240
        for (let i = 1; i <= 240; i++) {
            const img = new Image();
            // Use correct path and extension
            img.src = `/exploded-frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`;
            img.onload = () => { count++; if (count >= 230) setImagesLoaded(true); }; // Allow slightly fewer for fast load
            img.onerror = () => { count++; if (count >= 230) setImagesLoaded(true); }; // Handle missing frames gracefully
            imgs.push(img);
        }
        whiskImagesRef.current = imgs;
    }, []);

    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const render = () => {
            const currentFrame = Math.min(240, Math.max(1, Math.floor(whiskFrameIndex.get())));
            const img = whiskImagesRef.current[currentFrame - 1];
            
            if (canvas && ctx) {
                const w = window.innerWidth;
                const h = window.innerHeight;
                
                // Only resize if needed to avoid flicker
                if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
                    canvas.width = w * dpr; 
                    canvas.height = h * dpr;
                    ctx.scale(dpr, dpr);
                }
                
                ctx.fillStyle = '#050505';
                ctx.fillRect(0, 0, w, h);

                // 3D platform
                const pY = h * 0.75; const pW = w * 0.4;
                const g = ctx.createRadialGradient(w / 2, pY, 0, w / 2, pY, pW / 2);
                g.addColorStop(0, 'rgba(0, 214, 255, 0.15)'); g.addColorStop(1, 'transparent');
                ctx.save(); ctx.translate(w / 2, pY); ctx.scale(1, 0.2); ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(0, 0, pW / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();

                // Particles
                const t = Date.now() * 0.001;
                for (let i = 0; i < 30; i++) {
                    const px = (Math.sin(i * 1.5 + t * 0.15) * 0.5 + 0.5) * w;
                    const py = ((i * 13) % 100) / 100 * h;
                    if (px > w * 0.25 && px < w * 0.75) continue;
                    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(0, 214, 255, 0.15)'; ctx.fill();
                }

                if (img && img.complete && img.naturalHeight !== 0) {
                     const iR = img.width / img.height; 
                     const cR = w / h;
                     let dW = w, dH = h, dx = 0, dy = 0;
                     if (iR > cR) { dH = h; dW = h * iR; } else { dW = w; dH = w / iR; }
                     dx = (w - dW) / 2; dy = (h - dH) / 2;
                     ctx.drawImage(img, dx, dy, dW, dH);
                }
            }
        };
        const unsub = whiskFrameIndex.on("change", render);
        // Also stick a loop to render on resize or idle
        const interval = setInterval(render, 100);
        render(); 
        return () => { unsub(); clearInterval(interval); };
    }, [imagesLoaded]);

    return (
        <div style={styles.sceneSticky}>
            <canvas ref={canvasRef} style={styles.canvas} />
            {!imagesLoaded && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', letterSpacing: '0.4em', color: '#00D6FF', fontWeight: 900 }}>INITIALIZING...</div>
            )}
        </div>
    );
}

// --- MAIN EXPORTED HOME COMPONENT ---

export default function Home() {
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.2 });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    return (
        <main style={styles.main}>
            <Scene />

            <div style={styles.overlay}>
                {/* 1. HERO */}
                <section style={styles.section}>
                    <div style={{ ...styles.content, ...styles.alignCenter }}>
                        <motion.h1 style={styles.headingMain} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}>
                            FROM <span style={styles.gradientText}>INGREDIENTS</span> TO <span style={styles.gradientText}>INTELLIGENCE</span>
                        </motion.h1>
                        <p style={styles.subText}>SCROLL TO ANALYZE BIO-COMPATIBILITY.</p>
                    </div>
                </section>

                {/* 2. TASTE PROFILE (LEFT) */}
                <HUDSection align="left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <User size={24} color="#00D6FF" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>TASTE PROFILE</h2>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem 1rem', border: '1px solid #444', borderRadius: '8px', fontSize: '0.8rem' }}>SPICY: HIGH</div>
                        <div style={{ padding: '0.5rem 1rem', border: '1px solid #444', borderRadius: '8px', fontSize: '0.8rem' }}>LACTOSE: MILD</div>
                    </div>
                </HUDSection>

                {/* 3. BCS (RIGHT) */}
                <HUDSection align="right">
                    <CircularGauge value={62} label="BCS" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>BIOLOGICAL SCORE</h2>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>MEASURES BODY RESPONSE ACCURACY.</p>
                </HUDSection>

                {/* 4. SUGGESTION (LEFT) */}
                <HUDSection align="left">
                    <div style={{ display: 'inline-block', padding: '0.75rem 1.5rem', border: '1px solid #00D6FF', borderRadius: '100px', color: '#00D6FF', fontWeight: 900, marginBottom: '1.5rem' }}>78% MATCH</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>SUGGESTION ENGINE</h2>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>OPTIMIZING FOR YOUR TASTE + BIOLOGY.</p>
                </HUDSection>

                {/* 5. WARNINGS (RIGHT) */}
                <HUDSection align="right">
                    <div style={{ display: 'flex', gap: '1rem', color: '#FFD700', fontWeight: 800, marginBottom: '1rem' }}><AlertTriangle /> PRE-ORDER WARNINGS</div>
                    <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#FFD700' }}>HIGH CAPSAICIN CONTENT DETECTED.</p>
                    </div>
                </HUDSection>

                <div style={{ height: '100vh' }} />
            </div>
        </main>
    );
}
