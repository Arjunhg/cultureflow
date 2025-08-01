'use client';

import { useState, useEffect } from 'react';
import { qloo, QlooEntity, QlooAudience } from '@/lib/qloo';
import { Badge } from '@/components/ui/badge';
import { Brain, Users, Star, TrendingUp, Sparkles, Target } from 'lucide-react';

interface CulturalAnalysisProps {
  candidateName: string;
  candidateEmail: string;
  preferences?: string[];
  roleType?: string;
}

interface CulturalInsights {
  score: number;
  insights: string[];
  recommendations: QlooEntity[];
  audiences: QlooAudience[];
  loading: boolean;
}

export default function CulturalCandidateAnalysis({ 
  candidateName, 
  preferences = ['film', 'music', 'technology'], 
  roleType = 'Creative Role' 
}: CulturalAnalysisProps) {
  const [culturalData, setCulturalData] = useState<CulturalInsights>({
    score: 0,
    insights: [],
    recommendations: [],
    audiences: [],
    loading: true
  });

  useEffect(() => {
    const fetchCulturalInsights = async () => {
      try {
        setCulturalData(prev => ({ ...prev, loading: true }));
        
        const analysis = await qloo.analyzeCulturalFit(preferences, roleType);
        
        setCulturalData({
          score: analysis.score,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          audiences: analysis.audiences,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching cultural insights:', error);
        setCulturalData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchCulturalInsights();
  }, [candidateName, preferences, roleType]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <Star className="w-4 h-4" />;
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    if (score >= 60) return <Target className="w-4 h-4" />;
    return <Brain className="w-4 h-4" />;
  };

  if (culturalData.loading) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          <span className="text-sm text-slate-600 dark:text-purple-300">Analyzing cultural profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cultural Score Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-pink-50/80 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-slate-800 dark:text-purple-100">Cultural Intelligence</h4>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreColor(culturalData.score)}`}>
            {getScoreIcon(culturalData.score)}
            <span className="font-bold text-sm">{culturalData.score}%</span>
          </div>
        </div>
        
        {/* Score Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${culturalData.score}%` }}
          ></div>
        </div>

        <p className="text-sm text-slate-600 dark:text-purple-300">
          {candidateName} shows <span className="font-semibold">{culturalData.score >= 80 ? 'excellent' : culturalData.score >= 65 ? 'good' : 'moderate'}</span> cultural alignment for {roleType}
        </p>
      </div>

      {/* Cultural Insights */}
      {culturalData.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Cultural Entities */}
          {culturalData.recommendations.length > 0 && (
            <div className="p-3 rounded-lg bg-white/70 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Cultural Preferences</span>
              </div>
              <div className="space-y-1">
                {culturalData.recommendations.slice(0, 3).map((entity, idx) => (
                  <Badge key={idx} variant="secondary" className="mr-1 mb-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    {entity.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Audiences */}
          {culturalData.audiences.length > 0 && (
            <div className="p-3 rounded-lg bg-white/70 dark:bg-purple-900/20 border border-indigo-200/30 dark:border-indigo-700/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-purple-200">Cultural Audiences</span>
              </div>
              <div className="space-y-1">
                {culturalData.audiences.slice(0, 3).map((audience, idx) => (
                  <Badge key={idx} variant="outline" className="mr-1 mb-1 border-indigo-300 text-indigo-700 dark:text-indigo-300">
                    {audience.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Qloo Attribution */}
      <div className="text-center py-2">
        <span className="text-xs text-slate-500 dark:text-purple-400">
          ✨ Powered by Qloo Cultural Intelligence
        </span>
      </div>
    </div>
  );
}
