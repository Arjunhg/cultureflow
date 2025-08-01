import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';

export async function GET() {
  const client = new AssemblyAI({ apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || '' });
  try {
    const  token  = await client.streaming.createTemporaryToken({
      expires_in_seconds: 60, // 1 minute, adjust as needed
    });
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
} 