import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Activity, Pill } from 'lucide-react-native';
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {getEventIcon(event.type)}
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{event.message}</Text>
        <View style={styles.timeContainer}>
          <Clock size={12} color="#9CA3AF" />
          <Text style={styles.time}>{formatTime(event.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
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
    color: '#374151',
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
    color: '#9CA3AF',
  },
});