'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: '40rem',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 64,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-pill)',
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          marginBottom: 16,
        }}
      >
        <AlertTriangle size={24} strokeWidth={1.7} />
      </div>
      <h1
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          marginBottom: 24,
        }}
      >
        An unexpected error occurred. Please try again.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => reset()}
          style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: 'var(--bg-base)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/app"
          style={{
            display: 'inline-block',
            background: 'transparent',
            color: 'var(--text-secondary)',
            padding: '10px 24px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            textDecoration: 'none',
            border: '1px solid var(--border)',
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

