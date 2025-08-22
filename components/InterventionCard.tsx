import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, User, CheckCircle, AlertCircle, Circle, AlertTriangle, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';
import { Intervention } from '@/services/supabaseService';

interface InterventionCardProps {
  intervention: Intervention;
  onStatusUpdate?: (interventionId: string, status: 'planned' | 'done' | 'missed') => void;
}

export default function InterventionCard({ intervention, onStatusUpdate }: InterventionCardProps) {
  const { colors } = useThemeContext();

  const getStatusColor = (status: Intervention['status']) => {
    switch (status) {
      case 'done':
        return '#10B981';
      case 'planned':
        return '#6B7280';
      case 'missed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: Intervention['status']) => {
    switch (status) {
      case 'done':
        return CheckCircle;
      case 'planned':
        return Circle;
      case 'missed':
        return AlertTriangle;
      default:
        return Circle;
    }
  };

  const getStatusText = (status: Intervention['status']) => {
    switch (status) {
      case 'done':
        return 'Terminé';
      case 'planned':
        return 'Prévu';
      case 'missed':
        return 'Manqué';
      default:
        return 'Inconnu';
    }
  };

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const isToday = (datetime: string) => {
    const interventionDate = new Date(datetime).toDateString();
    const today = new Date().toDateString();
    return interventionDate === today;
  };

  const isOverdue = (datetime: string, status: string) => {
    if (status === 'done') return false;
    const scheduledTime = new Date(datetime);
    const now = new Date();
    return scheduledTime < now;
  };

  const StatusIcon = getStatusIcon(intervention.status);
  const statusColor = getStatusColor(intervention.status);
  const isLate = isOverdue(intervention.scheduled_start, intervention.status);

  const handleCardPress = () => {
    // Navigation vers le détail de l'intervention
    router.push(`/intervention-detail/${intervention.id}`);
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cardOverdue: {
      borderColor: '#EF4444',
      borderWidth: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    timeContainer: {
      flex: 1,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    timeText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    dateText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: statusColor + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '600',
      color: statusColor,
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
      flex: 1,
    },
    intervenantContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    intervenantName: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    addressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    addressText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.textTertiary,
      flex: 1,
    },
    notesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    noteTag: {
      backgroundColor: colors.primaryLight,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    noteText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    overdueIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
    overdueText: {
      fontSize: 10,
      color: '#EF4444',
      fontWeight: '600',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.card, isLate && styles.cardOverdue]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {isLate && (
        <View style={styles.overdueIndicator}>
          <Text style={styles.overdueText}>EN RETARD</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <Clock size={16} color={colors.textTertiary} />
            <Text style={styles.timeText}>
              {formatTime(intervention.scheduled_start)} - {formatTime(intervention.scheduled_end)}
            </Text>
          </View>
          {!isToday(intervention.scheduled_start) && (
            <Text style={styles.dateText}>
              {formatDate(intervention.scheduled_start)}
            </Text>
          )}
        </View>

        <View style={styles.statusContainer}>
          <StatusIcon size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText(intervention.status)}
          </Text>
        </View>
      </View>

      <View style={styles.patientContainer}>
        <User size={20} color={colors.primary} />
        <Text style={styles.patientName}>
          {intervention.patient?.full_name || 'Patient'}
        </Text>
      </View>

      {intervention.intervenant && (
        <View style={styles.intervenantContainer}>
          <User size={16} color={colors.textSecondary} />
          <Text style={styles.intervenantName}>
            {intervention.intervenant.full_name} - {intervention.intervenant.sub_role || intervention.intervenant.role}
          </Text>
        </View>
      )}

      {intervention.patient?.address && (
        <View style={styles.addressContainer}>
          <MapPin size={16} color={colors.textTertiary} />
          <Text style={styles.addressText}>
            {intervention.patient.address}
          </Text>
        </View>
      )}

      <View style={styles.notesContainer}>
        {intervention.notes.map((note, index) => (
          <View key={index} style={styles.noteTag}>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}