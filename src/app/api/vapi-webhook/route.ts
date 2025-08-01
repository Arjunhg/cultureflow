
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// GET endpoint to test if webhook is reachable
export async function GET() {
  console.log('🟢 [VAPI Webhook] GET request received - webhook is reachable');
  return NextResponse.json({
    message: 'VAPI Webhook endpoint is reachable',
    endpoint: '/api/vapi-webhook',
    status: 'ready',
    expectedWebhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-webhook`
  });
}

// This endpoint receives webhooks from VAPI when calls start/end
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 [VAPI WEBHOOK] Received webhook call!');
    const payload = await request.json();
    console.log('📦 [VAPI WEBHOOK] Full payload:', JSON.stringify(payload, null, 2));
    
    // VAPI webhook event types - check different possible structures
    const { type, message, call } = payload;
    const eventType = type || message?.type;
    const callData = call || message?.call;
    
    console.log('🔍 [VAPI WEBHOOK] Event type:', eventType, 'Call ID:', callData?.id);
    
    switch (eventType) {
      case 'status-update':
        if (message?.status === 'in-progress') {
          console.log('🟢 [VAPI WEBHOOK] Call started via status-update');
          return await handleCallStart(callData, payload);
        } else if (message?.status === 'ended') {
          console.log('🔴 [VAPI WEBHOOK] Call ended via status-update');
          return await handleCallEnd(callData);
        }
        break;
        
      case 'call.started':
      case 'call-started':
        console.log('🟢 [VAPI WEBHOOK] Call started via call.started');
        return await handleCallStart(callData, payload);
        
      case 'call.ended': 
      case 'call-ended':
      case 'end-of-call-report':
        console.log('🔴 [VAPI WEBHOOK] Call ended via call.ended');
        return await handleCallEnd(callData);
        
      case 'conversation-update':
      case 'transcript.update':
        console.log('💬 [VAPI WEBHOOK] Conversation/transcript update received');
        // Could be used for real-time transcript updates
        break;
        
      default:
        console.log('❓ [VAPI WEBHOOK] Unknown event type:', eventType);
        console.log('📋 [VAPI WEBHOOK] Available payload keys:', Object.keys(payload));
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received',
      eventType 
    });

  } catch (error) {
    console.error('❌ [VAPI WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCallStart(callData: any, fullPayload: any) {
  try {
    console.log('🚀 [VAPI WEBHOOK] Processing call start:', callData);
    
    // Extract candidate information from VAPI payload
    const candidateInfo = {
      candidateId: callData?.id || fullPayload?.candidate?.id || `candidate-${Date.now()}`,
      candidateName: fullPayload?.candidate?.name || callData?.name || 'Live VAPI Candidate',
      candidateEmail: fullPayload?.candidate?.email || 'candidate@vapi-call.com',
      roleType: fullPayload?.candidate?.role || 'Live Interview'
    };
    
    // Create session data
    const sessionData = {
      sessionId: `vapi-session-${callData?.id || Date.now()}`,
      vapiCallId: callData?.id || `call-${Date.now()}`,
      isActive: true,
      candidateInfo,
      startTime: new Date().toISOString()
    };
    
    console.log('📝 [VAPI WEBHOOK] Creating session:', sessionData);
    
    // Store the session using the session API
    const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        sessionData
      })
    });
    
    if (!sessionResponse.ok) {
      throw new Error(`Session API error: ${sessionResponse.status}`);
    }
    
    const sessionResult = await sessionResponse.json();
    console.log('✅ [VAPI WEBHOOK] Session created successfully:', sessionResult);
    
    return NextResponse.json({ 
      success: true,
      sessionCreated: true,
      sessionData,
      culturalAnalysisEnabled: true
    });
    
  } catch (error) {
    console.error('❌ [VAPI WEBHOOK] Error in handleCallStart:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleCallEnd(callData: any) {
  try {
    console.log('🔴 [VAPI WEBHOOK] Processing call end:', callData);
    
    // End the session
    const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'end',
        sessionData: {
          sessionId: `vapi-session-${callData?.id}`,
          vapiCallId: callData?.id,
          endTime: new Date().toISOString()
        }
      })
    });
    
    if (!sessionResponse.ok) {
      throw new Error(`Session API error: ${sessionResponse.status}`);
    }
    
    const sessionResult = await sessionResponse.json();
    console.log('✅ [VAPI WEBHOOK] Session ended successfully:', sessionResult);
    
    return NextResponse.json({ 
      success: true,
      sessionEnded: true
    });
    
  } catch (error) {
    console.error('❌ [VAPI WEBHOOK] Error in handleCallEnd:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
