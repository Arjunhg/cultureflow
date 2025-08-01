import jwt from 'jsonwebtoken'
import { VapiClient } from '@vapi-ai/server-sdk'

const generateVapiToken = () => {
  const payload = {
    orgId: process.env.VAPI_ORG_ID,
    token: {
      //  scope of the token
      tag: 'private',
    },
  }

  const key = process.env.VAPI_PRIVATE_KEY!

  const options = {
    expiresIn: 1800, // 30 minutes in seconds
  }

  return jwt.sign(payload, key, options)
}

// Create a function that returns a fresh VAPI client
export const getVapiServer = () => {
  const token = generateVapiToken()
  return new VapiClient({ token: token })
}

// For backward compatibility, keep the old export but make it generate fresh tokens
export const vapiServer = {
  assistants: {
    list: async () => {
      const client = getVapiServer()
      return client.assistants.list()
    },
    create: async (data: Record<string, unknown>) => {
      const client = getVapiServer()
      return client.assistants.create(data)
    },
    update: async (id: string, data: Record<string, unknown>) => {
      const client = getVapiServer()
      return client.assistants.update(id, data)
    },
    delete: async (id: string) => {
      const client = getVapiServer()
      return client.assistants.delete(id)
    }
  }
}
