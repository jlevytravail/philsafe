import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Database, Settings, Trash2, CheckCircle, User, Eye, RefreshCw } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { seedTestData, seedTestDataWithServices, cleanTestData } from '../scripts/seedTestData';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSessionUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase';

export default function TestDataScreen() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { colors } = useThemeContext();
  const { session, user, debugAuthState } = useAuth();
  const { profile } = useSessionUser();

  useEffect(() => {
    checkSessionStatus();
  }, [session, user, profile]);

  const checkSessionStatus = async () => {
    try {
      const sessionInfo = [];
      
      sessionInfo.push('🔍 DIAGNOSTIC DÉTAILLÉ DE SESSION\n');
      
      // Vérifier session depuis AuthContext
      sessionInfo.push(`🔐 Session AuthContext: ${session ? '✅ Active' : '❌ Manquante'}`);
      if (session) {
        sessionInfo.push(`   └── Token expires at: ${new Date(session.expires_at * 1000).toLocaleString()}`);
        sessionInfo.push(`   └── User ID: ${session.user?.id}`);
      }
      
      sessionInfo.push(`👤 User AuthContext: ${user ? `✅ ${user.email}` : '❌ Manquant'}`);
      sessionInfo.push(`📋 Profile UserContext: ${profile ? `✅ ${profile.full_name} (${profile.role})` : '❌ Manquant'}`);
      
      sessionInfo.push('\n📡 VÉRIFICATIONS SUPABASE DIRECTES:');
      
      // Vérifier session directement depuis Supabase
      try {
        const { data: { session: directSession }, error: sessionError } = await supabase.auth.getSession();
        sessionInfo.push(`🔗 getSession(): ${directSession ? '✅ Active' : '❌ Manquante'}`);
        
        if (sessionError) {
          sessionInfo.push(`   └── Erreur: ${sessionError.message}`);
        } else if (directSession) {
          sessionInfo.push(`   └── User: ${directSession.user?.email}`);
          sessionInfo.push(`   └── Expires: ${new Date(directSession.expires_at * 1000).toLocaleString()}`);
        }
      } catch (sessionErr: any) {
        sessionInfo.push(`🔗 getSession(): ❌ Exception: ${sessionErr.message}`);
      }
      
      // Vérifier getUser
      try {
        const { data: { user: directUser }, error: userError } = await supabase.auth.getUser();
        sessionInfo.push(`👨‍💻 getUser(): ${directUser ? '✅ Trouvé' : '❌ Manquant'}`);
        
        if (userError) {
          sessionInfo.push(`   └── Erreur: ${userError.message}`);
        } else if (directUser) {
          sessionInfo.push(`   └── Email: ${directUser.email}`);
        }
      } catch (userErr: any) {
        sessionInfo.push(`👨‍💻 getUser(): ❌ Exception: ${userErr.message}`);
      }
      
      sessionInfo.push('\n🧪 TESTS DE REQUÊTES:');
      
      // Test de requête simple
      try {
        const { data: testData, error: testError } = await supabase.from('users').select('id').limit(1);
        sessionInfo.push(`📊 Requête users: ${!testError ? '✅ Succès' : `❌ ${testError.message}`}`);
        if (testData && testData.length > 0) {
          sessionInfo.push(`   └── Données récupérées: ${testData.length} ligne(s)`);
        }
      } catch (queryErr: any) {
        sessionInfo.push(`📊 Requête users: ❌ Exception: ${queryErr.message}`);
      }
      
      // Test de refresh session
      try {
        sessionInfo.push('\n🔄 TEST DE REFRESH SESSION:');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        sessionInfo.push(`🔄 refreshSession(): ${refreshData.session ? '✅ Succès' : '❌ Échec'}`);
        
        if (refreshError) {
          sessionInfo.push(`   └── Erreur: ${refreshError.message}`);
        } else if (refreshData.session) {
          sessionInfo.push(`   └── Nouvelle session créée`);
        }
      } catch (refreshErr: any) {
        sessionInfo.push(`🔄 refreshSession(): ❌ Exception: ${refreshErr.message}`);
      }
      
      // Informations sur le storage
      sessionInfo.push('\n💾 INFORMATIONS STORAGE:');
      try {
        const storageKey = 'philsafe-auth-token';
        sessionInfo.push(`🔑 Storage key: ${storageKey}`);
        sessionInfo.push(`📱 Platform: React Native (AsyncStorage)`);
        
        // Essayer de lire directement depuis AsyncStorage (si disponible)
        import('@react-native-async-storage/async-storage').then(async (AsyncStorage) => {
          try {
            const storedSession = await AsyncStorage.default.getItem(storageKey);
            if (storedSession) {
              const parsedSession = JSON.parse(storedSession);
              sessionInfo.push(`💾 AsyncStorage: ✅ Session trouvée`);
              sessionInfo.push(`   └── User: ${parsedSession.user?.email || 'N/A'}`);
              sessionInfo.push(`   └── Expires: ${parsedSession.expires_at ? new Date(parsedSession.expires_at * 1000).toLocaleString() : 'N/A'}`);
            } else {
              sessionInfo.push(`💾 AsyncStorage: ❌ Aucune session stockée`);
            }
          } catch (storageReadErr: any) {
            sessionInfo.push(`💾 AsyncStorage: ❌ Erreur lecture: ${storageReadErr.message}`);
          }
          
          // Mettre à jour l'affichage avec les infos de storage
          setDebugInfo(sessionInfo.join('\n'));
        }).catch(() => {
          sessionInfo.push(`💾 AsyncStorage: ❌ Module non disponible`);
        });
        
      } catch (storageErr: any) {
        sessionInfo.push(`💾 Storage: ❌ Erreur: ${storageErr.message}`);
      }
      
      setDebugInfo(sessionInfo.join('\n'));
    } catch (error: any) {
      setDebugInfo(`❌ Erreur critique lors du diagnostic: ${error.message}`);
    }
  };

  const handleSeedData = async () => {
    Alert.alert(
      'Insérer des données de test',
      'Cela va créer des patients, intervenants et interventions de test. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            setStatus('Insertion des données...');
            
            try {
              // Vérifier la session avant de commencer
              await checkSessionStatus();
              
              if (!session || !user) {
                throw new Error('Session non valide. Veuillez vous reconnecter.');
              }
              
              // Attendre un peu pour laisser la session se stabiliser
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Utiliser la version avec services qui gère mieux les RLS
              const result = await seedTestDataWithServices();
              
              const successMessage = [
                `📊 Données créées:`,
                `• ${result.patients.length} patients`,
                `• ${result.intervenants.length} intervenants`,
                `• ${result.interventions.length} interventions`,
                `• ${result.aidantPatientLinks.length} liens`
              ].join('\n');
              
              setStatus(`✅ Insertion terminée !\n${successMessage}`);
              
              setTimeout(() => {
                Alert.alert(
                  'Données créées !',
                  'Vous pouvez maintenant tester l\'application avec des données réalistes.',
                  [
                    { text: 'Retour au dashboard', onPress: () => router.replace('/(tabs)') }
                  ]
                );
              }, 2000);
            } catch (error: any) {
              console.error('Erreur:', error);
              setStatus(`❌ Erreur : ${error?.message || 'Erreur inconnue'}`);
              
              // Relancer le check de session après erreur
              setTimeout(() => checkSessionStatus(), 500);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleForceSessionRefresh = async () => {
    Alert.alert(
      'Forcer le refresh de session',
      'Cela va tenter de rafraîchir votre session Supabase. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refresh Session',
          onPress: async () => {
            setLoading(true);
            setStatus('Refresh de la session...');
            
            try {
              // Première tentative: refresh session normale
              console.log('🔄 Tentative refresh session normale...');
              const { data, error } = await supabase.auth.refreshSession();
              
              if (error) {
                console.log('❌ Refresh normal échoué:', error.message);
                setStatus(`❌ Erreur refresh: ${error.message}`);
                
                // Si le refresh normal échoue, essayer de récupérer la session existante
                console.log('🔄 Tentative de récupération de session existante...');
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                
                if (!sessionError && sessionData.session) {
                  setStatus('✅ Session existante récupérée !');
                  setTimeout(() => checkSessionStatus(), 1000);
                } else {
                  setStatus('❌ Aucune session disponible - reconnectez-vous');
                }
              } else if (data.session) {
                console.log('✅ Refresh session réussi');
                setStatus('✅ Session rafraîchie avec succès !');
                setTimeout(() => checkSessionStatus(), 1000);
              } else {
                setStatus('❌ Aucune session à rafraîchir');
              }
            } catch (error: any) {
              console.error('❌ Exception lors du refresh:', error);
              setStatus(`❌ Exception: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleForceSyncSession = async () => {
    Alert.alert(
      'Test final des données',
      'Cela va tester l\'insertion des données avec un diagnostic complet. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Tester',
          onPress: async () => {
            setLoading(true);
            setStatus('Test des données en cours...');
            
            try {
              console.log('🧪 Test complet avant insertion...');
              
              // 1. Vérifier les deux configurations Supabase
              const { data: utilsSession } = await supabase.auth.getSession();
              console.log('🔧 utils/supabase session:', utilsSession.session ? '✅' : '❌');
              
              // 2. Simuler le processus d'insertion
              if (session && user) {
                console.log('🔄 Simulation insertion avec user:', user.email);
                
                // Test simple de requête comme dans le script
                const { data: testUsers, error: testError } = await supabase
                  .from('users')
                  .select('id, email')
                  .limit(1);
                
                if (testError) {
                  console.log('❌ Test requête échoué:', testError.message);
                  setStatus(`❌ Test requête: ${testError.message}`);
                } else {
                  console.log('✅ Test requête réussi');
                  setStatus('✅ Configuration validée - vous pouvez insérer les données !');
                }
              } else {
                setStatus('❌ Aucune session - connectez-vous d\'abord');
              }
              
              setTimeout(() => checkSessionStatus(), 1000);
            } catch (error: any) {
              console.error('❌ Exception lors du test:', error);
              setStatus(`❌ Exception: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCleanData = async () => {
    Alert.alert(
      'Nettoyer les données de test',
      'Cela va supprimer TOUTES les données de test. Cette action est irréversible !',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setStatus('Suppression des données...');
            
            try {
              await cleanTestData();
              setStatus('✅ Données supprimées avec succès.');
            } catch (error: any) {
              console.error('Erreur:', error);
              setStatus(`❌ Erreur : ${error?.message || 'Erreur inconnue'}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      marginLeft: 8,
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
    dangerButton: {
      backgroundColor: colors.error || '#EF4444',
    },
    buttonDisabled: {
      backgroundColor: colors.border,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    status: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
    },
    statusText: {
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
    },
    warningBox: {
      backgroundColor: colors.warning ? `${colors.warning}20` : '#FEF3C7',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.warning || '#F59E0B',
    },
    warningText: {
      fontSize: 14,
      color: colors.warning || '#D97706',
      textAlign: 'center',
      fontWeight: '500',
    },
    debugInfo: {
      backgroundColor: colors.surfaceSecondary || colors.surface,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    debugText: {
      fontSize: 12,
      fontFamily: 'monospace',
      lineHeight: 18,
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Database size={28} color="#3B82F6" />
          <Text style={styles.title}>Données de Test</Text>
        </View>
        <Text style={styles.subtitle}>
          Gestion des données pour les tests et la validation
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Écran de développement - Ne pas utiliser en production
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>État de la session</Text>
          <Text style={styles.sectionDescription}>
            Informations de debug sur l'état de la connexion utilisateur.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary || '#6B7280' }]}
            onPress={checkSessionStatus}
            disabled={loading}
          >
            <Eye size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Vérifier la session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.info || '#3B82F6' }, loading && styles.buttonDisabled]}
            onPress={handleForceSessionRefresh}
            disabled={loading}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Refresh...' : 'Forcer refresh session'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.warning || '#F59E0B' }, loading && styles.buttonDisabled]}
            onPress={handleForceSyncSession}
            disabled={loading}
          >
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Test...' : 'Tester la configuration'}
            </Text>
          </TouchableOpacity>
          
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error || '#EF4444' }]}
              onPress={() => {
                debugAuthState();
                setTimeout(() => checkSessionStatus(), 500);
              }}
            >
              <User size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Debug Console AuthContext</Text>
            </TouchableOpacity>
          )}
          
          {debugInfo ? (
            <View style={[styles.debugInfo, { backgroundColor: colors.surfaceSecondary || colors.surface }]}>
              <Text style={[styles.debugText, { color: colors.textSecondary }]}>{debugInfo}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Créer des données de test</Text>
          <Text style={styles.sectionDescription}>
            Cela va créer :{'\n'}
            • 3 patients de test (Marie Dupont, Jean Martin, Françoise Blanc){'\n'}
            • 3 intervenants (aide-soignante, infirmier, auxiliaire de vie){'\n'}
            • Planning d'interventions sur 7 jours{'\n'}
            • Liens avec votre compte aidant{'\n'}
            • Historique et notifications de test
          </Text>
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSeedData}
            disabled={loading}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Création en cours...' : 'Créer les données de test'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nettoyer les données</Text>
          <Text style={styles.sectionDescription}>
            Supprime toutes les données de test créées précédemment.{'\n'}
            ⚠️ Cette action est irréversible !
          </Text>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton, loading && styles.buttonDisabled]}
            onPress={handleCleanData}
            disabled={loading}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Suppression...' : 'Supprimer les données de test'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <Text style={styles.sectionDescription}>
            Retourner aux écrans principaux de l'application.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)')}
          >
            <Settings size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Retour au Dashboard</Text>
          </TouchableOpacity>
        </View>

        {status ? (
          <View style={styles.status}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}