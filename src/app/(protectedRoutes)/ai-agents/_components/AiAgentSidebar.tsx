'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAiAgentStore } from '@/store/useAiAgentStore'
import { Assistant } from '@vapi-ai/server-sdk/api'
import { Plus, Search, Bot } from 'lucide-react'
import React, { useState } from 'react'
import CreateAssistantModal from './CreateAssistantModal'

type Props = {
  aiAgents: Assistant[] | []
}

const AiAgentSidebar = ({ aiAgents }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { assistant, setAssistant } = useAiAgentStore()

  return (
    <div className="w-[320px] border-r border-emerald-200/30 dark:border-emerald-700/30 bg-emerald-50/50 dark:bg-emerald-900/20 backdrop-blur-sm flex flex-col">
      <div className="p-6 border-b border-emerald-200/30 dark:border-emerald-700/30">
        <Button
          className="w-full flex items-center gap-2 mb-4 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-200/30 dark:border-emerald-700/30 text-slate-800 dark:text-emerald-100 font-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" /> Create Interviewer
        </Button>
        <div className="relative">
          <Input
            placeholder="Search Interviewers"
            className="bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-200/30 dark:border-emerald-700/30 pl-10 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-emerald-500/50"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-emerald-400" />
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {aiAgents.map((aiAssistant) => (
            <div
              className={`p-4 rounded-2xl transition-all duration-300 cursor-pointer group hover:scale-105 ${
                aiAssistant.id === assistant?.id 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-lg' 
                  : 'bg-emerald-50/50 dark:bg-emerald-900/30 border border-emerald-200/20 dark:border-emerald-700/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 hover:border-emerald-200/30 dark:hover:border-emerald-700/30'
              }`}
              key={aiAssistant.name}
              onClick={() => {
                setAssistant(aiAssistant)
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="font-medium text-slate-800 dark:text-emerald-100">{aiAssistant.name}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <CreateAssistantModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}

export default AiAgentSidebar
