import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Filter
} from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { router } from 'expo-router';

// Mock data pour les rapports
const mockReports = [
  {
    id: '1',
    patientName: 'Marie Dupont',
    date: '2025-08-17',
    time: '09:30',
    type: 'Soins quotidiens',
    status: 'completed',
    duration: 45,
    notes: 'Patient en bonne forme. Glycémie normale (120 mg/dl). Prise des médicaments effectuée.',
    actions: ['Toilette', 'Prise de médicaments', 'Contrôle glycémie'],
  },
  {
    id: '2',
    patientName: 'Jean Martin',
    date: '2025-08-17',
    time: '14:00',
    type: 'Visite médicale',
    status: 'completed',
    duration: 60,
    notes: 'Confusion importante aujourd\'hui. Famille prévenue. Recommandation de consultation.',
    actions: ['Évaluation cognitive', 'Prise de médicaments', 'Contact famille'],
  },
  {
    id: '3',
    patientName: 'Françoise Blanc',
    date: '2025-08-16',
    time: '11:00',
    type: 'Rééducation',
    status: 'completed',
    duration: 30,
    notes: 'Exercices de mobilité réalisés. Amélioration de la marche avec déambulateur.',
    actions: ['Exercices mobilité', 'Marche assistée'],
  },
];

export default function ReportsScreen() {
  const { colors } = useThemeContext();
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  const filteredReports = mockReports.filter(report => {
    const reportDate = new Date(report.date);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return reportDate.toDateString() === today.toDateString();
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return reportDate >= weekAgo;
      default:
        return true;
    }
  });

  const handleNewReport = () => {
    router.push('/new-report');
  };

  const handleReportPress = (reportId: string) => {
    router.push(`/report-detail/${reportId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color={colors.success} />;
      case 'pending':
        return <AlertCircle size={16} color={colors.warning} />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    newReportButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    newReportText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 14,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    activeFilterText: {
      color: '#FFFFFF',
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: 16,
    },
    reportCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    reportInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    reportMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    reportType: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    actionTag: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    actionText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    notes: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 20,
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
        <View style={styles.headerTop}>
          <Text style={styles.title}>Rapports</Text>
          <TouchableOpacity style={styles.newReportButton} onPress={handleNewReport}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.newReportText}>Nouveau</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              Tous
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'today' && styles.activeFilter]}
            onPress={() => setFilter('today')}
          >
            <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>
              Aujourd'hui
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'week' && styles.activeFilter]}
            onPress={() => setFilter('week')}
          >
            <Text style={[styles.filterText, filter === 'week' && styles.activeFilterText]}>
              Cette semaine
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {filteredReports.length > 0 ? (
            filteredReports.map(report => (
              <TouchableOpacity 
                key={report.id} 
                style={styles.reportCard}
                onPress={() => handleReportPress(report.id)}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.patientName}>{report.patientName}</Text>
                    <View style={styles.reportMeta}>
                      <View style={styles.metaItem}>
                        <Calendar size={14} color={colors.textTertiary} />
                        <Text style={styles.metaText}>{formatDate(report.date)}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={colors.textTertiary} />
                        <Text style={styles.metaText}>{report.time} ({report.duration}min)</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(report.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                      Terminé
                    </Text>
                  </View>
                </View>

                <Text style={styles.reportType}>{report.type}</Text>

                <View style={styles.actions}>
                  {report.actions.map((action, index) => (
                    <View key={index} style={styles.actionTag}>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>

                <Text style={styles.notes} numberOfLines={2}>
                  {report.notes}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FileText size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                Aucun rapport pour cette période
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}