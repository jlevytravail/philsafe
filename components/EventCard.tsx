import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Activity, Pill } from 'lucide-react-native';
import { Event } from '@/types';
import { useThemeContext } from '@/context/ThemeContext';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { colors } = useThemeContext();

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'check-in':
        return <Activity size={16} color="#3B82F6" />;
      case 'check-out':
        return <CheckCircle size={16} color="#10B981" />;
      case 'care-completed':
        return <CheckCircle size={16} color="#10B981" />;
      case 'medication':
        return <Pill size={16} color="#8B5CF6" />;
      case 'emergency':
        return <AlertCircle size={16} color="#EF4444" />;
      default:
        return <Activity size={16} color="#6B7280" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    iconContainer: {
      marginRight: 12,
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
      marginBottom: 4,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    time: {
      marginLeft: 4,
      fontSize: 12,
      color: colors.textTertiary,
    },
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderLeftColor: colors.primary }]}>
      <View style={styles.iconContainer}>
        {getEventIcon(event.type)}
      </View>
      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{event.message}</Text>
        <View style={styles.timeContainer}>
          <Clock size={12} color={colors.textTertiary} />
          <Text style={[styles.time, { color: colors.textTertiary }]}>{formatTime(event.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}
