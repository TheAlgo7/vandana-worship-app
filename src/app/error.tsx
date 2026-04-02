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
        padding: 'var(--space-lg) var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 'var(--space-xl)',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
      <h1
        style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        An unexpected error occurred. Please try again.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <button
          onClick={() => unstable_retry()}
          style={{
            display: 'inline-block',
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 'var(--font-size-base)',
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
            color: 'var(--color-text-muted)',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: 'var(--font-size-base)',
            textDecoration: 'none',
            border: '1px solid var(--color-border)',
          }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
