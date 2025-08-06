import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, RefreshCw } from 'lucide-react-native';
import VisitCard from '@/components/VisitCard';
import EventCard from '@/components/EventCard';
import WeekPreview from '@/components/WeekPreview';
import { caregivers } from '@/data/mockData';
import { useVisits } from '@/context/VisitContext';
import { useThemeContext } from '@/context/ThemeContext';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { visits, events, resetVisits } = useVisits();
  const { colors } = useThemeContext();

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
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
      marginBottom: 8,
    },
    title: {
      marginLeft: 8,
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    welcomeMessage: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    currentTime: {
      fontSize: 14,
      color: colors.textTertiary,
      marginTop: 4,
      marginBottom: 12,
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
    },
    refreshText: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.primary,
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
      color: colors.text,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.titleContainer}>
            <Heart size={28} color="#10B981" />
            <Text style={[styles.title, { color: colors.text }]}>PhilSafe</Text>
          </View>
          <Text style={[styles.welcomeMessage, { color: colors.primary }]}>
            Bonjour Claire, voici les dernières infos sur votre maman
          </Text>
          <Text style={[styles.currentTime, { color: colors.textTertiary }]}>
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          <TouchableOpacity onPress={handleManualRefresh} style={[styles.refreshButton, { backgroundColor: colors.primaryLight }]}>
            <RefreshCw size={16} color="#3B82F6" />
            <Text style={[styles.refreshText, { color: colors.primary }]}>Rafraîchir les données</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={20} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Visites d'aujourd'hui</Text>
          </View>
          
          {todayVisits.length > 0 ? (
            todayVisits.map(visit => {
              const caregiver = getCaregiverById(visit.caregiverId);
              return caregiver ? (
                <VisitCard key={visit.id} visit={visit} caregiver={caregiver} />
              ) : null;
            })
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucune visite prévue aujourd'hui</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Derniers événements</Text>
          {recentEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </View>

        <WeekPreview visits={visits} caregivers={caregivers} />
      </ScrollView>
    </SafeAreaView>
  );
}
