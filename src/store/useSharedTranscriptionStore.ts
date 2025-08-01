import { create } from 'zustand'

export interface SharedTranscriptionResult {
  id: string
  text: string
  timestamp: number
  isPartial: boolean
  speakerId?: string
  speakerName?: string
}

interface SharedTranscriptionState {
  // Shared transcription state
  sharedTranscripts: SharedTranscriptionResult[]
  isHostTranscribing: boolean
  hostTranscriptionEnabled: boolean
  
  // Actions
  addSharedTranscript: (transcript: SharedTranscriptionResult) => void
  clearSharedTranscripts: () => void
  setHostTranscriptionEnabled: (enabled: boolean) => void
  setHostTranscribing: (isTranscribing: boolean) => void
  reset: () => void
}

export const useSharedTranscriptionStore = create<SharedTranscriptionState>((set) => ({
  // Initial state
  sharedTranscripts: [],
  isHostTranscribing: false,
  hostTranscriptionEnabled: false,

  // Actions
  addSharedTranscript: (transcript: SharedTranscriptionResult) => {
    set((state) => ({
      sharedTranscripts: [...state.sharedTranscripts, transcript]
    }))
  },

  clearSharedTranscripts: () => {
    set({ sharedTranscripts: [] })
  },

  setHostTranscriptionEnabled: (enabled: boolean) => {
    set({ hostTranscriptionEnabled: enabled })
  },

  setHostTranscribing: (isTranscribing: boolean) => {
    set({ isHostTranscribing: isTranscribing })
  },

  reset: () => {
    set({
      sharedTranscripts: [],
      isHostTranscribing: false,
      hostTranscriptionEnabled: false
    })
  }
})) 