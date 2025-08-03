import { Caregiver, Visit, Event, Notification, FamilyVisit } from '@/types';

// Fonction utilitaire pour formater les dates
export const formatDate = (date: Date) => date.toISOString().split('T')[0];

// Variables de date utilisées dans toute l'application
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);

// Fonction pour générer des données de visite dynamiques
export function getInitialVisits(): Visit[] {
  return [
    // Visites d'hier (terminées)
    {
      id: '1',
      caregiverId: '1',
      date: formatDate(yesterday),
      startTime: '08:30',
      endTime: '09:25',
      status: 'completed',
      careType: ['Toilette', 'Prise de médicaments'],
      notes: 'Toilette réalisée sans difficulté. Médicaments pris correctement. Mme Dupont en forme.',
      patientName: 'Mme Dupont'
    },
    {
      id: '2',
      caregiverId: '2',
      date: formatDate(yesterday),
      startTime: '14:00',
      endTime: '14:45',
      status: 'completed',
      careType: ['Soins infirmiers', 'Pansement'],
      notes: 'Pansement changé. Cicatrisation en bonne voie.',
      patientName: 'Mme Dupont'
    },
    
    // Visites d'aujourd'hui
    {
      id: '3',
      caregiverId: '1',
      date: formatDate(today),
      startTime: '08:30',
      endTime: '09:30',
      status: 'completed',
      careType: ['Toilette', 'Prise de médicaments'],
      notes: 'Toilette réalisée. Médicaments administrés selon prescription.',
      patientName: 'Mme Dupont'
    },
    {
      id: '4',
      caregiverId: '2',
      date: formatDate(today),
      startTime: '10:00',
      endTime: '11:00',
      status: 'scheduled', // En retard si l'heure actuelle > 10:00
      careType: ['Soins infirmiers', 'Contrôle tension'],
      patientName: 'Mme Dupont'
    },
    {
      id: '5',
      caregiverId: '3',
      date: formatDate(today),
      startTime: '18:00',
      endTime: '19:00',
      status: 'scheduled',
      careType: ['Aide aux repas', 'Compagnie'],
      patientName: 'Mme Dupont'
    },
    
    // Visites de demain
    {
      id: '6',
      caregiverId: '1',
      date: formatDate(tomorrow),
      startTime: '08:30',
      endTime: '09:30',
      status: 'scheduled',
      careType: ['Toilette', 'Prise de médicaments'],
      patientName: 'Mme Dupont'
    },
    {
      id: '7',
      caregiverId: '2',
      date: formatDate(tomorrow),
      startTime: '14:00',
      endTime: '15:00',
      status: 'scheduled',
      careType: ['Soins infirmiers', 'Pansement'],
      patientName: 'Mme Dupont'
    },
    {
      id: '8',
      caregiverId: '3',
      date: formatDate(tomorrow),
      startTime: '18:00',
      endTime: '19:00',
      status: 'scheduled',
      careType: ['Aide aux repas', 'Compagnie'],
      patientName: 'Mme Dupont'
    },
    
    // Visites d'après-demain
    {
      id: '9',
      caregiverId: '1',
      date: formatDate(dayAfterTomorrow),
      startTime: '08:30',
      endTime: '09:30',
      status: 'scheduled',
      careType: ['Toilette', 'Prise de médicaments'],
      patientName: 'Mme Dupont'
    },
    {
      id: '10',
      caregiverId: '2',
      date: formatDate(dayAfterTomorrow),
      startTime: '14:00',
      endTime: '15:00',
      status: 'scheduled',
      careType: ['Soins infirmiers'],
      patientName: 'Mme Dupont'
    }
  ];
}

export const initialFamilyVisits: FamilyVisit[] = [
  {
    id: 'fv1',
    name: 'Claire',
    date: formatDate(yesterday),
    startTime: '12:00',
    endTime: '13:30',
    type: 'repas',
    notes: 'Déjeuner ensemble, maman en forme'
  },
  {
    id: 'fv2',
    name: 'Jean (fils)',
    date: formatDate(tomorrow),
    startTime: '16:00',
    endTime: '17:00',
    type: 'visite',
    notes: 'Visite de courtoisie'
  },
  {
    id: 'fv3',
    name: 'Claire',
    date: formatDate(dayAfterTomorrow),
    startTime: '19:00',
    type: 'appel',
    notes: 'Appel vidéo quotidien'
  }
];

export const caregivers: Caregiver[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    role: 'Aide-soignante',
    phone: '06 12 34 56 78',
    photo: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '2',
    name: 'Pierre Martin',
    role: 'Infirmier',
    phone: '06 98 76 54 32',
    photo: 'https://images.pexels.com/photos/6749773/pexels-photo-6749773.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '3',
    name: 'Sophie Leroy',
    role: 'Auxiliaire de vie',
    phone: '06 55 44 33 22',
    photo: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

// Garder une référence statique pour les visites initiales
export const visits = getInitialVisits();

export const events: Event[] = [
  {
    id: '1',
    visitId: '1',
    type: 'check-out',
    message: 'Soins terminés chez Mme Dupont à 09:20',
    timestamp: '2025-01-11T09:20:00Z'
  },
  {
    id: '2',
    visitId: '2',
    type: 'check-in',
    message: 'Pierre Martin est arrivé chez Mme Dupont',
    timestamp: '2025-01-11T14:05:00Z'
  },
  {
    id: '3',
    visitId: '1',
    type: 'care-completed',
    message: 'Toilette réalisée par Marie Dubois',
    timestamp: '2025-01-11T08:45:00Z'
  }
];

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'Visite terminée',
    message: 'Marie Dubois a terminé les soins chez Mme Dupont',
    timestamp: '2025-01-11T09:20:00Z',
    type: 'success',
    read: false
  },
  {
    id: '2',
    title: 'Visite en cours',
    message: 'Pierre Martin est arrivé pour les soins infirmiers',
    timestamp: '2025-01-11T14:05:00Z',
    type: 'info',
    read: false
  }
];