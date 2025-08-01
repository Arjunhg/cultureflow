/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useSharedTranscription } from '@/hooks/useSharedTranscription'
// import { SharedTranscriptionResult } from '@/store/useSharedTranscriptionStore'
import { Mic, MicOff, Download, Trash2, Copy, ChevronDown, ChevronUp, X, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SharedLiveTranscriptionProps {
  className?: string
  isHost: boolean
  channel: any // StreamChat channel
  hostId?: string
  hostName?: string
  onTranscriptUpdate?: (transcript: string) => void
  onClose?: () => void
  showCloseButton?: boolean
}

export function SharedLiveTranscription({ 
  className, 
  isHost, 
  channel, 
  hostId, 
  hostName,
  onTranscriptUpdate, 
  onClose, 
  showCloseButton = false 
}: SharedLiveTranscriptionProps) {
  const [savedTranscripts, setSavedTranscripts] = useState<string>('')
  const [isMinimized, setIsMinimized] = useState(false)
  
  const {
    sharedTranscripts,
    isHostTranscribing,
    hostTranscriptionEnabled,
    isLocalLoading,
    localError,
    startHostTranscription,
    stopHostTranscription,
    clearAllTranscriptions
  } = useSharedTranscription({
    isHost,
    channel,
    hostId,
    hostName,
    onTranscript: () => {
      const fullTranscript = sharedTranscripts.map(t => t.text).join(' ')
      onTranscriptUpdate?.(fullTranscript)
    },
    onError: (error: Error) => {
      console.error('Shared transcription error:', error)
    }
  })

  const handleToggleRecording = async () => {
    if (isHost) {
      if (isHostTranscribing) {
        await stopHostTranscription()
        // Save the current transcript when stopping
        const fullTranscript = sharedTranscripts.map(t => t.text).join(' ')
        if (fullTranscript) {
          setSavedTranscripts(prev => prev + (prev ? '\n\n' : '') + fullTranscript)
        }
      } else {
        await startHostTranscription()
      }
    }
  }

  const handleClearAll = () => {
    clearAllTranscriptions()
    setSavedTranscripts('')
  }

  const handleDownloadTranscript = () => {
    const fullTranscript = savedTranscripts + (savedTranscripts ? '\n\n' : '') + sharedTranscripts.map(t => t.text).join(' ')
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
    const fullTranscript = savedTranscripts + (savedTranscripts ? '\n\n' : '') + sharedTranscripts.map(t => t.text).join(' ')
    try {
      await navigator.clipboard.writeText(fullTranscript)
    } catch (err) {
      console.error('Failed to copy transcript:', err)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const isRecording = isHost ? isHostTranscribing : hostTranscriptionEnabled
  const isLoading = isHost ? isLocalLoading : false
  const error = isHost ? localError : null

  return (
    <Card className={cn('w-full h-full flex flex-col', className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg font-semibold truncate">
            Live Transcription
            {!isHost && (
              <Badge variant="outline" className="ml-2 text-xs">
                Shared
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1 md:gap-2">
            <Badge variant={isRecording ? 'destructive' : 'secondary'} className="text-xs">
              {isRecording ? 'Recording' : 'Stopped'}
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="text-xs">Processing...</Badge>
            )}
            {!isHost && hostTranscriptionEnabled && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                Host
              </Badge>
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
            {isHost ? (
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
            ) : (
              <div className="text-xs text-muted-foreground px-2 py-1">
                {hostTranscriptionEnabled ? 'Host is transcribing' : 'Waiting for host to start'}
              </div>
            )}
            
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            
            <Button
              onClick={handleCopyTranscript}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            
            <Button
              onClick={handleDownloadTranscript}
              variant="outline"
              size="sm"
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
              
              {sharedTranscripts.length === 0 && !savedTranscripts ? (
                <div className="text-center text-muted-foreground py-6 md:py-8">
                  <Mic className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs md:text-sm px-2">
                    {isHost 
                      ? 'Click "Start" to begin live transcription for all participants'
                      : 'Host will start transcription when ready'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {sharedTranscripts.map((transcript, index) => (
                    <div
                      key={transcript.id || index}
                      className={cn(
                        'text-xs md:text-sm p-2 rounded-md break-words',
                        transcript.isPartial 
                          ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                          : 'bg-green-50 border border-green-200 text-green-800'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-xs mb-1">
                            {transcript.speakerName || 'Host'}
                          </div>
                          <div className="break-words">
                            {transcript.text}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimestamp(transcript.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {sharedTranscripts.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>• Green: Final</span>
                <span>• Yellow: Processing</span>
              </div>
              <div className="mt-1">
                Transcripts auto-saved when recording stops
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
} 