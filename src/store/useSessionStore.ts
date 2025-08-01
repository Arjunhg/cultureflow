/* eslint-disable  @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface CulturalSession {
  sessionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  roleType: string;
  vapiCallId?: string;
  streamChannelId?: string;
  isActive: boolean;
  culturalAnalysisEnabled: boolean;
  startTime: Date;
  transcript: string;
  lastAnalysis?: any;
  extractedData?: {
    entities: string[];
    keywords: string[];
    categories: string[];
    confidence: number;
  };
}

interface SessionState {
  activeSessions: CulturalSession[];
  currentSessionId: string | null;
  
  // Session management
  createSession: (candidate: {
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    roleType: string;
  }) => string;
  
  updateSession: (sessionId: string, updates: Partial<CulturalSession>) => void;
  endSession: (sessionId: string) => void;
  getSession: (sessionId: string) => CulturalSession | undefined;
  getSessionByCandidate: (candidateId: string) => CulturalSession | undefined;
  setCurrentSession: (sessionId: string | null) => void;
  
  // Cultural analysis management
  enableCulturalAnalysis: (sessionId: string) => void;
  disableCulturalAnalysis: (sessionId: string) => void;
  updateTranscript: (sessionId: string, transcript: string) => void;
  updateCulturalAnalysis: (sessionId: string, analysis: any, extractedData: any) => void;
  
  // Cleanup
  clearInactiveSessions: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSessions: [],
  currentSessionId: null,

  createSession: (candidate) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession: CulturalSession = {
      sessionId,
      candidateId: candidate.candidateId,
      candidateName: candidate.candidateName,
      candidateEmail: candidate.candidateEmail,
      roleType: candidate.roleType,
      isActive: true,
      culturalAnalysisEnabled: false,
      startTime: new Date(),
      transcript: '',
    };

    set((state) => ({
      activeSessions: [...state.activeSessions, newSession],
      currentSessionId: sessionId
    }));

    console.log(`Created cultural analysis session for ${candidate.candidateName}:`, sessionId);
    return sessionId;
  },

  updateSession: (sessionId, updates) => {
    set((state) => ({
      activeSessions: state.activeSessions.map(session =>
        session.sessionId === sessionId
          ? { ...session, ...updates }
          : session
      )
    }));
  },

  endSession: (sessionId) => {
    set((state) => ({
      activeSessions: state.activeSessions.map(session =>
        session.sessionId === sessionId
          ? { ...session, isActive: false }
          : session
      ),
      currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
    }));
    
    console.log(`Ended cultural analysis session:`, sessionId);
  },

  getSession: (sessionId) => {
    return get().activeSessions.find(session => session.sessionId === sessionId);
  },

  getSessionByCandidate: (candidateId) => {
    return get().activeSessions.find(session => 
      session.candidateId === candidateId && session.isActive
    );
  },

  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  enableCulturalAnalysis: (sessionId) => {
    get().updateSession(sessionId, { culturalAnalysisEnabled: true });
    console.log(`Enabled cultural analysis for session:`, sessionId);
  },

  disableCulturalAnalysis: (sessionId) => {
    get().updateSession(sessionId, { culturalAnalysisEnabled: false });
    console.log(`Disabled cultural analysis for session:`, sessionId);
  },

  updateTranscript: (sessionId, transcript) => {
    get().updateSession(sessionId, { transcript });
  },

  updateCulturalAnalysis: (sessionId, analysis, extractedData) => {
    get().updateSession(sessionId, { 
      lastAnalysis: analysis,
      extractedData 
    });
  },

  clearInactiveSessions: () => {
    set((state) => ({
      activeSessions: state.activeSessions.filter(session => 
        session.isActive || 
        (Date.now() - session.startTime.getTime()) < 24 * 60 * 60 * 1000 // Keep for 24 hours
      )
    }));
  }
}));
