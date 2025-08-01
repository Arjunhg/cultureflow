# CultureFlow - AI-Powered Cultural Intelligence Hiring Platform

CultureFlow is a revolutionary hiring platform that transforms recruitment through AI-powered cultural intelligence, real-time conversation analysis, and voice-first interviews. Built with Next.js 15, it combines advanced cultural profiling with technical assessment to create comprehensive candidate evaluations that go beyond traditional hiring approaches.

## Features

### 🧠 Cultural Intelligence & Real-Time Analysis
- **Live Cultural Profiling** with Qloo API integration for entertainment, lifestyle, and interest analysis
- **Real-time Conversation Analysis** using AssemblyAI Universal Streaming v3
- **Automatic Cultural Extraction** from interview transcripts (movies, music, books, hobbies)
- **Cultural Fit Scoring** with AI-powered recommendations and audience matching
- **Personality Insights** derived from natural conversation patterns
- **Dynamic Cultural Categories** extracted from candidate preferences and values

### 🎤 Advanced Voice-First Interviews
- **VAPI Voice Technology** with natural speech recognition and synthesis
- **Real-time Transcription** with microphone capture and audio processing
- **Session Auto-Detection** with webhook-based session management
- **Cultural-Enhanced Questioning** that adapts based on detected interests
- **Emotional Intelligence** with human-like conversation patterns
- **Seamless Session Integration** between voice calls and cultural analysis

### 📊 Comprehensive Candidate Assessment
- **Multi-Dimensional Scoring**: Technical (40%) + Cultural Fit (35%) + Communication (25%)
- **Real-time Cultural Insights** with automatic Qloo entity and audience matching
- **Behavioral Analytics** monitoring engagement patterns and authenticity markers
- **Predictive Cultural Alignment** based on entertainment preferences and lifestyle choices
- **Visual Assessment Dashboard** with cultural categories and recommendation engine

### 🎯 Cultural Intelligence-Powered Personalization
- **Real-time Cultural Adaptation** based on detected entertainment preferences and lifestyle
- **Contextual Interview Questions** that connect technical skills to personal interests
- **Intelligent Cultural Recommendations** powered by Qloo's cultural intelligence API
- **Personalized Assessment Framework** combining technical competency with cultural alignment
- **Dynamic Conversation Flow** that adapts to candidate's communication style and interests
- **Cultural Fit Predictions** for role and team compatibility

### 🔄 Live Streaming & Virtual Events (Legacy Features)
- **High-quality live streaming** with Stream.io integration
- **Real-time chat** with message moderation and engagement tracking
- **Dynamic interview scheduling** based on cultural and behavioral analysis
- **Live analytics dashboard** with cultural insights and engagement metrics
- **OBS integration** for professional broadcasting

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Cultural Intelligence**: Qloo API for entertainment and lifestyle analysis
- **Real-time Transcription**: AssemblyAI Universal Streaming v3
- **Voice AI**: VAPI for natural conversation and session management
- **Live Streaming**: Stream.io Video SDK (legacy feature)
- **State Management**: Zustand with real-time session stores
- **Deployment**: Azure/Vercel with webhook integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication
- Qloo API key for cultural intelligence
- AssemblyAI API key for real-time transcription
- VAPI account for voice AI interviews
- Stream.io account for live streaming (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Arjunhg/cultureflow.git
cd cultureflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/callback
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/callback

# Base URL (update with your deployed URL for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cultural Intelligence (Qloo API)
NEXT_PUBLIC_QLOO_API_KEY=your_qloo_hackathon_api_key

# Real-time Transcription (AssemblyAI)
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Voice AI (VAPI)
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_ORG_ID=your_vapi_org_id
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key

# Live Streaming (Stream.io) - Optional for legacy features
NEXT_PUBLIC_STREAM_USER_ID=your_stream_user_id
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET=your_stream_secret
STREAM_TOKEN=your_stream_token
STREAM_CALL_ID=your_stream_call_id
RMTP_URL=your_rtmp_url

# Database
DATABASE_URL=your_postgresql_connection_string
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## OBS Setup for Live Virtual Meetings

### Prerequisites
- OBS Studio installed
- Active virtual meeting session in HireFlow

### Configuration Steps

1. **Get OBS Credentials**
   - Start a virtual meeting in HireFlow
   - Click "Get OBS Creds" button
   - Copy the RTMP URL and Stream Key

2. **Configure OBS Stream Settings**
   - Open OBS Studio
   - Go to Settings → Stream
   - Select "Custom" as the service
   - Enter the RTMP URL in the Server field
   - Enter the Stream Key in the Stream Key field

3. **Recommended OBS Settings**
   - **Output Mode**: Advanced
   - **Encoder**: x264 (software) or NVENC (NVIDIA GPU)
   - **Rate Control**: CBR
   - **Bitrate**: 2500-4000 Kbps
   - **Keyframe Interval**: 2 seconds
   - **Preset**: Very Fast (x264) or Quality (NVENC)
   - **Profile**: Main
   - **Tune**: None

4. **Audio Settings**
   - **Sample Rate**: 44.1 kHz
   - **Channels**: Stereo
   - **Audio Bitrate**: 128 Kbps

5. **Start Streaming**
   - Click "Start Streaming" in OBS
   - Your stream will appear in the HireFlow virtual meeting interface

## Usage

### Setting up Cultural Intelligence Interviews
1. Navigate to the AI Agents section
2. Create or configure your AI interviewer with cultural intelligence prompts
3. Test the Qloo API connection using the "Test Qloo Connection" feature
4. Enable real-time transcription and cultural analysis
5. Configure VAPI webhooks for automatic session detection

### Conducting Cultural Intelligence Interviews
1. Use "Book a Call" to start a voice interview with candidates
2. The system automatically:
   - Captures real-time audio and transcription
   - Extracts cultural preferences (entertainment, lifestyle, interests)
   - Analyzes cultural fit using Qloo API
   - Provides real-time cultural insights and scoring
3. Monitor active sessions in the AI Agents dashboard
4. Review comprehensive cultural analysis reports post-interview

### Managing Cultural Profiles
1. Access the Candidate section to view cultural analysis results
2. Review extracted entertainment preferences, lifestyle choices, and interests
3. Analyze cultural fit scores and Qloo recommendations
4. Use cultural insights for role matching and team compatibility assessment

### Real-time Transcription Testing
1. Use the Assembly Test page for microphone and transcription testing
2. Validate real-time audio capture and processing
3. Test cultural keyword extraction from conversation
4. Verify integration between transcription and cultural analysis

## Key Features in Detail

### Cultural Intelligence Engine
- **Entertainment Analysis**: Automatic detection of movies, TV shows, music preferences
- **Lifestyle Profiling**: Food, travel, hobbies, and activity preferences
- **Interest Categorization**: Technology, sports, arts, and personal interests
- **Cultural Fit Scoring**: AI-powered compatibility analysis for roles and teams

### Real-time Processing
- **Live Audio Capture**: Microphone access with permission handling
- **Stream Processing**: Real-time audio conversion to PCM16 format
- **WebSocket Transcription**: AssemblyAI Universal Streaming v3 integration
- **Cultural Extraction**: Live processing of conversation for cultural insights

### VAPI Integration
- **Voice-First Interviews**: Natural conversation with AI interviewer "Eliot"
- **Session Management**: Automatic detection and tracking of interview sessions
- **Webhook Integration**: Real-time session creation and status updates
- **Cultural-Enhanced Prompts**: Interview questions adapted based on cultural insights

## Deployment & Production Setup

### Environment Configuration
1. Update `NEXT_PUBLIC_BASE_URL` with your deployed application URL
2. Ensure all API keys are properly configured in production environment
3. Configure VAPI webhooks with HTTPS URLs (required for production)

### VAPI Webhook Configuration
1. Deploy your application to get the HTTPS URL
2. Use the "Configure VAPI Webhooks" button in the AI Agents dashboard
3. This automatically updates all AI assistants with the correct webhook endpoints
4. Verify webhook functionality with test calls

### Cultural Intelligence Setup
1. Obtain Qloo Hackathon API key from Qloo platform
2. Test API connection using the built-in testing tools
3. Verify cultural analysis is working with sample conversations
4. Monitor cultural extraction accuracy and adjust keywords if needed

## API Endpoints

### Cultural Intelligence
- `GET /api/qloo-test` - Test Qloo API connection and entity search
- `POST /api/vapi-webhook` - Receive VAPI session events and create cultural profiles

### Session Management  
- `GET /api/vapi-sessions` - Retrieve active interview sessions
- `POST /api/vapi-sessions` - Create new session with cultural analysis

### Real-time Transcription
- `GET /api/assemblyai-token` - Get temporary AssemblyAI access token
- WebSocket connection to AssemblyAI for live transcription streaming

## Contributing

This platform represents a new approach to hiring that combines technical assessment with cultural intelligence. Contributions are welcome, especially in areas of:
- Cultural analysis algorithm improvements
- Additional cultural data sources and APIs
- Enhanced real-time processing capabilities
- Interview question generation based on cultural insights


## Live Demo

Visit the deployed CultureFlow application to experience cultural intelligence hiring in action.
