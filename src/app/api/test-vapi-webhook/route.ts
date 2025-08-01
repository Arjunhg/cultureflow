import { NextRequest, NextResponse } from 'next/server';

// This endpoint simulates VAPI webhook events for testing
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'start_call':
        // Simulate a VAPI call started event
        const callStartPayload = {
          type: 'call.started',
          call: {
            id: `call-${Date.now()}`,
            status: 'in-progress'
          },
          candidate: {
            id: `candidate-${Date.now()}`,
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'Software Developer'
          }
        };
        
        // Send to our webhook
        const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(callStartPayload)
        });
        
        const webhookResult = await webhookResponse.json();
        
        return NextResponse.json({ 
          success: true,
          message: 'Simulated VAPI call started',
          webhookResult,
          payload: callStartPayload
        });
        
      case 'end_call':
        // Simulate a VAPI call ended event
        const callEndPayload = {
          type: 'call.ended',
          call: {
            id: 'call-test-123', // You would pass the actual call ID here
            status: 'ended'
          }
        };
        
        // Send to our webhook
        const endWebhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(callEndPayload)
        });
        
        const endWebhookResult = await endWebhookResponse.json();
        
        return NextResponse.json({ 
          success: true,
          message: 'Simulated VAPI call ended',
          webhookResult: endWebhookResult,
          payload: callEndPayload
        });
        
      default:
        return NextResponse.json({ 
          error: 'Unknown action. Use "start_call" or "end_call"' 
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Test VAPI webhook error:', error);
    return NextResponse.json({ 
      error: 'Test webhook failed' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'VAPI Test Webhook Endpoint',
    usage: {
      start_call: 'POST with {"action": "start_call"}',
      end_call: 'POST with {"action": "end_call"}'
    }
  });
}
