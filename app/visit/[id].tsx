import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, User, Phone, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle, MessageSquare, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { visits, caregivers } from '@/data/mockData';
import { useVisits } from '@/context/VisitContext';
import { useThemeContext } from '@/context/ThemeContext';

export default function VisitDetail() {
  const { id } = useLocalSearchParams();
  const { visits, updateVisitStatus } = useVisits();
  const { colors } = useThemeContext();

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
      shadowOffset: {
        width: 0,
        height: 2,
      },
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
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
    },
    visitDate: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    timeCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
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
    timeInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    timeLabel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    timeValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    caregiverCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    caregiverInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    caregiverPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
    },
    caregiverDetails: {
      flex: 1,
    },
    caregiverName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    caregiverRole: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    phoneButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    phoneText: {
      marginLeft: 4,
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    careCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Détail de la visite</Text>
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

        <View style={[styles.timeCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#3B82F6" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Horaires</Text>
          </View>
          <View style={[styles.timeInfo, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Heure de début</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{visit.startTime}</Text>
          </View>
          <View style={[styles.timeInfo, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Heure de fin</Text>
            <Text style={[styles.timeValue, { color: colors.text }]}>{visit.endTime}</Text>
          </View>
        </View>

        <View style={[styles.caregiverCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <User size={20} color="#3B82F6" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Intervenant</Text>
          </View>
          
          <View style={styles.caregiverInfo}>
            {caregiver.photo && (
              <Image source={{ uri: caregiver.photo }} style={styles.caregiverPhoto} />
            )}
            <View style={styles.caregiverDetails}>
              <Text style={[styles.caregiverName, { color: colors.text }]}>{caregiver.name}</Text>
              <Text style={[styles.caregiverRole, { color: colors.textSecondary }]}>{caregiver.role}</Text>
              {caregiver.phone && (
                <TouchableOpacity style={styles.phoneButton}>
                  <Phone size={16} color="#3B82F6" />
                  <Text style={[styles.phoneText, { color: colors.primary }]}>{caregiver.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.careCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <MessageSquare size={20} color="#3B82F6" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Soins apportés</Text>
          </View>
          
          <View style={styles.careTypesList}>
            {visit.careType.map((type, index) => (
              <View key={index} style={styles.careTypeItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={[styles.careTypeText, { color: colors.textSecondary }]}>{type}</Text>
              </View>
            ))}
          </View>

          {visit.notes && (
            <View style={[styles.notesSection, { borderTopColor: colors.borderLight }]}>
              <Text style={[styles.notesTitle, { color: colors.textSecondary }]}>Notes complémentaires</Text>
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>{visit.notes}</Text>
            </View>
          )}
        </View>

        <View style={[styles.patientCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.patientTitle, { color: colors.textSecondary }]}>Patient</Text>
          <Text style={[styles.patientName, { color: colors.text }]}>{visit.patientName}</Text>
        </View>
        
        {visit.status === 'scheduled' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleMarkAsCompleted}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Marquer comme effectuée</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}