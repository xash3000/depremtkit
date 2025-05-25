// Service to manage notification refresh across the app
class NotificationRefreshService {
  private refreshCallbacks: Set<() => void> = new Set();

  // Register a callback to be called when notifications need to be refreshed
  registerRefreshCallback(callback: () => void) {
    this.refreshCallbacks.add(callback);
    
    // Return an unregister function
    return () => {
      this.refreshCallbacks.delete(callback);
    };
  }

  // Trigger refresh for all registered callbacks
  triggerRefresh() {
    this.refreshCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in notification refresh callback:', error);
      }
    });
  }
}

export const notificationRefreshService = new NotificationRefreshService();
