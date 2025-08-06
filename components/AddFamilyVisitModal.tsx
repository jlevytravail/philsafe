import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { X, Calendar, Clock, User, MessageSquare, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FamilyVisit } from '@/types';
import { useThemeContext } from '@/context/ThemeContext';

interface AddFamilyVisitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (familyVisit: FamilyVisit) => void;
  selectedDate?: Date;
}

export default function AddFamilyVisitModal({ 
  visible, 
  onClose, 
  onAdd, 
  selectedDate 
}: AddFamilyVisitModalProps) {
  const { colors } = useThemeContext();
  const [name, setName] = useState('');
  const [date, setDate] = useState(selectedDate || new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [type, setType] = useState<FamilyVisit['type']>('visite');
  const [notes, setNotes] = useState('');
  
  // États pour contrôler l'affichage des pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [hasEndTime, setHasEndTime] = useState(false);

  const visitTypes = [
    { value: 'visite', label: 'Visite' },
    { value: 'repas', label: 'Repas' },
    { value: 'appel', label: 'Appel' },
    { value: 'aide', label: 'Aide' },
    { value: 'autre', label: 'Autre' }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const handleSubmit = () => {
    const newFamilyVisit: FamilyVisit = {
      id: Date.now().toString(),
      name: name || undefined,
      date: date.toISOString().split('T')[0],
      startTime: formatTime(startTime),
      endTime: hasEndTime ? formatTime(endTime) : undefined,
      type,
      notes: notes || undefined
    };

    onAdd(newFamilyVisit);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setDate(selectedDate || new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setType('visite');
    setNotes('');
    setHasEndTime(false);
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    onClose();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    form: {
      flex: 1,
      padding: 20,
    },
    field: {
      marginBottom: 20,
    },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    fieldLabel: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    textInput: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    pickerButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    endTimeContainer: {
      gap: 12,
    },
    toggleButton: {
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
    },
    toggleButtonActive: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primary,
    },
    toggleButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    toggleButtonTextActive: {
      color: colors.primary,
    },
    typeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeOption: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    selectedType: {
      backgroundColor: '#8B5CF6',
      borderColor: '#8B5CF6',
    },
    typeText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    selectedTypeText: {
      color: '#FFFFFF',
    },
    footer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    submitButton: {
      flex: 1,
      backgroundColor: '#8B5CF6',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Ajouter une venue familiale</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <User size={16} color={colors.textTertiary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Qui vient ?</Text>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Nom du proche (optionnel)"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Calendar size={16} color={colors.textTertiary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date</Text>
            </View>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(!showDatePicker)}
            >
              <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                {formatDate(date)}
              </Text>
              <ChevronDown size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Clock size={16} color={colors.textTertiary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Heure de début</Text>
            </View>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowStartTimePicker(!showStartTimePicker)}
            >
              <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                {formatTime(startTime)}
              </Text>
              <ChevronDown size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Clock size={16} color={colors.textTertiary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Heure de fin</Text>
            </View>
            
            <View style={styles.endTimeContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, hasEndTime && styles.toggleButtonActive]}
                  styles.toggleButton,
                  styles.toggleButtonText,
                  { color: colors.textSecondary },
                  hasEndTime && [styles.toggleButtonTextActive, { color: colors.primary }]
                <Text style={[styles.toggleButtonText, hasEndTime && styles.toggleButtonTextActive]}>
                  {hasEndTime ? 'Heure de fin définie' : 'Pas d\'heure de fin'}
                </Text>
              </TouchableOpacity>
              
              {hasEndTime && (
                <>
                  <TouchableOpacity
                    style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                  >
                    <Text style={[styles.pickerButtonText, { color: colors.text }]}>
                      {formatTime(endTime)}
                    </Text>
                    <ChevronDown size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                  
                  {showEndTimePicker && (
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      display="spinner"
                      onChange={handleEndTimeChange}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Type de venue</Text>
            <View style={styles.typeSelector}>
              {visitTypes.map((visitType) => (
                <TouchableOpacity
                  key={visitType.value}
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    type === visitType.value && styles.selectedType
                  ]}
                  onPress={() => setType(visitType.value as FamilyVisit['type'])}
                >
                  <Text style={[
                    styles.typeText,
                    { color: colors.textSecondary },
                    type === visitType.value && styles.selectedTypeText
                  ]}>
                    {visitType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <MessageSquare size={16} color={colors.textTertiary} />
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Commentaire (optionnel)</Text>
            </View>
            <TextInput
              style={[
                styles.textInput, 
                styles.textArea,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes ou détails..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]} onPress={handleClose}>
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
