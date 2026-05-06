import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message = "Connecting to Backend Server..." }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(8px)'
    }}>
      <div className="card" style={{
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          background: 'var(--accent-soft)',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', color: 'var(--primary)' }}>System Initializing</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{
          marginTop: '2rem',
          height: '4px',
          background: 'var(--border)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div className="loading-bar-animation" style={{
            height: '100%',
            background: 'var(--accent)',
            width: '100%'
          }} />
        </div>
      </div>

      <style jsx>{`
        .loading-bar-animation {
          animation: loadingBar 2s infinite ease-in-out;
        }

        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
