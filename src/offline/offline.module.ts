import { Module, OnModuleInit } from '@nestjs/common';
import { LocalForageService } from './localforage.service';
import { SyncService } from './sync.service';
import { NetworkStatusService } from './network-status.service';
import { OfflineController } from './offline.controller';

@Module({
  imports: [],
  controllers: [OfflineController],
  providers: [LocalForageService, SyncService, NetworkStatusService],
  exports: [LocalForageService, SyncService, NetworkStatusService],
})
export class OfflineModule implements OnModuleInit {
  constructor(
    private readonly networkStatusService: NetworkStatusService,
    private readonly syncService: SyncService,
  ) {}

  async onModuleInit() {
    // Set up the sync service in the network status service
    this.networkStatusService.setSyncService(this.syncService);
  }
}