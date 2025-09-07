import { supabase } from './supabase.js';
import { User } from './types.js';

export class AuthManager {
  private currentUser: User | null = null;

  // Authentifier avec un JWT token
  async authenticateWithToken(token: string): Promise<User> {
    try {
      // Définir la session avec le token
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: '' // Pas de refresh pour MCP
      });

      if (error) throw error;
      if (!data.user) throw new Error('Utilisateur introuvable');

      // Récupérer le profil utilisateur
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;
      
      this.currentUser = userProfile as User;
      return this.currentUser;
    } catch (error) {
      throw new Error(`Authentification échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // Vérifier l'accès basé sur le rôle
  checkRoleAccess(requiredRoles: string[]): void {
    if (!this.currentUser) {
      throw new Error('Authentification requise');
    }

    if (!this.currentUser.role || !requiredRoles.includes(this.currentUser.role)) {
      throw new Error(`Accès refusé. Rôles requis: ${requiredRoles.join(', ')}`);
    }
  }

  // Vérifier si l'utilisateur peut accéder à un patient
  async checkPatientAccess(patientId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('Authentification requise');
    }

    // Si l'utilisateur est un intervenant, il peut accéder à tous les patients
    if (this.currentUser.role === 'intervenant') {
      return;
    }

    // Si c'est un aidant, vérifier les liens
    if (this.currentUser.role === 'aidant') {
      const { data, error } = await supabase
        .from('aidant_patient_links')
        .select('id')
        .eq('aidant_id', this.currentUser.id)
        .eq('patient_id', patientId)
        .single();

      if (error || !data) {
        throw new Error('Accès refusé à ce patient');
      }
      return;
    }

    throw new Error('Rôle non autorisé');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  logout(): void {
    this.currentUser = null;
    supabase.auth.signOut();
  }
}

// Instance globale
export const authManager = new AuthManager();