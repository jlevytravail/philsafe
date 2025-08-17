import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Heart } from 'lucide-react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useForm } from '@/hooks/useForm';
import AuthInput from '@/components/AuthInput';
import AuthButton from '@/components/AuthButton';
import RoleSelector from '@/components/RoleSelector';

export default function CompleteProfileScreen() {
  const { colors } = useThemeContext();
  const { profile, updateUserProfile, loading } = useUser();
  
  // Configuration des règles de validation
  const validationRules = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    role: {
      required: true,
    },
  };

  // Hook de formulaire
  const profileForm = useForm(
    { 
      fullName: profile?.full_name || '',
      role: profile?.role || 'aidant',
      phoneNumber: profile?.phone_number || '',
    },
    validationRules
  );

  const [selectedRole, setSelectedRole] = useState<'aidant' | 'intervenant'>(
    (profile?.role as 'aidant' | 'intervenant') || 'aidant'
  );

  const handleCompleteProfile = async () => {
    if (!profileForm.validateForm()) {
      return;
    }

    try {
      const { error } = await updateUserProfile({
        full_name: profileForm.formData.fullName.trim(),
        role: selectedRole,
        phone_number: profileForm.formData.phoneNumber.trim() || null,
      });

      if (!error) {
        Alert.alert(
          'Profil complété',
          'Votre profil a été complété avec succès !',
          [
            {
              text: 'Continuer',
              onPress: () => {
                // Redirection selon le rôle
                if (selectedRole === 'aidant') {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/(caregiver)');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', error);
      }
    } catch (err) {
      console.error('Error completing profile:', err);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite');
    }
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
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
    },
    form: {
      marginBottom: 24,
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
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              Complétez votre profil
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Quelques informations pour personnaliser votre expérience dans PhilSafe
            </Text>

            <View style={styles.form}>
              <AuthInput
                label="Nom complet"
                icon={<User size={20} color={colors.textTertiary} />}
                value={profileForm.formData.fullName}
                onChangeText={(text) => profileForm.handleChange('fullName', text)}
                onBlur={() => profileForm.handleBlur('fullName')}
                error={profileForm.getFieldError('fullName')}
                placeholder="Votre nom complet"
                autoCapitalize="words"
                required
              />

              <AuthInput
                label="Numéro de téléphone (optionnel)"
                value={profileForm.formData.phoneNumber}
                onChangeText={(text) => profileForm.handleChange('phoneNumber', text)}
                onBlur={() => profileForm.handleBlur('phoneNumber')}
                error={profileForm.getFieldError('phoneNumber')}
                placeholder="+33 6 12 34 56 78"
                keyboardType="phone-pad"
              />

              <RoleSelector
                selectedRole={selectedRole}
                onRoleChange={(role) => {
                  setSelectedRole(role);
                  profileForm.handleChange('role', role);
                }}
                disabled={loading}
              />

              <AuthButton
                title={loading ? "Enregistrement..." : "Compléter mon profil"}
                onPress={handleCompleteProfile}
                loading={loading}
                disabled={profileForm.hasErrors || loading}
                icon={<User size={20} color="#FFFFFF" />}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}