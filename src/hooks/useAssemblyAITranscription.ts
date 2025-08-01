/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react'
import { assemblyAIService } from '@/lib/assemblyai/service'

export interface TranscriptionResult {
  text: string
  timestamp: number
  isPartial: boolean
}

export interface UseAssemblyAITranscriptionOptions {
  autoStart?: boolean
  onTranscript?: (result: TranscriptionResult) => void
  onError?: (error: Error) => void
}

export function useAssemblyAITranscription(options: UseAssemblyAITranscriptionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcripts, setTranscripts] = useState<TranscriptionResult[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  // const audioChunksRef = useRef<Blob[]>([])
  
  // Use refs to track processing state and user intent
  const isProcessingRef = useRef(false)
  const userStoppedRef = useRef(false)


  const startRecording = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      streamRef.current = stream

      // Start AssemblyAI streaming
      const transcriber = await assemblyAIService.startStreaming()
      
      // Set up transcription event listeners
      transcriber.on('turn', (turn: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.log('Received turn from AssemblyAI:', turn);
        if (turn.transcript) {
          const result: TranscriptionResult = {
            text: turn.transcript,
            timestamp: Date.now(),
            isPartial: !turn.end_of_turn
          }
          
          setTranscripts(prev => [...prev, result])
          options.onTranscript?.(result)
        }
      })

      transcriber.on('error', (error: Error) => {
        console.error('AssemblyAI transcription error:', error);
        setError(error)
        options.onError?.(error)
      })

      transcriber.on('close', (code: number, reason: string) => {
        console.log('AssemblyAI connection closed:', code, reason);
        
        // Only stop processing if the user actually requested it
        if (userStoppedRef.current) {
          console.log('User initiated stop → cleaning up audio.')
          isProcessingRef.current = false
        } else {
          console.warn('Server closed the socket; continuing to record…')
          // Don't stop processing - let the user manually restart if needed
          setError(new Error(`Connection lost: ${reason}. Recording continues...`))
        }
      })

      // Set up audio context for PCM16 capture
      const audioContext = new AudioContext({ sampleRate: 16000 })
      
      // Resume audio context to prevent suspension
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
      
      const source = audioContext.createMediaStreamSource(stream)
      
      // Use a simpler approach with AnalyserNode instead of ScriptProcessor
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      source.connect(analyser)
      
      // Create a controlled audio processing loop
      let lastSendTime = 0
      const SEND_INTERVAL = 50 // Send every 50ms
      
      const processAudio = () => {
        if (!isProcessingRef.current) {
          console.log('Audio processing stopped - isProcessingRef set to false')
          return
        }
        
        try {
          const now = Date.now()
          if (now - lastSendTime >= SEND_INTERVAL) {
            // Check if audio context is suspended and resume if needed
            if (audioContext.state === 'suspended') {
              console.log('Audio context suspended, resuming...')
              audioContext.resume()
            }
            
            analyser.getByteTimeDomainData(dataArray)
            
            // Convert to PCM16
            const pcmData = new Int16Array(bufferLength)
            for (let i = 0; i < bufferLength; i++) {
              const sample = (dataArray[i] - 128) / 128
              pcmData[i] = Math.max(-32768, Math.min(32767, sample * 32768))
            }
            
            // Send to AssemblyAI
            try {
              transcriber.sendAudio(new Uint8Array(pcmData.buffer))
              lastSendTime = now
            } catch (error) {
              console.error('Error sending audio to AssemblyAI:', error)
              // Don't stop processing on send errors - just skip this chunk
            }
          }
          
          // Continue processing
          if (isProcessingRef.current) {
            setTimeout(processAudio, 10) // Check every 10ms
          } else {
            console.log('Audio processing stopped - isProcessingRef set to false')
          }
        } catch (globalError) {
          console.error('Critical error in audio processing:', globalError)
          const errorMessage = globalError instanceof Error ? globalError.message : String(globalError)
          setError(new Error(`Audio processing error: ${errorMessage}`))
          // Continue processing even on errors to maintain stability
          if (isProcessingRef.current) {
            setTimeout(processAudio, 100) // Slower retry on errors
          }
        }
      }
      
      // Start processing
      isProcessingRef.current = true
      userStoppedRef.current = false
      processAudio()
      
      // Store references for cleanup
      mediaRecorderRef.current = {
        stop: () => {
          console.log(
            '%c[mediaRecorderRef.stop] called — userStoppedRef=%s',
            'color: orange; font-weight: bold;',
            userStoppedRef.current
          );
          console.trace();    // <— this will show you exactly what called it
          userStoppedRef.current = true;
          isProcessingRef.current = false;
          source.disconnect();
          analyser.disconnect();
          audioContext.close();
        }
      } as any;
      
      
      // Set up periodic check to keep audio context active
      const audioContextCheckInterval = setInterval(() => {
        if (audioContext.state === 'suspended') {
          console.log('Audio context suspended, resuming...')
          audioContext.resume()
        }
      }, 1000) // Check every second
      
      // Store the interval for cleanup
      ;(mediaRecorderRef.current as any).interval = audioContextCheckInterval
      
      setIsRecording(true)
      setIsLoading(false)
      
    } catch (err) {
      const error = err as Error
      setError(error)
      setIsLoading(false)
      options.onError?.(error)
    }
  }, [options])

  const stopRecording = useCallback(async () => {
    try {
      setIsLoading(true)

      if (mediaRecorderRef.current) {
        // Clear the audio context check interval
        if ((mediaRecorderRef.current as any).interval) {
          clearInterval((mediaRecorderRef.current as any).interval)
        }
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      await assemblyAIService.stopStreaming()
      setIsRecording(false)
      setIsLoading(false)
      
    } catch (err) {
      const error = err as Error
      setError(error)
      setIsLoading(false)
      options.onError?.(error)
    }
  }, [options])

  const clearTranscripts = useCallback(() => {
    setTranscripts([])
  }, [])

  const getFullTranscript = useCallback(() => {
    return transcripts
      .filter(t => !t.isPartial)
      .map(t => t.text)
      .join(' ')
  }, [transcripts])

  // Auto-start if requested
  useEffect(() => {
    if (!options.autoStart) return;
  
    // defer to next tick—beyond StrictMode’s double‑mount
    const id = setTimeout(() => startRecording(), 0);
    return () => clearTimeout(id);
  }, [options.autoStart, startRecording]);
  

  useEffect(() => {
    return () => {
      // Direct cleanup without calling stopRecording
      if (isProcessingRef.current) {
        isProcessingRef.current = false;
        userStoppedRef.current = true;
      }
      // Clean up streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, []) // Empty dependency array

  useEffect(() => {
    console.log('Mounted useAssemblyAITranscription')
    return () => {
      console.log('Unmounted useAssemblyAITranscription')
    }
  }, [])
  

  return {
    isRecording,
    isLoading,
    transcripts,
    error,
    startRecording,
    stopRecording,
    clearTranscripts,
    getFullTranscript
  }
}
