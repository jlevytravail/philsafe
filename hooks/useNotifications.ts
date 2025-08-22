import { useState, useEffect, useCallback } from 'react';
import { supabaseService, Notification } from '@/services/supabaseService';
import { useSessionUser } from '@/context/UserContext';

interface NotificationWithDetails extends Notification {
  intervention?: {
    id: string;
    scheduled_start: string;
    scheduled_end: string;
    notes: string[];
    patient?: {
      full_name: string;
    };
    intervenant?: {
      full_name: string;
    };
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useSessionUser();

  const fetchNotifications = useCallback(async () => {
    if (!profile?.id || profile.role !== 'aidant') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await supabaseService.getNotifications(profile.id);
      setNotifications(data as NotificationWithDetails[]);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, profile?.role]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscription temps réel pour les nouvelles notifications
  useEffect(() => {
    if (!profile?.id || profile.role !== 'aidant') return;

    const subscription = supabaseService.subscribeToNotifications(
      profile.id,
      (payload) => {
        console.log('Nouvelle notification reçue:', payload);
        // Recharger les notifications quand une nouvelle arrive
        fetchNotifications();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id, profile?.role, fetchNotifications]);

  // Utilitaires pour formater les notifications
  const getNotificationMessage = (notification: NotificationWithDetails) => {
    const patientName = notification.intervention?.patient?.full_name || 'Patient';
    const intervenantName = notification.intervention?.intervenant?.full_name || 'Intervenant';
    
    switch (notification.type) {
      case 'check_in':
        return `${intervenantName} est arrivé(e) chez ${patientName}`;
      case 'check_out':
        return `${intervenantName} a terminé les soins chez ${patientName}`;
      case 'missed':
        return `Intervention manquée chez ${patientName}`;
      default:
        return 'Notification';
    }
  };

  const getNotificationTitle = (notification: NotificationWithDetails) => {
    switch (notification.type) {
      case 'check_in':
        return 'Arrivée de l\'intervenant';
      case 'check_out':
        return 'Soins terminés';
      case 'missed':
        return 'Intervention manquée';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (notification: NotificationWithDetails) => {
    switch (notification.type) {
      case 'check_in':
        return 'user-check';
      case 'check_out':
        return 'check-circle';
      case 'missed':
        return 'alert-triangle';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (notification: NotificationWithDetails) => {
    switch (notification.type) {
      case 'check_in':
        return '#3B82F6'; // Bleu
      case 'check_out':
        return '#10B981'; // Vert
      case 'missed':
        return '#EF4444'; // Rouge
      default:
        return '#6B7280'; // Gris
    }
  };

  const formatNotificationTime = (sentAt: string) => {
    const date = new Date(sentAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Créer une notification programmatiquement (utile pour les tests)
  const createNotification = async (
    interventionId: string, 
    type: 'check_in' | 'check_out' | 'missed'
  ) => {
    if (!profile?.id || profile.role !== 'aidant') return false;
    
    try {
      await supabaseService.createNotification({
        aidant_id: profile.id,
        intervention_id: interventionId,
        type,
        sent_at: new Date().toISOString()
      });
      
      // Recharger les notifications
      await fetchNotifications();
      return true;
    } catch (err) {
      console.error('Erreur lors de la création de la notification:', err);
      return false;
    }
  };

  // Obtenir le nombre de notifications récentes (dernières 24h)
  const getRecentNotificationsCount = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return notifications.filter(notification => 
      new Date(notification.sent_at) > yesterday
    ).length;
  };

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    createNotification,
    getRecentNotificationsCount,
    // Utilitaires de formatage
    getNotificationMessage,
    getNotificationTitle,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime
  };
}