/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssemblyAI } from 'assemblyai'

export interface TranscriptTurn {
  id: string
  text: string
  timestamp: number
  speaker?: string
  confidence?: number
  words?: Array<{
    text: string
    start: number
    end: number
    confidence: number
  }>
}

export interface TranscriptionSummary {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  topics: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
}

export class AssemblyAIService {
  private client: AssemblyAI
  private transcriber: any
  private isConnected = false
  private turns: TranscriptTurn[] = []

  constructor() {
    this.client = new AssemblyAI({
      apiKey: process.env.ASSEMBLY_API_KEY || process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY!
    })
  }

  async startStreaming(
    onTranscript: (turn: TranscriptTurn) => void,
    onError: (error: any) => void,
    options?: {
      formatTurns?: boolean
      wordBoost?: string[]
      redactPii?: boolean
      disfluencies?: boolean
      speakerLabels?: boolean
      summarization?: boolean
    }
  ) {
    try {
      this.transcriber = this.client.streaming.transcriber({
        sampleRate: 16_000,
        formatTurns: options?.formatTurns ?? true
      })

      this.transcriber.on('open', ({ id }: { id: string }) => {
        console.log(`AssemblyAI streaming session opened: ${id}`)
        this.isConnected = true
      })

      this.transcriber.on('error', (error: any) => {
        console.error('AssemblyAI streaming error:', error)
        this.isConnected = false
        onError(error)
      })

      this.transcriber.on('close', (code: number, reason: string) => {
        console.log(`AssemblyAI session closed: ${code} - ${reason}`)
        this.isConnected = false
      })

      this.transcriber.on('transcript', (transcript: any) => {
        if (transcript.text && transcript.text.trim()) {
          const turn: TranscriptTurn = {
            id: transcript.message_id || Date.now().toString(),
            text: transcript.text,
            timestamp: Date.now(),
            speaker: transcript.speaker_label,
            confidence: transcript.confidence,
            words: transcript.words
          }
          
          this.turns.push(turn)
          onTranscript(turn)
        }
      })

      await this.transcriber.connect()
      return this.transcriber

    } catch (error) {
      console.error('Failed to start AssemblyAI streaming:', error)
      this.isConnected = false
      throw error
    }
  }

  async sendAudioData(audioData: ArrayBuffer | Uint8Array) {
    if (this.isConnected && this.transcriber) {
      try {
        this.transcriber.sendAudio(audioData)
      } catch (error) {
        console.error('Error sending audio data:', error)
      }
    }
  }

  async stopStreaming() {
    if (this.transcriber && this.isConnected) {
      try {
        await this.transcriber.close()
      } catch (error) {
        console.error('Error closing transcriber:', error)
      } finally {
        this.isConnected = false
      }
    }
  }

  isStreaming(): boolean {
    return this.isConnected
  }

  getTurns(): TranscriptTurn[] {
    return [...this.turns]
  }

  clearTurns() {
    this.turns = []
  }

  // Post-webinar analysis
  async analyzeTranscript(transcript: string): Promise<TranscriptionSummary> {
    try {
      const params = {
        audio: transcript,
        summarization: true,
        summary_model: 'informative' as const,
        summary_type: 'bullets' as const,
        iab_categories: true,
        auto_highlights: true,
        sentiment_analysis: true
      }

      const result = await this.client.transcripts.transcribe(params)
      
      return {
        summary: result.summary || 'No summary available',
        keyPoints: result.auto_highlights_result?.results?.map((h: any) => h.text) || [],
        actionItems: this.extractActionItems(result.summary || ''),
        topics: result.iab_categories_result?.results?.map((c: any) => c.text) || [],
        sentiment: this.determineSentiment(result.sentiment_analysis_results || [])
      }
    } catch (error) {
      console.error('Error analyzing transcript:', error)
      throw error
    }
  }

  private extractActionItems(summary: string): string[] {
    // Simple regex to find action items
    const actionRegex = /(?:action|todo|follow.?up|next step|should|need to|must)[:\s]([^.!?]+)/gi
    const matches = summary.match(actionRegex) || []
    return matches.map(match => match.trim()).slice(0, 5)
  }

  private determineSentiment(sentimentResults: any[]): 'positive' | 'negative' | 'neutral' {
    if (!sentimentResults.length) return 'neutral'
    
    const avgSentiment = sentimentResults.reduce((sum, result) => {
      return sum + (result.sentiment === 'POSITIVE' ? 1 : result.sentiment === 'NEGATIVE' ? -1 : 0)
    }, 0) / sentimentResults.length

    if (avgSentiment > 0.2) return 'positive'
    if (avgSentiment < -0.2) return 'negative'
    return 'neutral'
  }
}

export const assemblyAI = new AssemblyAIService()
