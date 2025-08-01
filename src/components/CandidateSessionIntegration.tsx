'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Activity, Phone, Users } from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';

interface CandidateSessionIntegrationProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  roleType: string;
}

export default function CandidateSessionIntegration({
  candidateId,
  candidateName, 
  candidateEmail,
  roleType
}: CandidateSessionIntegrationProps) {
  const { 
    getSessionByCandidate, 
    createSession, 
    enableCulturalAnalysis, 
  } = useSessionStore();

  const candidateSession = getSessionByCandidate(candidateId);

  const handleStartSession = () => {
    const sessionId = createSession({
      candidateId,
      candidateName,
      candidateEmail,
      roleType
    });
    
    // Auto-enable cultural analysis
    setTimeout(() => {
      enableCulturalAnalysis(sessionId);
    }, 1000);
  };

  // Auto-detect if candidate should have a session
  useEffect(() => {
    // In a real app, this would listen for VAPI call events
    // For demo, we'll show how it would work
  }, [candidateId]);

  return (
    <div className="space-y-4">
      {/* Current Session Status */}
      {candidateSession ? (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Activity className="h-5 w-5" />
              Live Cultural Analysis Session
            </CardTitle>
            <CardDescription className="text-green-700">
              Real-time cultural intelligence is active for this candidate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-green-800">Session Status</p>
                <div className="flex items-center gap-2">
                  {candidateSession.culturalAnalysisEnabled ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Brain className="h-3 w-3 mr-1" />
                      Analysis Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Analysis Paused</Badge>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-green-800">Cultural Fit Score</p>
                <div className="text-2xl font-bold text-green-600">
                  {candidateSession.lastAnalysis?.score || '--'}%
                </div>
              </div>
            </div>

            {candidateSession.extractedData && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm font-medium text-green-800 mb-2">Live Cultural Insights</p>
                <div className="flex flex-wrap gap-2">
                  {candidateSession.extractedData.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* No Active Session */
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              Cultural Intelligence Ready
            </CardTitle>
            <CardDescription className="text-purple-700">
              Start a session to enable real-time cultural analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-2">
                  Ready to analyze cultural preferences from live conversations
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <Users className="h-4 w-4" />
                  <span>Cultural fit analysis • Real-time insights • Audience matching</span>
                </div>
              </div>
              
              <Button 
                onClick={handleStartSession}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Auto-Integration:</strong> In production, cultural analysis sessions automatically start 
          when candidates join VAPI calls. Session data syncs with their profile in real-time.
        </AlertDescription>
      </Alert>
    </div>
  );
}
