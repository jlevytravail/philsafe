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
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [otpCode, setOtpCode] = useState('');

  const { signIn, signUp, resetPasswordForEmail, signInWithOAuth, signInWithOtp, verifyOtp, loading, error, clearError, otpSent, otpEmail, clearOtpState } = useAuth();
  const { colors } = useThemeContext();



  // Handler pour les deep links (magic links de Supabase)
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      // Les magic links de Supabase contiennent des fragments (#access_token=...)
      // Supabase gère automatiquement l'extraction du token avec detectSessionInUrl: true
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        console.log('Auth token detected in URL, Supabase will handle session creation');
      }
    };

    // Vérifier l'URL initiale au lancement de l'app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Écouter les nouveaux deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Configuration des règles de validation
  const loginValidationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
    { email: '' },
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

    try {
      await signInWithOtp(loginForm.formData.email);
    } catch (err) {
      console.error('Unexpected error in handleLogin:', err);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres');
      return;
    }

    try {
      const { error } = await verifyOtp(otpEmail, otpCode);
      
      if (!error) {
        setOtpCode('');
        loginForm.resetForm();
      }
    } catch (err) {
      console.error('Unexpected error in handleVerifyOtp:', err);
    }
  };

  const handleBackToLogin = () => {
    clearOtpState();
    setOtpCode('');
  };

  const handleSignUp = async () => {
    if (!signupForm.formData.email || !signupForm.formData.fullName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    // Pour l'instant, utiliser OTP avec les données de signup stockées temporairement
    // TODO: Améliorer pour passer les données lors du callback du magic link
    const { error } = await signInWithOtp(signupForm.formData.email);
    
    if (!error) {
      Alert.alert(
        'Email envoyé',
        `Un lien de connexion a été envoyé à ${signupForm.formData.email}. Après avoir cliqué sur le lien, vous pourrez compléter votre profil.`,
        [{ text: 'OK' }]
      );
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

  const handleMagicLinkLogin = () => {
    if (!loginForm.formData.email) {
      Alert.alert(
        'Email requis',
        'Veuillez saisir votre email pour recevoir un lien de connexion',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Connexion par lien magique',
      `Envoyer un lien de connexion à ${loginForm.formData.email} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Envoyer', 
          onPress: () => signInWithOtp(loginForm.formData.email)
        }
      ]
    );
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
              {otpSent ? (
                <>
                  <TouchableOpacity 
                    onPress={handleBackToLogin}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}
                  >
                    <ArrowLeft size={20} color={colors.primary} />
                    <Text style={{ color: colors.primary, marginLeft: 8, fontSize: 16 }}>Retour</Text>
                  </TouchableOpacity>

                  <Text style={[{ 
                    color: colors.text, 
                    fontSize: 24, 
                    fontWeight: '600',
                    textAlign: 'center', 
                    marginBottom: 8
                  }]}>
                    Vérification
                  </Text>

                  <Text style={[{ 
                    color: colors.textSecondary, 
                    fontSize: 16, 
                    textAlign: 'center', 
                    marginBottom: 32,
                    lineHeight: 22 
                  }]}>
                    Nous avons envoyé un code à 6 chiffres à{'\n'}{otpEmail}
                  </Text>

                  <AuthInput
                    label="Code de vérification"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    placeholder="123456"
                    keyboardType="numeric"
                    maxLength={6}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <AuthButton
                    title={loading ? "Vérification..." : "Vérifier le code"}
                    onPress={handleVerifyOtp}
                    loading={loading}
                    disabled={otpCode.length !== 6 || loading}
                    icon={<Mail size={20} color="#FFFFFF" />}
                  />

                  <TouchableOpacity 
                    onPress={handleLogin}
                    style={{ alignSelf: 'center', marginTop: 24 }}
                    disabled={loading}
                  >
                    <Text style={[{ color: colors.primary, fontSize: 16 }]}>
                      Renvoyer le code
                    </Text>
                  </TouchableOpacity>
                </>
              ) : authMode === 'login' ? (
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

                  <Text style={[{ 
                    color: colors.textSecondary, 
                    fontSize: 14, 
                    textAlign: 'center', 
                    marginBottom: 16,
                    lineHeight: 20 
                  }]}>
                    Saisissez votre email ci-dessus et cliquez sur "Envoyer le lien de connexion" pour recevoir un lien magique par email.
                  </Text>

                  <AuthButton
                    title={loading ? "Envoi en cours..." : "Envoyer le lien de connexion"}
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loginForm.hasErrors || loading}
                    icon={<Mail size={20} color="#FFFFFF" />}
                  />

                  {loading && (
                    <Text style={[{ 
                      color: colors.primary, 
                      fontSize: 14, 
                      textAlign: 'center', 
                      marginTop: 12,
                      fontWeight: '500'
                    }]}>
                      📧 Vérifiez votre boîte email et cliquez sur le lien de connexion
                    </Text>
                  )}

                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dividerText, { color: colors.textTertiary }]}>ou</Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  </View>

                  <TouchableOpacity 
                    onPress={handleForgotPassword}
                    style={[styles.forgotPasswordButton, { alignSelf: 'center' }]}
                    accessibilityRole="button"
                    accessibilityLabel="Mot de passe oublié"
                  >
                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                      Réinitialiser le mot de passe
                    </Text>
                  </TouchableOpacity>

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

                  <Text style={[{ 
                    color: colors.textSecondary, 
                    fontSize: 14, 
                    textAlign: 'center', 
                    marginBottom: 16,
                    lineHeight: 20 
                  }]}>
                    Saisissez vos informations ci-dessus. Un lien de connexion vous sera envoyé par email.
                  </Text>

                  <RoleSelector
                    selectedRole={selectedRole}
                    onRoleChange={setSelectedRole}
                    disabled={loading}
                  />

                  <AuthButton
                    title={loading ? "Envoi en cours..." : "Créer mon compte"}
                    onPress={handleSignUp}
                    loading={loading}
                    disabled={loading}
                    icon={<Mail size={20} color="#FFFFFF" />}
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