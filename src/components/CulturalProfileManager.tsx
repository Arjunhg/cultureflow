/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Clock, 
  Activity, 
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { culturalExtractor } from '@/lib/culturalExtractor';

interface CulturalProfileManagerProps {
  candidateId: string;
  candidateName: string;
  onProfileUpdate?: (profile: CulturalProfile) => void;
}

interface CulturalProfile {
  id: string;
  name: string;
  culturalScore: number;
  lastUpdated: Date;
  callHistory: CallAnalysis[];
  cumulativeInsights: {
    entities: string[];
    categories: string[];
    audiences: string[];
    confidence: number;
  };
  trends: {
    scoreHistory: { date: Date; score: number }[];
    improvementAreas: string[];
  };
}

interface CallAnalysis {
  id: string;
  date: Date;
  duration: number;
  culturalScore: number;
  extractedEntities: string[];
  keyInsights: string[];
  confidence: number;
}

export default function CulturalProfileManager({ 
  candidateId, 
  candidateName, 
  onProfileUpdate 
}: CulturalProfileManagerProps) {
  const [profile, setProfile] = useState<CulturalProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastCallAnalysis, setLastCallAnalysis] = useState<CallAnalysis | null>(null);

  // Initialize or load existing profile
  useEffect(() => {
    initializeProfile();
  }, [candidateId]);

  const initializeProfile = async () => {
    // In a real app, this would load from database
    const mockProfile: CulturalProfile = {
      id: candidateId,
      name: candidateName,
      culturalScore: 0,
      lastUpdated: new Date(),
      callHistory: [],
      cumulativeInsights: {
        entities: [],
        categories: [],
        audiences: [],
        confidence: 0
      },
      trends: {
        scoreHistory: [],
        improvementAreas: []
      }
    };

    setProfile(mockProfile);
  };

  const updateProfileFromCall = async () => {
    if (!profile) return;

    setIsUpdating(true);
    
    try {
      // In real implementation, this would get data from active VAPI call
      // For now, simulate realistic conversation data
      const mockTranscript = `
        I'm really passionate about creative work and innovation. 
        I love watching independent films and documentaries. 
        In my spare time, I enjoy visiting art museums and galleries. 
        I'm also into jazz music and attend live concerts regularly.
        I believe in companies that value creativity and work-life balance.
      `;
      
      const analysis = await culturalExtractor.analyzeCulturalFitFromConversation(
        mockTranscript, 
        'Creative Role'
      );
      
      const callAnalysis: CallAnalysis = {
        id: `call-${Date.now()}`,
        date: new Date(),
        duration: 180, // 3 minutes
        culturalScore: analysis.score,
        extractedEntities: analysis.extractedData?.entities || [],
        keyInsights: analysis.insights.slice(0, 3),
        confidence: analysis.extractedData?.confidence || 0
      };

      // Update profile with new call data
      const updatedProfile: CulturalProfile = {
        ...profile,
        culturalScore: calculateNewCulturalScore(profile, callAnalysis),
        lastUpdated: new Date(),
        callHistory: [callAnalysis, ...profile.callHistory].slice(0, 10), // Keep last 10 calls
        cumulativeInsights: updateCumulativeInsights(profile, { extractedData: analysis.extractedData, culturalAnalysis: analysis }),
        trends: updateTrends(profile, callAnalysis)
      };

      setProfile(updatedProfile);
      setLastCallAnalysis(callAnalysis);
      onProfileUpdate?.(updatedProfile);

    } catch (error) {
      console.error('Error updating cultural profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateNewCulturalScore = (currentProfile: CulturalProfile, newCall: CallAnalysis): number => {
    const history = currentProfile.callHistory;
    if (history.length === 0) return newCall.culturalScore;
    
    // Weight recent calls more heavily
    const weights = history.map((_, index) => Math.pow(0.8, index));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) + 1; // +1 for new call
    
    const weightedSum = history.reduce((sum, call, index) => 
      sum + (call.culturalScore * weights[index]), 0
    ) + newCall.culturalScore;
    
    return Math.round(weightedSum / totalWeight);
  };

  const updateCumulativeInsights = (currentProfile: CulturalProfile, simulation: any) => {
    const currentInsights = currentProfile.cumulativeInsights;
    const newData = simulation.extractedData;
    
    return {
      entities: [...new Set([...currentInsights.entities, ...newData.entities])].slice(0, 20),
      categories: [...new Set([...currentInsights.categories, ...newData.categories])],
      audiences: [...new Set([...currentInsights.audiences, ...(simulation.culturalAnalysis.audiences || [])])].slice(0, 10),
      confidence: Math.max(currentInsights.confidence, newData.confidence)
    };
  };

  const updateTrends = (currentProfile: CulturalProfile, newCall: CallAnalysis) => {
    const newScoreHistory = [
      { date: newCall.date, score: newCall.culturalScore },
      ...currentProfile.trends.scoreHistory
    ].slice(0, 20);

    // Identify improvement areas
    const improvementAreas: string[] = [];
    if (newCall.culturalScore < 70) {
      improvementAreas.push('Cultural awareness could be enhanced');
    }
    if (newCall.extractedEntities.length < 3) {
      improvementAreas.push('Limited cultural interests expressed');
    }
    if (newCall.confidence < 0.6) {
      improvementAreas.push('Need more cultural conversation');
    }

    return {
      scoreHistory: newScoreHistory,
      improvementAreas: [...new Set([...currentProfile.trends.improvementAreas, ...improvementAreas])].slice(0, 5)
    };
  };

  const getScoreTrend = () => {
    if (!profile || profile.trends.scoreHistory.length < 2) return 'stable';
    
    const recent = profile.trends.scoreHistory[0].score;
    const previous = profile.trends.scoreHistory[1].score;
    
    if (recent > previous) return 'up';
    if (recent < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getScoreTrend();
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-2 border-gradient-to-r from-purple-500 to-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Cultural Profile: {profile.name}
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-sm text-gray-600">
                Last updated: {profile.lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Comprehensive cultural intelligence analysis from {profile.callHistory.length} calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Overall Cultural Score</label>
              <div className="flex items-center gap-2">
                <Progress value={profile.culturalScore} className="flex-1 h-3" />
                <span className="text-2xl font-bold text-purple-600">
                  {profile.culturalScore}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cultural Categories</label>
              <div className="text-2xl font-bold text-indigo-600">
                {profile.cumulativeInsights.categories.length}
              </div>
              <p className="text-sm text-gray-600">identified interests</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confidence Level</label>
              <div className="text-2xl font-bold text-pink-600">
                {Math.round(profile.cumulativeInsights.confidence * 100)}%
              </div>
              <p className="text-sm text-gray-600">analysis confidence</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={updateProfileFromCall}
              disabled={isUpdating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isUpdating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Call...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Analyze Recent Call Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Call Analysis */}
      {lastCallAnalysis && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>New Analysis Complete!</strong> Cultural score: {lastCallAnalysis.culturalScore}%, 
            {lastCallAnalysis.extractedEntities.length} entities extracted, 
            confidence: {Math.round(lastCallAnalysis.confidence * 100)}%
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Cultural Insights</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
          <TabsTrigger value="trends">Score Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cultural Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.cumulativeInsights.entities.slice(0, 10).map((entity, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {entity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interest Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.cumulativeInsights.categories.map((category, index) => (
                    <Badge key={index} className="mr-2 mb-2">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Call Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.callHistory.map((call, index) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Call {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {call.date.toLocaleDateString()} • {Math.floor(call.duration / 60)}min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{call.culturalScore}%</p>
                      <p className="text-sm text-gray-600">{call.extractedEntities.length} entities</p>
                    </div>
                  </div>
                ))}
                {profile.callHistory.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No call history yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cultural Score Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.trends.scoreHistory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-24">
                      {entry.date.toLocaleDateString()}
                    </span>
                    <Progress value={entry.score} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-12">{entry.score}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Improvement Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.trends.improvementAreas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{area}</p>
                  </div>
                ))}
                {profile.trends.improvementAreas.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">Great cultural engagement!</p>
                    <p className="text-sm text-gray-600">No improvement areas identified</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
