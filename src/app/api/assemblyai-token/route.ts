import { NextResponse } from 'next/server';

export async function GET() {
  return getToken();
}

export async function POST() {
  return getToken();
}

async function getToken() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY; 
    
    if (!apiKey) {
      console.error('No AssemblyAI API key found in environment variables');
      throw new Error('AssemblyAI API key not configured');
    }
    
    console.log('Generating AssemblyAI token with API key:', apiKey.substring(0, 10) + '...');
    
    // Use the new Universal Streaming v3 token endpoint
    const response = await fetch('https://streaming.assemblyai.com/v3/token?expires_in_seconds=60', {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI API response:', response.status, errorText);
      throw new Error(`AssemblyAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const token = data.token;
    
    if (!token) {
      throw new Error('No token received from AssemblyAI');
    }
    
    console.log('Successfully generated token:', token.substring(0, 20) + '...');
    return NextResponse.json({ token });
  } catch (err) {
    console.error('AssemblyAI token error:', err);
    
    // For demo purposes, return a mock token if AssemblyAI fails
    return NextResponse.json({ 
      token: 'demo-token-for-simulation',
      demo: true,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
