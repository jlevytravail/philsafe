import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { importService } from '@/services/importService';
import type { DiagnosticResult } from '@/services/importService';

export default function ImportDiagnosticScreen() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const result = await importService.diagnoseCurrentUser();
      setDiagnostic(result);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de lancer le diagnostic');
      console.error('Erreur diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testImport = async () => {
    if (!testEmail || !testName) {
      Alert.alert('Erreur', 'Email et nom requis pour le test d\'import');
      return;
    }

    setIsLoading(true);
    try {
      // Générer des données de test
      const testData = importService.generateTestImportData(testEmail, testName);
      
      // Importer
      const importResult = await importService.importUserCalendar(testData);
      
      if (importResult.success) {
        Alert.alert(
          'Succès', 
          `Import réussi!\n- Patients: ${importResult.data.patients_created}\n- Interventions: ${importResult.data.interventions_created}`
        );
        
        // Valider l'import
        setTimeout(async () => {
          try {
            const validation = await importService.validateImportSuccess(testEmail);
            console.log('Validation:', validation);
          } catch (error) {
            console.error('Erreur validation:', error);
          }
        }, 1000);
      } else {
        Alert.alert('Échec', importResult.error || 'Import failed');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'import de test');
      console.error('Erreur import:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fixAuthIds = async () => {
    setIsLoading(true);
    try {
      const result = await importService.fixMissingAuthIds();
      Alert.alert('Correction', JSON.stringify(result, null, 2));
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la correction des auth_id');
      console.error('Erreur correction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Diagnostic Import',
          headerShown: true,
          headerBackTitle: 'Retour'
        }} 
      />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🔧 Diagnostic d'Import PhilSafe</Text>
      
      {/* Section diagnostic */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic Utilisateur Actuel</Text>
        <TouchableOpacity
          style={[styles.button, styles.diagnosticButton]}
          onPress={runDiagnostic}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Diagnostic...' : '🔍 Lancer Diagnostic'}
          </Text>
        </TouchableOpacity>
        
        {diagnostic && (
          <View style={styles.diagnosticResult}>
            <Text style={styles.resultTitle}>Résultats:</Text>
            <Text style={diagnostic.success ? styles.success : styles.error}>
              Status: {diagnostic.success ? '✅ Success' : '❌ Error'}
            </Text>
            
            {diagnostic.user_found && diagnostic.user_info && (
              <View style={styles.userInfo}>
                <Text style={styles.infoText}>👤 User: {diagnostic.user_info.email}</Text>
                <Text style={styles.infoText}>🆔 ID: {diagnostic.user_info.id}</Text>
                <Text style={styles.infoText}>
                  🔐 Auth ID: {diagnostic.user_info.auth_id || 'NULL'}
                </Text>
                <Text style={diagnostic.user_info.auth_id_matches ? styles.success : styles.warning}>
                  🔗 Auth Match: {diagnostic.user_info.auth_id_matches ? 'YES' : 'NO'}
                </Text>
                
                {diagnostic.data_access && (
                  <View style={styles.dataAccess}>
                    <Text style={styles.infoText}>
                      🔗 Liens Patients: {diagnostic.data_access.links_count}
                    </Text>
                    <Text style={styles.infoText}>
                      📅 Interventions: {diagnostic.data_access.interventions_count}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {diagnostic.error && (
              <Text style={styles.error}>Erreur: {diagnostic.error}</Text>
            )}
          </View>
        )}
      </View>

      {/* Section test d'import */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test d'Import</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email de test (ex: test@example.com)"
          value={testEmail}
          onChangeText={setTestEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          value={testName}
          onChangeText={setTestName}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testImport}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Import...' : '🧪 Test Import Complet'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section outils */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outils de Réparation</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.fixButton]}
          onPress={fixAuthIds}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Correction...' : '🔧 Corriger Auth IDs'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section informations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
        <Text style={styles.infoText}>
          Cette page permet de diagnostiquer et résoudre les problèmes d'affichage 
          des données après import de calendriers.
        </Text>
        <Text style={styles.infoText}>
          • Le diagnostic vérifie la configuration RLS de l'utilisateur actuel
        </Text>
        <Text style={styles.infoText}>
          • Le test d'import crée un utilisateur complet avec des données de test
        </Text>
        <Text style={styles.infoText}>
          • Les outils de réparation corrigent les problèmes détectés
        </Text>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosticButton: {
    backgroundColor: '#007bff',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  fixButton: {
    backgroundColor: '#ffc107',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  diagnosticResult: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  userInfo: {
    marginTop: 8,
  },
  dataAccess: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  success: {
    color: '#28a745',
    fontWeight: '600',
  },
  error: {
    color: '#dc3545',
    fontWeight: '600',
  },
  warning: {
    color: '#ffc107',
    fontWeight: '600',
  },
});