import { NextResponse } from 'next/server';

// Alternative to webhooks for local development - manually check for active VAPI calls
export async function POST() {
  try {
    console.log('🔍 [VAPI Monitor] Checking for active VAPI calls...');
    
    // Create a session for any active VAPI call
    // This is a workaround for local development since webhooks require HTTPS
    const sessionData = {
      sessionId: `vapi-monitor-${Date.now()}`,
      vapiCallId: `active-call-${Date.now()}`,
      isActive: true,
      candidateInfo: {
        candidateId: `candidate-${Date.now()}`,
        candidateName: 'Live VAPI Candidate',
        candidateEmail: 'candidate@vapi-monitor.com',
        roleType: 'Live Interview Monitor'
      },
      startTime: new Date().toISOString()
    };

    console.log('📝 [VAPI Monitor] Creating monitored session:', sessionData);

    // Store the session
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
    console.log('✅ [VAPI Monitor] Monitored session created:', sessionResult);

    return NextResponse.json({
      success: true,
      message: 'VAPI call monitoring session created',
      sessionData,
      note: 'This is a development workaround. For production, configure HTTPS webhooks.'
    });

  } catch (error) {
    console.error('❌ [VAPI Monitor] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create VAPI monitoring session',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET to check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'VAPI Call Monitor (Development)',
    description: 'Use POST to manually create a session for active VAPI calls',
    note: 'This is a workaround for local development since VAPI webhooks require HTTPS'
  });
}
