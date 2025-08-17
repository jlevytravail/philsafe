import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, User, MapPin, Phone, ChevronRight } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { usePatients } from '@/src/hooks/usePatients';
import { router } from 'expo-router';

export default function PatientsScreen() {
  const { colors } = useThemeContext();
  const { patients, loading, error } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientPress = (patientId: string) => {
    router.push(`/patient-detail/${patientId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
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
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: 16,
    },
    patientCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    patientHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    patientAge: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    patientDetails: {
      gap: 8,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    visitInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    visitItem: {
      flex: 1,
      alignItems: 'center',
    },
    visitLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    visitDate: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    conditions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    conditionTag: {
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    conditionText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
    chevronIcon: {
      marginLeft: 8,
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
        <Text style={styles.title}>Mes Patients</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          {loading ? (
            <View style={styles.emptyState}>
              <User size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                Chargement des patients...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <User size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                Erreur: {error}
              </Text>
            </View>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <TouchableOpacity 
                key={patient.id} 
                style={styles.patientCard}
                onPress={() => handlePatientPress(patient.id)}
              >
                <View style={styles.patientHeader}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.full_name}</Text>
                    <Text style={styles.patientAge}>{calculateAge(patient.birth_date)} ans</Text>
                  </View>
                  <ChevronRight size={20} color={colors.textTertiary} style={styles.chevronIcon} />
                </View>

                <View style={styles.patientDetails}>
                  <View style={styles.detailRow}>
                    <MapPin size={16} color={colors.textTertiary} />
                    <Text style={styles.detailText}>{patient.address}</Text>
                  </View>
                </View>

                {patient.medical_notes && (
                  <View style={styles.conditions}>
                    <View style={styles.conditionTag}>
                      <Text style={styles.conditionText}>Voir notes médicales</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <User size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>
                Aucun patient trouvé
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}