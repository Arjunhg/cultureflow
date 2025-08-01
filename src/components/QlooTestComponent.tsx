/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { qloo } from '@/lib/qloo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function QlooTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [audiences, setAudiences] = useState<any[]>([]);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await qloo.testConnection();
      setConnectionStatus(result);
      
      if (result.success) {
        // Demo search with allowed entity types
        const [entities, audienceResults] = await Promise.all([
          qloo.searchEntities('Inception'), // Search for a movie
          qloo.searchAudiences('art') // Search for art-related audiences
        ]);
        
        setSearchResults(entities.results.slice(0, 3));
        setAudiences(audienceResults.slice(0, 3));
      }
    } catch (error) {
      setConnectionStatus({ success: false, message: 'Test failed' });
      console.error('Connection test failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-200/30 dark:border-indigo-700/30 backdrop-blur-sm mb-4">
          <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400"/>
          <span className="text-sm font-medium text-slate-700 dark:text-indigo-300">Live Qloo Integration</span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
          Cultural Intelligence Engine
        </h2>
        <p className="text-lg text-slate-600 dark:text-purple-300 max-w-2xl mx-auto">
          Experience real-time cultural insights powered by Qloo&apos;s Taste AI™ platform
        </p>
      </div>

      {/* Main Component */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/30 dark:border-indigo-700/30 backdrop-blur-sm hover:scale-[1.02] transition-all duration-500 shadow-xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 shadow-lg">
              <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400"/>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-purple-100 mb-1">
                Qloo Cultural Intelligence Test
              </h3>
              <p className="text-slate-600 dark:text-purple-300">
                Connect to Qloo&apos;s hackathon API and discover cultural insights
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 text-white border-0 rounded-2xl py-8 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-center gap-4">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Analyzing Cultural Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Test Cultural Intelligence Engine</span>
                </>
              )}
            </div>
          </Button>

          {/* Connection Status */}
          {connectionStatus && (
            <div className={`p-6 rounded-2xl flex items-center gap-4 ${
              connectionStatus.success 
                ? 'bg-green-50/80 border-2 border-green-200/50 backdrop-blur-sm' 
                : 'bg-red-50/80 border-2 border-red-200/50 backdrop-blur-sm'
            } transition-all duration-300`}>
              {connectionStatus.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <p className={`font-medium ${
                connectionStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {connectionStatus.message}
              </p>
            </div>
          )}

          {/* Results Grid */}
          {(searchResults.length > 0 || audiences.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cultural Entities */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-purple-200">
                      Cultural Entities
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((entity, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 dark:text-purple-100">
                            {entity.name}
                          </span>
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300/50">
                            {entity.type || 'entity'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Audiences */}
              {audiences.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-purple-200">
                      Cultural Audiences
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {audiences.map((audience, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-purple-900/30 border border-indigo-200/50 dark:border-indigo-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-200 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 dark:text-purple-100">
                            {audience.name}
                          </span>
                          <Badge variant="outline" className="border-indigo-300 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/30">
                            audience
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {connectionStatus?.success && (
            <div className="text-center p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/30 dark:border-purple-700/20">
              <p className="text-sm text-slate-600 dark:text-purple-400">
                ✨ Powered by Qloo Taste AI™ Cultural Intelligence Platform
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
