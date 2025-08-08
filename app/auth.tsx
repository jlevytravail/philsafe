import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, User, Heart, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import { useForm } from '@/hooks/useForm';
import AuthInput from '@/components/AuthInput';
import AuthButton from '@/components/AuthButton';
import SocialLoginButton from '@/components/SocialLoginButton';
import AuthModeToggle from '@/components/AuthModeToggle';
import RoleSelector from '@/components/RoleSelector';

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signUp, resetPasswordForEmail, signInWithOAuth, loading, error, clearError, session, role } = useAuth();
  const { colors } = useThemeContext();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (session && role) {
      if (role === 'aidant') {
        router.replace('/(tabs)');
      } else if (role === 'intervenant') {
        router.replace('/(caregiver)');
      }
    }
  }, [session, role]);

  // Configuration des règles de validation
  const loginValidationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 1,
    },
  };

  const signupValidationRules = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    },
    confirmPassword: {
      required: true,
      custom: (value: string, formData: Record<string, string>) => {
        if (value !== formData.password) {
          return 'Les mots de passe ne correspondent pas';
        }
        return null;
      },
    },
  };

  // Hooks de formulaire
  const loginForm = useForm(
    { email: '', password: '' },
    loginValidationRules
  );

  const signupForm = useForm(
    { fullName: '', email: '', password: '', confirmPassword: '' },
    signupValidationRules
  );

  const [selectedRole, setSelectedRole] = useState<'aidant' | 'intervenant'>('aidant');

  // Nettoyer les erreurs quand on change de mode
  useEffect(() => {
    if (error) {
      clearError();
    }
    loginForm.resetForm();
    signupForm.resetForm();
  }, [authMode]);

  const handleLogin = async () => {
    if (!loginForm.validateForm()) {
      return;
    }

    const { error } = await signIn(
      loginForm.formData.email, 
      loginForm.formData.password, 
      rememberMe
    );
    
    if (!error) {
      loginForm.resetForm();
    }
  };

  const handleSignUp = async () => {
    if (!signupForm.validateForm()) {
      return;
    }

    const { error } = await signUp(
      signupForm.formData.email,
      signupForm.formData.password,
      signupForm.formData.fullName,
      selectedRole
    );
    
    if (!error) {
      signupForm.resetForm();
      setAuthMode('login');
    }
  };

  const handleForgotPassword = () => {
    if (!loginForm.formData.email) {
      Alert.alert(
        'Email requis',
        'Veuillez saisir votre email pour réinitialiser votre mot de passe',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Réinitialiser le mot de passe',
      `Envoyer un email de récupération à ${loginForm.formData.email} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Envoyer', 
          onPress: () => resetPasswordForEmail(loginForm.formData.email)
        }
      ]
    );
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    signInWithOAuth(provider);
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
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    form: {
      marginBottom: 24,
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    rememberMeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rememberMeText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 8,
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 14,
      color: colors.textTertiary,
      paddingHorizontal: 16,
    },
    socialButtonsContainer: {
      gap: 8,
      marginBottom: 24,
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
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Heart size={64} color="#10B981" />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>PhilSafe</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                Votre assistant de soins à domicile
              </Text>
            </View>

            <AuthModeToggle mode={authMode} onModeChange={setAuthMode} />

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
                <Text style={[styles.errorMessage, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              {authMode === 'login' ? (
                <>
                  <AuthInput
                    label="Email"
                    icon={<Mail size={20} color={colors.textTertiary} />}
                    value={loginForm.formData.email}
                    onChangeText={(text) => loginForm.handleChange('email', text)}
                    onBlur={() => loginForm.handleBlur('email')}
                    error={loginForm.getFieldError('email')}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                  />

                  <AuthInput
                    label="Mot de passe"
                    icon={<Lock size={20} color={colors.textTertiary} />}
                    value={loginForm.formData.password}
                    onChangeText={(text) => loginForm.handleChange('password', text)}
                    onBlur={() => loginForm.handleBlur('password')}
                    error={loginForm.getFieldError('password')}
                    placeholder="Votre mot de passe"
                    isPassword
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                  />

                  <View style={styles.rememberMeContainer}>
                    <View style={styles.rememberMeLeft}>
                      <Switch
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={rememberMe ? '#FFFFFF' : colors.textTertiary}
                        accessibilityLabel="Se souvenir de moi"
                      />
                      <Text style={[styles.rememberMeText, { color: colors.textSecondary }]}>
                        Se souvenir de moi
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={handleForgotPassword}
                      style={styles.forgotPasswordButton}
                      accessibilityRole="button"
                      accessibilityLabel="Mot de passe oublié"
                    >
                      <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                        Mot de passe oublié ?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <AuthButton
                    title="Se connecter"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loginForm.hasErrors}
                    icon={<Mail size={20} color="#FFFFFF" />}
                  />
                </>
              ) : (
                <>
                  <AuthInput
                    label="Nom complet"
                    icon={<User size={20} color={colors.textTertiary} />}
                    value={signupForm.formData.fullName}
                    onChangeText={(text) => signupForm.handleChange('fullName', text)}
                    onBlur={() => signupForm.handleBlur('fullName')}
                    error={signupForm.getFieldError('fullName')}
                    placeholder="Votre nom complet"
                    autoCapitalize="words"
                    required
                  />

                  <AuthInput
                    label="Email"
                    icon={<Mail size={20} color={colors.textTertiary} />}
                    value={signupForm.formData.email}
                    onChangeText={(text) => signupForm.handleChange('email', text)}
                    onBlur={() => signupForm.handleBlur('email')}
                    error={signupForm.getFieldError('email')}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                  />

                  <AuthInput
                    label="Mot de passe"
                    icon={<Lock size={20} color={colors.textTertiary} />}
                    value={signupForm.formData.password}
                    onChangeText={(text) => signupForm.handleChange('password', text)}
                    onBlur={() => signupForm.handleBlur('password')}
                    error={signupForm.getFieldError('password')}
                    placeholder="Minimum 8 caractères"
                    isPassword
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                  />

                  <AuthInput
                    label="Confirmer le mot de passe"
                    icon={<Lock size={20} color={colors.textTertiary} />}
                    value={signupForm.formData.confirmPassword}
                    onChangeText={(text) => signupForm.handleChange('confirmPassword', text)}
                    onBlur={() => signupForm.handleBlur('confirmPassword')}
                    error={signupForm.getFieldError('confirmPassword')}
                    placeholder="Confirmez votre mot de passe"
                    isPassword
                    autoCapitalize="none"
                    autoCorrect={false}
                    required
                  />

                  <RoleSelector
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                    disabled={loading}
                  />

                  <AuthButton
                    title="Créer mon compte"
                    onPress={handleSignUp}
                    loading={loading}
                    disabled={signupForm.hasErrors}
                    icon={<User size={20} color="#FFFFFF" />}
                  />
                </>
              )}

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textTertiary }]}>ou</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <SocialLoginButton
                  provider="google"
                  onPress={() => handleSocialLogin('google')}
                  disabled={loading}
                />
                <SocialLoginButton
                  provider="apple"
                  onPress={() => handleSocialLogin('apple')}
                  disabled={loading}
                />
                <SocialLoginButton
                  provider="facebook"
                  onPress={() => handleSocialLogin('facebook')}
                  disabled={loading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}