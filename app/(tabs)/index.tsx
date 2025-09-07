import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, RefreshCw, Bell, Calendar } from 'lucide-react-native';
import InterventionCard from '@/components/InterventionCard';
import { useTodayInterventions } from '@/hooks/useInterventions';
import { useNotifications } from '@/hooks/useNotifications';
import { useThemeContext } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useSessionUser } from '@/context/UserContext';
import { router } from 'expo-router';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { 
    interventions, 
    loading, 
    error, 
    refetch,
    updateInterventionStatus 
  } = useTodayInterventions();
  const { 
    notifications, 
    getRecentNotificationsCount 
  } = useNotifications();
  const { colors } = useThemeContext();
  const { signOut } = useAuth();
  const { session, profile } = useSessionUser();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    try {
      await refetch();
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de rafraîchir les données');
    }
  };


  const handleInterventionStatusUpdate = async (interventionId: string, status: 'planned' | 'done' | 'missed') => {
    const success = await updateInterventionStatus(interventionId, status);
    if (!success) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de l\'intervention');
    }
  };

  // Obtenir le nom du patient principal (premier patient lié)
  const getMainPatientName = () => {
    if (interventions.length > 0 && interventions[0].patient) {
      return interventions[0].patient.full_name.split(' ')[0]; // Prénom seulement
    }
    return 'Patient';
  };

  const recentNotificationsCount = getRecentNotificationsCount();

  // Fonction pour formater l'heure des notifications
  const formatNotificationTime = (sentAt: string) => {
    const date = new Date(sentAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      marginLeft: 8,
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    welcomeMessage: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    currentTime: {
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: 4,
      marginBottom: 12,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    refreshText: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    section: {
      padding: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      marginLeft: 8,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    notificationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EF4444',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 'auto',
    },
    notificationCount: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    loadingState: {
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      textAlign: 'center',
    },
    errorState: {
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 12,
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    retryText: {
      fontSize: 14,
      fontWeight: '600',
    },
    notificationCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    notificationTime: {
      fontSize: 12,
    },
    notificationMessage: {
      fontSize: 14,
      lineHeight: 20,
    },
    calendarPreview: {
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    calendarText: {
      fontSize: 16,
      marginBottom: 4,
    },
    calendarCount: {
      fontSize: 14,
      fontWeight: '600',
    },
    refreshingIndicator: {
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    refreshingText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.titleContainer}>
            <Heart size={28} color="#10B981" />
            <Text style={[styles.title, { color: colors.text }]}>PhilSafe</Text>
          </View>
          <Text style={[styles.welcomeMessage, { color: colors.primary }]}>
            Bonjour {profile?.full_name?.split(' ')[0] || 'Aidant'}, voici les dernières infos sur {getMainPatientName()}
          </Text>
          <Text style={[styles.currentTime, { color: colors.textTertiary }]}>
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleManualRefresh} style={[styles.refreshButton, { backgroundColor: colors.primaryLight }]}>
              <RefreshCw size={16} color="#3B82F6" />
              <Text style={[styles.refreshText, { color: colors.primary }]}>Rafraîchir</Text>
            </TouchableOpacity>
            
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Interventions d'aujourd'hui</Text>
            {recentNotificationsCount > 0 && (
              <View style={styles.notificationBadge}>
                <Bell size={16} color="#FFFFFF" />
                <Text style={styles.notificationCount}>{recentNotificationsCount}</Text>
              </View>
            )}
          </View>
          
          {loading && interventions.length === 0 ? (
            <View style={[styles.loadingState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des interventions...</Text>
            </View>
          ) : error && interventions.length === 0 ? (
            <View style={[styles.errorState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.errorText, { color: colors.error || '#EF4444' }]}>Erreur: {error}</Text>
              <TouchableOpacity onPress={handleManualRefresh} style={styles.retryButton}>
                <Text style={[styles.retryText, { color: colors.primary }]}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : interventions.length > 0 ? (
            <>
              {interventions.map(intervention => (
                <InterventionCard 
                  key={intervention.id} 
                  intervention={intervention}
                  onStatusUpdate={handleInterventionStatusUpdate}
                />
              ))}
              {loading && (
                <View style={[styles.refreshingIndicator, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.refreshingText, { color: colors.primary }]}>Mise à jour...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune intervention prévue aujourd'hui</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dernières notifications</Text>
          </View>
          
          {notifications.slice(0, 3).map(notification => (
            <View key={notification.id} style={[styles.notificationCard, { backgroundColor: colors.surface }]}>
              <View style={styles.notificationHeader}>
                <Text style={[styles.notificationTitle, { color: colors.text }]}>
                  {notification.type === 'check_in' ? 'Arrivée intervenant' : 
                   notification.type === 'check_out' ? 'Intervention terminée' : 
                   'Intervention manquée'}
                </Text>
                <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
                  {formatNotificationTime(notification.sent_at)}
                </Text>
              </View>
              <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                {notification.type === 'check_in' ? 
                  `L'intervenant est arrivé chez ${notification.intervention?.patient?.full_name}` :
                  notification.type === 'check_out' ?
                  `Les soins ont été terminés chez ${notification.intervention?.patient?.full_name}` :
                  `Intervention manquée chez ${notification.intervention?.patient?.full_name}`
                }
              </Text>
            </View>
          ))}
          
          {notifications.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune notification récente</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Prochaines interventions</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.calendarPreview, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(tabs)/calendar')}
          >
            <Text style={[styles.calendarText, { color: colors.textSecondary }]}>Voir le planning complet</Text>
            <Text style={[styles.calendarCount, { color: colors.primary }]}>{interventions.length} intervention{interventions.length > 1 ? 's' : ''} aujourd'hui</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
