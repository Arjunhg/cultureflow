'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  Brain,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface RealTimeAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  activeCalls: number;
  totalCandidates: number;
  averageCulturalScore: number;
  recentAnalyses: Array<{
    candidateName: string;
    score: number;
    timestamp: Date;
    trend: 'up' | 'down' | 'stable';
  }>;
  topCulturalCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export default function RealTimeAnalytics({ className = '' }: RealTimeAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeCalls: 0,
    totalCandidates: 0,
    averageCulturalScore: 0,
    recentAnalyses: [],
    topCulturalCategories: []
  });

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setAnalytics(() => {
        const mockData: AnalyticsData = {
          activeCalls: Math.floor(Math.random() * 5) + 1,
          totalCandidates: 47 + Math.floor(Math.random() * 10),
          averageCulturalScore: 72 + Math.floor(Math.random() * 20),
          recentAnalyses: [
            {
              candidateName: 'Alex Rivera',
              score: 85 + Math.floor(Math.random() * 10),
              timestamp: new Date(),
              trend: Math.random() > 0.5 ? 'up' : 'down'
            },
            {
              candidateName: 'Maya Chen',
              score: 78 + Math.floor(Math.random() * 15),
              timestamp: new Date(Date.now() - 60000),
              trend: Math.random() > 0.5 ? 'up' : 'stable'
            },
            {
              candidateName: 'Jordan Smith',
              score: 92 + Math.floor(Math.random() * 8),
              timestamp: new Date(Date.now() - 120000),
              trend: 'up'
            }
          ],
          topCulturalCategories: [
            { category: 'Entertainment', count: 23, percentage: 48 },
            { category: 'Lifestyle', count: 18, percentage: 38 },
            { category: 'Technology', count: 12, percentage: 25 },
            { category: 'Sports', count: 8, percentage: 17 }
          ]
        };
        return mockData;
      });
      setIsLive(true);
      
      // Reset live indicator after a moment
      setTimeout(() => setIsLive(false), 1000);
    }, 5000);

    // Initial data load
    setAnalytics({
      activeCalls: 2,
      totalCandidates: 47,
      averageCulturalScore: 78,
      recentAnalyses: [
        {
          candidateName: 'Alex Rivera',
          score: 87,
          timestamp: new Date(),
          trend: 'up'
        },
        {
          candidateName: 'Maya Chen',
          score: 82,
          timestamp: new Date(Date.now() - 60000),
          trend: 'up'
        }
      ],
      topCulturalCategories: [
        { category: 'Entertainment', count: 23, percentage: 48 },
        { category: 'Lifestyle', count: 18, percentage: 38 },
        { category: 'Technology', count: 12, percentage: 25 }
      ]
    });

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-600" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-600" />;
      default: return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className={`border-2 border-gradient-to-r from-purple-500 to-pink-500 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Brain className="h-5 w-5 text-purple-600" />
            {isLive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          Real-time Cultural Analytics
        </CardTitle>
        <CardDescription>
          Live insights from cultural intelligence analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active Calls</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {analytics.activeCalls}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Analyzed</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalCandidates}
            </div>
          </div>
        </div>

        {/* Average Cultural Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Cultural Score</span>
            <span className="text-lg font-bold text-purple-600">
              {analytics.averageCulturalScore}%
            </span>
          </div>
          <Progress value={analytics.averageCulturalScore} className="h-2" />
        </div>

        {/* Recent Analyses */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Recent Analyses</span>
          </div>
          <div className="space-y-2">
            {analytics.recentAnalyses.slice(0, 3).map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{analysis.candidateName}</span>
                  {getTrendIcon(analysis.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {analysis.score}%
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(analysis.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cultural Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Top Cultural Categories</span>
          </div>
          <div className="space-y-2">
            {analytics.topCulturalCategories.slice(0, 3).map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{category.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Status */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">Live data updates every 5 seconds</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
