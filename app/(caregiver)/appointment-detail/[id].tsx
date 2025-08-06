import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, User, MapPin, Play, Square, SquareCheck as CheckSquare, MessageSquare } from 'lucide-react-native';
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