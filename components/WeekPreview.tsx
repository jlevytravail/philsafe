import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { Caregiver } from '@/types';
import { useVisits } from '@/context/VisitContext';

interface WeekPreviewProps {
  caregivers: Caregiver[];
}

export default function WeekPreview({ caregivers }: WeekPreviewProps) {
  const { visits } = useVisits();

  const getUpcomingDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayVisits = visits.filter(visit => {
        const visitDate = new Date(visit.date);
        return visitDate.toDateString() === date.toDateString();
      });
      
      days.push({
        date,
        visits: dayVisits,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: date.getDate(),
      });
    }
    
    return days;
  };

  const getCaregiverById = (id: string) => {
    return caregivers.find(c => c.id === id);
  };

  const upcomingDays = getUpcomingDays();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={20} color="#3B82F6" />
        <Text style={styles.title}>Prochaines visites</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {upcomingDays.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <Text style={styles.dayName}>{day.dayName}</Text>
            <Text style={styles.dayNumber}>{day.dayNumber}</Text>
            
            {day.visits.length > 0 ? (
              day.visits.map((visit, visitIndex) => {
                const caregiver = getCaregiverById(visit.caregiverId);
                return (
                  <View key={visitIndex} style={styles.visitInfo}>
                    <View style={styles.timeInfo}>
                      <Clock size={10} color="#6B7280" />
                      <Text style={styles.visitTime}>{visit.startTime}</Text>
                    </View>
                    <Text style={styles.caregiverName}>{caregiver?.name}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noVisits}>Aucune visite</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    paddingLeft: 16,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  visitInfo: {
    marginBottom: 6,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  visitTime: {
    marginLeft: 4,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  caregiverName: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  noVisits: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});