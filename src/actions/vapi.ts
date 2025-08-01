'use server'

import { interviewAgentPrompt, firstMessage } from '@/lib/vapiConfig'
import { vapiServer } from '@/lib/vapi/vapiServer'

export const getAllAssistants = async () => {
  try {
    const getAllAgents = await vapiServer.assistants.list()
    return {
      success: true,
      status: 200,
      data: getAllAgents,
    }
  } catch (error: unknown) {
    console.error('Error fetching agents:', error)
    
    // Handle specific VAPI errors
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      const err = error as { statusCode?: number; message?: string }
      if (err.statusCode === 401) {
        return {
          success: false,
          status: 401,
          message: 'Authentication failed. Please check your VAPI credentials.',
        }
      }
    }
    
    return {
      success: false,
      status: 500,
      message: 'Failed to fetch agents. Please try again.',
    }
  }
}

export const createAssistant = async (name: string) => {
  try {
    const createAssistant = await vapiServer.assistants.create({
      name,
      voice: {
        provider: 'vapi',
        voiceId: 'Elliot', // Using valid VAPI voice ID
      },
      firstMessage: firstMessage,
      model: {
        model: 'gpt-4.1',
        provider: 'openai',
        messages: [
          {
            role: 'system',
            content: interviewAgentPrompt,
          },
        ],
        temperature: 0.7, // Slightly higher for more natural conversation
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        keywords: ['HireFlow', 'technical', 'interview', 'hiring', 'collaboration']
      },
      // Add webhook URL for real-time session detection (requires HTTPS)
      // For local development, either use ngrok tunnel or deploy to get HTTPS URL
      server: {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/vapi-webhook`
      },
      endCallFunctionEnabled: true,
      endCallMessage: "Thank you for your time today. The interview has been completed successfully. You should hear back from our team within the next few business days. Have a great day!",
      maxDurationSeconds: 360, // 6 minutes for a typical interview
      serverMessages: [],
    })

    return {
      success: true,
      status: 200,
      data: createAssistant,
    }
  } catch (error: unknown) {
    console.error('Error creating assistant:', error)
    
    // Handle specific VAPI errors
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      const err = error as { statusCode?: number; message?: string }
      if (err.statusCode === 401) {
        return {
          success: false,
          status: 401,
          message: 'Authentication failed. Please check your VAPI credentials.',
        }
      }
      if (err.statusCode === 400) {
        return {
          success: false,
          status: 400,
          message: 'Invalid request. Please check your assistant configuration.',
        }
      }
    }
    
    return {
      success: false,
      status: 500,
      message: 'Failed to create assistant. Please try again.',
    }
  }
}

export const updateAssistant = async (
  assistantId: string,
  customFirstMessage?: string,
  customSystemPrompt?: string
) => {
  try {
    const updateAssistant = await vapiServer.assistants.update(assistantId, {
      firstMessage: customFirstMessage || firstMessage,
      model: {
        model: 'gpt-4.1',
        provider: 'openai',
        messages: [
          {
            role: 'system',
            content: customSystemPrompt || interviewAgentPrompt,
          },
        ],
        temperature: 0.7,
      },
      voice: {
        provider: 'vapi',
        voiceId: 'Elliot', // Using valid VAPI voice ID
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        keywords: ['HireFlow', 'technical', 'interview', 'hiring', 'collaboration']
      },
      // Add webhook URL for real-time session detection (requires HTTPS)
      server: {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/vapi-webhook`
      },
      endCallFunctionEnabled: true,
      endCallMessage: "Thank you for your time today. The interview has been completed successfully. You should hear back from our team within the next few business days. Have a great day!",
      maxDurationSeconds: 360,
      serverMessages: [],
    })
    console.log('Assistant updated:', updateAssistant)

    return {
      success: true,
      status: 200,
      data: updateAssistant,
    }
  } catch (error: unknown) {
    console.error('Error updating assistant:', error)
    
    // Handle specific VAPI errors
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      const err = error as { statusCode?: number; message?: string }
      if (err.statusCode === 401) {
        return {
          success: false,
          status: 401,
          message: 'Authentication failed. Please check your VAPI credentials.',
        }
      }
      if (err.statusCode === 404) {
        return {
          success: false,
          status: 404,
          message: 'Assistant not found.',
        }
      }
    }
    
    return {
      success: false,
      status: 500,
      message: 'Failed to update assistant. Please try again.',
      error: error,
    }
  }
}
