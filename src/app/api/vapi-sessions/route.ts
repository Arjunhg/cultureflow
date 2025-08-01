/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
let activeSessions: any[] = [];

export async function GET() {
  try {
    // Return active VAPI sessions
    return NextResponse.json({ 
      success: true,
      activeSessions: activeSessions.filter(session => session.isActive)
    });
  } catch (error) {
    console.error('Error fetching VAPI sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sessions' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, sessionData } = await request.json();
    
    switch (action) {
      case 'create':
        // Create a new session
        const newSession = {
          ...sessionData,
          timestamp: new Date().toISOString(),
          isActive: true
        };
        activeSessions.push(newSession);
        console.log('Created new VAPI session:', newSession.sessionId);
        break;
        
      case 'end':
        // End a session
        activeSessions = activeSessions.map(session => 
          session.sessionId === sessionData.sessionId 
            ? { ...session, isActive: false }
            : session
        );
        console.log('Ended VAPI session:', sessionData.sessionId);
        break;
        
      case 'update':
        // Update a session
        activeSessions = activeSessions.map(session => 
          session.sessionId === sessionData.sessionId 
            ? { ...session, ...sessionData }
            : session
        );
        console.log('Updated VAPI session:', sessionData.sessionId);
        break;
    }
    
    return NextResponse.json({ 
      success: true,
      activeSessions: activeSessions.filter(session => session.isActive)
    });
  } catch (error) {
    console.error('Error managing VAPI sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to manage session' 
    }, { status: 500 });
  }
}
