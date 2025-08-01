'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain } from 'lucide-react'
import React from 'react'
import ModelConfiguration from './ModelConfiguration'
import RealTimeCallAnalysis from '@/components/RealTimeCallAnalysis'

const ModelSection = () => {
  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="uppercase text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wider">AI AGENT CONFIGURATION</span>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">Model Configuration</TabsTrigger>
          <TabsTrigger value="cultural-analysis">Real-time Cultural Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <ScrollArea className="h-[600px]">
            <ModelConfiguration/>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="cultural-analysis">
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Live Cultural Intelligence
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Test real-time cultural analysis during sales conversations
                </p>
              </div>
              
              <RealTimeCallAnalysis 
                candidateName="Demo Candidate"
                roleType="Sales Role"
                onAnalysisUpdate={(analysis) => {
                  console.log('Real-time analysis update:', analysis);
                }}
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ModelSection
