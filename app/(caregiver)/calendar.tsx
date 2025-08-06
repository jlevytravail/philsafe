import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useVisits } from '@/context/VisitContext';
import { caregivers } from '@/data/mockData';
import { router } from 'expo-router';
import { useThemeContext } from '@/context/ThemeContext';

export default function CaregiverCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { visits } = useVisits();
  const { colors } = useThemeContext();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayVisits = visits.filter(visit => visit.date === dateString);
      
      days.push({
        day,
        date: currentDate,
        visits: dayVisits,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isSelected: currentDate.toDateString() === selectedDate.toDateString(),
      });
    }
    
    return days;
  };

  const getVisitsForSelectedDate = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return visits.filter(visit => visit.date === dateString);
  };

  const getCaregiverById = (id: string) => {
    return caregivers.find(c => c.id === id);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const days = getDaysInMonth(selectedDate);
  const selectedDateVisits = getVisitsForSelectedDate();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

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
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    navButton: {
      padding: 8,
    },
    monthYear: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    weekDay: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    todayCell: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
    },
    selectedCell: {
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    hasVisitsCell: {
      borderWidth: 2,
      borderColor: '#10B981',
      borderRadius: 8,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    todayText: {
      color: colors.primary,
      fontWeight: '700',
    },
    selectedText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    visitIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: '#10B981',
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    visitCount: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    visitsList: {
      flex: 1,
      padding: 16,
    },
    selectedDateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    visitItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    completedVisit: {
      backgroundColor: colors.successLight,
      borderLeftWidth: 4,
      borderLeftColor: '#10B981',
    },
    visitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    visitTime: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    visitTimeText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    statusIcon: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    patientInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    patientName: {
      marginLeft: 4,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    careTypes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    careType: {
      fontSize: 12,
      color: colors.primary,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    noVisits: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    noVisitsText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <Calendar size={28} color="#3B82F6" />
          <Text style={[styles.title, { color: colors.text }]}>Calendrier</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Planning des interventions</Text>
      </View>

      <View style={[styles.calendarHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        
        <Text style={[styles.monthYear, { color: colors.text }]}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <ChevronRight size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={[styles.weekDaysContainer, { backgroundColor: colors.surface }]}>
        {weekDays.map((day, index) => (
          <Text key={index} style={[styles.weekDay, { color: colors.textSecondary }]}>{day}</Text>
        ))}
      </View>

      <View style={[styles.calendarGrid, { backgroundColor: colors.surface }]}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day?.isToday && [styles.todayCell, { backgroundColor: colors.primaryLight }],
              day?.isSelected && [styles.selectedCell, { backgroundColor: colors.primary }],
              day?.visits.length > 0 && styles.hasVisitsCell,
            ]}
            onPress={() => day && setSelectedDate(day.date)}
            disabled={!day}
          >
            {day && (
              <>
                <Text style={[
                  styles.dayNumber,
                  { color: colors.textSecondary },
                  day.isToday && [styles.todayText, { color: colors.primary }],
                  day.isSelected && styles.selectedText,
                ]}>
                  {day.day}
                </Text>
                {day.visits.length > 0 && (
                  <View style={styles.visitIndicator}>
                    <Text style={styles.visitCount}>{day.visits.length}</Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.visitsList}>
        <Text style={[styles.selectedDateTitle, { color: colors.text }]}>
          {selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        
        {selectedDateVisits.length > 0 ? (
          selectedDateVisits.map(visit => (
            <TouchableOpacity
              key={visit.id}
              style={[
                styles.visitItem,
                { backgroundColor: colors.surface },
                visit.status === 'completed' && [styles.completedVisit, { backgroundColor: colors.successLight }]
              ]}
              onPress={() => router.push(`/(caregiver)/appointment-detail/${visit.id}`)}
            >
              <View style={styles.visitHeader}>
                <View style={styles.visitTime}>
                  <Clock size={16} color={colors.textTertiary} />
                  <Text style={[styles.visitTimeText, { color: colors.textSecondary }]}>
                    {visit.startTime} - {visit.endTime}
                  </Text>
                </View>
                <View style={styles.statusIcon}>
                  {visit.status === 'completed' ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <AlertCircle size={20} color="#F59E0B" />
                  )}
                </View>
              </View>
              
              <View style={styles.patientInfo}>
                <User size={16} color={colors.textTertiary} />
                <Text style={[styles.patientName, { color: colors.text }]}>{visit.patientName}</Text>
              </View>
              
              <View style={styles.careTypes}>
                {visit.careType.map((type, index) => (
                  <Text key={index} style={[styles.careType, { color: colors.primary, backgroundColor: colors.primaryLight }]}>{type}</Text>
                ))}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.noVisits, { backgroundColor: colors.surface }]}>
            <Text style={[styles.noVisitsText, { color: colors.textSecondary }]}>Aucun rendez-vous ce jour</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}