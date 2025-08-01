'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, PhoneOff, Mic, MicOff, Loader2, TrendingUp, Users, Brain, AlertCircle } from 'lucide-react';
import { culturalExtractor, type CulturalExtraction } from '@/lib/culturalExtractor';

interface RealTimeCallAnalysisProps {
  candidateName: string;
  roleType?: string;
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
  onAnalysisUpdate 
}: RealTimeCallAnalysisProps) {
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isMuted: false,
    duration: 0,
    transcript: '',
    culturalAnalysis: null,
    extractedData: { entities: [], keywords: [], categories: [], confidence: 0 },
    isAnalyzing: false
  });

  // For now, we'll simulate the transcript connection
  // In a real implementation, this would connect to AssemblyAI streaming
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isConnected, setIsConnected] = useState(false);

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

  // Process live transcript for cultural analysis
  useEffect(() => {
    if (liveTranscript && callState.isActive) {
      setCallState(prev => ({ ...prev, transcript: liveTranscript }));
      debouncedAnalysis(liveTranscript);
    }
  }, [liveTranscript, callState.isActive]);

  // Debounced analysis to prevent too frequent API calls
  const debouncedAnalysis = useCallback(
    debounce(async (transcript: string) => {
      if (transcript.length < 50) return; // Wait for more content
      
      setCallState(prev => ({ ...prev, isAnalyzing: true }));
      
      try {
        const analysis = await culturalExtractor.analyzeCulturalFitFromConversation(
          transcript, 
          roleType
        );
        
        setCallState(prev => ({
          ...prev,
          culturalAnalysis: analysis,
          extractedData: analysis.extractedData || { entities: [], keywords: [], categories: [], confidence: 0 },
          isAnalyzing: false
        }));
        
        onAnalysisUpdate?.(analysis);
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

    // Simulate connection to live transcript
    setIsConnected(true);

    // For demo purposes, simulate a call with realistic data
    setTimeout(async () => {
      const simulation = await culturalExtractor.simulateCallAnalysis(candidateName);
      setLiveTranscript(simulation.transcript);
      setCallState(prev => ({
        ...prev,
        transcript: simulation.transcript,
        culturalAnalysis: simulation.culturalAnalysis,
        extractedData: simulation.extractedData
      }));
      onAnalysisUpdate?.(simulation.culturalAnalysis);
    }, 2000);
  };

  const endCall = () => {
    setCallState(prev => ({ 
      ...prev, 
      isActive: false, 
      isMuted: false 
    }));
    setIsConnected(false);
    setLiveTranscript('');
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
                  Start Analysis Call
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
