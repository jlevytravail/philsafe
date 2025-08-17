import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, MapPin, User, Activity } from 'lucide-react-native';
import { router } from 'expo-router';
// import { useTodayInterventions } from '@/src/hooks/useInterventions';
import { useInterventionsDebug } from '@/src/hooks/useInterventionsDebug';
import { useThemeContext } from '@/context/ThemeContext';

export default function AppointmentsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const { interventions, loading, error, refetch } = useInterventionsDebug();
  const { colors } = useThemeContext();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Transformer les interventions en format appointments
  const formatInterventionAsAppointment = (intervention: any) => ({
    id: intervention.id,
    startTime: new Date(intervention.scheduled_start).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    endTime: new Date(intervention.scheduled_end).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    status: intervention.status === 'planned' ? 'scheduled' : 
            intervention.status === 'done' ? 'completed' : 'cancelled',
    patientName: intervention.patient?.full_name || 'Patient inconnu',
    address: intervention.patient?.address,
    careType: intervention.notes || []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return '#10B981';
      case 'in-progress':
        return '#F59E0B';
      case 'scheduled':
      case 'planned':
        return '#6B7280';
      case 'cancelled':
      case 'missed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'scheduled':
      case 'planned':
        return 'Prévu';
      case 'cancelled':
      case 'missed':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  };

  const todayAppointments = interventions.map(formatInterventionAsAppointment);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
    },
    title: {
      marginLeft: 8,
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    appointmentCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeText: {
      marginLeft: 4,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    patientContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    patientName: {
      marginLeft: 8,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    addressText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    careTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    careTypeBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    careTypeText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 32,
      alignItems: 'center',
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Clock size={28} color="#3B82F6" />
          <Text style={[styles.title, { color: colors.text }]}>Mes rendez-vous</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Activity size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Chargement...</Text>
            <Text style={[styles.emptyMessage, { color: colors.textTertiary }]}>
              Récupération de vos rendez-vous
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Activity size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Erreur</Text>
            <Text style={[styles.emptyMessage, { color: colors.textTertiary }]}>
              {error}
            </Text>
          </View>
        ) : todayAppointments.length > 0 ? (
          todayAppointments.map(appointment => (
            <TouchableOpacity
              key={appointment.id}
              style={[styles.appointmentCard, { backgroundColor: colors.surface }]}
              onPress={() => router.push(`/(caregiver)/appointment-detail/${appointment.id}`)}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.timeContainer}>
                  <Clock size={16} color={colors.textTertiary} />
                  <Text style={[styles.timeText, { color: colors.text }]}>
                    {appointment.startTime} - {appointment.endTime}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(appointment.status)}</Text>
                </View>
              </View>

              <View style={styles.patientContainer}>
                <User size={20} color={colors.primary} />
                <Text style={[styles.patientName, { color: colors.text }]}>{appointment.patientName}</Text>
              </View>

              {appointment.address && (
                <View style={styles.addressContainer}>
                  <MapPin size={16} color={colors.textTertiary} />
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>{appointment.address}</Text>
                </View>
              )}

              <View style={styles.careTypeContainer}>
                {appointment.careType.map((type, index) => (
                  <View key={index} style={[styles.careTypeBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.careTypeText, { color: colors.primary }]}>{type}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Activity size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Aucun rendez-vous aujourd'hui</Text>
            <Text style={[styles.emptyMessage, { color: colors.textTertiary }]}>
              Vos prochains rendez-vous apparaîtront ici
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}