import * as Notifications from 'expo-notifications';
import { Item } from '../types';
import { databaseService } from './database';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // If this is a monthly check notification, perform the check
    if (notification.request.content.title === '📦 Deprem Çantası Kontrolü') {
      await notificationService.checkExpiringItemsAndNotify();
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
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
      const expirationDate = new Date(item.expirationDate);
      const now = new Date();
      const timeDiff = expirationDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      // Schedule notification 3 days before expiration
      if (daysDiff > 3) {
        const notificationDate = new Date(expirationDate);
        notificationDate.setDate(notificationDate.getDate() - 3);
        const secondsUntilNotification = Math.floor((notificationDate.getTime() - now.getTime()) / 1000);
        
        if (secondsUntilNotification > 0) {
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: '⚠️ Son Kullanma Tarihi Yaklaşıyor',
              body: `${item.name} ürününün son kullanma tarihi ${daysDiff} gün sonra sona eriyor.`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: { 
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilNotification 
            },
          });
          
          return identifier;
        }
      } else if (daysDiff >= 0) {
        // If expiring within 3 days, schedule immediate notification
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 Acil: Son Kullanma Tarihi',
            body: `${item.name} ürününün son kullanma tarihi ${daysDiff} gün içinde sona eriyor!`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: null, // immediate
        });
        
        return identifier;
      }
      
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

  async scheduleMonthlyCheck(): Promise<string | null> {
    try {
      // Schedule monthly check (30 days = 30 * 24 * 60 * 60 = 2,592,000 seconds)
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📦 Deprem Çantası Kontrolü',
          body: 'Deprem çantanızdaki ürünleri kontrol etme zamanı geldi!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2592000, // 30 days
          repeats: true 
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling monthly check:', error);
      return null;
    }
  },

  async checkExpiringItemsAndNotify(): Promise<void> {
    try {
      const expiringItems = await databaseService.getExpiringSoonItems(7);
      const expiredItems = await databaseService.getExpiredItems();

      if (expiredItems.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 Süresi Dolmuş Ürünler!',
            body: `Deprem çantanızdaki ${expiredItems.length} ürününüzün süresi dolmuş. Hemen kontrol edin!`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: null, // immediate
        });
      } else if (expiringItems.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Yakında Süresi Dolacak Ürünler',
            body: `${expiringItems.length} ürününüzün süresi yakında dolacak. Kontrol edin.`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // immediate
        });
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '✅ Deprem Çantası Durumu İyi',
            body: 'Tüm ürünleriniz güncel.!',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.DEFAULT,
          },
          trigger: null, // immediate
        });
      }
    } catch (error) {
      console.error('Error checking expiring items:', error);
    }
  },

  async initializeNotifications(): Promise<boolean> {
    try {
      const permissionGranted = await this.requestPermissions();
      if (permissionGranted) {
        // Cancel any existing monthly check notifications
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        // Start the monthly check
        const identifier = await this.scheduleMonthlyCheck();
        if (identifier) {
          console.log('Monthly check notifications started:', identifier);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  },

  async stopMonthlyCheck(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Monthly check notifications stopped');
    } catch (error) {
      console.error('Error stopping monthly check:', error);
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
