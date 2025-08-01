import { getAllAssistants } from '@/actions/vapi'
import React from 'react'
import AiAgentSidebar from './_components/AiAgentSidebar'
import ModelSection from './_components/ModelSection'
import { Brain, Palette } from 'lucide-react'

const page = async () => {
  const allAgents = await getAllAssistants()

  return (
    <div className="w-full flex h-[80vh] bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 rounded-3xl border border-purple-200/30 dark:border-purple-700/30 backdrop-blur-sm overflow-hidden shadow-lg relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20">
          <Brain className="w-16 h-16 text-purple-600 rotate-12" />
        </div>
        <div className="absolute top-40 right-32">
          <Palette className="w-12 h-12 text-pink-600 -rotate-12" />
        </div>
      </div>
      
      <AiAgentSidebar aiAgents={allAgents?.data || []} />
      <div className="flex-1 flex flex-col bg-purple-50/30 dark:bg-purple-900/20 backdrop-blur-sm relative z-10">
        <ModelSection />
      </div>
    </div>
  )
}


export default page
