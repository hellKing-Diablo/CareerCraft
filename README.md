# CareerCraft

A gamified healthcare technology career guidance platform with AI-powered personalized recommendations. Build your skills, track your progress, and achieve your career goals.

## Features

### Core Features
- **Interactive Skill Tree** - Visual node-based skill graph with prerequisites and progress tracking
- **Gap Analysis** - Compare your skills against target roles and identify gaps
- **Progress Tracking** - Track skill levels (0-5) with visual progress indicators
- **Career Goals** - Set short-term and long-term career objectives

### AI-Powered Features (Groq - FREE)
- **Dashboard Insights** - Personalized career recommendations based on your profile
- **Learning Path Generation** - Step-by-step roadmap to reach your goals
- **Skill Guidance** - Detailed tips, resources, and practice ideas for each skill
- **Gap Improvement Plan** - Strategic actions (quick wins, medium-term, long-term)

### UI/UX
- **Dark/Light Theme** - Toggle between modes with smooth transitions
- **Responsive Design** - Works on desktop and mobile devices
- **Gamification** - Pixel art characters, badges, and achievement system
- **Smooth Animations** - Framer Motion powered interactions

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | React | 18.3.1 |
| **Language** | TypeScript | 5.6.2 |
| **Build Tool** | Vite | 6.0.5 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **State Management** | Zustand | 4.5.0 |
| **Routing** | React Router DOM | 6.22.0 |
| **Animations** | Framer Motion | 11.0.0 |
| **Icons** | Lucide React | 0.330.0 |
| **Graph Visualization** | @xyflow/react | 12.0.0 |
| **AI Provider** | Groq (Llama 3) | groq-sdk |

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/careercraft.git
cd careercraft

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Add your Groq API key (FREE - get from https://console.groq.com/keys)
# Edit .env and add your key

# 5. Start development server
npm run dev
```

### Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Groq API Key (FREE!)
# Get your key from: https://console.groq.com/keys
VITE_GROQ_API_KEY=your_api_key_here
```

### Getting a FREE Groq API Key

1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up for a free account (no credit card required)
3. Create a new API key
4. Copy the key to your `.env` file

**Groq Free Tier Limits:**
- 30 requests/minute
- 14,400 requests/day
- Access to Llama 3.1 8B and Llama 3.3 70B models

## Test Credentials

This application uses **client-side storage only** (localStorage). No login is required.

To load sample data for testing:
1. Go to **Settings** page
2. Click **"Load Mock Data"** button in the Data Management section

This will populate the app with:
- Sample user profile
- Pre-filled skills with various levels
- Career goals
- Gap analysis data

## Project Structure

```
careercraft/
├── src/
│   ├── components/
│   │   ├── ai/              # AI-powered components
│   │   │   ├── DashboardInsights.tsx
│   │   │   ├── LearningPath.tsx
│   │   │   ├── GapImprovementPlan.tsx
│   │   │   └── SkillGuidance.tsx
│   │   ├── common/          # Reusable UI components
│   │   ├── flow/            # Skill graph components
│   │   └── game/            # Gamification elements
│   ├── data/
│   │   ├── skillOntology.ts # Skill definitions & prerequisites
│   │   └── roleBenchmarks.ts # Target role requirements
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Skills.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── aiService.ts     # Groq AI integration
│   ├── store/
│   │   ├── userStore.ts     # User profile & skills
│   │   ├── graphStore.ts    # Skill graph & gap analysis
│   │   ├── aiStore.ts       # AI configuration & cache
│   │   └── themeStore.ts    # Theme preferences
│   ├── types/
│   │   ├── index.ts         # Core type definitions
│   │   └── ai.ts            # AI-related types
│   └── utils/
│       └── cn.ts            # Tailwind class utility
├── .env                     # Environment variables (not committed)
├── .env.example             # Example environment file
└── package.json
```

## Error Handling

The application handles common errors gracefully:

| Error | User Message | Recovery |
|-------|--------------|----------|
| No API Key | "Configure API key in Settings" | Link to Settings page |
| Invalid API Key | "Invalid API key" | Clear and re-enter key |
| Rate Limit | "Please wait a moment" | Auto-retry with backoff |
| Network Error | "Failed to connect" | Retry button |
| Parse Error | Falls back to defaults | Logs warning to console |

### Built-in Rate Limiting
- Minimum 5 seconds between requests
- Maximum 3 requests per minute
- Prevents hitting Groq API limits

## Security Notes

**No secrets are committed to this repository.**

- `.env` file is in `.gitignore`
- API keys are stored in browser localStorage only
- Direct browser-to-Groq API calls (no backend server)
- Users provide their own API keys

### Files excluded from version control:
```
.env
.env.local
.env.*.local
node_modules/
dist/
```

## AI Models Available

| Model | ID | Best For |
|-------|-----|----------|
| **Llama 3.1 8B** | `llama-3.1-8b-instant` | Fast responses, quick guidance |
| **Llama 3.3 70B** | `llama-3.3-70b-versatile` | Detailed, nuanced responses |

Both models are **completely FREE** on Groq!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with React, TypeScript, and AI-powered by Groq
