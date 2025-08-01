'use client'
import { updateAssistant } from '@/actions/vapi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAiAgentStore } from '@/store/useAiAgentStore'
import { Info, Loader2, Settings } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import ConfigField from './ConfigField'
import DropdownSelect from './DropdownSelect'

const ModelConfiguration = () => {
  const { assistant } = useAiAgentStore()
  const [firstMessage, setFirstMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assistant) {
      setFirstMessage(assistant?.firstMessage || '')
      setSystemPrompt(assistant?.model?.messages?.[0]?.content || '')
    }
  }, [assistant])

  if (!assistant) {
    return (
      <div className="flex justify-center items-center h-[500px] w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center space-y-4">
            <div className="mx-auto p-3 rounded-2xl bg-purple-500/20 w-fit">
              <Settings className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No assistant selected. Please select an assistant to configure the
              model settings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleUpdateAssistant = async () => {
    setLoading(true)
    try {
      const res = await updateAssistant(
        assistant?.id,
        firstMessage,
        systemPrompt
      )

      if (!res.success) {
        throw new Error(res.message)
      }

      toast.success('Assistant updated successfully')
    } catch (error) {
      console.error('Error updating assistant:', error)
      toast.error('Failed to update assistant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Model Configuration</h2>
        </div>
        <Button
          onClick={handleUpdateAssistant}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 text-gray-900 dark:text-white font-semibold hover:scale-105 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Updating...
            </>
          ) : (
            'Update Assistant'
          )}
        </Button>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Configure the behavior of the assistant.
      </p>

      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-900 dark:text-white">First Message</label>
            <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <Input
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            className="bg-white/10 border-white/20 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-900 dark:text-white">System Prompt</label>
              <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="min-h-[300px] max-h-[500px] bg-white/10 border-white/20 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50 font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ConfigField label="Provider">
            <DropdownSelect value={assistant.model?.provider || ''} />
          </ConfigField>

          <ConfigField
            label="Model"
            showInfo={true}
          >
            <DropdownSelect value={assistant.model?.model || ''} />
          </ConfigField>
        </div>
      </div>
    </div>
  )
}

export default ModelConfiguration
