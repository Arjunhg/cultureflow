'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/useSessionStore';

// Type definition for VAPI session data
interface VapiSession {
  sessionId: string;
  vapiCallId: string;
  isActive: boolean;
  candidateInfo: {
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    roleType: string;
  };
  startTime: string;
  endTime?: string;
}

export function useVapiSessionDetection() {
  const { activeSessions, createSession, endSession } = useSessionStore();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownSessionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pollVapiSessions = async () => {
      try {
        console.log('🔍 [VAPI Detection] Polling VAPI sessions...');
        const response = await fetch('/api/vapi-sessions');
        
        if (!response.ok) {
          console.error('❌ [VAPI Detection] Failed to fetch VAPI sessions:', response.status, response.statusText);
          return;
        }

        const responseData = await response.json();
        console.log('📡 [VAPI Detection] Raw API response:', responseData);
        
        const { activeSessions: vapiSessions } = responseData;
        console.log('📋 [VAPI Detection] VAPI sessions found:', vapiSessions?.length || 0, vapiSessions);
        
        if (!vapiSessions || vapiSessions.length === 0) {
          console.log('⚠️ [VAPI Detection] No VAPI sessions found. This could mean:');
          console.log('   1. No active VAPI calls');
          console.log('   2. VAPI assistants not configured with webhook URL');
          console.log('   3. Webhook not receiving events from VAPI');
          console.log('   💡 Try clicking "Configure VAPI Webhooks" if you have active calls that aren\'t showing');
          return;
        }
        
        // Track current VAPI session IDs with proper typing
        const currentVapiSessionIds = new Set<string>(
          (vapiSessions as VapiSession[]).map(s => s.sessionId)
        );
        
        console.log('🏷️ [VAPI Detection] Current session IDs:', Array.from(currentVapiSessionIds));
        console.log('🏷️ [VAPI Detection] Previously known IDs:', Array.from(lastKnownSessionsRef.current));
        
        // Create new sessions that don't exist in our store
        (vapiSessions as VapiSession[]).forEach((vapiSession) => {
          if (!lastKnownSessionsRef.current.has(vapiSession.sessionId)) {
            // Check if we already have this session in our store
            const existingSession = activeSessions.find(
              session => session.vapiCallId === vapiSession.vapiCallId
            );
            
            if (!existingSession && vapiSession.isActive) {
              console.log('🚀 Detected new VAPI call, creating cultural analysis session:', vapiSession);
              
              // Create a new session in our store
              const sessionId = createSession({
                candidateId: vapiSession.candidateInfo.candidateId,
                candidateName: vapiSession.candidateInfo.candidateName,
                candidateEmail: vapiSession.candidateInfo.candidateEmail,
                roleType: vapiSession.candidateInfo.roleType
              });
              
              // Update the session with VAPI-specific data
              const sessionStore = useSessionStore.getState();
              sessionStore.updateSession(sessionId, {
                vapiCallId: vapiSession.vapiCallId,
                culturalAnalysisEnabled: true // Auto-enable for VAPI calls
              });
              
              console.log('✅ Created cultural analysis session for VAPI call:', sessionId);
            }
          }
        });
        
        // End sessions that are no longer active in VAPI
        lastKnownSessionsRef.current.forEach(vapiSessionId => {
          if (!currentVapiSessionIds.has(vapiSessionId)) {
            // Find the session in our store that corresponds to this VAPI session
            const session = activeSessions.find(s => {
              // Match by vapiCallId which should correspond to the VAPI session
              return s.vapiCallId === vapiSessionId || s.sessionId.includes(vapiSessionId);
            });
            if (session && session.isActive) {
              console.log('📞 VAPI call ended, ending cultural analysis session:', session.sessionId);
              endSession(session.sessionId);
            }
          }
        });
        
        // Update our tracking
        lastKnownSessionsRef.current = currentVapiSessionIds;
        
      } catch (error) {
        console.error('Error polling VAPI sessions:', error);
      }
    };

    // Start polling every 3 seconds
    const startPolling = () => {
      pollVapiSessions(); // Initial poll
      pollingIntervalRef.current = setInterval(pollVapiSessions, 3000);
    };

    // Stop polling
    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    startPolling();
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [activeSessions, createSession, endSession]);

  return null; // This hook doesn't render anything
}
