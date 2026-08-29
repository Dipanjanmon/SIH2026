import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnect(true);
      setTimeout(() => setShowReconnect(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnect) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold transition-all ${
      isOnline
        ? 'bg-green-500 text-white'
        : 'bg-amber-500 text-white'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          Back online — syncing data...
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          Offline mode — reports will sync when connected
        </>
      )}
    </div>
  );
}
