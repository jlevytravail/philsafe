import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { X, Calendar, Clock, User, MessageSquare, ChevronDown } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FamilyVisit } from '@/types';

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
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter une venue familiale</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <User size={16} color="#6B7280" />
              <Text style={styles.fieldLabel}>Qui vient ?</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Nom du proche (optionnel)"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Calendar size={16} color="#6B7280" />
              <Text style={styles.fieldLabel}>Date</Text>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerButtonText}>
                {formatDate(date)}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.fieldLabel}>Heure de début</Text>
            </View>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.pickerButtonText}>
                {formatTime(startTime)}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
            
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.fieldLabel}>Heure de fin</Text>
            </View>
            
            <View style={styles.endTimeContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, hasEndTime && styles.toggleButtonActive]}
                onPress={() => setHasEndTime(!hasEndTime)}
              >
                <Text style={[styles.toggleButtonText, hasEndTime && styles.toggleButtonTextActive]}>
                  {hasEndTime ? 'Heure de fin définie' : 'Pas d\'heure de fin'}
                </Text>
              </TouchableOpacity>
              
              {hasEndTime && (
                <>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {formatTime(endTime)}
                    </Text>
                    <ChevronDown size={20} color="#6B7280" />
                  </TouchableOpacity>
                  
                  {showEndTimePicker && (
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleEndTimeChange}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Type de venue</Text>
            <View style={styles.typeSelector}>
              {visitTypes.map((visitType) => (
                <TouchableOpacity
                  key={visitType.value}
                  style={[
                    styles.typeOption,
                    type === visitType.value && styles.selectedType
                  ]}
                  onPress={() => setType(visitType.value as FamilyVisit['type'])}
                >
                  <Text style={[
                    styles.typeText,
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
              <MessageSquare size={16} color="#6B7280" />
              <Text style={styles.fieldLabel}>Commentaire (optionnel)</Text>
            </View>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes ou détails..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    color: '#374151',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  endTimeContainer: {
    gap: 12,
  },
  toggleButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#3B82F6',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
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