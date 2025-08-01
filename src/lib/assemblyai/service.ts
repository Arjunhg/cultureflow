/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssemblyAI } from 'assemblyai'

export interface TranscriptionOptions {
  formatTurns?: boolean
  summarization?: boolean
}

export interface TranscriptAnalysis {
  transcript: string
  sentiment?: string
  summary?: string
  keyPoints: string[]
  topics: string[]
}

export class AssemblyAIService {
  private client: AssemblyAI
  private transcriber: any // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(apiKey?: string) {
    this.client = new AssemblyAI({
      apiKey: apiKey || process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || ''
    })
  }

  // Start real-time transcription streaming
  async startStreaming() {
    try {
      // Fetch temporary token from Next.js API route
      const res = await fetch('/api/assemblyai-token');
      if (!res.ok) {
        throw new Error('Failed to fetch AssemblyAI token');
      }
      const { token } = await res.json();
      if (!token) {
        throw new Error('No AssemblyAI token received');
      }

      // Use the token to create the transcriber
      const { StreamingTranscriber } = await import('assemblyai');
      this.transcriber = new StreamingTranscriber({
        token,
        sampleRate: 16_000
      });

      // Add event listeners for connection state
      this.transcriber.on('open', (info: any) => {
        console.log('AssemblyAI WebSocket connection opened', info)
      })
      this.transcriber.on('close', (code: number, reason: string) => {
        console.log('AssemblyAI WebSocket connection closed', code, reason)
      })
      this.transcriber.on('error', (err: Error) => {
        console.error('AssemblyAI WebSocket error:', err)
      })

      // Add event listeners for transcription results
      this.transcriber.on('turn', (turn: any) => {
        console.log('AssemblyAI turn event:', turn);
      });
      this.transcriber.on('transcript', (transcript: any) => {
        console.log('AssemblyAI transcript event:', transcript);
      });

      // Await connection before returning
      await this.transcriber.connect()
      return this.transcriber
    } catch (error) {
      console.error('Error starting streaming transcription:', error)
      throw error
    }
  }

  // Stop streaming transcription
  async stopStreaming() {
    if (this.transcriber) {
      await this.transcriber.close()
      this.transcriber = null
    }
  }

  // Transcribe audio file for post-webinar analysis (server-side only)
  async transcribeAudioFile(audioPath: string): Promise<TranscriptAnalysis> {
    if (typeof window !== 'undefined') {
      throw new Error('This method can only be used on the server side')
    }
    
    try {
      const params = {
        audio: audioPath,
        summarization: true,
        summary_model: 'informative' as const,
        summary_type: 'bullets' as const,
        sentiment_analysis: true
      }

      const result = await this.client.transcripts.transcribe(params)

      return {
        transcript: result.text || '',
        sentiment: (result as any).sentiment_analysis_results?.[0]?.sentiment || 'neutral', // eslint-disable-line @typescript-eslint/no-explicit-any
        summary: result.summary || '',
        keyPoints: this.extractKeyPoints(result.text || ''),
        topics: this.extractTopics(result.text || '')
      }
    } catch (error) {
      console.error('Error transcribing audio file:', error)
      throw error
    }
  }

  // Extract key points from transcript using simple heuristics
  private extractKeyPoints(transcript: string): string[] {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20)
    const keywords = ['important', 'key', 'crucial', 'significant', 'main', 'primary', 'essential']
    
    return sentences
      .filter(sentence => 
        keywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 5)
      .map(s => s.trim())
  }

  // Extract topics from transcript using simple keyword analysis
  private extractTopics(transcript: string): string[] {
    const text = transcript.toLowerCase()
    const topicKeywords = [
      'technology', 'business', 'marketing', 'sales', 'development',
      'strategy', 'innovation', 'growth', 'leadership', 'management',
      'product', 'service', 'customer', 'solution', 'analytics'
    ]

    return topicKeywords
      .filter(topic => text.includes(topic))
      .slice(0, 5)
  }

  // Generate meeting summary
  async generateMeetingSummary(transcript: string): Promise<string> {
    try {
      // For now, use a simple summary generation
      // In production, you might want to use a more sophisticated approach
      const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 30)
      const keyPoints = sentences.slice(0, 3).map(s => `• ${s.trim()}`)
      
      return `Meeting Summary:\n\n${keyPoints.join('\n')}\n\nTotal duration: ${Math.ceil(transcript.length / 150)} minutes (estimated)`
    } catch (error) {
      console.error('Error generating meeting summary:', error)
      throw error
    }
  }

  // Save transcript to browser storage
  async saveTranscript(transcript: string, filename: string): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('This method can only be used on the client side')
    }
    
    try {
      localStorage.setItem(`transcript_${filename}`, transcript)
    } catch (error) {
      console.error('Error saving transcript:', error)
      throw error
    }
  }

  // Load transcript from browser storage
  async loadTranscript(filename: string): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('This method can only be used on the client side')
    }
    
    try {
      const transcript = localStorage.getItem(`transcript_${filename}`)
      if (!transcript) {
        throw new Error(`Transcript file not found: ${filename}`)
      }
      
      return transcript
    } catch (error) {
      console.error('Error loading transcript:', error)
      throw error
    }
  }

  // Get streaming status
  isStreaming(): boolean {
    return this.transcriber !== null && this.transcriber !== undefined
  }
}

// Export singleton instance
export const assemblyAIService = new AssemblyAIService()
