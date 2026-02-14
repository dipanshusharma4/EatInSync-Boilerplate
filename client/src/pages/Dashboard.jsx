import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Loader from '../components/Loader';
import { DemoAnalysis } from '../data/demo';

// Max suggestions to show
const MAX_SUGGESTIONS = 8;

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Reusable Sticky Card Component (Premium Glass)
const StoryCard = ({ children, width, index, color, title }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass"
        style={{
          minWidth: width || '85vw',
          width: width || '85vw',
          height: '70vh',
          marginRight: '4vw',
          padding: '0',
          borderRadius: '2rem',
          background: 'rgba(255, 255, 255, 0.8)', // Clearer white
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', // Soft shadow
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Title Bar - Clean & Minimal */}
        <div style={{
          padding: '2rem 2.5rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.03)'
        }}>
           <span style={{
              fontSize: '0.9rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', 
              color: color || '#64748b', display: 'flex', alignItems: 'center', gap: '0.8rem'
           }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color || '#64748b' }} />
              {title}
           </span>
           <span style={{ fontSize: '1.2rem', opacity: 0.3, fontFamily: '"Playfair Display", serif', color: '#1e293b', fontStyle: 'italic' }}>
               {index !== undefined ? String(index + 1).padStart(2, '0') : ''}
           </span>
        </div>

        <div style={{ flex: 1, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            {children}
        </div>
      </motion.div>
    );
};

// ... (Dashboard component start) ...

const Dashboard = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });

  // Responsive Layout
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = isMobile ? 85 : 30; // vw
  const cardGap = isMobile ? 5 : 4; // vw
  
  // Search State - Persisted
  const [query, setQuery] = useState(() => sessionStorage.getItem('dashboard_query') || '');
  // Demo Mode
  const loadDemo = () => {
    setQuery(DemoAnalysis.dish.dishName);
    setAnalysis(DemoAnalysis);
    setResults([DemoAnalysis.dish]); // Mock result for list view
    setShowSuggestions(false);
  };

  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dashboard_results')) || []; } 
    catch(e) { return []; }
  });

  // Suggestion Sources
  const [keywordSuggestions, setKeywordSuggestions] = useState([]); 
  const [historySuggestions, setHistorySuggestions] = useState([]); 

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pagination State - Persisted
  const [page, setPage] = useState(() => parseInt(sessionStorage.getItem('dashboard_page') || '1'));
  const [hasMore, setHasMore] = useState(() => sessionStorage.getItem('dashboard_hasMore') === 'true');
  const [total, setTotal] = useState(() => parseInt(sessionStorage.getItem('dashboard_total') || '0'));

  // Analysis State - Persisted
  const [analysis, setAnalysis] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dashboard_analysis')) || null; } 
    catch(e) { return null; }
  });

  // Determine how many cards we have to calculate width
  const cardCount = (analysis?.alternatives?.length > 0 || analysis?.analysis?.modifications) ? 4 : 3;
  
  // Transform vertical scroll to horizontal movement
  // Add +1 to cardCount to account for the Reaction Section at the end
  const totalScrollWidth = (cardCount) * (cardWidth + cardGap);
  
  // PAUSE & REVEAL LOGIC:
  // 0% -> 85%: Scroll cards horizontally
  // 85% -> 100%: Pause cards, reveal "Scroll Down" indicator
  const x = useTransform(scrollYProgress, [0, 0.85, 1], ["5vw", `-${totalScrollWidth}vw`, `-${totalScrollWidth}vw`]);
  
  // Indicator fades in during the pause phase
  const scrollOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);
  const scrollYValue = useTransform(scrollYProgress, [0.6, 0.9], [20, 0]);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const wrapperRef = useRef(null);

  // Persistence Effects
  useEffect(() => { sessionStorage.setItem('dashboard_query', query); }, [query]);
  useEffect(() => { sessionStorage.setItem('dashboard_results', JSON.stringify(results)); }, [results]);
  useEffect(() => { sessionStorage.setItem('dashboard_page', page); }, [page]);
  useEffect(() => { sessionStorage.setItem('dashboard_hasMore', hasMore); }, [hasMore]);
  useEffect(() => { sessionStorage.setItem('dashboard_total', total); }, [total]);
  useEffect(() => { sessionStorage.setItem('dashboard_analysis', JSON.stringify(analysis)); }, [analysis]);
 
  // Combine Suggestions (History first, then Keywords)
  const suggestions = useMemo(() => {
    const combined = [];
    const seen = new Set();
    
    // 1. History Matches (Local Browser Memory)
    if (query.trim().length >= 2) {
        const normQuery = normalizeText(query);
        const historyMatches = historySuggestions.filter(item => {
            const normTitle = normalizeText(item.title);
            return normTitle.includes(normQuery);
        }).slice(0, 3); // Top 3 history matches

        historyMatches.forEach(h => {
            combined.push({ ...h, source: 'history', type: 'recipe' });
            seen.add(normalizeText(h.title));
        });
    }

    // 2. Keyword Matches (Backend Local DB)
    keywordSuggestions.forEach(k => {
        const key = normalizeText(k.title);
        if (!seen.has(key)) {
            combined.push({ ...k, source: 'keyword' }); // type from backend is 'ingredient'
            seen.add(key);
        }
    });

    return combined.slice(0, MAX_SUGGESTIONS);
  }, [query, keywordSuggestions, historySuggestions]);

  // Fetch Backend Keywords (While Typing)
  useEffect(() => {
    const fetchKeywords = async () => {
      if (debouncedQuery.length < 2) {
        setKeywordSuggestions([]);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        // This endpoint is now LOCAL-ONLY (0 Tokens)
        const res = await axios.get(`http://localhost:5000/api/analyze/suggestions?q=${debouncedQuery}`, {
          headers: { 'x-auth-token': token }
        });
        setKeywordSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Keywords error', err);
      }
    };

    if (!loading) fetchKeywords();
  }, [debouncedQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // Perform Search (Standard or Pagination)
  const performSearch = async (searchQuery, pageIdx = 1, append = false) => {
    if (!append) setLoading(true); else setLoadingMore(true);
    setShowSuggestions(false);
    setAnalysis(null);

    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(`http://localhost:5000/api/analyze/search?q=${encodeURIComponent(searchQuery)}&page=${pageIdx}&limit=8`, {
        headers: { 'x-auth-token': token }
      });

      const data = res.data.data || [];
      if (append) {
        setResults((prev) => [...prev, ...data]);
      } else {
        setResults(data);
      }

      // Add successful results to Local History for future suggestions
      if (data.length > 0) {
          setHistorySuggestions(prev => {
              const newItems = data.map(d => ({ title: d.Recipe_title || d.title, id: d.Recipe_id || d.id }));
              // Simple dedupe by title
              const existingTitles = new Set(prev.map(p => normalizeText(p.title)));
              const filteredNew = newItems.filter(i => !existingTitles.has(normalizeText(i.title)));
              return [...filteredNew, ...prev].slice(0, 50); // Keep last 50
          });
      }

      if (res.data.pagination) {
        setHasMore(res.data.pagination.hasMore);
        setTotal(res.data.pagination.total);
        setPage(pageIdx);
      } else {
        setHasMore(false);
      }

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    let searchTerm = query.trim();
    if (!searchTerm) return;

    // Smart submit: auto-upgrade to top suggestion when typed text is a prefix.
    if (suggestions.length > 0) {
      const topMatch = suggestions[0].title;
      // If query is a prefix of the top suggestion (and at least 2 chars)
      if (topMatch.toLowerCase().startsWith(searchTerm.toLowerCase()) && searchTerm.length >= 2) {
        searchTerm = topMatch;
        setQuery(searchTerm);
      }
    }

    performSearch(searchTerm, 1);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    performSearch(suggestion.title, 1);
  };

  const loadMore = () => {
    performSearch(query, page + 1, true);
  };

  // Analyze a specific dish
  const handleAnalyze = async (dish) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/analyze', {
        recipeId: dish.Recipe_id || dish.id,
        dishName: dish.Recipe_title || dish.title,
        ingredients: dish.ingredients
      }, {
        headers: { 'x-auth-token': token }
      });
      setAnalysis(res.data);
      setResults([]);
    } catch (err) {
      console.error(err);
      alert('Analysis failed');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '110px', paddingBottom: '3rem' }}>
      
      {/* HEADER & SEARCH (Fade out when analyzing) */}
      <AnimatePresence>
        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '4.5rem', marginBottom: '0.5rem', lineHeight: 1.1, color: '#1e293b' }}>
                track your <span style={{ color: 'var(--primary)', fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>intake.</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#64748b' }}>
                Advanced bio-compatibility analysis for your meals.
              </p>
            </div>

            <div className="glass" style={{ padding: '0.8rem', borderRadius: '3rem', maxWidth: '700px', margin: '0 auto 4rem', position: 'relative', border: '1px solid rgba(0,0,0,0.05)', background: 'white' }} ref={wrapperRef}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search for a dish (e.g. Butter Chicken)..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', width: '100%', color: '#1e293b', padding: '1rem 0' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ borderRadius: '2.5rem', padding: '1.2rem 2.5rem', fontSize: '1.1rem' }}
                  disabled={!query.trim()}
                >
                  Analyze
                </button>
              </form>

              {/* Demo Button */}
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '1rem', textAlign: 'center' }}>
                 <button 
                  type="button" 
                  onClick={loadDemo}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', opacity: 0.7 }}
                  className="hover-underline"
                >
                  ✨ Try Demo: Thai Peanut Sauce
                </button>
              </div>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="glass"
                    style={{
                      position: 'absolute', top: '120%', left: 0, right: 0,
                      borderRadius: '1.5rem', overflow: 'hidden', zIndex: 20,
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)'
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <div
                        key={`${s.title}-${i}`}
                        style={{ padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem', color: '#1e293b' }}
                        className="glass-hover"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        <span style={{ fontSize: '1.2rem', background: 'rgba(0,0,0,0.05)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                          {s.source === 'history' ? '🕒' : (s.type === 'ingredient' ? '🥬' : '🍲')}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{s.title}</span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                                {s.source === 'history' ? 'Recently viewed' : (s.type === 'ingredient' ? 'Ingredient' : 'Recipe')}
                            </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING STATE */}
      {loading && (
          <div style={{ margin: '4rem 0' }}>
            <Loader text={analysis ? 'Crunching bio-data...' : 'Scouring recipe database...'} />
          </div>
      )}

      {/* RESULTS GRID */}
      <AnimatePresence>
      {results.length > 0 && !analysis && !loading && (
        <motion.div
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#1e293b' }}>Found <strong style={{ color: 'var(--primary)' }}>{total}</strong> matches</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {results.map((dish, idx) => (
              <motion.div
                key={idx}
                className="glass"
                style={{ 
                    padding: '0', borderRadius: '1.5rem', cursor: 'pointer', overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.05)',
                    background: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' }}
                onClick={() => handleAnalyze(dish)}
              >
                <div style={{ height: '140px', background: `linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3.5rem', opacity: 1 }}>🍲</span>
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.8)', padding: '0.3rem 0.8rem', borderRadius: '1rem', backdropFilter: 'blur(4px)', fontSize: '0.8rem', color: '#1e293b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        {dish.Calories ? `${Math.round(dish.Calories)} kcal` : 'N/A'}
                    </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontFamily: '"Playfair Display", serif', color: '#1e293b' }}>
                        {dish.Recipe_title || dish.title || 'Unknown Dish'}
                    </h3>
                    <button className="btn-outline" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
                        Analyze Safety
                    </button>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              {loadingMore ? (
                <Loader text="Loading more..." />
              ) : (
                <button className="btn-outline" onClick={loadMore} style={{ padding: '1rem 3rem', borderRadius: '2rem' }}>
                  Load More Results
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {!loading && query && results.length === 0 && !analysis && !showSuggestions && (
        <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤷‍♂️</div>
          <h3>No recipes found for "{query}"</h3>
          <p>Try checking your spelling or using fewer keywords.</p>
        </div>
      )}

      {/* ANALYSIS CARDS SCROLL SECTION */}
      {analysis && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            ref={scrollRef}
            style={{ height: `${cardCount * 100}vh`, position: 'relative' }}
          >
            <div className="sticky-window" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>

              <motion.div style={{ x, display: 'flex' }}>

                {/* CARD 1: BIO SYNC */}
                <StoryCard
                    width={`${cardWidth}vw`}
                    index={0}
                    color={analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}
                    title="Bio-Compatibility"
                >
                   <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', marginBottom: '0.5rem', lineHeight: 1.1, color: '#1e293b', maxWidth: '90%', textAlign: 'center' }}>
                        {analysis.dish.dishName || analysis.dish.Recipe_title}
                      </h1>

                      <div style={{ margin: '1.5rem 0', position: 'relative', width: '240px', height: '240px' }}>
                          {/* Pulse Effect */}
                          <div style={{
                              position: 'absolute', inset: 0, borderRadius: '50%',
                              border: `2px solid ${analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}`,
                              animation: 'pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite'
                          }} />

                          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            {/* Track */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                            {/* Indicator */}
                            <motion.circle
                              cx="50" cy="50" r="45" fill="none" stroke="url(#gradientScore)" strokeWidth="6"
                              strokeDasharray="283"
                              strokeDashoffset="283"
                              animate={{ strokeDashoffset: 283 - (283 * analysis.analysis.bioScore) / 100 }}
                              transition={{ duration: 2, ease: "circOut" }}
                              strokeLinecap="round"
                              style={{ filter: `drop-shadow(0 0 10px ${analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}80)` }}
                            />
                            <defs>
                                <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={analysis.analysis.block ? '#7f1d1d' : (analysis.analysis.bioScore < 50 ? '#78350f' : '#064e3b')} />
                                    <stop offset="100%" stopColor={analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')} />
                                </linearGradient>
                            </defs>
                         </svg>

                         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '4.5rem', fontWeight: '800', fontFamily: '"Playfair Display", serif', color: '#1e293b', textShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                {Math.round(analysis.analysis.bioScore)}
                            </span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '3px', textTransform: 'uppercase', marginTop: '-5px', color: '#64748b', fontWeight: 'bold' }}>Score</span>
                         </div>
                      </div>

                      <div style={{
                          padding: '0.6rem 1.5rem', borderRadius: '3rem',
                          background: analysis.analysis.block ? 'rgba(239, 68, 68, 0.1)' : (analysis.analysis.bioScore < 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                          border: `1px solid ${analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}40`,
                          boxShadow: `0 0 20px ${analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}20`,
                          color: analysis.analysis.block ? '#b91c1c' : (analysis.analysis.bioScore < 50 ? '#b45309' : '#047857'), // Darker text for readability
                          fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem'
                      }}>
                          {analysis.analysis.block ? '⛔ Not Recommended' : (analysis.analysis.bioScore < 50 ? '⚠️ Caution Advised' : '✅ Safe to Eat')}
                      </div>
                   </div>
                </StoryCard>

                {/* CARD 2: TASTE MATCH */}
                <StoryCard
                    width={`${cardWidth}vw`}
                    index={1}
                    color="#8b5cf6"
                    title="Flavor Profile"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                      <h2 style={{ fontSize: '3rem', fontFamily: '"Playfair Display", serif', marginBottom: '2rem', color: '#6366f1' }}>
                          Taste Match
                      </h2>

                      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto', animation: 'float 6s ease-in-out infinite' }}>
                         <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
                            <motion.circle
                              cx="50" cy="50" r="45" fill="none" stroke="url(#gradientTaste)" strokeWidth="8"
                              strokeDasharray="283"
                              strokeDashoffset="283"
                              animate={{ strokeDashoffset: 283 - (283 * analysis.analysis.tasteScore) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                              strokeLinecap="round"
                              style={{ filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.5))' }}
                            />
                             <defs>
                                <linearGradient id="gradientTaste" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#7c3aed" />
                                    <stop offset="100%" stopColor="#c4b5fd" />
                                </linearGradient>
                            </defs>
                         </svg>
                         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '4rem', fontWeight: '800', fontFamily: '"Playfair Display", serif', color: '#1e293b' }}>{Math.round(analysis.analysis.tasteScore)}%</span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold', color: '#64748b' }}>Match</span>
                         </div>
                      </div>

                      <p style={{ marginTop: '2rem', fontSize: '1.2rem', opacity: 0.7, maxWidth: '400px', lineHeight: 1.6, color: '#64748b' }}>
                        "This dish aligns with your preference for <span style={{ color: '#6366f1', fontWeight: 'bold' }}>savory</span> and <span style={{ color: '#6366f1', fontWeight: 'bold' }}>spicy</span> flavors."
                      </p>
                  </div>
                </StoryCard>

                {/* CARD 3: DATA INTEL */}
                <StoryCard
                    width={`${cardWidth}vw`}
                    index={2}
                    color="#3b82f6"
                    title="Intel Logs"
                >
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', marginBottom: '1.5rem', textAlign: 'left', color: 'black' }}>Analysis Data</h2>

                      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                          {analysis.analysis.evidence.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              {analysis.analysis.evidence.map((item, i) => (
                                <div key={i} className="glass-hover" style={{
                                    padding: '1.2rem',
                                    background: 'rgba(255,255,255,0.5)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    textAlign: 'left',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                   {/* Corner Accent */}
                                   <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: item.type === 'critical' ? '#ef4444' : '#f59e0b' }} />
                                   
                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', paddingLeft: '1rem' }}>
                                      <strong style={{ fontSize: '1.3rem', color: '#1e293b' }}>{item.ingredient}</strong>
                                      <span style={{ 
                                          fontSize: '0.7rem', padding: '0.3rem 0.8rem', borderRadius: '2rem', 
                                          border: `1px solid ${item.type === 'critical' ? '#ef4444' : '#f59e0b'}`,
                                          color: item.type === 'critical' ? '#b91c1c' : '#b45309', // Dark red/amber
                                          fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase'
                                      }}>
                                        {item.type === 'critical' ? 'Allergy Conflict' : 'Sensitivity'}
                                      </span>
                                   </div>
                                   <p style={{ margin: 0, paddingLeft: '1rem', fontSize: '1rem', opacity: 0.8, lineHeight: 1.6, color: '#475569' }}>{item.reason}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                             <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5, border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '1rem' }}>
                               <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                               <p style={{ fontSize: '1.2rem' }}>No negative interactions detected.</p>
                             </div>
                          )}
                          
                          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'left' }}>
                            {analysis.analysis.breakdown.map((msg, i) => (
                               <p key={i} style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1rem', lineHeight: 1.7, fontFamily: 'monospace', paddingLeft: '1rem', borderLeft: '2px solid rgba(0,0,0,0.1)', color: '#334155' }} dangerouslySetInnerHTML={{ __html: msg }} />
                            ))}
                          </div>
                      </div>
                  </div>
                </StoryCard>

                {/* CARD 4: ALTERNATIVES */}
                {(analysis.alternatives.length > 0 || analysis.analysis.modifications) && (
                   <StoryCard 
                        width={`${cardWidth}vw`} 
                        index={3}
                        color="#10b981" 
                        title="Optimization"
                   >
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                         <h2 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', marginBottom: '2rem', textAlign: 'left', color: '#34d399' }}>Safer Options</h2>
                         
                         <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }} className="custom-scrollbar">
                             {analysis.analysis.modifications && analysis.analysis.modifications.length > 0 && (
                                <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
                                   <h4 style={{ opacity: 0.5, marginBottom: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Recommended Swaps</h4>
                                   <div style={{ display: 'grid', gap: '1rem' }}>
                                       {analysis.analysis.modifications.map((mod, k) => (
                                           <div key={k} style={{ 
                                               display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', 
                                               padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', 
                                               border: '1px solid rgba(16, 185, 129, 0.2)' 
                                           }}>
                                              <div style={{ textDecoration: 'line-through', opacity: 0.6, textAlign: 'center', color: '#ef4444' }}>{mod.original}</div>
                                              <div style={{ color: '#10b981', fontSize: '1.2rem' }}>➔</div>
                                              <div style={{ fontWeight: 'bold', color: '#6ee7b7', textAlign: 'center', fontSize: '1.1rem' }}>{mod.swap}</div>
                                           </div>
                                       ))}
                                   </div>
                                </div>
                             )}

                             {analysis.alternatives.length > 0 && (
                               <div style={{ textAlign: 'left' }}>
                                 <h4 style={{ opacity: 0.5, marginBottom: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>Related Safe Recipes</h4>
                                 <div style={{ display: 'grid', gap: '1rem' }}>
                                     {analysis.alternatives.map((alt, idx) => (
                                       <div
                                         key={idx}
                                         className="glass-hover"
                                         style={{ 
                                             display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                             padding: '1.2rem', background: 'white', 
                                             borderRadius: '1rem', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.05)',
                                             boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                         }}
                                         onClick={() => handleAnalyze(alt)}
                                       >
                                         <div>
                                           <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.3rem', color: '#384353' }}>{alt.Recipe_title || alt.title}</div>
                                           <div style={{ fontSize: '0.8rem', opacity: 1, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                               <span style={{ width: '6px', height: '6px', backgroundColor: '#059669', borderRadius: '50%' }}></span>
                                               98% Compatibility
                                           </div>
                                         </div>
                                         <span style={{ fontSize: '1.2rem', opacity: 0.5, transform: 'rotate(-45deg)', display: 'inline-block' }}>➜</span>
                                       </div>
                                     ))}
                                 </div>
                               </div>
                             )}
                         </div>
                      </div>
                   </StoryCard>
                )}
                
              </motion.div>
              
               {/* Scroll Down Indicator */}
               <motion.div
                style={{
                    position: 'absolute',
                    bottom: '5vh',
                    left: '50%',
                    x: '-50%',
                    // Always visible to guide navigation
                    opacity: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 100,
                    color: '#1e293b' // Dark Text for Light Mode
                }}
               >
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                          opacity: 1, 
                          y: [0, 10, 0] 
                      }}
                      transition={{ 
                          opacity: { duration: 0.8, delay: 1 }, // Delay appearance slightly
                          y: { duration: 2, repeat: Infinity, ease: "easeInOut" } 
                      }}
                      style={{ 
                          width: '50px', height: '50px', 
                          borderRadius: '50%', 
                          border: '2px solid rgba(30, 41, 59, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
                      }}
                  >
                      <span style={{ fontSize: '1.5rem', marginTop: '2px' }}>↓</span>
                  </motion.div>
               </motion.div>

            </div>
          </motion.div>
       )}

       {/* REACTION SECTION (Vertical Scroll) */}
       {analysis && (
          <div style={{ 
              minHeight: '80vh', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 10,
              background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)', // Soft Mint to White
              borderTop: '1px solid rgba(0,0,0,0.05)',
              padding: '4rem 2rem'
          }}>
              {/* Background Glow */}
              <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                  pointerEvents: 'none', filter: 'blur(80px)'
              }} />

              <div className="glass" style={{
                  padding: '4rem', borderRadius: '3rem',
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 30px 60px -15px rgba(0,0,0,0.08)',
                  maxWidth: '800px', width: '100%',
                  textAlign: 'center', position: 'relative', overflow: 'hidden'
              }}>
                  {/* Decorative Elements */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #8b5cf6, transparent)' }} />
                  
                  <h3 style={{ 
                      fontSize: '3.5rem', fontFamily: '"Playfair Display", serif', marginBottom: '1rem',
                      color: '#1e293b'
                  }}>
                      System Feedback
                  </h3>
                  <p style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', color: '#64748b' }}>
                      Help us fine-tune your bio-algorithm. How did your body respond to this fuel?
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      <button 
                          className="glass-hover" 
                          onClick={() => LogReaction(analysis.dish.dishName, 'No problem')} 
                          style={{ 
                              padding: '2rem', borderRadius: '1.5rem', 
                              border: '1px solid rgba(16, 185, 129, 0.3)', 
                              background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.2) 100%)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                              transition: 'all 0.3s ease'
                          }}
                      >
                          <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))' }}>⚡</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#065f46' }}>Optimal</span>
                          <span style={{ fontSize: '0.9rem', opacity: 0.8, color: '#1e293b' }}>Felt great, full energy.</span>
                      </button>

                      <button 
                          className="glass-hover" 
                          onClick={() => LogReaction(analysis.dish.dishName, 'Minor discomfort')} 
                          style={{ 
                              padding: '2rem', borderRadius: '1.5rem', 
                              border: '1px solid rgba(245, 158, 11, 0.3)', 
                              background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.1) 0%, rgba(120, 53, 15, 0.2) 100%)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                              transition: 'all 0.3s ease'
                          }}
                      >
                          <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }}>⚠️</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#92400e' }}>Minor Load</span>
                          <span style={{ fontSize: '0.9rem', opacity: 0.8, color: '#1e293b' }}>Slight bloat or fatigue.</span>
                      </button>

                      <button 
                          className="glass-hover" 
                          onClick={() => LogReaction(analysis.dish.dishName, 'Severe')} 
                          style={{ 
                              padding: '2rem', borderRadius: '1.5rem', 
                              border: '1px solid rgba(239, 68, 68, 0.3)', 
                              background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.1) 0%, rgba(127, 29, 29, 0.2) 100%)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                              transition: 'all 0.3s ease'
                          }}
                      >
                          <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }}>⛔</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#991b1b' }}>Conflict</span>
                          <span style={{ fontSize: '0.9rem', opacity: 0.8, color: '#1e293b' }}>Bad reaction, avoid.</span>
                      </button>
                  </div>
              </div>
          </div>
       )}

    </div>
  );

  async function LogReaction(dishName, reaction) {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/log-reaction', { dishName, reaction }, { headers: { 'x-auth-token': token } });
      alert("Feedback saved! We'll use this to improve your scores.");
    } catch (e) {
      console.error(e);
    }
  }
};

export default Dashboard;
