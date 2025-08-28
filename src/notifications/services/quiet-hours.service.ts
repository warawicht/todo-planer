import { Injectable } from '@nestjs/common';
import { NotificationPreference } from '../entities/notification-preference.entity';

@Injectable()
export class QuietHoursService {
  /**
   * Check if the current time is within the user's quiet hours
   * @param preferences User's notification preferences
   * @param userTimezone User's timezone (e.g., 'America/New_York')
   * @returns boolean indicating if current time is within quiet hours
   */
  isWithinQuietHours(preferences: NotificationPreference, userTimezone?: string): boolean {
    // If quiet hours are not enabled, return false
    if (!preferences.quietHoursEnabled) {
      return false;
    }

    // If start or end times are not set, return false
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false;
    }

    // Get current time in user's timezone
    const now = userTimezone ? new Date().toLocaleString('en-US', { timeZone: userTimezone }) : new Date();
    const currentDate = userTimezone ? new Date(now) : new Date();
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes(); // Current time in minutes

    const [startHours, startMinutes] = preferences.quietHoursStart.split(':').map(Number);
    const [endHours, endMinutes] = preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }

    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Check if a notification should be suppressed due to quiet hours
   * @param preferences User's notification preferences
   * @param notificationPriority Priority of the notification (0-4)
   * @param userTimezone User's timezone (e.g., 'America/New_York')
   * @returns boolean indicating if notification should be suppressed
   */
  shouldSuppressNotification(preferences: NotificationPreference, notificationPriority: number, userTimezone?: string): boolean {
    // If quiet hours are not enabled, don't suppress
    if (!preferences.quietHoursEnabled) {
      return false;
    }

    // Don't suppress critical notifications (priority 4)
    if (notificationPriority >= 4) {
      return false;
    }

    // Check if current time is within quiet hours
    return this.isWithinQuietHours(preferences, userTimezone);
  }

  /**
   * Get user-friendly feedback about quiet hours status
   * @param preferences User's notification preferences
   * @param userTimezone User's timezone (e.g., 'America/New_York')
   * @returns string with information about quiet hours status
   */
  getQuietHoursFeedback(preferences: NotificationPreference, userTimezone?: string): string {
    if (!preferences.quietHoursEnabled) {
      return 'Quiet hours are currently disabled';
    }

    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return 'Quiet hours are enabled but not properly configured';
    }

    // Get current time in user's timezone
    const now = userTimezone ? new Date().toLocaleString('en-US', { timeZone: userTimezone }) : new Date();
    const currentDate = userTimezone ? new Date(now) : new Date();
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();

    const [startHours, startMinutes] = preferences.quietHoursStart.split(':').map(Number);
    const [endHours, endMinutes] = preferences.quietHoursEnd.split(':').map(Number);

    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;

    // Format times for display
    const formatTime = (hours: number, minutes: number): string => {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const startFormatted = formatTime(startHours, startMinutes);
    const endFormatted = formatTime(endHours, endMinutes);

    // Check if current time is within quiet hours
    let isQuiet: boolean;
    if (startTime > endTime) {
      isQuiet = currentTime >= startTime || currentTime <= endTime;
    } else {
      isQuiet = currentTime >= startTime && currentTime <= endTime;
    }

    if (isQuiet) {
      return `Quiet hours are currently active (${startFormatted} - ${endFormatted}). Non-critical notifications are suppressed.`;
    } else {
      return `Quiet hours are configured (${startFormatted} - ${endFormatted}) but not currently active.`;
    }
  }
}