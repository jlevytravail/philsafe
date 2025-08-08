import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, Heart, UserPlus, Users, UserCheck, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'aidant' | 'intervenant'>('aidant');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // États de validation
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { signUp, loading, error, clearError, session } = useAuth();
  const { colors } = useThemeContext();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  // Nettoyer les erreurs quand on change les champs
  useEffect(() => {
    if (error) {
      clearError();
    }
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  }, [fullName, email, password, confirmPassword]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Le nom complet est requis');
      isValid = false;
    } else if (fullName.trim().length < 2) {
      setFullNameError('Le nom doit contenir au moins 2 caractères');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('L\'email est requis');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Format d\'email invalide');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Le mot de passe est requis');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('La confirmation du mot de passe est requise');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    const { error } = await signUp(email, password, fullName, role);
    
    if (error) {
      Alert.alert('Erreur de création de compte', error);
    } else {
      Alert.alert(
        'Compte créé avec succès',
        'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    }
  };

  const navigateToLogin = () => {
    router.back();
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 20,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputWrapperError: {
      borderColor: colors.error,
    },
    inputIcon: {
      marginRight: 12,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    passwordToggle: {
      padding: 4,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
      marginLeft: 4,
    },
    roleContainer: {
      marginBottom: 20,
    },
    roleSelector: {
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
    roleDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 16,
    },
    signUpButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
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
    signUpButtonDisabled: {
      backgroundColor: colors.textTertiary,
    },
    signUpButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    loginText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    loginLink: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
    errorContainer: {
      backgroundColor: colors.errorLight,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorMessage: {
      fontSize: 14,
      color: colors.error,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={navigateToLogin} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Créer un compte</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Heart size={48} color="#10B981" />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>Rejoindre PhilSafe</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                Créez votre compte pour commencer
              </Text>
            </View>

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
                <Text style={[styles.errorMessage, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nom complet</Text>
                <View style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  fullNameError && [styles.inputWrapperError, { borderColor: colors.error }]
                ]}>
                  <User size={20} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Votre nom complet"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
                {fullNameError ? <Text style={[styles.errorText, { color: colors.error }]}>{fullNameError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                <View style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  emailError && [styles.inputWrapperError, { borderColor: colors.error }]
                ]}>
                  <Mail size={20} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="votre@email.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
                {emailError ? <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mot de passe</Text>
                <View style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  passwordError && [styles.inputWrapperError, { borderColor: colors.error }]
                ]}>
                  <Lock size={20} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 6 caractères"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textTertiary} />
                    ) : (
                      <Eye size={20} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError ? <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirmer le mot de passe</Text>
                <View style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  confirmPasswordError && [styles.inputWrapperError, { borderColor: colors.error }]
                ]}>
                  <Lock size={20} color={colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirmez votre mot de passe"
                    placeholderTextColor={colors.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={colors.textTertiary} />
                    ) : (
                      <Eye size={20} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={[styles.errorText, { color: colors.error }]}>{confirmPasswordError}</Text> : null}
              </View>

              <View style={styles.roleContainer}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Je suis</Text>
                <View style={[styles.roleSelector, { backgroundColor: colors.surfaceSecondary }]}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === 'aidant' && [styles.activeRoleOption, { backgroundColor: colors.primary }]
                    ]}
                    onPress={() => setRole('aidant')}
                    disabled={loading}
                  >
                    <Users size={16} color={role === 'aidant' ? '#FFFFFF' : colors.textTertiary} />
                    <Text style={[
                      styles.roleOptionText,
                      { color: colors.textTertiary },
                      role === 'aidant' && styles.activeRoleOptionText
                    ]}>
                      Proche aidant
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      role === 'intervenant' && [styles.activeRoleOption, { backgroundColor: colors.primary }]
                    ]}
                    onPress={() => setRole('intervenant')}
                    disabled={loading}
                  >
                    <UserCheck size={16} color={role === 'intervenant' ? '#FFFFFF' : colors.textTertiary} />
                    <Text style={[
                      styles.roleOptionText,
                      { color: colors.textTertiary },
                      role === 'intervenant' && styles.activeRoleOptionText
                    ]}>
                      Professionnel de santé
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                  {role === 'aidant' 
                    ? 'Vous accompagnez un proche dans ses soins quotidiens'
                    : 'Vous êtes un professionnel de santé intervenant à domicile'
                  }
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  loading && [styles.signUpButtonDisabled, { backgroundColor: colors.textTertiary }]
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <UserPlus size={20} color="#FFFFFF" />
                    <Text style={styles.signUpButtonText}>Créer mon compte</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>Déjà un compte ?</Text>
              <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}