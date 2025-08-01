/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAssemblyAITranscription } from '@/hooks/useAssemblyAITranscription'
import { 
  Mic, 
  Download, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  X,
  Bot,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { vapi } from '@/lib/vapi/vapiclient'

interface TranscriptMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  isPartial?: boolean
}

interface VapiLiveTranscriptionProps {
  className?: string
  onTranscriptUpdate?: (transcript: TranscriptMessage[]) => void
  onClose?: () => void
  showCloseButton?: boolean
  userName?: string
  assistantName?: string
}

export function VapiLiveTranscription({ 
  className, 
  onTranscriptUpdate, 
  onClose, 
  showCloseButton = false,
  userName = 'You',
  assistantName = 'AI Assistant'
}: VapiLiveTranscriptionProps) {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVapiConnected, setIsVapiConnected] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  
  const {
    isRecording,
    isLoading,
    error,
    startRecording,
    stopRecording,
    clearTranscripts
  } = useAssemblyAITranscription({
    onTranscript: (result) => {
      // Add user transcription to combined transcript
      const userMessage: TranscriptMessage = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        text: result.text,
        timestamp: result.timestamp,
        isPartial: result.isPartial
      }
      
      setTranscript(prev => {
        // If this is a partial transcript, replace the last partial user message
        if (result.isPartial) {
          const newTranscript = [...prev]
          const lastMessageIndex = newTranscript.length - 1
          if (lastMessageIndex >= 0 && 
              newTranscript[lastMessageIndex].role === 'user' && 
              newTranscript[lastMessageIndex].isPartial) {
            newTranscript[lastMessageIndex] = userMessage
            return newTranscript
          }
        } else {
          // Final transcript - remove any partial user messages first
          const filteredTranscript = prev.filter(msg => 
            !(msg.role === 'user' && msg.isPartial)
          )
          return [...filteredTranscript, userMessage]
        }
        return [...prev, userMessage]
      })
    },
    onError: (error: Error) => {
      console.error('AssemblyAI transcription error:', error)
    }
  })

  // VAPI Event Handlers
  useEffect(() => {
    console.log('Setting up VAPI event listeners...')
    
    // Log ALL events to debug what's happening
    const originalEmit = vapi.emit.bind(vapi)
    // const originalOn = vapi.on.bind(vapi)
    
    // Override emit to log all events
    vapi.emit = function(event: any, ...args: any[]) {
      console.log(`🔥 VAPI EMIT [${event}]:`, args)
      return originalEmit(event, ...args)
    }
    
    // Generic event logger to catch all events
    const logAllEvents = (eventName: string) => {
      return (data: any) => {
        console.log(`🎭 VAPI Event [${eventName}]:`, data)
        
        // If this is a message event, also try to process it
        if (eventName === 'message') {
          handleVapiMessage(data)
        }
      }
    }
    
    const handleVapiMessage = (message: any) => {
      console.log('🎯 VAPI Message received:', message)
      
      // Handle various message types from VAPI
      if (message.type === 'conversation-update' && message.conversation) {
        console.log('📝 Conversation update received:', message.conversation)
        
        // Process the entire conversation from VAPI
        const updatedTranscript: TranscriptMessage[] = []
        
        message.conversation.forEach((msg: any, index: number) => {
          const messageId = `${msg.role}-${index}-${Date.now()}`
          const transcriptMessage: TranscriptMessage = {
            id: messageId,
            role: msg.role === 'user' ? 'user' : 'assistant',
            text: msg.content || msg.message || msg.text || '',
            timestamp: Date.now() - (message.conversation.length - index) * 2000,
            isPartial: false
          }
          
          if (transcriptMessage.text) {
            updatedTranscript.push(transcriptMessage)
          }
        })
        
        setTranscript(updatedTranscript)
      }
      
      // Handle assistant messages (try different variations)
      if (message.type === 'assistant-message' || 
          (message.role === 'assistant' && message.content) ||
          message.role === 'assistant' ||
          message.type === 'assistant') {
        console.log('🤖 Assistant message received:', message)
        
        const text = message.content || message.text || message.message || message.transcript || ''
        
        if (text) {
          const aiMessage: TranscriptMessage = {
            id: `assistant-${Date.now()}-${Math.random()}`,
            role: 'assistant',
            text: text,
            timestamp: Date.now(),
            isPartial: false
          }
          
          setTranscript(prev => [...prev, aiMessage])
        }
      }
      
      // Handle user messages (try different variations)
      if (message.type === 'user-message' || 
          (message.role === 'user' && message.content) ||
          message.role === 'user' ||
          message.type === 'user') {
        console.log('👤 User message received:', message)
        
        const text = message.content || message.text || message.message || message.transcript || ''
        
        if (text) {
          const userMessage: TranscriptMessage = {
            id: `user-${Date.now()}-${Math.random()}`,
            role: 'user',
            text: text,
            timestamp: Date.now(),
            isPartial: false
          }
          
          setTranscript(prev => [...prev, userMessage])
        }
      }
      
      // Handle transcript messages (real-time transcription)
      if (message.type === 'transcript') {
        console.log('📋 Transcript received:', message)
        
        const transcriptMessage: TranscriptMessage = {
          id: `transcript-${Date.now()}-${Math.random()}`,
          role: message.role || 'assistant',
          text: message.transcript || message.text || '',
          timestamp: Date.now(),
          isPartial: message.isPartial || false
        }
        
        if (transcriptMessage.text) {
          setTranscript(prev => [...prev, transcriptMessage])
        }
      }
      
      // Handle function calls
      if (message.type === 'function-call' && message.functionCall) {
        console.log('⚙️ Function call received:', message.functionCall)
        
        const functionMessage: TranscriptMessage = {
          id: `function-${Date.now()}-${Math.random()}`,
          role: 'assistant',
          text: `[Function: ${message.functionCall.name}] ${JSON.stringify(message.functionCall.parameters || {})}`,
          timestamp: Date.now(),
          isPartial: false
        }
        
        setTranscript(prev => [...prev, functionMessage])
      }
    }

    const handleCallStart = () => {
      console.log('📞 VAPI call started - enabling transcription')
      setIsVapiConnected(true)
      setTranscript([]) // Clear previous transcript
      startRecording() // Start AssemblyAI for user voice
    }

    const handleCallEnd = () => {
      console.log('📞 VAPI call ended - stopping transcription')
      setIsVapiConnected(false)
      stopRecording() // Stop AssemblyAI
    }

    const handleSpeechStart = () => {
      console.log('🗣️ AI speech started')
      // We could add a placeholder for the AI message here
    }

    const handleSpeechEnd = () => {
      console.log('🤫 AI speech ended')
      // When AI speech ends, we should try to get the text that was spoken
      // For now, let's add a mock message to test the functionality
      setTimeout(() => {
        const aiMessage: TranscriptMessage = {
          id: `assistant-speech-${Date.now()}-${Math.random()}`,
          role: 'assistant',
          text: '[AI Response] - Speech detected but text not captured from VAPI',
          timestamp: Date.now(),
          isPartial: false
        }
        
        console.log('🤖 Adding AI speech end placeholder message')
        setTranscript(prev => [...prev, aiMessage])
      }, 100)
    }

    const handleError = (error: any) => {
      console.error('❌ VAPI error:', error)
    }

    // Register VAPI event listeners with only valid event names
    console.log('📡 Registering VAPI event listeners...')
    
    // Core call events
    vapi.on('call-start', handleCallStart)
    vapi.on('call-end', handleCallEnd)
    vapi.on('speech-start', handleSpeechStart)
    vapi.on('speech-end', handleSpeechEnd)
    vapi.on('error', handleError)
    
    // Main message event - this should capture all message types
    vapi.on('message', handleVapiMessage)
    
    // Add debug listeners for other potential events
    const eventNames = ['transcript', 'response', 'conversation', 'volume-level', 'hang', 'function-call']
    eventNames.forEach(eventName => {
      try {
        vapi.on(eventName as any, logAllEvents(eventName))
      } catch (e) {
        console.log(`❌ Could not register listener for ${eventName}:`, e)
      }
    })

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up VAPI event listeners...')
      
      vapi.off('call-start', handleCallStart)
      vapi.off('call-end', handleCallEnd)
      vapi.off('speech-start', handleSpeechStart)
      vapi.off('speech-end', handleSpeechEnd)
      vapi.off('error', handleError)
      vapi.off('message', handleVapiMessage)
      
      // Clean up debug listeners
      eventNames.forEach(eventName => {
        try {
          vapi.off(eventName as any, logAllEvents(eventName))
        } catch (e) {
          // Ignore cleanup errors
          console.log(`❌ Could not remove listener for ${eventName}:`, e)
        }
      })
      
      // Restore original emit
      vapi.emit = originalEmit
    }
  }, [startRecording, stopRecording])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  // Update parent component with transcript changes
  useEffect(() => {
    onTranscriptUpdate?.(transcript)
  }, [transcript, onTranscriptUpdate])

  const handleClearAll = useCallback(() => {
    setTranscript([])
    clearTranscripts()
  }, [clearTranscripts])

  const handleDownloadTranscript = useCallback(() => {
    const fullTranscript = transcript
      .map(msg => `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.role === 'user' ? userName : assistantName}: ${msg.text}`)
      .join('\n')
    
    const blob = new Blob([fullTranscript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-interview-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [transcript, userName, assistantName])

  const handleCopyTranscript = useCallback(async () => {
    const fullTranscript = transcript
      .map(msg => `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.role === 'user' ? userName : assistantName}: ${msg.text}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(fullTranscript)
    } catch (err) {
      console.error('Failed to copy transcript:', err)
    }
  }, [transcript, userName, assistantName])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card className={cn('w-full h-full flex flex-col', className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base md:text-lg font-semibold truncate">
            AI Interview Transcript
          </CardTitle>
          <div className="flex items-center gap-1 md:gap-2">
            <Badge variant={isVapiConnected && isRecording ? 'destructive' : 'secondary'} className="text-xs">
              {isVapiConnected && isRecording ? 'Recording' : 'Stopped'}
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
              className="p-1 h-6 w-6"
            >
              {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex flex-wrap items-center gap-1 md:gap-2">
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              disabled={transcript.length === 0}
              className="text-xs px-2 py-1"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            
            <Button
              onClick={handleCopyTranscript}
              variant="outline"
              size="sm"
              disabled={transcript.length === 0}
              className="text-xs px-2 py-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            
            <Button
              onClick={handleDownloadTranscript}
              variant="outline"
              size="sm"
              disabled={transcript.length === 0}
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
              {transcript.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 md:py-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Mic className="h-6 w-6 md:h-8 md:w-8 opacity-50" />
                    <Bot className="h-6 w-6 md:h-8 md:w-8 opacity-50" />
                  </div>
                  <p className="text-xs md:text-sm px-2">AI interview transcript will appear here during the call</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {transcript.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'text-xs md:text-sm p-3 rounded-lg break-words',
                        message.role === 'user' 
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 ml-0 mr-8' 
                          : 'bg-purple-50 border border-purple-200 text-purple-900 ml-8 mr-0',
                        message.isPartial && 'opacity-70 animate-pulse'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 font-medium">
                          {message.role === 'user' ? (
                            <>
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span>{userName}</span>
                            </>
                          ) : (
                            <>
                              <Bot className="h-3 w-3 flex-shrink-0" />
                              <span>{assistantName}</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="min-w-0 break-words">{message.text}</p>
                      {message.isPartial && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="mt-3 text-xs text-muted-foreground flex-shrink-0 space-y-1">
            <div className="flex flex-wrap gap-x-4">
              <span>• Blue: {userName}</span>
              <span>• Purple: {assistantName}</span>
            </div>
            <p className="hidden md:block">Transcript auto-saved during conversation</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
