import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [location] = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="glass" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      padding: '1rem 2rem', 
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '0 0 1rem 1rem',
      margin: '0 1rem'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>
        <Link href="/">EatInSync</Link>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link href="/">Home</Link>
        {isAuthenticated && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/profile">Profile</Link>
          </>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem' }}>Hi, {user?.name}</span>
            <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Logout</button>
          </div>
        ) : (
          <Link href="/auth">
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
