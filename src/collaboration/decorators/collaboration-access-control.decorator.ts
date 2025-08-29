import { SetMetadata } from '@nestjs/common';
import { CollaborationAccessControlOptions } from '../guards/collaboration-access.guard';

export const CollaborationAccessControl = (options: CollaborationAccessControlOptions) => 
  SetMetadata('collaborationAccessControl', options);