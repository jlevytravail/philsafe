import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, User, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Visit, Caregiver } from '@/types';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';

interface VisitCardProps {
  visit: Visit;
  caregiver: Caregiver;
}

export default function VisitCard({ visit, caregiver }: VisitCardProps) {
  const { colors } = useThemeContext();

  const getStatusColor = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#F59E0B';
      case 'scheduled':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: Visit['status']) => {
    const color = getStatusColor(status);
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color={color} />;
      case 'in-progress':
        return <AlertCircle size={20} color={color} />;
      default:
        return <Circle size={20} color={color} />;
    }
  };

  const getStatusText = (status: Visit['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in-progress':
        return 'En cours';
      case 'scheduled':
        return 'Prévue';
      case 'cancelled':
        return 'Annulée';
      default:
        return 'Inconnue';
    }
  };

  const isVisitLate = () => {
    if (visit.status !== 'scheduled') return false;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    return visit.date === today && currentTime > visit.startTime;
  };

  const handlePress = () => {
    router.push(`/visit/${visit.id}`);
  };

  const visitIsLate = isVisitLate();

  const styles = StyleSheet.create({
    card: {
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
    lateCard: {
      borderLeftWidth: 4,
      borderLeftColor: '#EF4444',
    },
    lateIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF2F2',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    lateText: {
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '600',
      color: '#EF4444',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    time: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    status: {
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '500',
    },
    caregiverContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    caregiverName: {
      marginLeft: 4,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    caregiverRole: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.textSecondary,
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
  });

  return (
    <TouchableOpacity style={[
      [styles.card, { backgroundColor: colors.surface }],
      visitIsLate && styles.lateCard
    ]} onPress={handlePress}>
      {visitIsLate && (
        <View style={styles.lateIndicator}>
          <AlertTriangle size={16} color="#EF4444" />
          <Text style={styles.lateText}>En retard</Text>
        </View>
      )}
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.time}>{visit.startTime} - {visit.endTime}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(visit.status)}
          <Text style={[styles.status, { color: getStatusColor(visit.status) }]}>
            {getStatusText(visit.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.caregiverContainer}>
        <User size={16} color="#6B7280" />
        <Text style={[styles.caregiverName, { color: colors.text }]}>{caregiver.name}</Text>
        <Text style={[styles.caregiverRole, { color: colors.textSecondary }]}>• {caregiver.role}</Text>
      </View>
      
      <View style={styles.careTypeContainer}>
        {visit.careType.map((type, index) => (
          <View key={index} style={[styles.careTypeBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.careTypeText, { color: colors.primary }]}>{type}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
