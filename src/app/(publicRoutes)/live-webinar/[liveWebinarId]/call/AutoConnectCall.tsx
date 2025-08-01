'use client'
import { changeCallStatus } from '@/actions/attendance'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Button } from '@/components/ui/button'
import { WebinarWithPresenter } from '@/lib/types'
import { cn } from '@/lib/utils'
import { vapi } from '@/lib/vapi/vapiclient'
import { CallStatusEnum } from '@prisma/client'
import { Bot, Clock, Loader2, Mic, MicOff, PhoneOff } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { VapiLiveTranscription } from '@/components/ui/VapiLiveTranscription'


const CallStatus = {
  CONNECTING: 'CONNECTING',
  ACTIVE: 'ACTIVE',
  FINISHED: 'FINISHED',
}

type Props = {
  userName?: string
  assistantId: string
  assistantName?: string
  callTimeLimit?: number
  webinar: WebinarWithPresenter
  userId: string
}

const AutoConnectCall = ({
  userName = 'User',
  assistantId,
  assistantName = 'Ai Assistant',
  callTimeLimit = 3000,
  // webinar,
  userId,
}: Props) => {
  const [callStatus, setCallStatus] = useState(CallStatus.CONNECTING)
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false)
  const [userIsSpeaking, setUserIsSpeaking] = useState(false)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(callTimeLimit)

  const refs = useRef({
    countdownTimer: undefined as NodeJS.Timeout | undefined,
    audioStream: null as MediaStream | null,
    userSpeakingTimeout: undefined as NodeJS.Timeout | undefined,
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const cleanup = () => {
    if (refs.current.countdownTimer) {
      clearInterval(refs.current.countdownTimer)
      refs.current.countdownTimer = undefined
    }

    if (refs.current.userSpeakingTimeout) {
      clearTimeout(refs.current.userSpeakingTimeout)
      refs.current.userSpeakingTimeout = undefined
    }

    if (refs.current.audioStream) {
      refs.current.audioStream.getTracks().forEach((track) => track.stop())
      refs.current.audioStream = null
    }
  }

  // Simple audio setup for speech detection
  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      refs.current.audioStream = stream

      // Simple speech detection using AudioContext
      const audioContext = new (window.AudioContext || window.AudioContext)()
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 256

      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyzer)

      // Monitor audio levels
      const checkAudioLevel = () => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount)
        analyzer.getByteFrequencyData(dataArray)

        // Calculate average volume
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedVolume = average / 256

        // Detect speech based on volume
        if (normalizedVolume > 0.15 && !assistantIsSpeaking && !isMicMuted) {
          setUserIsSpeaking(true)

          // Clear previous timeout
          if (refs.current.userSpeakingTimeout) {
            clearTimeout(refs.current.userSpeakingTimeout)
          }

          // Reset after short delay
          refs.current.userSpeakingTimeout = setTimeout(() => {
            setUserIsSpeaking(false)
          }, 500)
        }

        // Continue monitoring
        requestAnimationFrame(checkAudioLevel)
      }

      checkAudioLevel()
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }

  const stopCall = async () => {
    try {
      vapi.stop()
      setCallStatus(CallStatus.FINISHED)
      cleanup()
      const res = await changeCallStatus(userId, CallStatusEnum.COMPLETED)
      if (!res.success) {
        throw new Error('Failed to update call status')
      }
      toast.success('Call ended successfully')
    } catch (error) {
      console.error('Failed to stop call:', error)
      toast.error('Failed to stop call. Please try again.')
    }
  }

  const toggleMicMute = () => {
    if (refs.current.audioStream) {
      refs.current.audioStream.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted // Toggle from current state
      })
    }
    setIsMicMuted(!isMicMuted)
  }

  const startCall = async () => {
    try {
      console.log('Starting call with assistant ID:', assistantId)
      setCallStatus(CallStatus.CONNECTING)
      
      // Update call status to InProgress first
      const statusRes = await changeCallStatus(userId, CallStatusEnum.InProgress)
      if (!statusRes.success) {
        throw new Error('Failed to update call status to InProgress')
      }
      
      // Start the VAPI call
      await vapi.start(assistantId)
      
      console.log('VAPI call started successfully')
      toast.success('Call started successfully')
    } catch (error) {
      console.error('Failed to start call:', error)
      toast.error(`Failed to start call: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setCallStatus(CallStatus.FINISHED)
      
      // Reset call status to PENDING if call fails to start
      try {
        await changeCallStatus(userId, CallStatusEnum.PENDING)
      } catch (statusError) {
        console.error('Failed to reset call status:', statusError)
      }
    }
  }

  // Call setup & cleanup
  useEffect(() => {
    // Start the call immediately on mount
    startCall()

    // Return cleanup function
    return () => {
      stopCall()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array means this runs once on mount

  useEffect(() => {
    const onCallStart = async () => {
      console.log('Call started')
      setCallStatus(CallStatus.ACTIVE)
      setupAudio()

      // Start countdown timer from 3 minutes
      setTimeRemaining(callTimeLimit)
      refs.current.countdownTimer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(refs.current.countdownTimer)
            stopCall()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    const onCallEnd = () => {
      console.log('Call ended')
      setCallStatus(CallStatus.FINISHED)
      cleanup()
    }

    const onSpeechStart = () => {
      setAssistantIsSpeaking(true)
    }

    const onSpeechEnd = () => {
      setAssistantIsSpeaking(false)
    }

    const onError = (error: Error) => {
      console.error('Vapi error:', error)
      setCallStatus(CallStatus.FINISHED)
      cleanup()
    }

    vapi.on('call-start', onCallStart)
    vapi.on('call-end', onCallEnd)
    vapi.on('speech-start', onSpeechStart)
    vapi.on('speech-end', onSpeechEnd)
    vapi.on('error', onError)

    return () => {
      vapi.off('call-start', onCallStart)
      vapi.off('call-end', onCallEnd)
      vapi.off('speech-start', onSpeechStart)
      vapi.off('speech-end', onSpeechEnd)
      vapi.off('error', onError)
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, callTimeLimit])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 relative">
        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg relative border border-white/20">
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm flex items-center gap-2 z-10">
            <Mic
              className={cn(
                'h-4 w-4',
                assistantIsSpeaking ? 'text-purple-400' : ''
              )}
            />
            <span className="font-medium">{assistantName}</span>
          </div>

          <div className="h-full flex items-center justify-center">
            <div className="relative">
              {assistantIsSpeaking && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping opacity-20"
                    style={{ margin: '-8px' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping opacity-10"
                    style={{ margin: '-16px', animationDelay: '0.5s' }}
                  />
                </>
              )}

              <div
                className={cn(
                  'flex justify-center items-center rounded-full overflow-hidden border-4 p-8',
                  assistantIsSpeaking
                    ? 'border-purple-400'
                    : 'border-purple-400/50'
                )}
              >
                <Bot className="w-[80px] h-[80px] text-purple-600 dark:text-purple-400" />
              </div>

              {assistantIsSpeaking && (
                <div className="absolute -bottom-2 -right-2 bg-purple-400 text-white p-3 rounded-full shadow-lg">
                  <Mic className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg relative border border-white/20">
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm flex items-center gap-2 z-10">
            {isMicMuted ? (
              <>
                <MicOff className="h-4 w-4 text-red-400" />
                <span className="font-medium">Muted</span>
              </>
            ) : (
              <>
                <Mic
                  className={cn(
                    'h-4 w-4',
                    userIsSpeaking ? 'text-blue-400' : ''
                  )}
                />
                <span className="font-medium">{userName}</span>
              </>
            )}
          </div>

          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm flex items-center gap-2 z-10">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>

          <div className="h-full flex items-center justify-center">
            <div className="relative">
              {userIsSpeaking && !isMicMuted && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"
                    style={{ margin: '-8px' }}
                  />
                </>
              )}

              <div
                className={cn(
                  'flex justify-center items-center rounded-full overflow-hidden border-4',
                  isMicMuted
                    ? 'border-red-400/50'
                    : userIsSpeaking
                    ? 'border-blue-400'
                    : 'border-blue-400/50'
                )}
              >
                <Avatar className="w-[120px] h-[120px]">
                  <AvatarImage
                    src="/user-avatar.png"
                    alt={userName}
                  />
                  <AvatarFallback className="text-2xl font-bold">{userName.split('')?.[0]}</AvatarFallback>
                </Avatar>
              </div>

              {isMicMuted && (
                <div className="absolute -bottom-2 -right-2 bg-red-400 text-white p-3 rounded-full shadow-lg">
                  <MicOff className="h-6 w-6" />
                </div>
              )}

              {userIsSpeaking && !isMicMuted && (
                <div className="absolute -bottom-2 -right-2 bg-blue-400 text-white p-3 rounded-full shadow-lg">
                  <Mic className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        </div>

        {callStatus === CallStatus.CONNECTING && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4 z-20 rounded-3xl">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Connecting...</h3>
          </div>
        )}

        {callStatus === CallStatus.FINISHED && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center flex-col gap-4 z-20 rounded-3xl">
            <h3 className="text-2xl font-bold text-white">Call Ended</h3>
            <p className="text-gray-300">Time limit reached</p>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {callStatus === CallStatus.ACTIVE && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span
                  className={cn(
                    'text-lg font-semibold',
                    timeRemaining < 30
                      ? 'text-red-500 animate-pulse'
                      : timeRemaining < 60
                      ? 'text-orange-500'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  {formatTime(timeRemaining)} remaining
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMicMute}
              className={cn(
                'p-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg',
                isMicMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-gray-900 dark:text-white border border-white/20'
              )}
              disabled={callStatus !== CallStatus.ACTIVE}
            >
              {isMicMuted ? (
                <MicOff className="h-7 w-7" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>

            <button
              onClick={stopCall}
              className="p-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="End call"
              disabled={callStatus !== CallStatus.ACTIVE}
            >
              <PhoneOff className="h-7 w-7" />
            </button>
          </div>

          <div className="hidden md:block">
            {callStatus === CallStatus.ACTIVE && timeRemaining < 30 && (
              <span className="text-red-500 font-bold text-lg">
                Call ending soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Live Transcription Panel */}
      {callStatus === CallStatus.ACTIVE && (
        <div
          className="fixed bottom-8 right-8 z-50 max-w-md w-full sm:w-96 shadow-2xl rounded-2xl bg-slate-900/80 border border-slate-700 backdrop-blur-lg animate-fade-in"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        >
          <div className="max-h-[60vh] overflow-y-auto p-4">
            <VapiLiveTranscription
              className="!bg-transparent !shadow-none !p-0"
              userName={userName}
              assistantName={assistantName}
              showCloseButton={false}
              onTranscriptUpdate={(transcript) => {
                console.log('Full conversation transcript:', transcript)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AutoConnectCall
