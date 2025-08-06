import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Clock } from 'lucide-react-native';
import { Caregiver } from '@/types';
import { useVisits } from '@/context/VisitContext';
import { useThemeContext } from '@/context/ThemeContext';

interface WeekPreviewProps {
  caregivers: Caregiver[];
}

export default function WeekPreview({ caregivers }: WeekPreviewProps) {
  const { colors } = useThemeContext();
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
      color: colors.text,
    },
    scrollView: {
      paddingLeft: 16,
    },
    dayCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginRight: 12,
      minWidth: 120,
      shadowColor: colors.shadow,
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
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: '500',
    },
    dayNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
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
      color: colors.textSecondary,
      fontWeight: '500',
    },
    caregiverName: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    noVisits: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={20} color="#3B82F6" />
        <Text style={[styles.title, { color: colors.text }]}>Prochaines visites</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {upcomingDays.map((day, index) => (
          <View key={index} style={[styles.dayCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dayName, { color: colors.textSecondary }]}>{day.dayName}</Text>
            <Text style={[styles.dayNumber, { color: colors.text }]}>{day.dayNumber}</Text>
            
            {day.visits.length > 0 ? (
              day.visits.map((visit, visitIndex) => {
                const caregiver = getCaregiverById(visit.caregiverId);
                return (
                  <View key={visitIndex} style={styles.visitInfo}>
                    <View style={styles.timeInfo}>
                      <Clock size={10} color={colors.textTertiary} />
                      <Text style={[styles.visitTime, { color: colors.textSecondary }]}>{visit.startTime}</Text>
                    </View>
                    <Text style={[styles.caregiverName, { color: colors.textSecondary }]}>{caregiver?.name}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.noVisits, { color: colors.textTertiary }]}>Aucune visite</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
