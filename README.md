# HireFlow - AI-Powered Hiring & Collaboration Platform

HireFlow is a comprehensive platform that transforms how organizations hire, interview, and collaborate through AI-powered voice agents, live streaming, and intelligent candidate tracking. Built with Next.js 15, it combines real-time analytics with personalized hiring experiences to revolutionize workplace recruitment and team collaboration.

## Features

### 🎥 Live Virtual Meetings & Job Fairs
- **High-quality live streaming** with Stream.io integration
- **Real-time chat** with message moderation and engagement tracking
- **Dynamic interview scheduling** that appears based on candidate behavior
- **Live analytics dashboard** with participant count and engagement metrics
- **OBS integration** for professional broadcasting

### 🤖 AI-Powered Interview Bots
- **Custom AI interviewer creation** with Vapi.ai integration
- **Voice-first interviews** with natural speech recognition and synthesis
- **Dynamic interview flow** that adapts to candidate responses
- **Emotional intelligence** with human-like conversation patterns
- **Automated interview management** with scheduling and duration tracking

### 📊 Candidate Pipeline Tracking
- **Multi-stage hiring pipeline**: Applied → Screened → Interviewed → Offered → Hired
- **Real-time status updates** as candidates progress through the hiring funnel
- **Behavioral analytics** to monitor candidate engagement patterns
- **Predictive scoring** based on candidate performance and interactions
- **Visual hiring funnel** with drag-and-drop interface

### 🎯 Hyper-Personalized Hiring Experience
- **Real-time personalization** based on candidate profile and behavior
- **Contextual recommendations** powered by AI
- **Intelligent interview questions** triggered by skill assessments
- **Personalized job offers** with dynamic compensation packages
- **A/B testing framework** for continuous hiring optimization

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Live Streaming**: Stream.io Video SDK
- **Voice AI**: Vapi.ai
- **State Management**: Zustand
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication
- Stream.io account for live streaming
- Vapi.ai account for voice AI

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Arjunhg/HireFlow.git
cd HireFlow
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

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Live Streaming (Stream.io)
NEXT_PUBLIC_STREAM_USER_ID=your_stream_user_id
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET=your_stream_secret
STREAM_TOKEN=your_stream_token
STREAM_CALL_ID=your_stream_call_id
RMTP_URL=your_rtmp_url

# Voice AI (Vapi.ai)
VAPI_PRIVATE_KEY=your_vapi_private_key
VAPI_ORG_ID=your_vapi_org_id
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key

NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your_assemblyai_api_key

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

### Creating a Virtual Meeting/Job Fair
1. Navigate to the Virtual Meetings section
2. Click "Create Meeting"
3. Fill in basic information (title, description, date/time)
4. Configure interview settings and AI interviewer
5. Set additional options (skills assessment, candidate tracking)
6. Publish the meeting

### Setting up AI Interviewers
1. Go to the AI Interviewers section
2. Click "Create Interviewer"
3. Configure the interviewer's personality and question bank
4. Set up interview flows and candidate assessment criteria
5. Test the interviewer before using in meetings

### Managing Candidate Pipeline
1. Access the Pipeline view for any meeting
2. Monitor candidates as they move through hiring stages
3. Use tags to categorize and segment candidates
4. Analyze hiring success rates and optimize interview strategies


## Live Demo

Visit [work-cast.vercel.app](https://work-cast.vercel.app) to see the platform in action.

---

Built with ❤️ by [Arjun Sharma](https://github.com/Arjunhg) and [Anushka Chaudhary](https://github.com/Anu19-10)
