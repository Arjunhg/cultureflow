'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { assemblyAIService } from '@/lib/assemblyai/service'

export default function AssemblyAITest() {
  const [status, setStatus] = useState('Initializing...')
  const [transcripts, setTranscripts] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side before accessing browser APIs
  useEffect(() => {
    setIsClient(true)
  }, [])

  const testAssemblyAI = async () => {
    try {
      setStatus('Testing AssemblyAI connection...')
      setError(null)

      // Test 1: Check API key
      console.log('🔑 Checking API key...')
      if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {
        throw new Error('API key not found')
      }
      setStatus('✅ API key found')
      
      // Test 2: Create transcriber
      console.log('🔌 Creating transcriber...')
      const transcriber = await assemblyAIService.startStreaming()
      setStatus('✅ Transcriber created')

      // Test 3: Set up listeners
      transcriber.on('open', () => {
        console.log('🔓 Connection opened')
        setStatus('✅ Connection opened')
      })

      transcriber.on('transcript', (transcript: any) => {
        console.log('📝 Transcript received:', transcript)
        setTranscripts(prev => [...prev, transcript.text])
        setStatus('✅ Receiving transcripts')
      })

      transcriber.on('error', (error: any) => {
        console.error('❌ Transcription error:', error)
        setError(error.message)
        setStatus('❌ Error occurred')
      })

      // Test 4: Get microphone
      console.log('🎤 Requesting microphone...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1
        }
      })
      setStatus('✅ Microphone access granted')

      // Test 5: Start recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('🎵 Audio data:', event.data.size, 'bytes')
          event.data.arrayBuffer().then(buffer => {
            transcriber.sendAudio(new Uint8Array(buffer))
          })
        }
      }

      mediaRecorder.start(250)
      setIsRecording(true)
      setStatus('🎤 Recording and transcribing...')

      // Auto-stop after 30 seconds
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach(track => track.stop())
        transcriber.close()
        setIsRecording(false)
        setStatus('⏹️ Test completed')
      }, 30000)

    } catch (err: any) {
      console.error('❌ Test failed:', err)
      setError(err.message)
      setStatus('❌ Test failed')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AssemblyAI Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p className={`${error ? 'text-red-600' : 'text-green-600'}`}>
            {status}
          </p>
          {error && (
            <p className="text-red-600 mt-2">
              Error: {error}
            </p>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Environment Check:</h2>
          {isClient ? (
            <ul className="text-sm space-y-1">
              <li>API Key: {process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY ? '✅ Present' : '❌ Missing'}</li>
              <li>MediaDevices: {navigator.mediaDevices ? '✅ Supported' : '❌ Not supported'}</li>
              <li>MediaRecorder: {window.MediaRecorder ? '✅ Supported' : '❌ Not supported'}</li>
              <li>HTTPS: {location.protocol === 'https:' || location.hostname === 'localhost' ? '✅ Secure context' : '❌ Insecure context'}</li>
            </ul>
          ) : (
            <p className="text-gray-500">Loading environment checks...</p>
          )}
        </div>

        <button
          onClick={testAssemblyAI}
          disabled={isRecording || !isClient}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {!isClient ? 'Loading...' : isRecording ? 'Recording... (30s test)' : 'Start AssemblyAI Test'}
        </button>

        {transcripts.length > 0 && (
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Transcripts:</h2>
            <div className="space-y-2">
              {transcripts.map((transcript, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded">
                  {transcript}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
