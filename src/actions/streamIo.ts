'use server'

import { Attendee, Webinar } from '@prisma/client'
import { getStreamClient } from '@/lib/streamio/streamClient'
import { UserRequest } from '@stream-io/node-sdk'
// import { prismaClient } from '@/lib/prismaClient'

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const newUser: UserRequest = {
      id: attendee?.id || 'guest',
      role: 'user',
      name: attendee?.name || 'Guest',
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${
        attendee?.name || 'Guest'
      }`,
    }
    await getStreamClient.upsertUsers([newUser])
    // validity is optional (by default the token is valid for an hour)
    const validity = 60 * 60 * 60
    const token = getStreamClient.generateUserToken({
      user_id: attendee?.id || 'guest',
      validity_in_seconds: validity,
    })

    return token
  } catch (error) {
    console.error('Error generating Stream Io token:', error)
    throw new Error('Failed to generate Stream Io token')
  }
}

export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string
) => {
  try {
    const newUser: UserRequest = {
      id: userId,
      role: 'user',
      name: username || 'Guest',
      image:
        profilePic ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    }
    await getStreamClient.upsertUsers([newUser])

    const validity = 60 * 60 * 60
    const token = getStreamClient.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    })

    return token
  } catch (error) {
    console.error('Error generating Stream Io token:', error)
    throw new Error('Failed to generate Stream Io token')
  }
}

export const createAndStartStream = async (webinar: Webinar) => {
  try {
    // const checkWebinar = await prismaClient.webinar.findMany({
    //   where: {
    //     presenterId: webinar.presenterId,
    //     webinarStatus: 'LIVE',
    //   },
    // })

    // if (checkWebinar.length > 0) {
    //   throw new Error('You already have a live stream running')
    // }

    const call = getStreamClient.video.call('livestream', webinar.id)
    await call.getOrCreate({
      data: {
        // starts_at: new Date(webinar.startTime),
        created_by_id: webinar.presenterId,
        members: [
          {
            user_id: webinar.presenterId,
            role: 'host',
          },
        ],
      },
    })

    await call.goLive({
      start_recording: true,
      recording_storage_name: 'livestream',
    })

    console.log('Stream created and started successfully')
    return { success: true, callId: webinar.id }
  } catch (error) {
    console.error('Error creating and starting stream:', error)
    throw new Error('Failed to create and start stream')
  }
}

// Function to create a breakout room for AI chat/interview
export const createBreakoutRoom = async (
  hostId: string, 
  attendeeId: string,
  webinarId: string
) => {
  try {
    // Create a unique call ID for the breakout room
    const breakoutCallId = `breakout-${webinarId}-${attendeeId}-${Date.now()}`
    
    const call = getStreamClient.video.call('default', breakoutCallId)
    
    // Create the call with both host and attendee as members
    await call.getOrCreate({
      data: {
        created_by_id: hostId,
        members: [
          {
            user_id: hostId,
            role: 'host',
          },
          {
            user_id: attendeeId,
            role: 'user',
          },
        ],
        settings_override: {
          audio: { 
            mic_default_on: true,
            default_device: 'speaker'
          },
          video: { 
            camera_default_on: true
          },
          recording: { 
            mode: 'available' 
          },
        },
      },
    })

    console.log('Breakout room created successfully:', breakoutCallId)
    return { 
      success: true, 
      callId: breakoutCallId,
      callType: 'default'
    }
  } catch (error) {
    console.error('Error creating breakout room:', error)
    throw new Error('Failed to create breakout room')
  }
}

// Function to join an existing call
export const joinCall = async (callId: string, userId: string, callType: string = 'default') => {
  try {
    const call = getStreamClient.video.call(callType, callId)
    
    // Get call details to check if it exists and is accessible
    const callDetails = await call.get()
    
    if (!callDetails) {
      throw new Error('Call not found')
    }

    // Check if user is a member or add them
    const isMember = callDetails.members.some(member => member.user_id === userId)
    
    if (!isMember) {
      await call.updateCallMembers({
        update_members: [
          {
            user_id: userId,
            role: 'user',
          },
        ],
      })
    }

    console.log('User joined call successfully:', callId)
    return { 
      success: true, 
      callId: callId,
      callType: callType 
    }
  } catch (error) {
    console.error('Error joining call:', error)
    throw new Error('Failed to join call')
  }
}

// Function to end a call
export const endCall = async (callId: string, callType: string = 'default') => {
  try {
    const call = getStreamClient.video.call(callType, callId)
    
    // Update call to ended state
    await call.update({
      settings_override: {
        limits: {
          max_duration_seconds: 1
        }
      }
    })
    
    console.log('Call ended successfully:', callId)
    return { success: true }
  } catch (error) {
    console.error('Error ending call:', error)
    throw new Error('Failed to end call')
  }
}

// Function to get call details and status
export const getCallDetails = async (callId: string, callType: string = 'default') => {
  try {
    const call = getStreamClient.video.call(callType, callId)
    const callDetails = await call.get()
    
    return {
      success: true,
      callDetails: callDetails,
      isLive: callDetails?.call?.backstage ? false : true,
    }
  } catch (error) {
    console.error('Error getting call details:', error)
    return {
      success: false,
      error: 'Call not found or not accessible'
    }
  }
}

//Premium Feature: Make a call to get the recording. 