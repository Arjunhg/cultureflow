'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Phone, 
  PhoneOff, 
  Brain, 
  Activity, 
  Clock,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { useVapiSessionDetection } from '@/hooks/useVapiSessionDetection';
import RealTimeCallAnalysis from './RealTimeCallAnalysis';

export default function ActiveSessionsManager() {
  const { 
    activeSessions,
    enableCulturalAnalysis, 
    disableCulturalAnalysis,
    endSession,
    createSession
  } = useSessionStore();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

  // Auto-detect VAPI sessions and create cultural analysis sessions
  useVapiSessionDetection();

  const activeCallSessions = activeSessions.filter(session => session.isActive);

  const handleToggleCulturalAnalysis = (sessionId: string, enabled: boolean) => {
    if (enabled) {
      enableCulturalAnalysis(sessionId);
    } else {
      disableCulturalAnalysis(sessionId);
    }
  };

  const handleCreateDemoSession = () => {
    const demoCandidate = {
      candidateId: `demo-${Date.now()}`,
      candidateName: `Demo Candidate ${activeCallSessions.length + 1}`,
      candidateEmail: `demo${activeCallSessions.length + 1}@example.com`,
      roleType: 'Software Developer'
    };

    const sessionId = createSession(demoCandidate);
    setSelectedSessionId(sessionId);
  };

  const handleSimulateVapiCall = async () => {
    try {
      const response = await fetch('/api/test-vapi-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start_call' })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Simulated VAPI call:', result);
        // The session should appear automatically via polling
      } else {
        console.error('Failed to simulate VAPI call');
      }
    } catch (error) {
      console.error('Error simulating VAPI call:', error);
    }
  };

  const handleCreateManualVapiSession = async () => {
    try {
      console.log('🔧 Creating manual VAPI session for active call...');
      
      const response = await fetch('/api/create-manual-vapi-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: 'Live VAPI Candidate',
          candidateEmail: 'candidate@live-call.com',
          roleType: 'Live Interview',
          callId: `live-call-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Manual VAPI session created:', result);
    } catch (error) {
      console.error('❌ Failed to create manual VAPI session:', error);
    }
  };

  const handleUpdateAssistantWebhooks = async () => {
    try {
      console.log('🔄 Updating all VAPI assistants with webhook URLs...');
      
      const response = await fetch('/api/update-assistant-webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Assistants updated with webhooks:', result);
      
      if (result.success) {
        alert(`Successfully updated ${result.successCount} assistants with webhook URLs! Now VAPI calls should automatically appear here.`);
      } else {
        alert(`Failed to update assistants: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to update assistant webhooks:', error);
      alert('Failed to update assistant webhooks. Check console for details.');
    }
  };

  const handleMonitorVapiCall = async () => {
    try {
      console.log('👁️ Creating monitor session for active VAPI call...');
      
      const response = await fetch('/api/vapi-monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ VAPI monitor session created:', result);
    } catch (error) {
      console.error('❌ Failed to create monitor session:', error);
    }
  };

  const formatDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Active Interview Sessions
          </CardTitle>
          <CardDescription>
            Manage cultural intelligence analysis for live VAPI calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-purple-600">
                {activeCallSessions.length}
              </div>
              <span className="text-sm text-gray-600">Active Sessions</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateDemoSession}
                variant="outline"
              >
                <Phone className="h-4 w-4 mr-2" />
                Manual Demo
              </Button>
              
              <Button 
                onClick={handleSimulateVapiCall}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Simulate VAPI Call
              </Button>
              
              <Button 
                onClick={handleCreateManualVapiSession}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Connect Live VAPI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VAPI Setup for Local Development */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Brain className="h-5 w-5" />
            VAPI Local Development Setup
          </CardTitle>
          <CardDescription className="text-orange-600">
            For local development (localhost), VAPI webhooks require HTTPS. Use the monitor button below to manually create sessions for active calls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-orange-700 space-y-2">
              <p><strong>Issue:</strong> VAPI webhooks require HTTPS URLs, but localhost uses HTTP.</p>
              <p><strong>Solution:</strong> Click &quot;Monitor VAPI Call&quot; when you have an active call to create a session manually.</p>
              <p><strong>For Production:</strong> Deploy to get HTTPS URL, then configure webhooks.</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleMonitorVapiCall}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Monitor VAPI Call
              </Button>
              
              <Button 
                onClick={handleUpdateAssistantWebhooks}
                variant="outline"
                className="text-orange-700 border-orange-300"
              >
                <Brain className="h-4 w-4 mr-2" />
                Try Configure Webhooks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Active Sessions */}
      {activeCallSessions.length === 0 && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            No active interview sessions. When candidates join VAPI calls, they&apos;ll appear here for cultural analysis.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Sessions List */}
      {activeCallSessions.length > 0 && (
        <div className="grid gap-4">
          {activeCallSessions.map((session) => (
            <Card key={session.sessionId} className="border-2 hover:border-purple-300 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{session.candidateName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {session.candidateEmail} • {session.roleType}
                        <Badge variant="outline" className="ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(session.startTime)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.culturalAnalysisEnabled ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Brain className="h-3 w-3 mr-1" />
                        Analysis Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300">
                        Analysis Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Session Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Session: {session.sessionId.split('-')[1]}
                    </span>
                    {session.lastAnalysis && (
                      <span className="text-purple-600 font-medium">
                        Cultural Fit: {session.lastAnalysis.score}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={session.culturalAnalysisEnabled ? "destructive" : "default"}
                      onClick={() => handleToggleCulturalAnalysis(
                        session.sessionId, 
                        !session.culturalAnalysisEnabled
                      )}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {session.culturalAnalysisEnabled ? 'Disable' : 'Enable'} Analysis
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAnalysis(
                        showAnalysis === session.sessionId ? null : session.sessionId
                      )}
                    >
                      {showAnalysis === session.sessionId ? (
                        <><EyeOff className="h-4 w-4 mr-2" />Hide Details</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" />View Details</>
                      )}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => endSession(session.sessionId)}
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </div>

                {/* Expanded Analysis View */}
                {showAnalysis === session.sessionId && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border">
                    <RealTimeCallAnalysis
                      candidateName={session.candidateName}
                      roleType={session.roleType}
                      sessionId={session.sessionId}
                      autoStart={session.culturalAnalysisEnabled}
                      onAnalysisUpdate={(analysis) => {
                        // This will be handled by the session store
                        console.log('Analysis update for session:', session.sessionId, analysis);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current Analysis Display */}
      {selectedSessionId && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-purple-800">
              Cultural Analysis Dashboard
            </CardTitle>
            <CardDescription>
              Real-time cultural intelligence for selected session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* This will show the detailed analysis for the selected session */}
            <div className="text-center text-purple-600">
              Session {selectedSessionId.split('-')[1]} - Cultural analysis ready
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
