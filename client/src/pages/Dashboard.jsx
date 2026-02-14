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

// Reusable Sticky Card Component
// Reusable Card for Horizontal Scroll
const StoryCard = ({ children, color, title, index, width }) => {
  return (
    <div
      className="glass"
      style={{
        minWidth: width || '85vw',
        width: width || '85vw',
        height: '70vh',
        marginRight: '4vw', // Gap handled here
        padding: '2.5rem',
        borderRadius: '2.5rem',
        // Premium Glass Effect
        background: `linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)`,
        backdropFilter: 'blur(24px)', 
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${color ? color + '40' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // Top align content
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Dynamic Glow Background */}
      <div style={{
         position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%',
         background: `radial-gradient(circle at 50% 50%, ${color || '#64748b'}20, transparent 70%)`,
         zIndex: -1, pointerEvents: 'none', filter: 'blur(40px)'
      }} />

      {title && (
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, 
          padding: '1.2rem', 
          borderBottom: `1px solid ${color ? color + '20' : 'rgba(255,255,255,0.05)'}`,
          background: 'rgba(0,0,0,0.2)', fontSize: '0.85rem', 
          fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase',
          color: color || '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
        }}>
          {title}
        </div>
      )}
      <div style={{ overflowY: 'auto', width: '100%', height: '100%', padding: '1.5rem 0.5rem', marginTop: title ? '2rem' : '0' }} className="custom-scrollbar">
        {children}
      </div>
    </div>
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
  const x = useTransform(scrollYProgress, [0, 1], ["5vw", `-${totalScrollWidth}vw`]); // Start with 5vw padding for center look

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
    <div className="container full-height" style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
      <motion.h1
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        What are you eating?
      </motion.h1>

      <div className="glass" style={{ padding: '1rem', borderRadius: '2rem', maxWidth: '600px', margin: '0 auto 3rem', position: 'relative' }} ref={wrapperRef}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search for a dish (e.g. Butter Chicken)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', width: '100%' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: '2rem', opacity: !query ? 0.7 : 1 }}
            disabled={!query.trim()}
          >
            Search
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            type="button" 
            onClick={loadDemo}
            style={{ 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: 'rgba(255,255,255,0.6)', 
              padding: '0.4rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.8rem', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            🥡 Try Demo: Thai Peanut Sauce
          </button>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass"
              style={{
                position: 'absolute', top: '110%', left: 0, right: 0,
                borderRadius: '1rem', overflow: 'hidden', zIndex: 10,
                background: 'rgba(30, 41, 59, 0.95)',
                padding: '0.5rem 0'
              }}
            >
              {suggestions.map((s, i) => (
                <div
                  key={`${s.title}-${i}`}
                  style={{ padding: '0.8rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  className="glass-hover"
                  onClick={() => handleSuggestionClick(s)}
                >
                  <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                    {s.source === 'history' ? '🕒' : (s.type === 'ingredient' ? '🥬' : '🍲')}
                  </span>
                  <span>{s.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.5, fontStyle: 'italic' }}>
                    {s.source === 'history' ? 'Recent' : (s.type === 'ingredient' ? 'Keyword' : 'Recipe')}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && <Loader text={analysis ? 'Analyzing safety...' : 'Searching recipes...'} />}

      {results.length > 0 && !analysis && (
        <>
          <h3 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Found {total} recipes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {results.map((dish, idx) => (
              <motion.div
                key={idx}
                className="glass glass-hover"
                style={{ padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleAnalyze(dish)}
              >
                <h3>{dish.Recipe_title || dish.title || 'Unknown Dish'}</h3>
                <p>{dish.Calories ? `${Math.round(dish.Calories)} kcal` : ''}</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Analyze Details</button>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              {loadingMore ? (
                <Loader text="Fetching more..." />
              ) : (
                <button className="btn btn-outline" onClick={loadMore} style={{ padding: '0.8rem 3rem' }}>
                  Load More Results
                </button>
              )}
            </div>
          )}
        </>
      )}

      {!loading && query && results.length === 0 && !analysis && !showSuggestions && (
        <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '2rem' }}>
          <h3>No recipes found for "{query}"</h3>
          <p>Try checking your spelling or using fewer keywords.</p>
        </div>
      )}

      {analysis && (
          <div ref={scrollRef} style={{ height: `${cardCount * 100}vh`, position: 'relative' }}>
            {/* Horizontal Scroll Section */}
            <div className="sticky-window" style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
              
              {/* Animated Track */}
              <motion.div style={{ x, display: 'flex' }}>
                
                {/* Intro / Title Card (Card 0) */}
                <StoryCard width={`${cardWidth}vw`} color={analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}>
                   <div style={{ padding: '2rem' }}>
                      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                        {analysis.dish.dishName || analysis.dish.Recipe_title}
                      </h1>
                      
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 2rem', borderRadius: '3rem', background: analysis.analysis.block ? 'rgba(239, 68, 68, 0.2)' : (analysis.analysis.bioScore < 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'), border: `1px solid ${analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981')}`, backdropFilter: 'blur(10px)', marginBottom: '3rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {analysis.analysis.block ? '⛔' : (analysis.analysis.bioScore < 50 ? '⚠️' : '✅')}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '0.5px', color: analysis.analysis.block ? '#fca5a5' : (analysis.analysis.bioScore < 50 ? '#fcd34d' : '#6ee7b7') }}>
                          {analysis.analysis.block ? 'NOT RECOMMENDED' : (analysis.analysis.bioScore < 50 ? 'CAUTION ADVISED' : 'SAFE TO EAT')}
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', opacity: 0.9 }}>Bio Sync Score</h2>
                      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
                         <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <motion.circle 
                              cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                              strokeDasharray="283"
                              strokeDashoffset="283"
                              animate={{ strokeDashoffset: 283 - (283 * analysis.analysis.bioScore) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              strokeLinecap="round"
                              style={{ color: analysis.analysis.block ? '#ef4444' : (analysis.analysis.bioScore < 50 ? '#f59e0b' : '#10b981') }}
                            />
                         </svg>
                         <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '4.5rem', fontWeight: 'bold' }}>{Math.round(analysis.analysis.bioScore)}</span>
                            <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>/ 100</span>
                         </div>
                      </div>
                      <p style={{ marginTop: '2rem', fontSize: '1.2rem', opacity: 0.8, maxWidth: '600px', marginInline: 'auto', lineHeight: 1.6 }}>
                        {analysis.analysis.bioScore >= 80 ? 'Matches your biological profile perfectly.' : (analysis.analysis.block ? 'Conflicts with your critical allergies.' : 'Some ingredients may not agree with you.')}
                      </p>
                   </div>
                </StoryCard>

                {/* CARD 2: TASTE MATCH */}
                <StoryCard width={`${cardWidth}vw`} color="#8b5cf6">
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', opacity: 0.9 }}>Taste Match</h2>
                  <div style={{ position: 'relative', width: '250px', height: '250px', margin: '0 auto' }}>
                     <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <motion.circle 
                          cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="8"
                          strokeDasharray="283"
                          strokeDashoffset="283"
                          animate={{ strokeDashoffset: 283 - (283 * analysis.analysis.tasteScore) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                          strokeLinecap="round"
                        />
                     </svg>
                     <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '5rem', fontWeight: 'bold', color: '#a78bfa' }}>{Math.round(analysis.analysis.tasteScore)}%</span>
                     </div>
                  </div>
                  <p style={{ marginTop: '3rem', fontSize: '1.4rem', opacity: 0.8 }}>
                    Based on your flavor preferences.
                  </p>
                </StoryCard>

                {/* CARD 3: BREAKDOWN */}
                <StoryCard width={`${cardWidth}vw`} color="#3b82f6" title="Analysis Breakdown">
                  <h2 style={{ fontSize: '2.2rem', marginBottom: '2rem', opacity: 0.9 }}>Deep Dive</h2>
                  
                  <div style={{ textAlign: 'left', width: '100%', height: '50vh', overflowY: 'auto', paddingRight: '1rem' }} className="custom-scrollbar">
                    {analysis.analysis.evidence.length > 0 ? (
                      analysis.analysis.evidence.map((item, i) => (
                        <div key={i} style={{ marginBottom: '1rem', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', borderLeft: `6px solid ${item.type === 'critical' ? '#ef4444' : '#f59e0b'}` }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                              <strong style={{ fontSize: '1.2rem' }}>{item.ingredient}</strong>
                              <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: item.type === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: item.type === 'critical' ? '#fca5a5' : '#fcd34d', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                {item.type === 'critical' ? 'ALLERGY' : 'SENSITIVITY'}
                              </span>
                           </div>
                           <p style={{ margin: 0, fontSize: '1rem', opacity: 0.8, lineHeight: 1.5 }}>{item.reason}</p>
                        </div>
                      ))
                    ) : (
                       <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6, fontStyle: 'italic', fontSize: '1.2rem' }}>
                         No negative interactions found. This dish looks clean! ✨
                       </div>
                    )}
                    
                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                      {analysis.analysis.breakdown.map((msg, i) => (
                         <p key={i} style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '0.8rem', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: msg }} />
                      ))}
                    </div>
                  </div>
                </StoryCard>

                {/* CARD 4: ALTERNATIVES (Conditional) */}
                {(analysis.alternatives.length > 0 || analysis.analysis.modifications) && (
                   <StoryCard width={`${cardWidth}vw`} color="#10b981">
                      <h2 style={{ fontSize: '2.2rem', marginBottom: '2rem', opacity: 0.9, color: '#6ee7b7' }}>Safer Alternatives</h2>
                      
                      <div style={{ height: '50vh', overflowY: 'auto', width: '100%', paddingRight: '1rem' }} className="custom-scrollbar">
                        {analysis.analysis.modifications && analysis.analysis.modifications.length > 0 && (
                           <div style={{ marginBottom: '2.5rem', textAlign: 'left', width: '100%' }}>
                              <h4 style={{ opacity: 0.9, marginBottom: '1.2rem', fontSize: '1.2rem', color: '#a7f3d0' }}>Recommended Swaps</h4>
                              {analysis.analysis.modifications.map((mod, k) => (
                                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                     <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>{mod.original}</span>
                                     <span style={{ fontSize: '1.2rem' }}>➔</span>
                                     <span style={{ fontWeight: 'bold', color: '#6ee7b7', fontSize: '1.1rem' }}>{mod.swap}</span>
                                  </div>
                              ))}
                           </div>
                        )}

                        {analysis.alternatives.length > 0 && (
                          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <h4 style={{ opacity: 0.9, textAlign: 'left', fontSize: '1.2rem', color: '#a7f3d0' }}>Similiar Safe Recipes</h4>
                            {analysis.alternatives.map((alt, idx) => (
                              <div
                                key={idx}
                                className="glass-hover"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
                                onClick={() => handleAnalyze(alt)}
                              >
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{alt.Recipe_title || alt.title}</div>
                                  <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>High Match</div>
                                </div>
                                <span style={{ fontSize: '1.5rem' }}>👉</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                   </StoryCard>
                )}
                
                {/* Final: Reaction Prompt */}
                 <div style={{ minWidth: '40vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>How did your body react?</h3>
                    <div className="reaction-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <button className="reaction-btn" onClick={() => LogReaction(analysis.dish.dishName, 'No problem')} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>👍 Good</button>
                      <button className="reaction-btn" onClick={() => LogReaction(analysis.dish.dishName, 'Minor discomfort')} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>😐 Bloat</button>
                      <button className="reaction-btn danger" onClick={() => LogReaction(analysis.dish.dishName, 'Severe')} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>👎 Bad</button>
                    </div>
                 </div>

              </motion.div>
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
