import { NextRequest, NextResponse } from 'next/server';

// Manual session creation for active VAPI calls (temporary solution)
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [Manual VAPI Session] Creating manual session for active VAPI call');
    
    const body = await request.json();
    const { candidateName, candidateEmail, roleType, callId } = body;
    
    // Create session data for manual VAPI call
    const sessionData = {
      sessionId: `manual-vapi-session-${Date.now()}`,
      vapiCallId: callId || `manual-call-${Date.now()}`,
      isActive: true,
      candidateInfo: {
        candidateId: `manual-candidate-${Date.now()}`,
        candidateName: candidateName || 'Live VAPI Candidate',
        candidateEmail: candidateEmail || 'candidate@vapi-call.com',
        roleType: roleType || 'Interview Candidate'
      },
      startTime: new Date().toISOString(),
    };

    console.log('📝 [Manual VAPI Session] Session data:', sessionData);

    // Store the session in the vapi-sessions API
    const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        sessionData
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error(`Failed to create session: ${sessionResponse.status}`);
    }

    const sessionResult = await sessionResponse.json();
    console.log('✅ [Manual VAPI Session] Session created:', sessionResult);

    return NextResponse.json({
      success: true,
      message: 'Manual VAPI session created successfully',
      sessionId: sessionData.sessionId,
      sessionData
    });

  } catch (error) {
    console.error('❌ [Manual VAPI Session] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create manual VAPI session',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET to check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Manual VAPI Session Creation Endpoint',
    description: 'Use POST to manually create a session for active VAPI calls',
    usage: 'POST with { candidateName, candidateEmail, roleType, callId }'
  });
}
