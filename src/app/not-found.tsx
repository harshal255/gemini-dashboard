'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-main text-text-main px-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,var(--active-model-border)_0%,rgba(0,0,0,0)_60%)]" />
      
      <div className="z-10 text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-primary-accent select-none drop-shadow-[0_0_15px_rgba(224,122,95,0.3)] animate-pulse">
          404
        </h1>
        
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
          Page Not Found
        </h2>
        
        <p className="mt-4 text-base text-text-muted leading-relaxed">
          The page you are looking for does not exist, or has been moved to another coordinate in the sandbox.
        </p>
        
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-accent hover:bg-primary-accent-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-accent shadow-md shadow-primary-accent/10"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
