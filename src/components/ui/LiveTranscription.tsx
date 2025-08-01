import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAssemblyAITranscription } from '@/hooks/useAssemblyAITranscription'
import { Mic, MicOff, Download, Trash2, Copy, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveTranscriptionProps {
  className?: string
  onTranscriptUpdate?: (transcript: string) => void
  onClose?: () => void
  showCloseButton?: boolean
}

export function LiveTranscription({ className, onTranscriptUpdate, onClose, showCloseButton = false }: LiveTranscriptionProps) {
  const [savedTranscripts, setSavedTranscripts] = useState<string>('')
  const [isMinimized, setIsMinimized] = useState(false)
  
  const {
    isRecording,
    isLoading,
    transcripts,
    error,
    startRecording,
    stopRecording,
    clearTranscripts,
    getFullTranscript
  } = useAssemblyAITranscription({
    onTranscript: () => {
      const fullTranscript = getFullTranscript()
      onTranscriptUpdate?.(fullTranscript)
    },
    onError: (error: Error) => {
      console.error('Transcription error:', error)
    }
  })

  const getFinalizedTranscript = () =>
    transcripts.filter(t => !t.isPartial).map(t => t.text).join(' ')

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording()
      // Save only finalized (green) transcripts when stopping
      const finalizedTranscript = getFinalizedTranscript()
      if (finalizedTranscript) {
        setSavedTranscripts(prev => prev + (prev ? '\n\n' : '') + finalizedTranscript)
      }
      clearTranscripts() 
    } else {
      await startRecording()
    }
  }

  const handleClearAll = () => {
    clearTranscripts()
    setSavedTranscripts('')
  }

  const handleDownloadTranscript = () => {
    const fullTranscript = savedTranscripts + (savedTranscripts ? '\n\n' : '') + getFinalizedTranscript()
    const blob = new Blob([fullTranscript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `webinar-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyTranscript = async () => {
    const fullTranscript = savedTranscripts + (savedTranscripts ? '\n\n' : '') + getFinalizedTranscript()
    try {
      await navigator.clipboard.writeText(fullTranscript)
    } catch (err) {
      console.error('Failed to copy transcript:', err)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card className={cn('w-full h-full flex flex-col', className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg font-semibold truncate">
            Live Transcription
          </CardTitle>
          <div className="flex items-center gap-1 md:gap-2">
            <Badge variant={isRecording ? 'destructive' : 'secondary'} className="text-xs">
              {isRecording ? 'Recording' : 'Stopped'}
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="text-xs">Processing...</Badge>
            )}
            {showCloseButton && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 h-6 w-6 lg:flex"
            >
              {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <Button
              onClick={handleToggleRecording}
              disabled={isLoading}
              variant={isRecording ? 'destructive' : 'default'}
              size="sm"
              className="text-xs px-2 py-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Mic className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Start</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              disabled={transcripts.length === 0 && !savedTranscripts}
              className="text-xs px-2 py-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            
            <Button
              onClick={handleCopyTranscript}
              variant="outline"
              size="sm"
              disabled={transcripts.length === 0 && !savedTranscripts}
              className="text-xs px-2 py-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            
            <Button
              onClick={handleDownloadTranscript}
              variant="outline"
              size="sm"
              disabled={transcripts.length === 0 && !savedTranscripts}
              className="text-xs px-2 py-1"
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="hidden md:inline">Download</span>
            </Button>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex-1 flex flex-col min-h-0 p-3 md:p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md flex-shrink-0">
              <p className="text-xs text-red-600 break-words">
                Error: {error.message}
              </p>
            </div>
          )}

          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full w-full border rounded-md p-2 md:p-3">
              {savedTranscripts && (
                <>
                  <div className="text-xs text-muted-foreground mb-2">Previous recordings:</div>
                  <div className="text-xs mb-3 p-2 bg-muted rounded break-words whitespace-pre-wrap">
                    {savedTranscripts}
                  </div>
                  <Separator className="my-3" />
                </>
              )}
              
              {transcripts.length === 0 && !savedTranscripts ? (
                <div className="text-center text-muted-foreground py-6 md:py-8">
                  <Mic className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs md:text-sm px-2">Click &ldquo;Start&rdquo; to begin live transcription</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {transcripts.map((transcript, index) => (
                    <div
                      key={index}
                      className={cn(
                        'text-xs md:text-sm p-2 rounded-md break-words',
                        transcript.isPartial 
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                          : 'bg-green-50 border border-green-200 text-green-800'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                        <p className="flex-1 min-w-0 break-words">{transcript.text}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatTimestamp(transcript.timestamp)}
                        </span>
                      </div>
                      {transcript.isPartial && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="mt-3 text-xs text-muted-foreground flex-shrink-0 space-y-1">
            <div className="flex flex-wrap gap-x-4">
              <span>&bull; Green: Final</span>
              <span>&bull; Yellow: Processing</span>
            </div>
            <p className="hidden md:block">Transcripts auto-saved when recording stops</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
