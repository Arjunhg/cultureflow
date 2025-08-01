/* eslint-disable  @typescript-eslint/no-explicit-any */
interface QlooInsightRequest {
  'filter.type': string;
  'signal.interests.entities'?: string[];
  'signal.interests.tags'?: string[];
  'signal.demographics.audiences'?: string[];
  'filter.tags'?: string[];
}

interface QlooEntity {
  id: string;
  name: string;
  type: string;
  metadata?: any;
}

interface QlooInsightResponse {
  results: QlooEntity[];
  meta: {
    total: number;
    query_id: string;
  };
}

interface QlooSearchResponse {
  results: QlooEntity[];
  meta: {
    total: number;
  };
}

interface QlooAudience {
  entity_id: string;
  name: string;
  type: string;
  id: string;
  parents?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface QlooAudienceResponse {
  success: boolean;
  results: {
    audiences: QlooAudience[];
  };
  totalRequestDuration: number;
}


class QlooService {
  private baseUrl = 'https://hackathon.api.qloo.com';
  private apiKey = process.env.NEXT_PUBLIC_QLOO_API_KEY!;

  private async makeRequest(endpoint: string, params?: Record<string, any>) {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v));
        } else if (value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Qloo API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Test connection to Qloo API with allowed entity types
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with allowed entity type instead of forbidden 'brand'
      await this.searchEntities('Inception', 'movie');
      return { success: true, message: 'Successfully connected to Qloo Hackathon API' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  // Search for entities by name (free-text search only - no type filtering)
  async searchEntities(query: string, preferredType?: string): Promise<QlooSearchResponse> {
    // Use free-text search without type filtering to avoid 403 errors
    // Note: hackathon API uses 'query' parameter, not 'q'
    // Limit parameter may not work on hackathon API, so we'll limit client-side
    console.log('Searching entities with query:', query, 'preferredType:', preferredType);
    const response = await this.makeRequest('/search', {
      query: query
    });
    
    // Client-side limiting since API limit parameter doesn't work
    return {
      ...response,
      results: response.results?.slice(0, 10) || []
    };
  }

  // Search for cultural audiences (this works with your API key)
  async searchAudiences(query: string): Promise<QlooAudience[]> {
    try {
      const response: QlooAudienceResponse = await this.makeRequest('/v2/audiences', {
        'filter.query': query,
        limit: 10
      });
      return response.results.audiences || [];
    } catch (error) {
      console.error('Error searching audiences:', error);
      return [];
    }
  }

  // Get cultural insights for recommendations (limited by permissions)
  async getInsights(request: QlooInsightRequest): Promise<QlooInsightResponse> {
    return this.makeRequest('/v2/insights', request);
  }

  // Get cultural recommendations based on preferences (using allowed entity types)
  async getCulturalRecommendations(preferences: string[]): Promise<QlooEntity[]> {
    try {
      const allResults: QlooEntity[] = [];
      
      // Search for each preference using free-text search
      for (const preference of preferences.slice(0, 2)) { // Limit to 2 to avoid long responses
        const searchResults = await this.searchEntities(preference);
        allResults.push(...searchResults.results.slice(0, 3)); // Take top 3 from each search
      }
      
      return allResults.slice(0, 6); // Return top 6 overall
    } catch (error) {
      console.error('Error getting cultural recommendations:', error);
      return [];
    }
  }

  // Analyze cultural fit based on preferences (updated for hackathon limitations)
  async analyzeCulturalFit(candidatePreferences: string[], roleType: string): Promise<{
    score: number;
    insights: string[];
    recommendations: QlooEntity[];
    audiences: QlooAudience[];
  }> {
    try {
      // Get cultural entities and audiences
      const [recommendations, audiences] = await Promise.all([
        this.getCulturalRecommendations(candidatePreferences),
        this.searchAudiences(candidatePreferences[0] || 'creative')
      ]);
      
      // Enhanced scoring algorithm
      const baseScore = 65;
      const entityBonus = Math.min(20, recommendations.length * 3);
      const audienceBonus = Math.min(10, audiences.length * 2);
      const score = Math.min(95, baseScore + entityBonus + audienceBonus);
      
      const insights = [
        `Cultural alignment score: ${score}%`,
        `Found ${recommendations.length} matching cultural entities`,
        `Identified ${audiences.length} relevant cultural audiences`,
        `Recommended for ${roleType} roles based on cultural profile`
      ];

      return {
        score,
        insights,
        recommendations,
        audiences
      };
    } catch (error) {
      console.error('Error analyzing cultural fit:', error);
      return {
        score: 0,
        insights: ['Unable to analyze cultural fit - API limitations'],
        recommendations: [],
        audiences: []
      };
    }
  }

  // Get cultural profile for a person (using allowed searches)
  async getCulturalProfile(interests: string[]): Promise<{
    entities: QlooEntity[];
    audiences: QlooAudience[];
    culturalCategories: string[];
  }> {
    try {
      const entities = await this.getCulturalRecommendations(interests);
      const audiences = await this.searchAudiences(interests.join(' '));
      
      // Extract cultural categories from audiences
      const culturalCategories = audiences
        .map(audience => audience.name)
        .filter((name, index, self) => self.indexOf(name) === index)
        .slice(0, 5);

      return {
        entities,
        audiences,
        culturalCategories
      };
    } catch (error) {
      console.error('Error getting cultural profile:', error);
      return {
        entities: [],
        audiences: [],
        culturalCategories: []
      };
    }
  }
}

export const qloo = new QlooService();
export type { QlooEntity, QlooInsightResponse, QlooSearchResponse, QlooInsightRequest, QlooAudience, QlooAudienceResponse };
