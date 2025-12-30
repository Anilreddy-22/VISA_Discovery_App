/**
 * Workshop Context - Simplified version that integrates with existing Home.tsx
 * Handles session management and data persistence without breaking existing UI
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sessionsAPI, useCasesAPI, painPointsAPI, Session } from '../lib/api';
import { useAuth } from './AuthContext';
import { UIPainPoint, UIUseCase, apiToUIPainPoint, uiToAPIPainPoint, uiToAPIUseCase } from '../lib/dataAdapter';

interface WorkshopContextType {
  session: Session | null;
  sessionId: number | null;
  customPainPoints: UIPainPoint[];
  savedUseCases: UIUseCase[];
  savedUseCaseStates: Map<string, any>; // Map of useCaseId to saved state
  isReady: boolean;
  saveCustomPainPoint: (painPoint: UIPainPoint) => Promise<void>;
  updateCustomPainPoint: (painPoint: UIPainPoint) => Promise<void>;
  deleteCustomPainPoint: (id: string) => Promise<void>;
  saveUseCaseState: (useCase: UIUseCase) => Promise<void>;
  batchSaveUseCases: (useCases: UIUseCase[]) => Promise<void>;
  canEdit: (createdBy?: number) => boolean;

  //anil
  // 🆕 NEW: Add these three lines
  recentSessions: Session[];
  loadRecentSessions: () => Promise<void>;
  loadSession: (sessionId: number) => Promise<void>;
  createNewSession: () => Promise<Session>;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [customPainPoints, setCustomPainPoints] = useState<UIPainPoint[]>([]);
  const [savedUseCases, setSavedUseCases] = useState<UIUseCase[]>([]);
  const [savedUseCaseStates, setSavedUseCaseStates] = useState<Map<string, any>>(new Map());
  const [isReady, setIsReady] = useState(false);

  //added by anil-NEW: Store list of all recent sessions for the user
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  //added by anil
  // 🆕 NEW: Function to load all recent sessions from database
  const loadRecentSessions = useCallback(async () => {
    try {
      console.log('📋 Loading recent sessions...');

      // Call the API to get all sessions (already sorted by most recent)
      const sessions = await sessionsAPI.getAll();

      console.log('✅ Loaded', sessions.length, 'recent sessions');

      // Store them in state
      setRecentSessions(sessions);

    } catch (error) {
      console.error('❌ Failed to load recent sessions:', error);
      // Don't throw - just log the error so app continues working
    }
  }, []);


  //anil
  // 🆕 NEW: Function to load a specific existing session
  const loadSession = useCallback(async (sessionId: number) => {
    try {
      console.log('🔄 Switching to session:', sessionId);

      // Load the session data
      const sessionData = await sessionsAPI.getOne(sessionId);
      setSession(sessionData);
      setSessionId(sessionData.id);

      // Save to localStorage so it persists
      localStorage.setItem('workshop_session_id', sessionData.id.toString());
      console.log('✅ Saved session ID to localStorage:', sessionData.id);

      // Load pain points for this session
      const painPoints = await painPointsAPI.getBySession(sessionData.id);
      setCustomPainPoints(painPoints.map(apiToUIPainPoint));
      console.log('✅ Loaded', painPoints.length, 'pain points');

      // Load use cases for this session
      try {
        const useCases = await useCasesAPI.getBySession(sessionData.id);
        console.log('✅ Loaded use case states:', useCases.length, 'items');

        // Create a map of useCaseId to saved state
        const stateMap = new Map();
        useCases.forEach((uc: any) => {
          stateMap.set(uc.useCaseId, {
            priority: uc.priority,
            quadrant: uc.quadrant,
            revenue: uc.revenue,
            savings: uc.savings,
            timeline: uc.timeline,


            //anil ADD THESE 6 FIELDS:
            name: uc.name,
            category: uc.category,
            problem: uc.problem,
            agentRole: uc.agentRole,
            dataRequired: uc.dataRequired,
            integration: uc.integration,
          });
        });
        setSavedUseCaseStates(stateMap);
        console.log('✅ Created state map with', stateMap.size, 'entries');
      } catch (error) {
        console.error('Failed to load use cases:', error);
      }

      console.log('✅ Successfully switched to session:', sessionId);

    } catch (error) {
      console.error('❌ Failed to load session:', error);
      throw error; // Re-throw so UI can show error
    }
  }, []);

  //anil
  // 🆕 NEW: Function to create a brand new session (fresh start)
  const createNewSession = useCallback(async () => {
    try {
      console.log('🆕 Creating brand new session...');

      // Create new session in database with timestamp in name
      const newSession = await sessionsAPI.create(
        `Visa Workshop - ${new Date().toLocaleDateString()}`,
        'Collaborative discovery session'
      );

      console.log('✅ New session created:', newSession.id);

      // Update current session state
      setSession(newSession);
      setSessionId(newSession.id);

      // Save to localStorage
      localStorage.setItem('workshop_session_id', newSession.id.toString());
      console.log('✅ Saved new session ID to localStorage:', newSession.id);

      // Clear all data for fresh start
      setCustomPainPoints([]);
      setSavedUseCases([]);
      setSavedUseCaseStates(new Map());
      console.log('✅ Cleared all pain points and use cases for fresh start');

      // Refresh the recent sessions list to include this new session
      await loadRecentSessions();
      console.log('✅ Refreshed recent sessions list');

      return newSession;

    } catch (error) {
      console.error('❌ Failed to create new session:', error);
      throw error; // Re-throw so UI can show error
    }
  }, [loadRecentSessions]);


  // Initialize or load session
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if there's a session in localStorage
        const savedSessionId = localStorage.getItem('workshop_session_id');
        const parsedSessionId = savedSessionId ? parseInt(savedSessionId, 10) : null;

        console.log('🔍 Checking saved session:', { savedSessionId, parsedSessionId, isValid: parsedSessionId && !isNaN(parsedSessionId) });

        if (parsedSessionId && !isNaN(parsedSessionId)) {
          // Load existing session
          console.log('📂 Loading existing session:', parsedSessionId);
          const sessionData = await sessionsAPI.getOne(parsedSessionId);
          setSession(sessionData);
          setSessionId(sessionData.id);

          // Load custom pain points
          const painPoints = await painPointsAPI.getBySession(sessionData.id);
          setCustomPainPoints(painPoints.map(apiToUIPainPoint));

          // Load saved use cases
          try {
            const useCases = await useCasesAPI.getBySession(sessionData.id);
            console.log('✅ Loaded use case states from database:', useCases.length, 'items');

            // Create a map of useCaseId to saved state
            const stateMap = new Map();
            useCases.forEach((uc: any) => {
              stateMap.set(uc.useCaseId, {
                priority: uc.priority,
                quadrant: uc.quadrant,
                revenue: uc.revenue,
                savings: uc.savings,
                timeline: uc.timeline,

                // anil ADD THESE 6 FIELDS:
                name: uc.name,
                category: uc.category,
                problem: uc.problem,
                agentRole: uc.agentRole,
                dataRequired: uc.dataRequired,
                integration: uc.integration,
              });
            });
            setSavedUseCaseStates(stateMap);
            console.log('✅ Created state map with', stateMap.size, 'entries');
          } catch (error) {
            console.error('Failed to load use cases:', error);
          }
        } else {
          // Clear invalid session ID from localStorage
          if (savedSessionId) {
            console.warn('⚠️ Invalid session ID in localStorage, clearing:', savedSessionId);
            localStorage.removeItem('workshop_session_id');
          }

          // Create new session
          console.log('🆕 Creating new session');
          const newSession = await sessionsAPI.create(
            `Visa Workshop - ${new Date().toLocaleDateString()}`,
            'Collaborative discovery session'
          );
          setSession(newSession);
          setSessionId(newSession.id);
          localStorage.setItem('workshop_session_id', newSession.id.toString());
          console.log('✅ New session created:', newSession.id);
        }

        // anil--🆕 NEW: Load all recent sessions for display in UI
        await loadRecentSessions();

        setIsReady(true);
      } catch (error) {
        console.error('❌ Failed to initialize session:', error);
        // Clear potentially corrupted session data
        localStorage.removeItem('workshop_session_id');
        setIsReady(true); // Still mark as ready to avoid blocking UI
      }
    };

    if (user) {
      initSession();
    }
  }, [user, loadRecentSessions]);




  const saveCustomPainPoint = useCallback(async (painPoint: UIPainPoint) => {
    console.log('\n🔵 saveCustomPainPoint called');
    console.log('Pain point to save:', painPoint);
    console.log('Current sessionId:', sessionId);

    if (!sessionId) {
      console.error('❌ No sessionId available!');
      return;
    }

    try {
      const apiData = uiToAPIPainPoint(painPoint);
      console.log('Converted to API format:', apiData);

      console.log('Calling painPointsAPI.create with:', {
        sessionId,
        category: apiData.category,
        title: apiData.title,
        description: apiData.description
      });

      const saved = await painPointsAPI.create(
        sessionId,
        apiData.category,
        apiData.title,
        apiData.description,
        apiData.theme,
        apiData.priority,
        apiData.quadrant
      );

      console.log('✅ Pain point saved to backend:', saved);

      const uiPainPoint = apiToUIPainPoint(saved);
      console.log('Converted back to UI format:', uiPainPoint);

      setCustomPainPoints(prev => {
        const updated = [...prev, uiPainPoint];
        console.log('Updated customPainPoints:', updated.length);
        return updated;
      });

      console.log('✅ saveCustomPainPoint completed successfully');
    } catch (error) {
      console.error('❌ Failed to save pain point:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [sessionId]);

  const updateCustomPainPoint = useCallback(async (painPoint: UIPainPoint) => {
    console.log('\n🔵 updateCustomPainPoint called');
    console.log('Pain point to update:', painPoint);

    if (!sessionId) {
      console.error('❌ No sessionId available!');
      return;
    }

    try {
      let numericId: number;

      // If it has 'custom-' prefix, extract the ID from it
      if (painPoint.id.startsWith('custom-')) {
        numericId = parseInt(painPoint.id.replace('custom-', ''), 10);

        if (isNaN(numericId)) {
          console.error('❌ Invalid pain point ID format:', painPoint.id);
          return;
        }
      } else {
        // For initial pain points (pp5, time-1, etc.), find the matching database record by question
        const dbPainPoint = customPainPoints.find(cp => cp.question === painPoint.question);

        if (!dbPainPoint) {
          console.warn('⚠️ Pain point not found in database, cannot update:', painPoint.question);
          return;
        }

        // Extract numeric ID from the database pain point
        numericId = parseInt(dbPainPoint.id.replace('custom-', ''), 10);

        if (isNaN(numericId)) {
          console.error('❌ Invalid database pain point ID:', dbPainPoint.id);
          return;
        }

        console.log(`Found database ID ${numericId} for pain point: ${painPoint.question}`);
      }

      const apiData = uiToAPIPainPoint(painPoint);

      console.log('Calling painPointsAPI.update with ID:', numericId);
      const updated = await painPointsAPI.update(
        numericId,
        apiData.category,
        apiData.title,
        apiData.description,
        apiData.theme,
        apiData.priority,
        apiData.quadrant
      );

      console.log('✅ Pain point updated in backend:', updated);

      const uiPainPoint = apiToUIPainPoint(updated);
      setCustomPainPoints(prev => prev.map(pp => pp.id === painPoint.id ? uiPainPoint : pp));

      console.log('✅ updateCustomPainPoint completed successfully');
    } catch (error) {
      console.error('❌ Failed to update pain point:', error);
      throw error;
    }
  }, [sessionId, customPainPoints]);

  const deleteCustomPainPoint = useCallback(async (id: string) => {
    if (!sessionId) return;

    try {
      // Extract numeric ID from custom-{id} format
      const numericId = parseInt(id.replace('custom-', ''));
      await painPointsAPI.delete(numericId);
      setCustomPainPoints(prev => prev.filter(pp => pp.id !== id));
    } catch (error) {
      console.error('Failed to delete pain point:', error);
      throw error;
    }
  }, [sessionId]);

  const saveUseCaseState = useCallback(async (useCase: UIUseCase) => {
    if (!sessionId) return;

    try {
      const apiData = uiToAPIUseCase(useCase);
      await useCasesAPI.update(sessionId, apiData.useCaseId, apiData);
    } catch (error) {
      console.error('Failed to save use case:', error);
      // Don't throw - we don't want to break the UI flow
    }
  }, [sessionId]);

  const batchSaveUseCases = useCallback(async (useCases: UIUseCase[]) => {
    console.log('🔵 batchSaveUseCases called with:', useCases.length, 'use cases');
    console.log('🔵 sessionId:', sessionId);
    console.log('🔵 First use case sample:', useCases[0]);

    if (!sessionId) {
      console.warn('⚠️ No sessionId available, skipping save');
      return;
    }

    try {
      const updates = useCases.map(uiToAPIUseCase);
      console.log('🔵 Mapped updates (first 3):', updates.slice(0, 3));
      console.log('🔵 Calling API with sessionId:', sessionId);
      const result = await useCasesAPI.batchUpdate(sessionId, updates);
      console.log('✅ Save successful! Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to batch save use cases:', error);
      if (error.response) {
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response status:', error.response.status);
      }
      throw error; // Re-throw so the UI can show error
    }
  }, [sessionId]);

  const canEdit = useCallback((createdBy?: number) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (!createdBy) return true; // Allow editing if no creator specified
    return user.id === createdBy;
  }, [user, isAdmin]);

  return (
    <WorkshopContext.Provider value={{
      session,
      sessionId,
      customPainPoints,
      savedUseCases,
      savedUseCaseStates,
      isReady,
      saveCustomPainPoint,
      updateCustomPainPoint,
      deleteCustomPainPoint,
      saveUseCaseState,
      batchSaveUseCases,
      canEdit,
      //anil
      // 🆕 NEW: Add these four lines
      recentSessions,
      loadRecentSessions,
      loadSession,
      createNewSession,
    }}>
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
