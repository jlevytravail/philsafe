import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Clock, User, Phone, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle, MessageSquare, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { visits, caregivers } from '@/data/mockData';
import { useVisits } from '@/context/VisitContext';
import { visits, caregivers } from '@/data/mockData';

export default function VisitDetail() {
  const { id } = useLocalSearchParams();
  const { visits, updateVisitStatus } = useVisits();
  const visit = visits.find(v => v.id === id);
  const caregiver = visit ? caregivers.find(c => c.id === visit.caregiverId) : null;

  if (!visit || !caregiver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Visite non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle size={24} color="#10B981" />,
          text: 'Terminée',
          color: '#10B981',
          bgColor: '#ECFDF5'
        };
      case 'in-progress':
        return {
          icon: <AlertCircle size={24} color="#F59E0B" />,
          text: 'En cours',
          color: '#F59E0B',
          bgColor: '#FFFBEB'
        };
      case 'scheduled':
        return {
          icon: <Circle size={24} color="#6B7280" />,
          text: 'Prévue',
          color: '#6B7280',
          bgColor: '#F9FAFB'
        };
      default:
        return {
          icon: <Circle size={24} color="#6B7280" />,
          text: 'Inconnue',
          color: '#6B7280',
          bgColor: '#F9FAFB'
        };
    }
  };

  const statusInfo = getStatusInfo(visit.status);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMarkAsCompleted = () => {
    if (visit && visit.status === 'scheduled') {
      updateVisitStatus(visit.id, 'completed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la visite</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={styles.visitDate}>{formatDate(visit.date)}</Text>
        </View>

        <View style={styles.timeCard}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Horaires</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Heure de début</Text>
            <Text style={styles.timeValue}>{visit.startTime}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Heure de fin</Text>
            <Text style={styles.timeValue}>{visit.endTime}</Text>
          </View>
        </View>

        <View style={styles.caregiverCard}>
          <View style={styles.cardHeader}>
            <User size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Intervenant</Text>
          </View>
          
          <View style={styles.caregiverInfo}>
            {caregiver.photo && (
              <Image source={{ uri: caregiver.photo }} style={styles.caregiverPhoto} />
            )}
            <View style={styles.caregiverDetails}>
              <Text style={styles.caregiverName}>{caregiver.name}</Text>
              <Text style={styles.caregiverRole}>{caregiver.role}</Text>
              {caregiver.phone && (
                <TouchableOpacity style={styles.phoneButton}>
                  <Phone size={16} color="#3B82F6" />
                  <Text style={styles.phoneText}>{caregiver.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.careCard}>
          <View style={styles.cardHeader}>
            <MessageSquare size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Soins apportés</Text>
          </View>
          
          <View style={styles.careTypesList}>
            {visit.careType.map((type, index) => (
              <View key={index} style={styles.careTypeItem}>
                <CheckCircle size={16} color="#10B981" />
                <Text style={styles.careTypeText}>{type}</Text>
              </View>
            ))}
          </View>

          {visit.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Notes complémentaires</Text>
              <Text style={styles.notesText}>{visit.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.patientCard}>
          <Text style={styles.patientTitle}>Patient</Text>
          <Text style={styles.patientName}>{visit.patientName}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#6B7280',
    textAlign: 'center',
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#111827',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  caregiverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#111827',
    marginBottom: 4,
  },
  caregiverRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  careCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  careTypesList: {
    gap: 12,
  },
  careTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careTypeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  patientTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
  },
  completeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  completeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});