import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, User, MapPin } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useVisits } from '@/context/VisitContext';
import { caregivers } from '@/data/mockData';

export default function HistoryScreen() {
  const { colors } = useThemeContext();
  const { visits } = useVisits();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Filtrer les visites passées
  const pastVisits = visits.filter(visit => {
    const visitDate = new Date(visit.date);
    const today = new Date();
    return visitDate < today;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCaregiverById = (id: string) => {
    return caregivers.find(c => c.id === id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: 16,
    },
    visitCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    visitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    visitDate: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    visitStatus: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      overflow: 'hidden',
    },
    completedStatus: {
      backgroundColor: colors.success + '20',
      color: colors.success,
    },
    visitInfo: {
      gap: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      margin: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>
          {pastVisits.length} visite{pastVisits.length > 1 ? 's' : ''} effectuée{pastVisits.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {pastVisits.length > 0 ? (
            pastVisits.map(visit => {
              const caregiver = getCaregiverById(visit.caregiverId);
              if (!caregiver) return null;

              return (
                <TouchableOpacity key={visit.id} style={styles.visitCard}>
                  <View style={styles.visitHeader}>
                    <Text style={styles.visitDate}>
                      {formatDate(visit.date)}
                    </Text>
                    <Text style={[styles.visitStatus, styles.completedStatus]}>
                      Terminée
                    </Text>
                  </View>
                  
                  <View style={styles.visitInfo}>
                    <View style={styles.infoRow}>
                      <Clock size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {visit.time} - {visit.type}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <User size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {caregiver.name} - {caregiver.role}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <MapPin size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        Domicile
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                Aucune visite dans l'historique
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}