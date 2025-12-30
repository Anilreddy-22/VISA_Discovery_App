import React, { createContext, useContext, useState, useEffect } from 'react';
import { sessionsAPI, useCasesAPI, painPointsAPI, Session, UseCase, PainPoint } from '../lib/api';
import { useAuth } from './AuthContext';

interface SessionContextType {
  session: Session | null;
  useCases: UseCase[];
  customPainPoints: PainPoint[];
  loading: boolean;
  createSession: (name: string, description?: string) => Promise<void>;
  loadSession: (id: number) => Promise<void>;
  updateUseCase: (useCaseId: string, updates: Partial<UseCase>) => Promise<void>;
  batchUpdateUseCases: (updates: Array<{ useCaseId: string } & Partial<UseCase>>) => Promise<void>;
  addPainPoint: (category: string, title: string, description: string) => Promise<void>;
  deletePainPoint: (id: number) => Promise<void>;
  canEdit: (createdBy: number) => boolean;
  canDelete: (createdBy: number) => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [customPainPoints, setCustomPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const createSession = async (name: string, description?: string) => {
    setLoading(true);
    try {
      const newSession = await sessionsAPI.create(name, description);
      setSession(newSession);
      setUseCases([]);
      setCustomPainPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: number) => {
    setLoading(true);
    try {
      const [sessionData, useCasesData, painPointsData] = await Promise.all([
        sessionsAPI.getOne(id),
        useCasesAPI.getBySession(id),
        painPointsAPI.getBySession(id),
      ]);
      setSession(sessionData);
      setUseCases(useCasesData);
      setCustomPainPoints(painPointsData);
    } finally {
      setLoading(false);
    }
  };

  const updateUseCase = async (useCaseId: string, updates: Partial<UseCase>) => {
    if (!session) return;
    
    const updated = await useCasesAPI.update(session.id, useCaseId, updates);
    setUseCases(prev => {
      const existing = prev.find(uc => uc.useCaseId === useCaseId);
      if (existing) {
        return prev.map(uc => uc.useCaseId === useCaseId ? { ...uc, ...updated } : uc);
      } else {
        return [...prev, updated];
      }
    });
  };

  const batchUpdateUseCases = async (updates: Array<{ useCaseId: string } & Partial<UseCase>>) => {
    if (!session) return;
    
    const results = await useCasesAPI.batchUpdate(session.id, updates);
    setUseCases(prev => {
      const updatedMap = new Map(results.map(r => [r.useCaseId, r]));
      const merged = prev.map(uc => updatedMap.get(uc.useCaseId) || uc);
      
      // Add new ones
      results.forEach(r => {
        if (!prev.find(uc => uc.useCaseId === r.useCaseId)) {
          merged.push(r);
        }
      });
      
      return merged;
    });
  };

  const addPainPoint = async (category: string, title: string, description: string) => {
    if (!session) return;
    
    const newPainPoint = await painPointsAPI.create(session.id, category, title, description);
    setCustomPainPoints(prev => [...prev, newPainPoint]);
  };

  const deletePainPoint = async (id: number) => {
    await painPointsAPI.delete(id);
    setCustomPainPoints(prev => prev.filter(pp => pp.id !== id));
  };

  const canEdit = (createdBy: number) => {
    if (!user) return false;
    return isAdmin || user.id === createdBy;
  };

  const canDelete = (createdBy: number) => {
    if (!user) return false;
    return isAdmin || user.id === createdBy;
  };

  return (
    <SessionContext.Provider value={{
      session,
      useCases,
      customPainPoints,
      loading,
      createSession,
      loadSession,
      updateUseCase,
      batchUpdateUseCases,
      addPainPoint,
      deletePainPoint,
      canEdit,
      canDelete,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
