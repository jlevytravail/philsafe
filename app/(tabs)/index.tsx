import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, RefreshCw } from 'lucide-react-native';
import VisitCard from '@/components/VisitCard';
import EventCard from '@/components/EventCard';
import WeekPreview from '@/components/WeekPreview';
import { caregivers } from '@/data/mockData';
import { useVisits } from '@/context/VisitContext';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { visits, events, resetVisits } = useVisits();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    resetVisits();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleManualRefresh = () => {
    resetVisits();
  };

  const getTodayVisits = () => {
    const today = new Date().toISOString().split('T')[0];
    return visits.filter(visit => visit.date === today);
  };

  const getRecentEvents = () => {
    return events.slice(0, 3);
  };

  const getCaregiverById = (id: string) => {
    return caregivers.find(c => c.id === id);
  };

  const todayVisits = getTodayVisits();
  const recentEvents = getRecentEvents();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Heart size={28} color="#10B981" />
            <Text style={styles.title}>PhilSafe</Text>
          </View>
          <Text style={styles.welcomeMessage}>
            Bonjour Claire, voici les dernières infos sur votre maman
          </Text>
          <Text style={styles.subtitle}>
            Suivi des soins pour Mme Dupont
          </Text>
          <Text style={styles.currentTime}>
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <TouchableOpacity onPress={handleManualRefresh} style={styles.refreshButton}>
            <RefreshCw size={16} color="#3B82F6" />
            <Text style={styles.refreshText}>Rafraîchir les données</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Visites d'aujourd'hui</Text>
          </View>
          
          {todayVisits.length > 0 ? (
            todayVisits.map(visit => {
              const caregiver = getCaregiverById(visit.caregiverId);
              return caregiver ? (
                <VisitCard key={visit.id} visit={visit} caregiver={caregiver} />
              ) : null;
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune visite prévue aujourd'hui</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Derniers événements</Text>
          {recentEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>

        <WeekPreview visits={visits} caregivers={caregivers} />
        <WeekPreview caregivers={caregivers} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  currentTime: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  refreshText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3B82F6',
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
    color: '#111827',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});