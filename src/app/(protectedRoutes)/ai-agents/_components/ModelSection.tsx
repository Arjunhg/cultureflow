import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings } from 'lucide-react'
import React from 'react'
import ModelConfiguration from './ModelConfiguration'

const ModelSection = () => {
  return (
    <div className="p-8 flex-1 overflow-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="uppercase text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wider">MODEL CONFIGURATION</span>
      </div>

      <ScrollArea className="h-full">
        <ModelConfiguration/>
      </ScrollArea>
    </div>
  )
}

export default ModelSection
