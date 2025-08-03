import { Notification } from '@/types';

class NotificationService {
  private static instance: NotificationService;
  private listeners: ((notification: Notification) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  addListener(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (notification: Notification) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Simulate receiving a notification
  simulateNotification(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
    
    // Log pour debug
    console.log('Notification simulée:', notification.title);
  }

  // Mock function to simulate real-time notifications
  startMockNotifications() {
    const mockNotifications = [
      {
        id: Date.now().toString(),
        title: 'Visite commencée',
        message: 'Marie Dubois vient d\'arriver chez Mme Dupont',
        timestamp: new Date().toISOString(),
        type: 'info' as const,
        read: false
      },
      {
        id: (Date.now() + 1).toString(),
        title: 'Soins terminés',
        message: 'La toilette a été réalisée avec succès',
        timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes later
        type: 'success' as const,
        read: false
      }
    ];

    // Simulate notifications at intervals
    mockNotifications.forEach((notification, index) => {
      setTimeout(() => {
        this.simulateNotification(notification);
      }, (index + 1) * 10000); // 10 seconds between each notification
    });
  }
}

export default NotificationService;