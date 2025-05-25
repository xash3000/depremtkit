// Testing utilities for notifications and expiration checking
import * as Notifications from 'expo-notifications';
import { databaseService } from './database';
import { notificationService } from './utils';

export class TestingUtils {
  /**
   * Add test items with various expiration scenarios for demo purposes
   */
  async addTestItems(): Promise<void> {
    const today = new Date();
    
    // Item expired 2 days ago
    const expiredItem = {
      name: 'Test Expired Water',
      category: 'Su ve İçecek',
      quantity: 5,
      unit: 'bottles',
      expirationDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Test item - expired',
      isChecked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Item expiring tomorrow
    const expiringSoonItem = {
      name: 'Test Expiring Cookies',
      category: 'Yiyecek',
      quantity: 3,
      unit: 'packs',
      expirationDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Test item - expiring soon',
      isChecked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Item expiring in 3 days
    const expiringIn3Days = {
      name: 'Test Medicine',
      category: 'İlk Yardım',
      quantity: 1,
      unit: 'box',
      expirationDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Test item - expiring in 3 days',
      isChecked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Item expiring in 1 week
    const expiringInWeek = {
      name: 'Test Canned Food',
      category: 'Yiyecek',
      quantity: 2,
      unit: 'cans',
      expirationDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Test item - expiring in 1 week',
      isChecked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await databaseService.addItem(expiredItem);
      await databaseService.addItem(expiringSoonItem);
      await databaseService.addItem(expiringIn3Days);
      await databaseService.addItem(expiringInWeek);
      
      console.log('Test items added successfully');
    } catch (error) {
      console.error('Error adding test items:', error);
    }
  }

  /**
   * Manually trigger the periodic check for testing
   */
  async triggerPeriodicCheck(): Promise<void> {
    console.log('Triggering periodic check manually...');
    await notificationService.checkExpiringItemsAndNotify();
  }

  /**
   * Schedule a test notification that will fire in a few seconds
   */
  async scheduleTestNotification(
    delaySeconds: number = 5, 
    customContent?: { title: string; body: string }
  ): Promise<string | null> {
    try {
      const content = customContent || {
        title: '🧪 Test Notification',
        body: `This is a test notification fired after ${delaySeconds} seconds`,
      };

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
      });
      
      console.log(`Test notification scheduled for ${delaySeconds} seconds:`, content.title);
      return identifier;
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      return null;
    }
  }

  /**
   * Schedule a "fast" monthly check that triggers every minute instead of every month
   * Use this for demo purposes - remember to cancel it after demo!
   */
  async scheduleFastPeriodicCheck(): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Fast Periodic Check (Demo)',
          body: 'This is a demo periodic check - happens every minute',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60, // 1 minute instead of 30 days
          repeats: true,
        },
      });

      console.log('Fast periodic check scheduled (every minute)');
      return identifier;
    } catch (error) {
      console.error('Error scheduling fast periodic check:', error);
      return null;
    }
  }

  /**
   * Schedule a test expiration reminder that will fire soon
   */
  async scheduleTestExpirationReminder(itemName: string, delaySeconds: number = 10): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Test: Son Kullanma Tarihi Yaklaşıyor',
          body: `${itemName} ürününün son kullanma tarihi yaklaşıyor (Test notification)`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: delaySeconds,
        },
      });
      
      console.log(`Test expiration reminder scheduled for ${delaySeconds} seconds`);
    } catch (error) {
      console.error('Error scheduling test expiration reminder:', error);
    }
  }

  /**
   * Get current notification status and counts
   */
  async getNotificationStats(): Promise<void> {
    try {
      const expiredItems = await databaseService.getExpiredItems();
      const expiringSoonItems = await databaseService.getExpiringSoonItems(7);
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      console.log('\n=== NOTIFICATION STATS ===');
      console.log(`Expired items: ${expiredItems.length}`);
      console.log(`Expiring soon items (7 days): ${expiringSoonItems.length}`);
      console.log(`Scheduled notifications: ${scheduledNotifications.length}`);
      
      if (expiredItems.length > 0) {
        console.log('\nExpired items:');
        expiredItems.forEach(item => console.log(`- ${item.name} (expired: ${item.expirationDate})`));
      }
      
      if (expiringSoonItems.length > 0) {
        console.log('\nExpiring soon items:');
        expiringSoonItems.forEach(item => console.log(`- ${item.name} (expires: ${item.expirationDate})`));
      }
      
      console.log('========================\n');
    } catch (error) {
      console.error('Error getting notification stats:', error);
    }
  }

  /**
   * Clear all test data
   */
  async clearTestData(): Promise<void> {
    try {
      // Cancel all scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Note: You might want to add a method to delete test items
      // For now, this just cancels notifications
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error clearing test data:', error);
    }
  }

  /**
   * Show all currently scheduled notifications
   */
  async showScheduledNotifications(): Promise<void> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      console.log('\n=== SCHEDULED NOTIFICATIONS ===');
      if (notifications.length === 0) {
        console.log('No scheduled notifications');
      } else {
        notifications.forEach((notification, index) => {
          console.log(`${index + 1}. ${notification.content.title}`);
          console.log(`   Body: ${notification.content.body}`);
          console.log(`   Identifier: ${notification.identifier}`);
          if (notification.trigger && 'seconds' in notification.trigger) {
            console.log(`   Trigger: ${notification.trigger.seconds} seconds`);
          }
          console.log('---');
        });
      }
      console.log('===============================\n');
    } catch (error) {
      console.error('Error showing scheduled notifications:', error);
    }
  }

  /**
   * Create items with very short expiration times for real-time testing
   * These items will expire in minutes instead of days
   */
  async createRealTimeTestItems(): Promise<void> {
    const now = new Date();
    
    // Item that expires in 2 minutes
    const expiring2Min = {
      name: 'Real-time Test Water',
      category: 'Su ve İçecek',
      quantity: 1,
      unit: 'bottle',
      expirationDate: new Date(now.getTime() + 2 * 60 * 1000).toISOString().split('T')[0] + 'T' + 
        new Date(now.getTime() + 2 * 60 * 1000).toISOString().split('T')[1],
      notes: 'Expires in 2 minutes - for real-time testing',
      isChecked: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    // Item that expires in 5 minutes
    const expiring5Min = {
      name: 'Real-time Test Food',
      category: 'Yiyecek',
      quantity: 1,
      unit: 'pack',
      expirationDate: new Date(now.getTime() + 5 * 60 * 1000).toISOString().split('T')[0] + 'T' + 
        new Date(now.getTime() + 5 * 60 * 1000).toISOString().split('T')[1],
      notes: 'Expires in 5 minutes - for real-time testing',
      isChecked: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    try {
      await databaseService.addItem(expiring2Min);
      await databaseService.addItem(expiring5Min);
      console.log('Real-time test items created - they will expire in 2 and 5 minutes');
    } catch (error) {
      console.error('Error creating real-time test items:', error);
    }
  }

  /**
   * Schedule notifications with custom intervals for rapid testing
   */
  async scheduleRapidTestNotifications(): Promise<void> {
    const notifications = [
      { title: '🔔 Test 1', body: 'First rapid test notification', delay: 10 },
      { title: '🔔 Test 2', body: 'Second rapid test notification', delay: 20 },
      { title: '🔔 Test 3', body: 'Third rapid test notification', delay: 30 },
      { title: '🔔 Final', body: 'Final rapid test notification', delay: 45 },
    ];

    try {
      for (const notification of notifications) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: notification.delay,
          },
        });
      }
      
      console.log('Rapid test notifications scheduled for 10s, 20s, 30s, and 45s intervals');
    } catch (error) {
      console.error('Error scheduling rapid test notifications:', error);
    }
  }

  /**
   * Complete demo flow - sets up everything for a perfect demo video
   * This function creates the ideal scenario for demonstration
   */
  async runCompleteDemo(): Promise<void> {
    console.log('🎬 Starting complete demo setup...');
    
    // Step 1: Clear any existing data
    await this.clearTestData();
    console.log('✅ Cleared existing test data');
    
    // Step 2: Add test items with perfect demo timing
    await this.addTestItems();
    console.log('✅ Added demo test items');
    
    // Step 3: Schedule the perfect demo notification sequence
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎬 Demo Started!',
        body: 'Demo mode active - notifications will appear as scheduled',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2 
      },
    });

    // Schedule notifications at perfect demo intervals
    const demoNotifications = [
      { title: '⚠️ Expiration Alert', body: 'Some items in your kit are expiring soon!', delay: 15 },
      { title: '🚨 Expired Items Found', body: '2 items have expired and need replacement', delay: 30 },
      { title: '✅ Kit Status Good', body: 'Your emergency kit is up to date after updates', delay: 45 },
    ];

    for (const notif of demoNotifications) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notif.title,
          body: notif.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: notif.delay,
        },
      });
    }
    
    console.log('🎬 Demo setup complete! Notifications scheduled for 15s, 30s, and 45s');
    console.log('📱 Perfect for a 1-minute demo video');
  }
}

export const testingUtils = new TestingUtils();
