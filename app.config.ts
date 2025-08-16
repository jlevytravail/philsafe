import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PhilSafe',
  slug: 'philsafe',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'philsafe',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.philsafe.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.philsafe.app'
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png'
  },
  plugins: [
    'expo-router'
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    // Supabase configuration
    // Pour configurer votre instance Supabase, ajoutez ces variables :
    // 
    // supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    // supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
    //
    // Vous pouvez aussi créer un fichier .env avec :
    // SUPABASE_URL=https://your-project.supabase.co
    // SUPABASE_ANON_KEY=your-anon-key
    //
    // Pour l'instant, utilisation des valeurs hardcodées existantes :
    supabaseUrl: 'https://yrkjdoynzcvagcqmzmgw.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya2pkb3luemN2YWdjcW16bWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTc0ODEsImV4cCI6MjA3MDIzMzQ4MX0.Q-Jyw6EPsrKkFpepFaUI8Czt3DP_kbrVwSVLxRSld5U',
  }
});