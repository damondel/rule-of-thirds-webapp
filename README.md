# Rule of Thirds Web Application

A modern web application for comprehensive product intelligence gathering using the **Rule of Thirds** methodology. This platform orchestrates three specialized agents to triangulate strategic insights from multiple signal sources.

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue) ![React](https://img.shields.io/badge/React-18.2-blue)

## 🎯 What is the Rule of Thirds?

The Rule of Thirds methodology combines three distinct signal sources to provide comprehensive product intelligence:

- **🌐 External Market Intelligence** - News, social media, industry trends, competitor analysis
- **📚 Internal Research Analysis** - Documents, transcripts, surveys, user interviews
- **📊 Product Usage Analytics** - Metrics, user behavior, performance data, A/B tests

By triangulating these three perspectives, you get a complete 360° view for strategic decision-making.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Optional: OpenAI API key for LLM-powered synthesis

### Installation

```bash
# Install dependencies
npm install

# Install web dependencies
cd web && npm install && cd ..

# Build the project
npm run build
```

### Running the Application

```bash
# Development mode (runs both backend and frontend)
npm run dev

# Production mode (serves built frontend from backend)
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173 (development) or http://localhost:3001 (production)
- **API**: http://localhost:3001/api/

## 📖 Usage

1. **Enter a Topic**: Type in the product or market area you want to analyze
2. **Add Focus Area** (optional): Specify a particular aspect to concentrate on
3. **Click "Start Analysis"**: The system will orchestrate all three agents in parallel
4. **Review Results**: View triangulated insights across external signals, internal research, and product metrics

## 🏗️ Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
│              Triangular visualization & UI                  │
├─────────────────────────────────────────────────────────────┤
│                    Express REST API                         │
│                  /api/orchestrate endpoint                  │
├─────────────────────────────────────────────────────────────┤
│                Rule of Thirds Orchestrator                 │
├─────────────────────────────────────────────────────────────┤
│  External Signals  │  Internal Research  │ Product Metrics  │
│     Agent          │       Agent         │      Agent       │
├────────────────────┼─────────────────────┼──────────────────┤
│ • News API         │ • File Analysis     │ • Analytics      │
│ • YouTube API      │ • Document Processing│ • Usage Patterns │
│ • RSS Feeds        │ • Text Extraction   │ • Simulated Data │
│ • Social Media     │ • Content Analysis  │ • Metrics        │
└────────────────────┴─────────────────────┴──────────────────┘
```

### Data Flow

1. **User Input** - Topic and focus area entered in React UI
2. **API Request** - Frontend calls `/api/orchestrate` endpoint
3. **Parallel Agent Execution** - Three agents run simultaneously
4. **Signal Collection** - Raw data is gathered from multiple sources
5. **LLM Synthesis** (optional) - OpenAI analyzes and synthesizes insights
6. **Response** - Structured results returned to frontend
7. **Visualization** - Triangular grid displays signal distribution

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# OpenAI Configuration (optional - falls back to simulated data)
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

# API Configuration (optional - falls back to simulated data)
NEWS_API_KEY=your_newsapi_key
YOUTUBE_API_KEY=your_youtube_key
```

### API Setup

The application works fully without API keys using simulated data. For production use:

1. **OpenAI API** - Get your key from [platform.openai.com](https://platform.openai.com/)
2. **News API** - Get your key from [newsapi.org](https://newsapi.org/)
3. **YouTube API** - Get your key from [Google Cloud Console](https://console.cloud.google.com/)

## 🛠️ Development

### Project Structure

```
rule-of-thirds/
├── src/                      # Backend TypeScript source
│   ├── httpServer.ts         # Express server & API
│   ├── orchestrator.ts       # Main orchestration logic
│   └── agents/               # Three specialized agents
│       ├── externalSignalsAgent.ts
│       ├── internalResearchAgent.ts
│       └── productMetricsAgent.ts
├── web/                      # React frontend
│   ├── src/
│   │   ├── App.tsx           # Main application component
│   │   └── index.css         # Styles
│   └── dist/                 # Built frontend (generated)
├── build/                    # Compiled backend (generated)
├── outputs/                  # Generated analysis reports
├── templates/                # Report templates
├── package.json
└── tsconfig.json
```

### Build Commands

```bash
# Development
npm run dev              # Run both backend and frontend with hot reload
npm run dev:backend      # Run backend only
npm run dev:frontend     # Run frontend only

# Production
npm run build            # Build both backend and frontend
npm start                # Start production server

# Testing
npm run build            # Compile and build everything
```

### API Endpoints

#### Health Check
```http
GET /api/health
```

#### Orchestrate Analysis
```http
POST /api/orchestrate
Content-Type: application/json

{
  "topic": "AI productivity tools",
  "focus_area": "enterprise adoption"
}
```

#### Get Status
```http
GET /api/status
```

#### Get Capabilities
```http
GET /api/capabilities
```

## 📊 Output Examples

### Successful Analysis Response

```json
{
  "success": true,
  "timestamp": "2025-10-02T12:00:00.000Z",
  "topic": "AI productivity tools",
  "productArea": "enterprise adoption",
  "insights": {
    "summary": "Cross-validated insights...",
    "opportunities": [...],
    "llmSynthesis": {...}
  },
  "signals": {
    "external": {
      "status": "success",
      "signalCount": 34
    },
    "internal": {
      "status": "success",
      "findingCount": 12
    },
    "product": {
      "status": "success",
      "dataPointCount": 89
    }
  },
  "metadata": {
    "executionTime": 3247,
    "totalSignals": 135
  }
}
```

## 🔒 Privacy & Security

- **Local Processing** - All analysis runs on your infrastructure
- **API Key Security** - Keys stored in environment variables, never logged or exposed
- **Configurable Data Sources** - Full control over what APIs are accessed
- **Optional Analytics** - Works fully offline with simulated data
- **No Data Storage** - Analyses are ephemeral (unless you implement persistence)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🏷️ Version History

- **v2.0.0** - Complete rewrite as web application with React frontend
- **v1.2.0** - MCP server with VS Code integration (deprecated)

---

**Built for strategic product intelligence**

Transform scattered signals into strategic insights with the Rule of Thirds methodology.
