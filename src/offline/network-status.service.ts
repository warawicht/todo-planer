import { Injectable } from '@nestjs/common';
import { SyncService } from './sync.service';

@Injectable()
export class NetworkStatusService {
  private isOnlineStatus: boolean = true;
  private syncService: SyncService | null = null;

  constructor() {
    // Check initial network status
    this.checkNetworkStatus();
    
    // Set up event listeners for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  // Set the sync service (needed for dependency injection workaround)
  setSyncService(syncService: SyncService): void {
    this.syncService = syncService;
  }

  // Check current network status
  checkNetworkStatus(): boolean {
    if (typeof navigator !== 'undefined') {
      this.isOnlineStatus = navigator.onLine;
    }
    return this.isOnlineStatus;
  }

  // Get current network status
  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  // Handle online event
  private handleOnline(): void {
    console.log('Network connection restored');
    this.isOnlineStatus = true;
    
    // Trigger sync when coming back online
    if (this.syncService) {
      this.syncService.syncPendingChanges().catch(error => {
        console.error('Error syncing when coming online:', error);
      });
    }
  }

  // Handle offline event
  private handleOffline(): void {
    console.log('Network connection lost');
    this.isOnlineStatus = false;
  }

  // Manual sync trigger
  async triggerManualSync(): Promise<void> {
    if (this.syncService) {
      await this.syncService.syncPendingChanges();
    }
  }
}