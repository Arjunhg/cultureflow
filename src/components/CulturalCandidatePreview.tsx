'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Users, TrendingUp, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for demo - in real app this would come from your database
const mockCandidateInsights = [
  { name: 'Alex Rivera', score: 89, role: 'Creative Director', status: 'High Match' },
  { name: 'Maya Chen', score: 85, role: 'Art Director', status: 'High Match' },
  { name: 'Jordan Smith', score: 78, role: 'Marketing Manager', status: 'Good Match' },
  { name: 'Priya Patel', score: 72, role: 'Content Strategist', status: 'Good Match' },
];

export default function CulturalCandidatePreview() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getStatusColor = (status: string) => {
    if (status === 'High Match') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'Good Match') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-purple-100">
                Cultural Candidate Analytics
              </h3>
              <p className="text-slate-600 dark:text-purple-300">
                Qloo-powered candidate cultural intelligence insights
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 animate-pulse">
                <div className="w-8 h-8 bg-purple-200 dark:bg-purple-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-3/4"></div>
                  <div className="h-3 bg-purple-100 dark:bg-purple-800 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-8 bg-purple-200 dark:bg-purple-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm hover:scale-[1.02] transition-all duration-500">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-purple-100">
                Cultural Candidate Analytics
              </h3>
              <p className="text-slate-600 dark:text-purple-300">
                Real-time Qloo cultural intelligence insights
              </p>
            </div>
          </div>
          <Link href="/candidate">
            <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/70 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-purple-300">Total Analyzed</p>
                <p className="text-xl font-bold text-slate-800 dark:text-purple-100">{mockCandidateInsights.length}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 dark:bg-purple-900/30 border border-green-200/50 dark:border-green-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-purple-300">High Matches</p>
                <p className="text-xl font-bold text-slate-800 dark:text-purple-100">
                  {mockCandidateInsights.filter(c => c.score >= 85).length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/70 dark:bg-purple-900/30 border border-blue-200/50 dark:border-blue-700/30 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-slate-600 dark:text-purple-300">Avg Score</p>
                <p className="text-xl font-bold text-slate-800 dark:text-purple-100">
                  {Math.round(mockCandidateInsights.reduce((acc, c) => acc + c.score, 0) / mockCandidateInsights.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-800 dark:text-purple-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Top Cultural Matches
          </h4>
          
          {mockCandidateInsights.map((candidate, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/70 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center font-semibold text-purple-700 dark:text-purple-300">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-purple-100">{candidate.name}</p>
                  <p className="text-sm text-slate-600 dark:text-purple-300">{candidate.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={`border ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </Badge>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold ${getScoreColor(candidate.score)}`}>
                  {candidate.score}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/30 dark:border-purple-700/20">
          <p className="text-sm text-slate-600 dark:text-purple-400">
            ✨ Powered by Qloo Taste AI™ Cultural Intelligence Platform
          </p>
        </div>
      </div>
    </div>
  );
}
