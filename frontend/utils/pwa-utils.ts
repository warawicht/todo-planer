// Utility functions for PWA functionality

// Register service worker
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered: ', registration);
          
          // Check for updates
          registration.update();
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available
                    console.log('New content is available; please refresh.');
                    // Show update notification to user
                    showUpdateNotification();
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.');
                  }
                }
              });
            }
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// Show update notification
function showUpdateNotification(): void {
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.backgroundColor = '#007bff';
  notification.style.color = 'white';
  notification.style.padding = '10px';
  notification.style.borderRadius = '4px';
  notification.style.zIndex = '10000';
  notification.textContent = 'New version available. Refresh to update.';
  
  // Add refresh button
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Refresh';
  refreshButton.style.marginLeft = '10px';
  refreshButton.style.backgroundColor = 'white';
  refreshButton.style.color = '#007bff';
  refreshButton.style.border = 'none';
  refreshButton.style.padding = '5px 10px';
  refreshButton.style.borderRadius = '3px';
  refreshButton.style.cursor = 'pointer';
  refreshButton.onclick = () => {
    // Skip waiting for the new service worker
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    window.location.reload();
  };
  
  notification.appendChild(refreshButton);
  document.body.appendChild(notification);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 10000);
}

// Handle install prompt
export function handleInstallPrompt(): void {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or banner
    showInstallPrompt();
  });

  function showInstallPrompt(): void {
    // Create install prompt UI
    const installBanner = document.createElement('div');
    installBanner.style.position = 'fixed';
    installBanner.style.top = '20px';
    installBanner.style.right = '20px';
    installBanner.style.backgroundColor = '#28a745';
    installBanner.style.color = 'white';
    installBanner.style.padding = '15px';
    installBanner.style.borderRadius = '4px';
    installBanner.style.zIndex = '10000';
    installBanner.style.maxWidth = '300px';
    installBanner.textContent = 'Install Todo Planer for a better experience';
    
    // Add install button
    const installButton = document.createElement('button');
    installButton.textContent = 'Install';
    installButton.style.marginTop = '10px';
    installButton.style.backgroundColor = 'white';
    installButton.style.color = '#28a745';
    installButton.style.border = 'none';
    installButton.style.padding = '8px 16px';
    installButton.style.borderRadius = '4px';
    installButton.style.cursor = 'pointer';
    installButton.style.display = 'block';
    installButton.onclick = () => {
      // Show the install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
          
          // Remove the banner
          if (installBanner.parentNode) {
            installBanner.parentNode.removeChild(installBanner);
          }
        });
      }
    };
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
      if (installBanner.parentNode) {
        installBanner.parentNode.removeChild(installBanner);
      }
    };
    
    installBanner.appendChild(closeButton);
    installBanner.appendChild(installButton);
    document.body.appendChild(installBanner);
  }
}

// Check if app is running as PWA
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

// Network status monitoring
export class NetworkStatus {
  private static isOnline: boolean = navigator.onLine;
  private static listeners: Array<(online: boolean) => void> = [];

  static initialize(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  static getCurrentStatus(): boolean {
    return this.isOnline;
  }

  static addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }

  static removeListener(callback: (online: boolean) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(callback => callback(online));
  }
}

// Initialize network status monitoring
NetworkStatus.initialize();