'use client';

import { useEffect, useState } from 'react';

export default function DevModeIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [isAuthBypassed, setIsAuthBypassed] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    setIsDev(isDevelopment);

    // Check if auth is bypassed
    const isAuthSkipped = process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
    setIsAuthBypassed(isAuthSkipped);

    // Only show in development
    setIsVisible(isDevelopment);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-3 py-2 rounded-md shadow-lg z-50 text-xs font-mono">
      <div className="flex flex-col">
        <span>DEV MODE {isDev ? '✓' : '✗'}</span>
        {isAuthBypassed && <span>AUTH BYPASSED</span>}
      </div>
    </div>
  );
} 