/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, PhoneOff, Mic, MicOff, Loader2, TrendingUp, Users, Brain, AlertCircle } from 'lucide-react';
import { culturalExtractor, type CulturalExtraction } from '@/lib/culturalExtractor';
import { useRealTimeTranscript } from '@/hooks/useRealTimeTranscript';
import { useSessionStore } from '@/store/useSessionStore';

interface RealTimeCallAnalysisProps {
  candidateName: string;
  roleType?: string;
  sessionId?: string;
  autoStart?: boolean;
  onAnalysisUpdate?: (analysis: any) => void;
}

interface CallState {
  isActive: boolean;
  isMuted: boolean;
  duration: number;
  transcript: string;
  culturalAnalysis: any;
  extractedData: CulturalExtraction;
  isAnalyzing: boolean;
}

export default function RealTimeCallAnalysis({ 
  candidateName, 
  roleType = 'Sales Role',
  sessionId,
  autoStart = false,
  onAnalysisUpdate 
}: RealTimeCallAnalysisProps) {
  const [callState, setCallState] = useState<CallState>({
    isActive: autoStart,
    isMuted: false,
    duration: 0,
    transcript: '',
    culturalAnalysis: null,
    extractedData: { entities: [], keywords: [], categories: [], confidence: 0 },
    isAnalyzing: false
  });

  const { updateTranscript, updateCulturalAnalysis } = useSessionStore();
  // const session = sessionId ? getSession(sessionId) : null;

  // Real-time transcript connection
  const {
    isConnected,
    isConnecting,
    error: transcriptError,
    connect: connectTranscript,
    disconnect: disconnectTranscript,
    simulateRealTimeTranscript
  } = useRealTimeTranscript({
    sessionId: sessionId || `call-${candidateName}`,
    enabled: callState.isActive,
    onTranscriptUpdate: async (fullTranscript, chunk) => {
      setCallState(prev => ({ ...prev, transcript: fullTranscript }));
      
      // Update session store if we have a session
      if (sessionId) {
        updateTranscript(sessionId, fullTranscript);
      }
      
      // Process the new chunk for cultural analysis
      if (chunk.length > 10) {
        debouncedAnalysis(fullTranscript, chunk);
      }
    },
    onError: (error) => {
      console.error('Transcript error:', error);
    }
  });

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isActive) {
      interval = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isActive]);

  // Monitor connection status and start demo if needed
  useEffect(() => {
    if (callState.isActive && transcriptError && !isConnected && !isConnecting) {
      // If we have an authorization error or other connection issues, start simulation
      if (transcriptError.includes('Not authorized') || transcriptError.includes('Authentication failed') || transcriptError.includes('Connection lost')) {
        const demoTimeout = setTimeout(() => {
          if (!isConnected && callState.transcript.length === 0) {
            console.log('Starting simulation due to connection issues:', transcriptError);
            simulateRealTimeTranscript(candidateName);
          }
        }, 1000); // Quick fallback for auth errors
        
        return () => clearTimeout(demoTimeout);
      }
    }
  }, [callState.isActive, transcriptError, isConnected, isConnecting, callState.transcript.length, candidateName, simulateRealTimeTranscript]);

  // Debounced analysis to prevent too frequent API calls
  const debouncedAnalysis = useCallback(
    debounce(async (transcript: string, chunk?: string) => {
      if (transcript.length < 50) return; // Wait for more content
      
      setCallState(prev => ({ ...prev, isAnalyzing: true }));
      
      try {
        // Use real-time processing if chunk provided, otherwise full analysis
        let analysis, extractedData;
        
        if (chunk) {
          const result = await culturalExtractor.processRealTimeTranscript(chunk, transcript, roleType);
          analysis = result.culturalAnalysis;
          extractedData = result.extractedData;
          
          // Only update if we have meaningful results
          if (!result.shouldUpdate) {
            setCallState(prev => ({ ...prev, isAnalyzing: false }));
            return;
          }
        } else {
          analysis = await culturalExtractor.analyzeCulturalFitFromConversation(transcript, roleType);
          extractedData = analysis.extractedData || { entities: [], keywords: [], categories: [], confidence: 0 };
        }
        
        if (analysis) {
          setCallState(prev => ({
            ...prev,
            culturalAnalysis: analysis,
            extractedData,
            isAnalyzing: false
          }));
          
          // Update session store if we have a session
          if (sessionId) {
            updateCulturalAnalysis(sessionId, analysis, extractedData);
          }
          
          onAnalysisUpdate?.(analysis);
        } else {
          setCallState(prev => ({ ...prev, isAnalyzing: false }));
        }
      } catch (error) {
        console.error('Real-time analysis error:', error);
        setCallState(prev => ({ ...prev, isAnalyzing: false }));
      }
    }, 3000),
    [roleType, onAnalysisUpdate]
  );

  const startCall = async () => {
    setCallState(prev => ({ 
      ...prev, 
      isActive: true, 
      duration: 0,
      transcript: '',
      culturalAnalysis: null,
      extractedData: { entities: [], keywords: [], categories: [], confidence: 0 }
    }));

    console.log('Starting cultural analysis for:', candidateName);
    
    try {
      // Await the connection promise from the hook
      const connected = await connectTranscript();
      
      if (connected) {
        console.log('Real-time connection established successfully.');
        // Connection successful - will wait for actual audio input
        // If no audio input comes in, user can manually start simulation or it will auto-fallback
        console.log('AssemblyAI is ready for audio input. Speak into your microphone or use simulation.');
      } else {
        console.log('Connection function returned false, starting simulation.');
        setTimeout(() => simulateRealTimeTranscript(candidateName), 1000);
      }
    } catch (error) {
      // If the promise from connectTranscript is rejected, it will be caught here
      console.error('Failed to connect to real-time transcript, starting simulation:', error);
      setTimeout(() => simulateRealTimeTranscript(candidateName), 1000);
    }
  };

  const endCall = () => {
    setCallState(prev => ({ 
      ...prev, 
      isActive: false, 
      isMuted: false 
    }));
    disconnectTranscript();
  };

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { culturalAnalysis, extractedData, isAnalyzing } = callState;

  return (
    <div className="space-y-6">
      {/* Call Controls */}
      <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Real-time Cultural Intelligence Call
          </CardTitle>
          <CardDescription>
            Analyzing conversation with {candidateName} for cultural fit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!callState.isActive ? (
                <Button 
                  onClick={startCall} 
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Start Cultural Analysis
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={endCall} 
                    variant="destructive"
                    size="lg"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Call
                  </Button>
                  <Button 
                    onClick={toggleMute} 
                    variant={callState.isMuted ? "destructive" : "secondary"}
                  >
                    {callState.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  {isConnected && !transcriptError && callState.transcript.length === 0 && (
                    <Button 
                      onClick={() => simulateRealTimeTranscript(candidateName)}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Start Demo
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {callState.isActive && (
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {formatDuration(callState.duration)}
                </Badge>
                {isConnected && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Live Transcript Active
                  </Badge>
                )}
                {isConnecting && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Connecting...
                  </Badge>
                )}
                {transcriptError && (transcriptError.includes('demo') || transcriptError.includes('Not authorized') || transcriptError.includes('simulation')) && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Demo Mode Active
                  </Badge>
                )}
                {transcriptError && !transcriptError.includes('demo') && !transcriptError.includes('Not authorized') && !transcriptError.includes('simulation') && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Connection Error
                  </Badge>
                )}
                {isAnalyzing && (
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Analyzing...
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Analysis Results */}
      {callState.isActive && (
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Cultural Analysis</TabsTrigger>
            <TabsTrigger value="entities">Extracted Entities</TabsTrigger>
            <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {culturalAnalysis ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Cultural Fit Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={culturalAnalysis.score} className="h-3" />
                      <p className="text-2xl font-bold text-purple-600">
                        {culturalAnalysis.score}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Confidence: {Math.round(extractedData.confidence * 100)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Target Audiences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {culturalAnalysis.audiences?.slice(0, 3).map((audience: any, index: number) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {audience.name || audience}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    Waiting for conversation to begin...
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="entities" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cultural Entities</CardTitle>
                  <CardDescription>{extractedData.entities.length} detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {extractedData.entities.map((entity, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {entity}
                      </Badge>
                    ))}
                    {extractedData.entities.length === 0 && (
                      <p className="text-gray-500 text-sm">No entities detected yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cultural Categories</CardTitle>
                  <CardDescription>{extractedData.categories.length} identified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {extractedData.categories.map((category, index) => (
                      <Badge key={index} className="mr-2 mb-2">
                        {category}
                      </Badge>
                    ))}
                    {extractedData.categories.length === 0 && (
                      <p className="text-gray-500 text-sm">No categories identified yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Live Conversation Transcript</CardTitle>
                <CardDescription>Real-time transcription and cultural analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full border rounded-md p-4">
                  <div className="space-y-2">
                    {callState.transcript ? (
                      <p className="text-sm leading-relaxed">{callState.transcript}</p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Transcript will appear here as the conversation progresses...
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
                <CardDescription>Cultural intelligence recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {culturalAnalysis?.insights?.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Brain className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm italic">
                      AI insights will be generated as cultural data is extracted...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
