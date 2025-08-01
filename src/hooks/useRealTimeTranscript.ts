'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealTimeTranscriptOptions {
  sessionId?: string;
  onTranscriptUpdate?: (transcript: string, chunk: string) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface TranscriptState {
  transcript: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastChunk: string;
}

export function useRealTimeTranscript({
  onTranscriptUpdate,
  enabled = false
}: UseRealTimeTranscriptOptions) {
  const [state, setState] = useState<TranscriptState>({
    transcript: '',
    isConnected: false,
    isConnecting: false,
    error: null,
    lastChunk: ''
  });

  const wsRef = useRef<WebSocket | null>(null);
  const transcriptRef = useRef<string>('');
  const connectionAttemptRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isProcessingRef = useRef(false);

  // Connect to AssemblyAI real-time transcription
  const connect = useCallback(async (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      // Check current state to prevent duplicate connections
      if (!enabled || state.isConnecting || state.isConnected) {
        resolve(false);
        return;
      }

      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      try {
        // Get microphone access first
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        streamRef.current = stream;
        console.log('Microphone access granted');

        // Set up audio context for PCM16 capture
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        
        // Resume audio context to prevent suspension
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        // Get temporary token for AssemblyAI
        const response = await fetch('/api/assemblyai-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to get AssemblyAI token: ${response.status}`);
        }

        const { token, demo, error } = await response.json();
        
        console.log('Received token response:', { 
          tokenType: demo ? 'demo' : 'real',
          tokenLength: token?.length || 0,
          tokenStart: token?.substring(0, 20) + '...',
          hasError: !!error
        });

        // If we got a demo token, fall back to simulation
        if (demo || token === 'demo-token-for-simulation') {
          console.log('Demo token received, falling back to simulation');
          // Clean up audio resources before falling back
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          setState(prev => ({ 
            ...prev, 
            isConnecting: false,
            error: 'Demo mode - using simulation'
          }));
          resolve(false);
          return;
        }

        // Validate token format
        if (!token || token.length < 100) {
          throw new Error('Invalid token received from server');
        }

        // Create WebSocket connection to AssemblyAI Universal Streaming (v3)
        const wsUrl = `wss://streaming.assemblyai.com/v3/ws?token=${token}&sample_rate=16000&encoding=pcm_s16le&format_turns=true`;
        console.log('Attempting to connect to AssemblyAI Universal Streaming WebSocket...');
        
        const socket = new WebSocket(wsUrl);
        connectionAttemptRef.current += 1;
        const currentAttempt = connectionAttemptRef.current;
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN && currentAttempt === connectionAttemptRef.current) {
            console.log('Connection timeout, closing socket');
            socket.close();
            setState(prev => ({ 
              ...prev, 
              error: 'Connection timeout - falling back to demo',
              isConnected: false,
              isConnecting: false 
            }));
            reject(new Error('Connection timeout'));
          }
        }, 15000); // 15 second timeout

        // Audio processing variables
        let lastSendTime = 0;
        const SEND_INTERVAL = 50; // Send every 50ms
        
        const processAudio = () => {
          if (!isProcessingRef.current || socket.readyState !== WebSocket.OPEN) {
            console.log('Audio processing stopped - connection closed or processing disabled');
            return;
          }
          
          try {
            const now = Date.now();
            if (now - lastSendTime >= SEND_INTERVAL) {
              // Check if audio context is suspended and resume if needed
              if (audioContext.state === 'suspended') {
                console.log('Audio context suspended, resuming...');
                audioContext.resume();
              }
              
              analyser.getByteTimeDomainData(dataArray);
              
              // Convert to PCM16
              const pcmData = new Int16Array(bufferLength);
              for (let i = 0; i < bufferLength; i++) {
                const sample = (dataArray[i] - 128) / 128;
                pcmData[i] = Math.max(-32768, Math.min(32767, sample * 32768));
              }
              
              // Send to AssemblyAI
              try {
                socket.send(new Uint8Array(pcmData.buffer));
                lastSendTime = now;
              } catch (error) {
                console.error('Error sending audio to AssemblyAI:', error);
                // Don't stop processing on send errors - just skip this chunk
              }
            }
            
            // Continue processing
            if (isProcessingRef.current && socket.readyState === WebSocket.OPEN) {
              setTimeout(processAudio, 10); // Check every 10ms
            }
          } catch (globalError) {
            console.error('Critical error in audio processing:', globalError);
            // Continue processing even on errors to maintain stability
            if (isProcessingRef.current && socket.readyState === WebSocket.OPEN) {
              setTimeout(processAudio, 100); // Slower retry on errors
            }
          }
        };
        
        socket.onopen = () => {
          if (currentAttempt !== connectionAttemptRef.current) return; // Ignore old connections
          
          clearTimeout(connectionTimeout);
          console.log('Successfully connected to AssemblyAI real-time transcription');
          
          // Start audio processing
          isProcessingRef.current = true;
          processAudio();
          
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            isConnecting: false,
            error: null 
          }));

          // For Universal Streaming v3, we don't need to send an initial message
          // The session begins automatically when connected
          console.log('WebSocket connected, session will begin automatically and audio processing started');
          resolve(true); // Resolve the promise on successful connection
        };

        socket.onmessage = (event) => {
          if (currentAttempt !== connectionAttemptRef.current) return; // Ignore old connections
          
          try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);
            
            // Handle error messages
            if (data.error) {
              console.error('AssemblyAI error message:', data.error);
              setState(prev => ({ 
                ...prev, 
                error: `AssemblyAI error: ${data.error}`,
                isConnected: false,
                isConnecting: false 
              }));
              socket.close();
              return;
            }
            
            // Handle Universal Streaming v3 message types
            if (data.type === 'Begin') {
              console.log('AssemblyAI session started:', data);
              // Session has begun, ready to receive audio
              return;
            }
            
            if (data.type === 'Turn' && data.transcript && typeof data.transcript === 'string') {
              const newTranscript = data.transcript.trim();
              if (newTranscript && newTranscript !== transcriptRef.current) {
                // For Universal Streaming, we get the full transcript each time
                const previousTranscript = transcriptRef.current;
                transcriptRef.current = newTranscript;
                
                // Extract the new part by comparing with previous transcript
                const newPart = newTranscript.substring(previousTranscript.length).trim();
                
                setState(prev => ({
                  ...prev,
                  transcript: newTranscript,
                  lastChunk: newPart || newTranscript
                }));
                
                onTranscriptUpdate?.(newTranscript, newPart || newTranscript);
              }
              return;
            }
            
            if (data.type === 'Termination') {
              console.log('AssemblyAI session terminated:', data);
              return;
            }
            
            // Handle any other message types
            console.log('Unhandled message type:', data.type || 'unknown', data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        socket.onerror = (error) => {
          if (currentAttempt !== connectionAttemptRef.current) return;
          
          clearTimeout(connectionTimeout);
          console.error('AssemblyAI WebSocket error:', error);
          
          // Clean up audio resources
          isProcessingRef.current = false;
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          
          setState(prev => ({ 
            ...prev, 
            error: 'WebSocket connection error - falling back to demo',
            isConnected: false,
            isConnecting: false 
          }));
          reject(new Error('WebSocket connection error'));
        };

        socket.onclose = (event) => {
          if (currentAttempt !== connectionAttemptRef.current) return;
          
          clearTimeout(connectionTimeout);
          console.log('AssemblyAI connection closed with code:', event.code, 'reason:', event.reason);
          
          // Stop audio processing
          isProcessingRef.current = false;
          
          // Clean up audio resources
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          
          let errorMessage = null;
          
          if (event.code === 1000) {
            // Normal closure
            console.log('Normal connection closure');
          } else if (event.code === 1006) {
            // Abnormal closure
            errorMessage = 'Connection failed - check your internet connection';
          } else if (event.code === 4001) {
            // AssemblyAI authorization error
            errorMessage = 'Authentication failed - check your API key';
          } else if (event.code === 4002) {
            // Insufficient credits
            errorMessage = 'Insufficient AssemblyAI credits';
          } else {
            errorMessage = `Connection closed unexpectedly (${event.code})`;
          }
          
          setState(prev => ({ 
            ...prev, 
            error: errorMessage,
            isConnected: false,
            isConnecting: false 
          }));
          
          wsRef.current = null;
        };

        wsRef.current = socket;

      } catch (error) {
        console.error('Failed to connect to AssemblyAI:', error);
        
        // Clean up audio resources on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Connection failed',
          isConnecting: false 
        }));
        reject(error);
      }
    });
  }, [enabled, onTranscriptUpdate]);

  // Disconnect from AssemblyAI
  const disconnect = useCallback(() => {
    connectionAttemptRef.current += 1; // Invalidate any pending connections
    
    // Stop audio processing
    isProcessingRef.current = false;
    
    // Clean up audio resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      wsRef.current.close(1000, 'User disconnected');
    }
    wsRef.current = null;
    transcriptRef.current = '';
    setState({
      transcript: '',
      isConnected: false,
      isConnecting: false,
      error: null,
      lastChunk: ''
    });
  }, []);

  // Send audio data to AssemblyAI
  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  // Connect when enabled
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Clean up on unmount
      isProcessingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      disconnect();
    };
  }, [enabled]);

  // Simulate real-time transcript for demo
  // ignore ts any error
  const simulateRealTimeTranscript = useCallback((candidateName: string) => {
    console.log('Simulating real-time transcript for candidate:', candidateName);
    setState(prev => {
      if (prev.isConnected) return prev;
      
      return { 
        ...prev, 
        isConnected: true,
        isConnecting: false,
        error: 'Using simulation for demo' 
      };
    });

    const transcriptChunks = [
      "Hi, nice to meet you.",
      "I'm really passionate about technology and innovation.",
      "In my free time, I love watching movies, especially Christopher Nolan films.",
      "I also enjoy listening to jazz music and going to art galleries.",
      "I'm particularly interested in startups with creative cultures.",
      "I believe in work-life balance and teams that value creativity."
    ];

    let chunkIndex = 0;
    const interval = setInterval(() => {
      if (chunkIndex < transcriptChunks.length) {
        const chunk = transcriptChunks[chunkIndex];
        const fullTranscript = transcriptRef.current + (transcriptRef.current ? ' ' : '') + chunk;
        
        transcriptRef.current = fullTranscript;
        
        setState(prev => ({
          ...prev,
          transcript: fullTranscript,
          lastChunk: chunk
        }));
        
        onTranscriptUpdate?.(fullTranscript, chunk);
        chunkIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [onTranscriptUpdate]);

  return {
    ...state,
    connect,
    disconnect,
    sendAudioData,
    simulateRealTimeTranscript
  };
}