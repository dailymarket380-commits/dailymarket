'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Global Exception:', error);
  }, [error]);

  // Strip database query details or ugly stack traces from the user-facing message
  let displayMessage = 'We encountered an unexpected issue while loading this page.';
  
  if (error.message.includes('fetch') || error.message.includes('network')) {
    displayMessage = 'There was a network error connecting to our servers. Please check your internet connection.';
  } else if (error.message.includes('permission') || error.message.includes('authorized')) {
    displayMessage = 'You do not have permission to view this resource.';
  } else if (error.message.length < 50 && !error.message.includes('Postgres') && !error.message.includes('JSON')) {
    // Show short, non-database error messages
    displayMessage = error.message;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#fee2e2',
          color: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 24px',
          fontWeight: '900'
        }}>
          !
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Oops! Something went wrong.
        </h1>
        
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
          {displayMessage}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
          <Link 
            href="/"
            style={{
              padding: '12px 24px',
              background: '#f1f5f9',
              color: '#334155',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px'
            }}
          >
            Return Home
          </Link>
        </div>
        
        {error.digest && (
          <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8' }}>
            Error Reference: {error.digest}
          </div>
        )}
      </div>
    </div>
  );
}
