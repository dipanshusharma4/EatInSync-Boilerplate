import React, { useRef } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Global Background Manager ---
// Seamlessly transitions backgrounds behind ALL content based on global scroll
const GlobalBackground = () => {
    const { scrollYProgress } = useScroll(); // Global 0-1
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

    const op1 = useTransform(smoothProgress, [0, 0.25, 0.35], [1, 1, 0]); // Dark Table
    const op2 = useTransform(smoothProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0]); // Green Salad
    const op3 = useTransform(smoothProgress, [0.55, 0.65, 0.85, 0.95], [0, 1, 1, 0]); // Spices
    const op4 = useTransform(smoothProgress, [0.85, 0.95], [0, 1]); // Final CTA

    const scale = useTransform(smoothProgress, [0, 1], [1.1, 1]); // Gentle global zoom

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: '#0f172a' }}>
            <motion.div style={{ position: 'absolute', inset: 0, opacity: op1, scale, backgroundImage: `url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?q=80&w=1920&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)' }} />
            <motion.div style={{ position: 'absolute', inset: 0, opacity: op2, scale, backgroundImage: `url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1920&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4) sepia(0.2) hue-rotate(90deg)' }} />
            <motion.div style={{ position: 'absolute', inset: 0, opacity: op3, scale, backgroundImage: `url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1920&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) contrast(1.2)' }} />
            <motion.div style={{ position: 'absolute', inset: 0, opacity: op4, background: 'radial-gradient(circle at 50% 100%, #1e293b 0%, #000 70%)' }} />
            
            {/* Overlay to unify contrast */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
        </div>
    );
};

// --- The Dynamic Traveler (Reference: Spylt/Spoon) ---
// Stays fixed but moves/rotates based on scroll section to guide the eye
const ScrollTraveler = () => {
    const { scrollYProgress } = useScroll();
    const springProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 15 });

    // Path: Starts top-right, dips to center, moves left, then centers for CTA
    const x = useTransform(springProgress, [0, 0.3, 0.6, 1], ["40vw", "0vw", "-35vw", "0vw"]);
    const y = useTransform(springProgress, [0, 0.3, 0.6, 1], ["-10vh", "30vh", "50vh", "20vh"]);
    const rotate = useTransform(springProgress, [0, 0.3, 0.6, 1], [15, -45, -120, 0]);
    const scale = useTransform(springProgress, [0, 0.1, 1], [0.5, 1, 0.8]);

    return (
        <motion.div 
            style={{ 
                position: 'fixed', 
                top: '40%', 
                left: '50%', 
                x, y, rotate, scale,
                zIndex: 50,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
            }}
        >
            {/* High-Quality Silver Spoon Asset */}
            <img 
                src="https://pngimg.com/uploads/spoon/spoon_PNG3055.png" 
                alt="Traveler Spoon" 
                style={{ width: '400px', height: 'auto', transform: 'rotate(45deg)' }} 
            />
        </motion.div>
    );
};

// --- Components ---

const ScrollSection = ({ children, height = "200vh" }) => {
  const ref = useRef(null);
  
  // Adjusted for stickiness: We want 0-1 to represent the time it's sticky.
  const { scrollYProgress: stickyProgress } = useScroll({
    target: ref, offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(stickyProgress, { stiffness: 40, damping: 20, restDelta: 0.001 });

  return (
    <div ref={ref} style={{ height, position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children(smoothProgress)}
      </div>
    </div>
  );
};

// --- VFX Components ---

const FloatingParticles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.4)',
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, willChange: 'transform, opacity'
          }}
          animate={{ y: [0, -60, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
);

const SteamVent = () => (
     <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 10 }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', bottom: '-20%', left: `${20 + Math.random() * 60}%`, width: '300px', height: '500px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', filter: 'blur(30px)', borderRadius: '50%', transformOrigin: 'bottom center', willChange: 'transform, opacity'
            }}
            animate={{ y: [-100, -800], opacity: [0, 0.4, 0], scale: [1, 2, 3], x: [0, (Math.random() - 0.5) * 200] }}
            transition={{ duration: 8 + Math.random() * 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
          />
        ))}
     </div>
);

const ParticleExplosion = ({ color = "#fca5a5" }) => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 20 }}>
       {[...Array(20)].map((_, i) => (
         <motion.div
           key={i}
           style={{
             position: 'absolute', left: '50%', top: '50%', width: Math.random() * 6 + 3, height: Math.random() * 6 + 3, borderRadius: '50%', background: color, filter: 'blur(1px)', boxShadow: `0 0 10px ${color}`, willChange: 'transform, opacity'
           }}
           animate={{ x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 1200, opacity: [0, 1, 0, 0], scale: [0, 1.5, 0] }}
           transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, ease: "easeOut", delay: Math.random() * 2 }}
         />
       ))}
    </div>
);

// --- Main Page ---

const Home = () => {
  return (
    // FIX: Removed solid 'background: #0f172a' to allow GlobalBackground to show
    <div style={{ color: '#f8fafc', fontFamily: '"Inter", sans-serif', minHeight: '900vh' }}>
      
      <GlobalBackground />
      <ScrollTraveler /> {/* The "Dynamic" element */}

      {/* 1. HERO SECTION - Extended Visibility */}
      <ScrollSection height="300vh">
        {(progress) => {
           // Range extended: stays visible until 0.8, then quick fade
           const scale = useTransform(progress, [0, 0.6], [1, 3.5]); 
           const rotate = useTransform(progress, [0, 0.6], [0, 90]);
           const opacity = useTransform(progress, [0.6, 0.85], [1, 0]); // Stays visible much longer
           
           const textY = useTransform(progress, [0, 0.6], [0, -150]);
           const textOp = useTransform(progress, [0, 0.4], [1, 0]);

           return (
             <>
               <FloatingParticles />
               
               <motion.div 
                 style={{ 
                   position: 'absolute', width: '45vh', height: '45vh', borderRadius: '50%',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   scale, rotate, opacity,
                   boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                   overflow: 'hidden', zIndex: 10,
                   willChange: 'transform, opacity'
                 }}
               >
                   <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop" alt="Healthy Bowl" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </motion.div>

               <motion.div style={{ position: 'absolute', opacity: textOp, y: textY, zIndex: 20, textAlign: 'center' }}>
                  <motion.h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(5rem, 12vw, 9rem)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: 0.9, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    Eat In <span style={{ color: '#4ade80', fontStyle: 'italic' }}>Sync.</span>
                  </motion.h1>
                  <p style={{ fontSize: '1.5rem', opacity: 0.9, fontWeight: 300, marginTop: '2rem', fontStyle: 'italic' }}>
                    Food that loves you back.
                  </p>
               </motion.div>
             </>
           );
        }}
      </ScrollSection>

      {/* 2. BIO SYNC - Seamless Entry */}
      <ScrollSection height="250vh">
        {(progress) => {
           // Enters while Hero is scaling out
           const y = useTransform(progress, [0, 0.4], [100, 0]);
           const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]); // Fade in quickly
           
           return (
             <>
               <SteamVent /> 
               <FloatingParticles />

               <motion.div style={{ y, opacity, zIndex: 10, textAlign: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', padding: '4rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '4.5rem', fontWeight: 700, color: '#d1fae5', marginBottom: '1rem' }}>Bio Sync.</h2>
                  <p style={{ fontSize: '2rem', maxWidth: '600px', lineHeight: 1.4, fontWeight: 300 }}>
                    Your biology is unique.<br/><span style={{ color: '#6ee7b7', fontWeight: 600 }}>Why guess?</span>
                  </p>
               </motion.div>
             </>
           );
        }}
      </ScrollSection>

      {/* 3. TASTE MATCH - Seamless Overlap */}
      <ScrollSection height="250vh">
        {(progress) => {
          const scale = useTransform(progress, [0, 0.5], [0.8, 1]);
          const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
          const rotateX = useTransform(progress, [0, 0.5], [20, 0]);

          return (
             <div style={{ perspective: '1000px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ParticleExplosion color="#fbbf24" />
                <ParticleExplosion color="#a78bfa" />
                <FloatingParticles />

                <motion.div style={{ scale, opacity, rotateX, zIndex: 10, textAlign: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', padding: '4rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                   <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '4.5rem', fontWeight: 700, color: '#ddd6fe', marginBottom: '1rem' }}>Taste Match.</h2>
                   <p style={{ fontSize: '2rem', maxWidth: '600px', lineHeight: 1.4, fontWeight: 300 }}>
                     <span style={{ color: '#fbbf24', fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>Explosive</span> flavor.<br/>Perfectly matched.
                   </p>
                </motion.div>
             </div>
          );
        }}
      </ScrollSection>

      {/* 4. FINAL CTA */}
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
         {/* Background handled by GlobalBackground */}
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
           style={{ textAlign: 'center', zIndex: 10 }}
         >
             <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '4rem', fontWeight: '800', marginBottom: '2rem', letterSpacing: '-0.02em' }}>Ready to dine?</h2>
             <div style={{ gap: '1.5rem', display: 'flex', justifyContent: 'center' }}>
               <Link href="/auth">
                 <button className="btn btn-primary" style={{ fontFamily: '"Inter", sans-serif', fontSize: '1.2rem', padding: '1rem 3rem', borderRadius: '3rem', fontWeight: 600 }}>Get Started</button>
               </Link>
               <Link href="/dashboard">
                 <button className="btn btn-outline" style={{ fontFamily: '"Inter", sans-serif', fontSize: '1.2rem', padding: '1rem 3rem', borderRadius: '3rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Demo Mode</button>
               </Link>
             </div>
         </motion.div>
         <footer style={{ position: 'absolute', bottom: '2rem', opacity: 0.4, fontSize: '0.9rem', fontFamily: '"Inter", sans-serif' }}>
           © 2024 EatInSync. Limitless Hackathon.
         </footer>
      </div>

    </div>
  );
};

export default Home;


