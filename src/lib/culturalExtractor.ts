import { qloo } from './qloo';

// Cultural keywords and patterns to extract from conversation transcripts
const CULTURAL_KEYWORDS = {
  entertainment: [
    // Movies & TV
    'movie', 'film', 'netflix', 'disney', 'marvel', 'cinema', 'director', 'actor', 'series', 'show',
    'streaming', 'hulu', 'amazon prime', 'hbo', 'documentary', 'comedy', 'drama', 'thriller',
    
    // Music
    'music', 'song', 'album', 'artist', 'band', 'spotify', 'apple music', 'concert', 'festival',
    'jazz', 'rock', 'pop', 'classical', 'hip hop', 'country', 'electronic', 'indie',
    
    // Books & Literature
    'book', 'author', 'novel', 'reading', 'kindle', 'audiobook', 'bestseller', 'fiction',
    'non-fiction', 'biography', 'poetry', 'magazine', 'newspaper',
    
    // Gaming
    'game', 'gaming', 'xbox', 'playstation', 'nintendo', 'steam', 'mobile game', 'esports',
    'twitch', 'streaming', 'multiplayer', 'rpg', 'strategy',
  ],
  
  lifestyle: [
    // Food & Dining
    'restaurant', 'cuisine', 'cooking', 'chef', 'food', 'dining', 'coffee', 'wine',
    'italian', 'chinese', 'mexican', 'sushi', 'pizza', 'burger', 'vegan', 'organic',
    
    // Travel & Culture
    'travel', 'vacation', 'culture', 'museum', 'art gallery', 'theater', 'opera',
    'architecture', 'history', 'photography', 'painting', 'sculpture',
    
    // Sports & Activities
    'sports', 'fitness', 'yoga', 'running', 'cycling', 'swimming', 'hiking',
    'basketball', 'football', 'soccer', 'tennis', 'golf', 'gym', 'workout',
    
    // Technology
    'technology', 'tech', 'startup', 'innovation', 'ai', 'machine learning',
    'coding', 'programming', 'software', 'app', 'digital', 'internet',
  ]
};

const ENTITY_PATTERNS = [
  // Movie/TV show patterns
  /\b(?:watched|love|favorite|enjoyed|binge)\s+([A-Z][a-z\s&]+)(?:\s+(?:movie|film|show|series))/gi,
  
  // Music patterns  
  /\b(?:listen to|love|favorite)\s+([A-Z][a-z\s&]+)(?:\s+(?:music|band|artist))/gi,
  
  // Book patterns
  /\b(?:read|reading|loved)\s+([A-Z][a-z\s&'"]+)(?:\s+(?:book|novel))/gi,
  
  // General entity patterns
  /\b(?:big fan of|really into|passionate about)\s+([A-Z][a-z\s&]+)/gi,
];

interface CulturalExtraction {
  entities: string[];
  keywords: string[];
  categories: string[];
  confidence: number;
}

interface TranscriptSegment {
  text: string;
  timestamp?: number;
  speaker?: string;
}

class CulturalIntelligenceExtractor {
  
  /**
   * Extract cultural preferences from conversation transcript
   */
  async extractCulturalInsights(transcript: string | TranscriptSegment[]): Promise<CulturalExtraction> {
    const fullText = this.normalizeTranscript(transcript);
    
    // Extract entities and keywords
    const entities = this.extractEntities(fullText);
    const keywords = this.extractKeywords(fullText);
    const categories = this.categorizePreferences(keywords);
    
    // Calculate confidence based on number of cultural mentions
    const confidence = this.calculateConfidence(entities, keywords);
    
    return {
      entities: [...new Set(entities)], // Remove duplicates
      keywords: [...new Set(keywords)],
      categories: [...new Set(categories)],
      confidence
    };
  }

  /**
   * Get real-time cultural analysis using Qloo
   */
  async analyzeCulturalFitFromConversation(
    transcript: string | TranscriptSegment[], 
    roleType: string = 'Sales Role'
  ) {
    try {
      const extraction = await this.extractCulturalInsights(transcript);
      
      if (extraction.entities.length === 0 && extraction.keywords.length === 0) {
        return {
          score: 0,
          insights: ['No cultural preferences detected in conversation'],
          recommendations: [],
          audiences: [],
          extractedData: extraction
        };
      }

      // Use extracted entities and keywords for Qloo analysis
      const searchTerms = [...extraction.entities, ...extraction.keywords].slice(0, 5);
      const analysis = await qloo.analyzeCulturalFit(searchTerms, roleType);
      
      return {
        ...analysis,
        extractedData: extraction,
        insights: [
          ...analysis.insights,
          `Extracted ${extraction.entities.length} cultural entities from conversation`,
          `Identified ${extraction.categories.length} cultural categories`,
          `Confidence level: ${Math.round(extraction.confidence * 100)}%`
        ]
      };
    } catch (error) {
      console.error('Error analyzing cultural fit from conversation:', error);
      return {
        score: 0,
        insights: ['Unable to analyze cultural preferences from conversation'],
        recommendations: [],
        audiences: [],
        extractedData: { entities: [], keywords: [], categories: [], confidence: 0 }
      };
    }
  }

  /**
   * Simulate real-time analysis for demo purposes
   */
  async simulateCallAnalysis(candidateName: string): Promise<{
    transcript: string;
    culturalAnalysis: any;
    extractedData: CulturalExtraction;
  }> {
    // Simulated conversation transcript based on candidate
    const simulatedTranscripts = {
      'Alex Rivera': `Hi Alex, tell me about your interests outside of work. 
        Well, I'm really passionate about film - I love Christopher Nolan movies like Inception and Interstellar. 
        I also listen to a lot of jazz music, especially Miles Davis and John Coltrane. 
        On weekends, I enjoy going to art galleries and I'm really into contemporary photography. 
        I'm also fascinated by technology and AI innovations.`,
      
      'Maya Chen': `What do you enjoy doing in your free time, Maya?
        I'm a huge art enthusiast - I love visiting museums and galleries. 
        I'm particularly drawn to modern art and abstract expressionism. 
        I also enjoy fashion and follow designers like Virgil Abloh and Rei Kawakubo. 
        For entertainment, I love indie films and foreign cinema, especially Korean directors like Bong Joon-ho.`,
      
      'Jordan Smith': `Jordan, what are your hobbies and interests?
        I'm really into music - I go to a lot of concerts and music festivals. 
        I love hip-hop, electronic music, and discovered some amazing artists on Spotify. 
        I'm also active on social media and love creating content. 
        I enjoy streaming on Twitch and following entertainment trends.`,
      
      'Priya Patel': `Tell me about your personal interests, Priya.
        I'm an avid reader - I love both fiction and non-fiction books. 
        Recently I've been reading a lot of historical biographies and literary fiction. 
        I'm also interested in education and learning new things. 
        I enjoy documentaries, especially those about history and culture.`,
      
      'Marcus Johnson': `What do you like to do outside of work, Marcus?
        I'm really into sports - I play basketball regularly and follow the NBA. 
        I also love fitness and working out at the gym. 
        I'm passionate about community involvement and volunteer coaching. 
        I enjoy action movies and sports documentaries.`
    };

    const transcript = simulatedTranscripts[candidateName as keyof typeof simulatedTranscripts] || 
                     simulatedTranscripts['Alex Rivera'];

    const culturalAnalysis = await this.analyzeCulturalFitFromConversation(transcript, 'Creative Role');
    
    return {
      transcript,
      culturalAnalysis,
      extractedData: culturalAnalysis.extractedData || { entities: [], keywords: [], categories: [], confidence: 0 }
    };
  }

  /**
   * Normalize transcript input to string
   */
  private normalizeTranscript(transcript: string | TranscriptSegment[]): string {
    if (typeof transcript === 'string') {
      return transcript.toLowerCase();
    }
    return transcript.map(segment => segment.text).join(' ').toLowerCase();
  }

  /**
   * Extract named entities from transcript
   */
  private extractEntities(text: string): string[] {
    const entities: string[] = [];
    
    ENTITY_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && match[1].trim().length > 2) {
          entities.push(match[1].trim());
        }
      }
    });
    
    return entities;
  }

  /**
   * Extract cultural keywords from transcript
   */
  private extractKeywords(text: string): string[] {
    const foundKeywords: string[] = [];
    
    Object.values(CULTURAL_KEYWORDS).flat().forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
      }
    });
    
    return foundKeywords;
  }

  /**
   * Categorize preferences into cultural categories
   */
  private categorizePreferences(keywords: string[]): string[] {
    const categories: string[] = [];
    
    Object.entries(CULTURAL_KEYWORDS).forEach(([category, categoryKeywords]) => {
      const hasKeywords = categoryKeywords.some(keyword => 
        keywords.includes(keyword)
      );
      if (hasKeywords) {
        categories.push(category);
      }
    });
    
    return categories;
  }

  /**
   * Calculate confidence score based on cultural mentions
   */
  private calculateConfidence(entities: string[], keywords: string[]): number {
    const totalMentions = entities.length + keywords.length;
    
    if (totalMentions === 0) return 0;
    if (totalMentions >= 10) return 1;
    if (totalMentions >= 5) return 0.8;
    if (totalMentions >= 3) return 0.6;
    if (totalMentions >= 1) return 0.4;
    
    return 0.2;
  }
}

export const culturalExtractor = new CulturalIntelligenceExtractor();
export type { CulturalExtraction, TranscriptSegment };
