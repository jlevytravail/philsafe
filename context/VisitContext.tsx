import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Visit, Event, Notification } from '@/types';
import { getInitialVisits, caregivers, events as initialEvents, notifications as initialNotifications } from '@/data/mockData';
import NotificationService from '@/utils/notifications';

interface VisitContextType {
  visits: Visit[];
  events: Event[];
  notifications: Notification[];
  updateVisitStatus: (visitId: string, status: Visit['status']) => void;
  resetVisits: () => void;
  addEvent: (event: Event) => void;
  addNotification: (notification: Notification) => void;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visits, setVisits] = useState<Visit[]>(getInitialVisits());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const updateVisitStatus = (visitId: string, status: Visit['status']) => {
    setVisits(prev => prev.map(visit => {
      if (visit.id === visitId) {
        const updatedVisit = { ...visit, status };
        
        // Si la visite est marquée comme terminée, mettre à jour l'heure de fin
        if (status === 'completed') {
          const now = new Date();
          updatedVisit.endTime = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
        
        // Créer un événement pour ce changement de statut
        const caregiver = caregivers.find(c => c.id === visit.caregiverId);
        let eventMessage = '';
        let eventType: Event['type'] = 'care-completed';
        
        if (status === 'completed') {
          eventMessage = `${caregiver?.name} a terminé les soins chez ${visit.patientName}`;
          eventType = 'check-out';
        } else if (status === 'in-progress') {
          eventMessage = `${caregiver?.name} a commencé les soins chez ${visit.patientName}`;
          eventType = 'check-in';
        }
        
        if (eventMessage) {
          const newEvent: Event = {
            id: Date.now().toString(),
            visitId: visitId,
            type: eventType,
            message: eventMessage,
            timestamp: new Date().toISOString()
          };
          
          setEvents(prev => [newEvent, ...prev]);
          
          // Créer une notification correspondante
          const newNotification: Notification = {
            id: Date.now().toString(),
            title: status === 'completed' ? 'Visite terminée' : 'Visite commencée',
            message: eventMessage,
            timestamp: new Date().toISOString(),
            type: status === 'completed' ? 'success' : 'info',
            read: false
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Déclencher la notification via le service
          NotificationService.getInstance().simulateNotification(newNotification);
        }
        
        return updatedVisit;
      }
      return visit;
    }));
  };

  const resetVisits = () => {
    setVisits(getInitialVisits());
    setEvents(initialEvents);
    setNotifications(initialNotifications);
  };

  const addEvent = (event: Event) => {
    setEvents(prev => [event, ...prev]);
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const addFamilyVisit = (familyVisit: FamilyVisit) => {
    setFamilyVisits(prev => [...prev, familyVisit]);
  };

  return (
    <VisitContext.Provider value={{
      visits,
      events,
      notifications,
      familyVisits,
      updateVisitStatus,
      resetVisits,
      addEvent,
      addNotification,
      addFamilyVisit
    }}>
      {children}
    </VisitContext.Provider>
  );
}

export function useVisits() {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error('useVisits must be used within a VisitProvider');
  }
  return context;
}