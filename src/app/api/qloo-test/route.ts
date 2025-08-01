import { NextResponse } from 'next/server';
import { qloo } from '@/lib/qloo';

export async function GET() {
  try {
    // Test Qloo connection
    const connectionTest = await qloo.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'Qloo connection failed', message: connectionTest.message },
        { status: 500 }
      );
    }

    // Test search functionality with allowed entity types
    const [searchResults, audiences, culturalProfile] = await Promise.all([
      qloo.searchEntities('Christopher Nolan'), // Search for person/director
      qloo.searchAudiences('creative'), // Search for creative audiences
      qloo.getCulturalProfile(['music', 'film', 'art']) // Get cultural profile
    ]);
    
    // Test cultural analysis
    const culturalAnalysis = await qloo.analyzeCulturalFit(['film', 'music', 'technology'], 'creative director');

    return NextResponse.json({
      success: true,
      connection: connectionTest,
      searchResults: searchResults.results.slice(0, 3),
      audiences: audiences.slice(0, 3),
      culturalProfile,
      culturalAnalysis,
      note: 'Using hackathon-allowed endpoints only (no brands)'
    });
  } catch (error) {
    console.error('Qloo API test error:', error);
    return NextResponse.json(
      { 
        error: 'Qloo API test failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'API key has limited permissions for hackathon'
      },
      { status: 500 }
    );
  }
}
