import { createAssistant } from '@/actions/vapi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Bot } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// Accept open and onOpenChange for Dialog control
interface CreateAssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CreateAssistantModal = ({ open, onOpenChange }: CreateAssistantModalProps) => {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createAssistant(name)
      if (!res.success) {
        throw new Error(res.message || 'Failed to create assistant')
      }
      router.refresh()
      setName('')
      onOpenChange(false)
      toast.success('Assistant created successfully')
    } catch (error: unknown) {
      console.error('Error creating assistant:', error)
      let errorMessage = 'Failed to create assistant'
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message?: string }).message || errorMessage
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-purple-500/20 w-fit">
            <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create AI Interviewer</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            This name will be used to identify your AI interviewer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-3">
            <label className="block font-semibold text-gray-900 dark:text-white">Interviewer Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter interviewer name"
              className="bg-white/10 border-white/20 rounded-2xl backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 text-gray-900 dark:text-white font-semibold hover:scale-105 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Interviewer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAssistantModal
