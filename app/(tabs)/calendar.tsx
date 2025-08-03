import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Plus, Home } from 'lucide-react-native';
import { caregivers } from '@/data/mockData';
import { useVisits } from '@/context/VisitContext';
import { router } from 'expo-router';
import AddFamilyVisitModal from '@/components/AddFamilyVisitModal';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const { visits, familyVisits, addFamilyVisit } = useVisits();

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
      const dayFamilyVisits = familyVisits.filter(fv => fv.date === dateString);
      
      days.push({
        day,
        date: currentDate,
        visits: dayVisits,
        familyVisits: dayFamilyVisits,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        isSelected: currentDate.toDateString() === selectedDate.toDateString(),
      });
    }
    
    return days;
  };

  const getVisitsForSelectedDate = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dayVisits = visits.filter(visit => visit.date === dateString);
    const dayFamilyVisits = familyVisits.filter(fv => fv.date === dateString);
    
    return { visits: dayVisits, familyVisits: dayFamilyVisits };
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
  const { visits: selectedDateVisits, familyVisits: selectedDateFamilyVisits } = getVisitsForSelectedDate();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Calendar size={28} color="#3B82F6" />
          <Text style={styles.title}>Calendrier</Text>
        </View>
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <ChevronLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <ChevronRight size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day?.isToday && styles.todayCell,
              day?.isSelected && styles.selectedCell,
              (day?.visits.length > 0 || day?.familyVisits?.length > 0) && styles.hasVisitsCell,
            ]}
            onPress={() => day && setSelectedDate(day.date)}
            disabled={!day}
          >
            {day && (
              <>
                <Text style={[
                  styles.dayNumber,
                  day.isToday && styles.todayText,
                  day.isSelected && styles.selectedText,
                ]}>
                  {day.day}
                </Text>
                {(day.visits.length > 0 || day.familyVisits?.length > 0) && (
                  <View style={styles.visitIndicator}>
                    <Text style={styles.visitCount}>
                      {day.visits.length + (day.familyVisits?.length || 0)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.visitsList}>
        <Text style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        
        {(selectedDateVisits.length > 0 || selectedDateFamilyVisits.length > 0) ? (
          <>
            {/* Visites soignantes */}
            {selectedDateVisits.map(visit => {
              const caregiver = getCaregiverById(visit.caregiverId);
              return (
                <TouchableOpacity
                  key={visit.id}
                  style={[
                    styles.visitItem,
                    visit.status === 'completed' && styles.completedVisit
                  ]}
                  onPress={() => router.push(`/visit/${visit.id}`)}
                >
                  <View style={styles.visitTime}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.visitTimeText}>
                      {visit.startTime} - {visit.endTime}
                    </Text>
                    {visit.status === 'completed' && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Effectuée</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.visitInfo}>
                    <View style={styles.caregiverInfo}>
                      <User size={16} color="#6B7280" />
                      <Text style={styles.caregiverText}>
                        {caregiver?.name} • {caregiver?.role}
                      </Text>
                    </View>
                    
                    <View style={styles.careTypes}>
                      {visit.careType.map((type, index) => (
                        <Text key={index} style={styles.careType}>{type}</Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {/* Visites familiales */}
            {selectedDateFamilyVisits.map(familyVisit => (
              <View key={familyVisit.id} style={[styles.visitItem, styles.familyVisit]}>
                <View style={styles.visitTime}>
                  <Clock size={16} color="#8B5CF6" />
                  <Text style={styles.visitTimeText}>
                    {familyVisit.startTime}
                    {familyVisit.endTime && ` - ${familyVisit.endTime}`}
                  </Text>
                </View>
                
                <View style={styles.visitInfo}>
                  <View style={styles.caregiverInfo}>
                    <Home size={16} color="#8B5CF6" />
                    <Text style={styles.familyVisitText}>
                      Visite familiale{familyVisit.name && ` de ${familyVisit.name}`} • {familyVisit.type}
                    </Text>
                  </View>
                  
                  {familyVisit.notes && (
                    <Text style={styles.familyNotes}>{familyVisit.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noVisits}>
            <Text style={styles.noVisitsText}>Aucune visite prévue ce jour</Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Ajouter une venue familiale</Text>
      </TouchableOpacity>
      
      <AddFamilyVisitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addFamilyVisit}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#3B82F6',
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
    color: '#374151',
  },
  todayText: {
    color: '#3B82F6',
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
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  visitItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedVisit: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  familyVisit: {
    backgroundColor: '#FAF5FF',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  visitTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitTimeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  completedBadge: {
    marginLeft: 'auto',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  visitInfo: {
    gap: 8,
  },
  caregiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caregiverText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  familyVisitText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  familyNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  careTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  careType: {
    fontSize: 12,
    color: '#3B82F6',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noVisits: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noVisitsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});