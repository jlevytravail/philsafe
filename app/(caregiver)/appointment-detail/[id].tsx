import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, User, MapPin, Play, Square, SquareCheck as CheckSquare, MessageSquare, CircleCheck, TriangleAlert as AlertTriangle, Circle } from 'lucide-react-native';
import { useVisits } from '@/context/VisitContext';
import { caregivers } from '@/data/mockData';
import { useThemeContext } from '@/context/ThemeContext';

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams();
  const { visits, updateVisitStatus } = useVisits();
  const { colors } = useThemeContext();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    headerRight: {
      width: 32,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    statusCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 12,
    },
    statusText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    visitDate: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      marginLeft: 8,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    careTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
    },
    careTypeBadge: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    careTypeText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.primary,
    },
    checkoutForm: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    checklistTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    taskText: {
      marginLeft: 12,
      fontSize: 16,
      color: colors.textSecondary,
    },
    completedTask: {
      textDecorationLine: 'line-through',
      color: colors.textTertiary,
    },
    notesInput: {
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      marginBottom: 16,
      minHeight: 80,
      textAlignVertical: 'top',
      fontSize: 16,
      color: colors.text,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      margin: 16,
    },
    checkInButton: {
      backgroundColor: '#10B981',
    },
    checkOutButton: {
      backgroundColor: '#F59E0B',
    },
    completeButton: {
      backgroundColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 16,
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  const visit = visits.find(v => v.id === id);
  const caregiver = caregivers.find(c => c.id === visit?.caregiverId);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CircleCheck size={16} color="#10B981" />,
          text: 'Effectuée',
          color: '#10B981',
          bgColor: '#D1FAE5',
        };
      case 'in-progress':
        return {
          icon: <Play size={16} color="#3B82F6" />,
          text: 'En cours',
          color: '#3B82F6',
          bgColor: '#DBEAFE',
        };
      case 'scheduled':
        return {
          icon: <Clock size={16} color="#F59E0B" />,
          text: 'Programmée',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
        };
      case 'cancelled':
        return {
          icon: <AlertTriangle size={16} color="#EF4444" />,
          text: 'Annulée',
          color: '#EF4444',
          bgColor: '#FEE2E2',
        };
      default:
        return {
          icon: <Circle size={16} color="#6B7280" />,
          text: 'Inconnue',
          color: '#6B7280',
          bgColor: '#F3F4F6',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toggleTask = (task: string) => {
    setCompletedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const handleCheckIn = () => {
    updateVisitStatus(visit.id, 'in-progress');
    Alert.alert('Intervention commencée', 'Vous avez commencé l\'intervention.');
  };

  const handleCheckOut = () => {
    setShowCheckout(true);
  };

  const handleCompleteVisit = () => {
    if (completedTasks.length === 0) {
      Alert.alert('Attention', 'Veuillez cocher au moins une tâche effectuée.');
      return;
    }
    
    updateVisitStatus(visit.id, 'completed');
    Alert.alert('Intervention terminée', 'L\'intervention a été marquée comme terminée.');
    router.back();
  };

  if (!visit || !caregiver) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#3B82F6" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Détail du rendez-vous</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text }}>Rendez-vous non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(visit.status);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Détail du rendez-vous</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={[styles.visitDate, { color: colors.textSecondary }]}>{formatDate(visit.date)}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <User size={20} color="#3B82F6" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Informations patient</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Patient</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{visit.patientName}</Text>
          </View>
          
          {visit.address && (
            <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Adresse</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{visit.address}</Text>
            </View>
          )}
          
          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Horaire</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{visit.startTime} - {visit.endTime}</Text>
          </View>
          
          <View style={styles.careTypeContainer}>
            {visit.careType.map((type, index) => (
              <View key={index} style={[styles.careTypeBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.careTypeText, { color: colors.primary }]}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        {showCheckout && (
          <View style={[styles.checkoutForm, { backgroundColor: colors.surface }]}>
            <Text style={[styles.checklistTitle, { color: colors.text }]}>Tâches effectuées</Text>
            
            {visit.careType.map((task, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.taskItem, { borderBottomColor: colors.borderLight }]}
                onPress={() => toggleTask(task)}
              >
                {completedTasks.includes(task) ? (
                  <CheckSquare size={20} color="#10B981" />
                ) : (
                  <Square size={20} color={colors.textTertiary} />
                )}
                <Text style={[
                  styles.taskText,
                  { color: colors.textSecondary },
                  completedTasks.includes(task) && [styles.completedTask, { color: colors.text }]
                ]}>
                  {task}
                </Text>
              </TouchableOpacity>
            ))}

            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Commentaires sur l'intervention..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.completeButton} onPress={handleCompleteVisit}>
              <CheckSquare size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Finaliser l'intervention</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {visit.status === 'scheduled' && (
        <TouchableOpacity style={[styles.actionButton, styles.checkInButton]} onPress={handleCheckIn}>
          <Play size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Commencer l'intervention</Text>
        </TouchableOpacity>
      )}

      {visit.status === 'in-progress' && !showCheckout && (
        <TouchableOpacity style={[styles.actionButton, styles.checkOutButton]} onPress={handleCheckOut}>
          <Square size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Terminer l'intervention</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}