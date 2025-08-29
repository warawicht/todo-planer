import { useState, useEffect } from 'react';
import { NetworkStatus } from '../utils/pwa-utils';

// Custom hook for PWA functionality
export function usePWA() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    // Check initial network status
    setIsOnline(NetworkStatus.getCurrentStatus());
    
    // Check if running as PWA
    setIsPWA(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
    
    // Listen for network status changes
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
    };
    
    NetworkStatus.addListener(handleNetworkChange);
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            setUpdateAvailable(true);
          });
        }
      });
    }
    
    // Cleanup listeners
    return () => {
      NetworkStatus.removeListener(handleNetworkChange);
    };
  }, []);

  // Function to trigger service worker update
  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  return {
    isOnline,
    isPWA,
    updateAvailable,
    updateServiceWorker
  };
}