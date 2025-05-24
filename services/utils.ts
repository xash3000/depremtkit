import * as Notifications from 'expo-notifications';
import { Item } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  async scheduleExpirationReminder(item: Item): Promise<string | null> {
    if (!item.expirationDate) return null;
    
    try {
      // For now, just return null to disable notifications
      // TODO: Fix notification trigger format
      return null;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async scheduleWeeklyCheck(): Promise<string | null> {
    try {
      // For now, just return null to disable notifications
      // TODO: Fix notification trigger format
      return null;
    } catch (error) {
      console.error('Error scheduling weekly check:', error);
      return null;
    }
  },
};

export const dateUtils = {
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  },

  getDaysUntilExpiration(expirationDate: string): number {
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isExpired(expirationDate: string): boolean {
    return this.getDaysUntilExpiration(expirationDate) < 0;
  },

  isExpiringSoon(expirationDate: string, daysThreshold: number = 7): boolean {
    const days = this.getDaysUntilExpiration(expirationDate);
    return days >= 0 && days <= daysThreshold;
  },
};

export const unitTranslations = {
  pcs: 'adet',
  kg: 'kg',
  L: 'L',
  pack: 'paket',
  box: 'kutu',
  bottle: 'şişe',
} as const;

export const translateUnit = (unit: string): string => {
  return unitTranslations[unit as keyof typeof unitTranslations] || unit;
};

// Export formatDate as a standalone function for convenience
export const formatDate = dateUtils.formatDate;
