/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback } from 'react'
import { useSharedTranscriptionStore, SharedTranscriptionResult } from '@/store/useSharedTranscriptionStore'
import { useAssemblyAITranscription } from './useAssemblyAITranscription'

interface UseSharedTranscriptionOptions {
  isHost: boolean
  channel: any // StreamChat channel
  hostId?: string
  hostName?: string
  onTranscript?: (transcript: SharedTranscriptionResult) => void
  onError?: (error: Error) => void
}

export function useSharedTranscription({
  isHost,
  channel,
  hostId,
  hostName,
  onTranscript,
  onError
}: UseSharedTranscriptionOptions) {
  const {
    sharedTranscripts,
    isHostTranscribing,
    hostTranscriptionEnabled,
    addSharedTranscript,
    setHostTranscribing,
    setHostTranscriptionEnabled,
    clearSharedTranscripts
  } = useSharedTranscriptionStore()

  // const localTranscriptionRef = useRef<any>(null)

  // Local transcription for host
  const {
    isRecording: isLocalRecording,
    isLoading: isLocalLoading,
    transcripts: localTranscripts,
    error: localError,
    startRecording: startLocalRecording,
    stopRecording: stopLocalRecording,
    clearTranscripts: clearLocalTranscripts
  } = useAssemblyAITranscription({
    onTranscript: (result) => {
      if (isHost && channel) {
        // Broadcast host transcription to all participants
        const sharedTranscript: SharedTranscriptionResult = {
          id: `${hostId}-${Date.now()}`,
          text: result.text,
          timestamp: result.timestamp,
          isPartial: result.isPartial,
          speakerId: hostId,
          speakerName: hostName || 'Host'
        }

        // Add to local shared store
        addSharedTranscript(sharedTranscript)

        // Broadcast to all participants via StreamChat
        channel.sendEvent({
          type: 'host_transcription',
          data: sharedTranscript
        })

        onTranscript?.(sharedTranscript)
      }
    },
    onError: (error) => {
      console.error('Local transcription error:', error)
      onError?.(error)
    }
  })

  // Listen for host transcription events from StreamChat
  useEffect(() => {
    if (!channel) return

    const handleHostTranscription = (event: any) => {
      if (event.type === 'host_transcription' && !isHost) {
        const transcript: SharedTranscriptionResult = event.data
        addSharedTranscript(transcript)
        onTranscript?.(transcript)
      }
    }

    const handleTranscriptionToggle = (event: any) => {
      if (event.type === 'transcription_toggle') {
        setHostTranscriptionEnabled(event.data.enabled)
      }
    }

    const handleTranscriptionClear = (event: any) => {
      if (event.type === 'transcription_clear') {
        clearSharedTranscripts()
      }
    }

    channel.on(handleHostTranscription)
    channel.on(handleTranscriptionToggle)
    channel.on(handleTranscriptionClear)

    return () => {
      channel.off(handleHostTranscription)
      channel.off(handleTranscriptionToggle)
      channel.off(handleTranscriptionClear)
    }
  }, [channel, isHost, addSharedTranscript, setHostTranscriptionEnabled, clearSharedTranscripts, onTranscript])

  // Host controls
  const startHostTranscription = useCallback(async () => {
    if (!isHost || !channel) return

    try {
      setHostTranscribing(true)
      await startLocalRecording()
      
      // Notify all participants that host transcription started
      channel.sendEvent({
        type: 'transcription_toggle',
        data: { enabled: true }
      })
    } catch (error) {
      console.error('Failed to start host transcription:', error)
      setHostTranscribing(false)
      onError?.(error as Error)
    }
  }, [isHost, channel, startLocalRecording, setHostTranscribing, onError])

  const stopHostTranscription = useCallback(async () => {
    if (!isHost || !channel) return

    try {
      await stopLocalRecording()
      setHostTranscribing(false)
      
      // Notify all participants that host transcription stopped
      channel.sendEvent({
        type: 'transcription_toggle',
        data: { enabled: false }
      })
    } catch (error) {
      console.error('Failed to stop host transcription:', error)
      onError?.(error as Error)
    }
  }, [isHost, channel, stopLocalRecording, setHostTranscribing, onError])

  const clearAllTranscriptions = useCallback(() => {
    if (isHost && channel) {
      // Notify all participants to clear transcriptions
      channel.sendEvent({
        type: 'transcription_clear'
      })
    }
    clearSharedTranscripts()
    if (isHost) {
      clearLocalTranscripts()
    }
  }, [isHost, channel, clearSharedTranscripts, clearLocalTranscripts])

  // Reset store when component unmounts
  useEffect(() => {
    return () => {
      if (isHost) {
        setHostTranscribing(false)
      }
    }
  }, [isHost, setHostTranscribing])

  return {
    // Shared state
    sharedTranscripts,
    isHostTranscribing,
    hostTranscriptionEnabled,
    
    // Local state (for host)
    isLocalRecording,
    isLocalLoading,
    localTranscripts,
    localError,
    
    // Actions
    startHostTranscription,
    stopHostTranscription,
    clearAllTranscriptions,
    
    // Local actions (for host)
    startLocalRecording,
    stopLocalRecording,
    clearLocalTranscripts
  }
} 