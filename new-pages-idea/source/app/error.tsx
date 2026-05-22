'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
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
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
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
          onClick={() => unstable_retry()}
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
          href="/"
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
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
