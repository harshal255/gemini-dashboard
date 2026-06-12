'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-main text-text-main">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-text-muted font-medium">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
