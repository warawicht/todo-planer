import { Injectable } from '@nestjs/common';

@Injectable()
export class InputSanitizationService {
  /**
   * Sanitize text input to prevent XSS and other security issues
   * @param input The input string to sanitize
   * @returns The sanitized string
   */
  sanitizeText(input: string): string {
    if (!input) return input;
    
    // Remove any HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Limit length to prevent abuse
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }
    
    return sanitized.trim();
  }

  /**
   * Sanitize note input with appropriate length limits
   * @param input The input string to sanitize
   * @returns The sanitized string
   */
  sanitizeNote(input: string): string {
    if (!input) return input;
    
    // Remove any HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Limit length to 500 characters for notes
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500);
    }
    
    return sanitized.trim();
  }

  /**
   * Validate and sanitize UUID input
   * @param input The UUID string to validate
   * @returns The validated UUID or null if invalid
   */
  sanitizeUuid(input: string): string | null {
    if (!input) return null;
    
    // Basic UUID format validation (v4 UUID pattern)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(input)) {
      return input.toLowerCase();
    }
    
    return null;
  }

  /**
   * Sanitize permission level input
   * @param input The permission level string to sanitize
   * @returns The sanitized permission level or null if invalid
   */
  sanitizePermissionLevel(input: string): 'view' | 'edit' | 'manage' | null {
    if (!input) return null;
    
    const validPermissions = ['view', 'edit', 'manage'];
    const sanitized = input.toLowerCase().trim();
    
    if (validPermissions.includes(sanitized)) {
      return sanitized as 'view' | 'edit' | 'manage';
    }
    
    return null;
  }

  /**
   * Sanitize assignment status input
   * @param input The assignment status string to sanitize
   * @returns The sanitized assignment status or null if invalid
   */
  sanitizeAssignmentStatus(input: string): 'pending' | 'accepted' | 'rejected' | 'completed' | null {
    if (!input) return null;
    
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    const sanitized = input.toLowerCase().trim();
    
    if (validStatuses.includes(sanitized)) {
      return sanitized as 'pending' | 'accepted' | 'rejected' | 'completed';
    }
    
    return null;
  }

  /**
   * Sanitize availability status input
   * @param input The availability status string to sanitize
   * @returns The sanitized availability status or null if invalid
   */
  sanitizeAvailabilityStatus(input: string): 'available' | 'busy' | 'away' | 'offline' | null {
    if (!input) return null;
    
    const validStatuses = ['available', 'busy', 'away', 'offline'];
    const sanitized = input.toLowerCase().trim();
    
    if (validStatuses.includes(sanitized)) {
      return sanitized as 'available' | 'busy' | 'away' | 'offline';
    }
    
    return null;
  }

  /**
   * Validate and sanitize date input
   * @param input The date string to validate
   * @returns The validated Date object or null if invalid
   */
  sanitizeDate(input: string): Date | null {
    if (!input) return null;
    
    const date = new Date(input);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Prevent dates too far in the past or future
    const now = new Date();
    const maxFuture = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());
    const minPast = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    
    if (date > maxFuture || date < minPast) {
      return null;
    }
    
    return date;
  }
}