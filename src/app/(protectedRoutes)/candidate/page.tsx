'use client';

import PageHeader from '@/components/ui/ReusableComponents/PageHeader';
import { Webcam, GitFork, Brain, Target, Palette, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { leadData } from './__tests__/data';
import CulturalCandidateAnalysis from '@/components/CulturalCandidateAnalysis';
import CulturalProfileManager from '@/components/CulturalProfileManager';
import CandidateSessionIntegration from '@/components/CandidateSessionIntegration';

const CandidatePage = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRowExpansion = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen flex flex-col px-6 md:px-8 lg:px-10 xl:px-12 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20">
          <Brain className="w-16 h-16 text-purple-600 rotate-12" />
        </div>
        <div className="absolute top-40 right-32">
          <Target className="w-12 h-12 text-pink-600 -rotate-12" />
        </div>
        <div className="absolute bottom-40 right-20">
          <Palette className="w-18 h-18 text-indigo-500 -rotate-12" />
        </div>
        <div className="absolute top-60 left-1/3">
          <Sparkles className="w-10 h-10 text-purple-400 rotate-45" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="w-full flex flex-col">
          <PageHeader
            leftIcon={<Webcam className="w-3 h-3" />}
            mainIcon={<Brain className="w-12 h-12 text-purple-600 dark:text-purple-400" />}
            rightIcon={<GitFork className="w-3 h-3" />}
            heading="Cultural Intelligence for All Your Prospects"
            placeholder="Search prospects..."
          />
        </div>

        {/* Enhanced Header Section */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-purple-100">
                Qloo-Powered Cultural Analysis
              </h2>
              <p className="text-slate-600 dark:text-purple-300">
                Real-time cultural insights for better candidate matching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Click on any candidate to view their detailed cultural analysis</span>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto"> 
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-white/20 backdrop-blur-sm shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-purple-200/30 dark:border-purple-700/30">
                  <TableHead className="text-sm text-slate-600 dark:text-purple-300 font-semibold">Candidate</TableHead>
                  <TableHead className="text-sm text-slate-600 dark:text-purple-300 font-semibold">Contact</TableHead>
                  <TableHead className="text-sm text-slate-600 dark:text-purple-300 font-semibold">Cultural Intelligence</TableHead>
                  <TableHead className="text-right text-sm text-slate-600 dark:text-purple-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadData?.map((lead, idx) => (
                  <React.Fragment key={idx}>
                    <TableRow 
                      className={`border-0 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 cursor-pointer transition-all duration-200 ${
                        expandedRow === idx ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''
                      }`}
                      onClick={() => toggleRowExpansion(idx)}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-lg">
                            {lead.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-purple-100">{lead?.name}</p>
                            <p className="text-sm text-slate-600 dark:text-purple-300">{lead?.roleType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="text-slate-700 dark:text-purple-200">{lead?.email}</p>
                          <p className="text-sm text-slate-500 dark:text-purple-400">{lead?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                            Cultural Analysis Available
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          {lead?.tags?.slice(0, 2).map((tag, tagIdx) => (
                            <Badge key={tagIdx} variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                              {tag}
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30"
                          >
                            {expandedRow === idx ? 'Hide Analysis' : 'View Analysis'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Cultural Analysis Row */}
                    {expandedRow === idx && (
                      <TableRow className="border-0 bg-gradient-to-br from-purple-50/80 via-indigo-50/80 to-pink-50/80 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-pink-900/20">
                        <TableCell colSpan={4} className="py-6">
                          <div className="max-w-6xl">
                            <Tabs defaultValue="session" className="space-y-4">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="session">Live Session</TabsTrigger>
                                <TabsTrigger value="analysis">Cultural Analysis</TabsTrigger>
                                <TabsTrigger value="profile">Profile Manager</TabsTrigger>
                              </TabsList>

                              <TabsContent value="session">
                                <CandidateSessionIntegration
                                  candidateId={`candidate-${idx}`}
                                  candidateName={lead.name}
                                  candidateEmail={lead.email}
                                  roleType={lead.roleType}
                                />
                              </TabsContent>

                              <TabsContent value="analysis">
                                <CulturalCandidateAnalysis
                                  candidateName={lead.name}
                                  candidateEmail={lead.email}
                                  preferences={lead.culturalPreferences}
                                  roleType={lead.roleType}
                                />
                              </TabsContent>

                              <TabsContent value="profile">
                                <CulturalProfileManager
                                  candidateId={`candidate-${idx}`}
                                  candidateName={lead.name}
                                  onProfileUpdate={(profile) => {
                                    console.log('Profile updated for', lead.name, profile);
                                  }}
                                />
                              </TabsContent>
                            </Tabs>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;
