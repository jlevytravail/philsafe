import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Mail, Lock, User, UserCheck, Users } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'intervenant' | 'aidant'>('aidant');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { colors } = useThemeContext();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur de connexion', error);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, selectedRole);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur d\'inscription', error);
    } else {
      Alert.alert('Inscription réussie', 'Votre compte a été créé avec succès');
      setIsSignUp(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setSelectedRole('aidant');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logo: {
      marginBottom: 16,
    },
    appName: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    formContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    formTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    roleSelector: {
      marginBottom: 24,
    },
    roleSelectorTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    roleOptions: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 4,
    },
    roleOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 8,
    },
    activeRoleOption: {
      backgroundColor: colors.primary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
    },
    roleOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textTertiary,
    },
    activeRoleOptionText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
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
    submitButtonDisabled: {
      backgroundColor: colors.textTertiary,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    toggleButton: {
      marginLeft: 4,
    },
    toggleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Heart size={64} color="#10B981" />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>PhilSafe</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                Suivi des soins à domicile
              </Text>
            </View>

            <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                {isSignUp ? 'Créer un compte' : 'Connexion'}
              </Text>

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nom complet</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <User size={20} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Votre nom complet"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <Mail size={20} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="votre@email.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mot de passe</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Votre mot de passe"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {isSignUp && (
                <View style={styles.roleSelector}>
                  <Text style={[styles.roleSelectorTitle, { color: colors.textSecondary }]}>Je suis un(e)</Text>
                  <View style={[styles.roleOptions, { backgroundColor: colors.surfaceSecondary }]}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        selectedRole === 'aidant' && [styles.activeRoleOption, { backgroundColor: colors.primary }]
                      ]}
                      onPress={() => setSelectedRole('aidant')}
                    >
                      <Users size={16} color={selectedRole === 'aidant' ? '#FFFFFF' : colors.textTertiary} />
                      <Text style={[
                        styles.roleOptionText,
                        { color: colors.textTertiary },
                        selectedRole === 'aidant' && styles.activeRoleOptionText
                      ]}>
                        Proche aidant
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        selectedRole === 'intervenant' && [styles.activeRoleOption, { backgroundColor: colors.primary }]
                      ]}
                      onPress={() => setSelectedRole('intervenant')}
                    >
                      <UserCheck size={16} color={selectedRole === 'intervenant' ? '#FFFFFF' : colors.textTertiary} />
                      <Text style={[
                        styles.roleOptionText,
                        { color: colors.textTertiary },
                        selectedRole === 'intervenant' && styles.activeRoleOptionText
                      ]}>
                        Professionnel de santé
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled
                ]}
                onPress={isSignUp ? handleSignUp : handleSignIn}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Chargement...' : (isSignUp ? 'Créer le compte' : 'Se connecter')}
                </Text>
              </TouchableOpacity>

              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                  {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
                </Text>
                <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                  <Text style={[styles.toggleButtonText, { color: colors.primary }]}>
                    {isSignUp ? 'Se connecter' : 'S\'inscrire'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}