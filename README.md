# Rule of Thirds MCP Server

A Model Context Protocol (MCP) server implementing the **Rule of Thirds** methodology for comprehensive product intelligence gathering. This server orchestrates three specialized agents to triangulate strategic insights from multiple signal sources.

![Rule of Thirds Architecture](https://img.shields.io/badge/MCP-2024--11--05-blue) ![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)

## 🎯 What is the Rule of Thirds?

The Rule of Thirds methodology combines three distinct signal sources to provide comprehensive product intelligence:

- **🌐 External Market Intelligence** - News, social media, industry trends, competitor analysis
- **📚 Internal Research Analysis** - Documents, transcripts, surveys, user interviews  
- **📊 Product Usage Analytics** - Metrics, user behavior, performance data, A/B tests

By triangulating these three perspectives, you get a complete 360° view for strategic decision-making.

## 🔺 MCP Tools Available

### Individual Analysis Tools
- **`analyze_market_trends`** - Gather external market intelligence and competitive signals
- **`analyze_internal_research`** - Process internal documents, research, and qualitative data  
- **`analyze_product_metrics`** - Collect and analyze product usage and performance metrics

### Comprehensive Analysis
- **`triangulate_signals`** - Combine all three sources using Rule of Thirds methodology for complete strategic intelligence

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- VS Code Insiders (for Agent Mode integration)
- API keys (optional, works with simulated data)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rule-of-thirds

# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Test the server (optional)
npm run start
```

### VS Code Insiders Configuration

Add to your VS Code Insiders MCP configuration file (`mcp.json`):

```json
{
  "mcpServers": {
    "rule-of-thirds": {
      "command": "node",
      "args": ["build/server.js"],
      "cwd": "/path/to/rule-of-thirds",
      "env": {
        "NEWS_API_KEY": "your-news-api-key",
        "YOUTUBE_API_KEY": "your-youtube-api-key"
      }
    }
  }
}
```

**Configuration Locations:**
- Windows: `%APPDATA%\\Code - Insiders\\User\\mcp.json`
- macOS: `~/Library/Application Support/Code - Insiders/User/mcp.json`
- Linux: `~/.config/Code - Insiders/User/mcp.json`

## 📖 Usage Examples

### In VS Code Insiders Agent Mode

```
🔺 Triangulate market signals for "AI productivity tools" in the SaaS space

🌐 Analyze market trends for "mobile banking apps" focusing on security features

📚 Process our internal research on "user onboarding" and identify key insights

📊 Collect product metrics for "checkout funnel" and highlight optimization opportunities
```

### Direct MCP Protocol Usage

```javascript
// Example tool call via MCP protocol
{
  "method": "tools/call",
  "params": {
    "name": "triangulate_signals",
    "arguments": {
      "topic": "AI productivity tools",
      "focus_area": "enterprise adoption patterns"
    }
  }
}
```

## 🏗️ Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Protocol Layer                       │
├─────────────────────────────────────────────────────────────┤
│                Rule of Thirds Orchestrator                 │
├─────────────────────────────────────────────────────────────┤
│  External Signals  │  Internal Research  │ Product Metrics  │
│     Agent          │       Agent         │      Agent       │
├────────────────────┼─────────────────────┼──────────────────┤
│ • News API         │ • File Analysis     │ • Amplitude      │
│ • YouTube API      │ • Document Processing│ • Custom APIs    │
│ • RSS Feeds        │ • Text Extraction   │ • Analytics      │
│ • Social Media     │ • Content Analysis  │ • Usage Patterns │
└────────────────────┴─────────────────────┴──────────────────┘
```

### Data Flow

1. **Signal Collection** - Three agents run in parallel to gather data
2. **Signal Processing** - Raw data is cleaned, ranked, and structured  
3. **Insight Synthesis** - Cross-agent analysis generates strategic insights
4. **Output Generation** - Comprehensive reports with AI analysis prompts

### Output Files Generated

Each analysis creates timestamped reports in the `outputs/` directory:

- `{topic}_{timestamp}_combined_insight_report.json` - Structured strategic insights
- `{topic}_{timestamp}_human_readable_summary.md` - Executive summary
- `{topic}_{timestamp}_external_signals.json` - Market intelligence data
- `{topic}_{timestamp}_internal_signals.json` - Research findings
- `{topic}_{timestamp}_product_signals.json` - Usage analytics
- `{topic}_{timestamp}_orchestration_metadata.json` - Analysis metadata

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration (optional - falls back to simulated data)
NEWS_API_KEY=your_newsapi_key
YOUTUBE_API_KEY=your_youtube_key
AMPLITUDE_API_KEY=your_amplitude_key

# Server Configuration
MCP_SILENT=true                    # Suppress console output for MCP mode
NODE_ENV=production                # Environment mode
```

### API Setup

Detailed API setup instructions are available in [`API_SETUP_GUIDE.md`](./API_SETUP_GUIDE.md).

The server gracefully falls back to simulated data when API keys are not configured, making it fully functional for testing and development.

### Agent Configuration

Each agent can be configured via the orchestrator constructor:

```javascript
const orchestrator = new RuleOfThirdsOrchestrator({
  external: {
    sources: { news: true, youtube: true, rss: true },
    maxResults: 50
  },
  internal: {
    supportedFormats: ['.md', '.txt', '.pdf', '.docx'],
    maxFileSize: 10485760  // 10MB
  },
  product: {
    dataSources: ['amplitude', 'custom'],
    timeRange: '30d'
  }
});
```

## 🛠️ Development

### Project Structure

```
rule-of-thirds/
├── src/
│   ├── server.ts              # MCP protocol implementation
│   ├── orchestrator.ts        # Main orchestration logic
│   └── agents/
│       ├── externalSignalsAgent.ts
│       ├── internalResearchAgent.ts
│       └── productMetricsAgent.ts
├── templates/                 # Handlebars templates for outputs
├── build/                     # Compiled JavaScript (generated)
├── outputs/                   # Generated analysis reports
├── package.json
├── tsconfig.json
└── README.md
```

### Build Commands

```bash
# Development
npm run build              # Compile TypeScript
npm run start              # Start MCP server
npm run dev                # Development mode with watch

# Testing
npm test                   # Run test suite (if configured)
```

### Adding New Signal Sources

1. **Extend an existing agent** by adding new data source methods
2. **Create a new agent** by implementing the agent interface
3. **Update the orchestrator** to include the new agent in parallel execution
4. **Add MCP tool definitions** in `server.ts` for new capabilities

## 📊 Output Examples

### Market Trends Analysis
```markdown
# 🌐 Market Trends Analysis

**Topic:** AI productivity tools
**Focus:** Enterprise adoption
**Signals Found:** 47

## Market Intelligence
- **News**: 23 signals
- **YouTube**: 15 signals  
- **RSS**: 9 signals

## Key Market Trends
- Enterprise AI adoption up 67% YoY
- Focus shifting to workflow automation
- Security concerns driving vendor selection
```

### Signal Triangulation
```markdown
# 🔺 Signal Triangulation Analysis

**Topic:** Mobile banking security
**Status:** ✅ Complete
**Analysis Time:** 3,247ms

## Triangulated Signal Sources
- **🌐 Market Intelligence:** 34 external signals
- **📚 Internal Research:** 12 research findings  
- **📊 Usage Analytics:** 89 product data points

## Triangulated Insights
Cross-source analysis reveals increasing user concern about biometric security,
supported by 73% of survey respondents and 45% increase in security-related
support tickets, while competitor analysis shows market moving toward
hardware-based authentication solutions.
```

## 🔒 Privacy & Security

- **Local Processing** - All analysis runs locally, data stays in your environment
- **API Key Security** - Keys stored in environment variables, never logged
- **Configurable Data Sources** - Full control over what data sources are accessed
- **Optional Analytics** - Works fully offline with simulated data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues** - Report bugs or request features via GitHub Issues
- **Documentation** - Check [`API_SETUP_GUIDE.md`](./API_SETUP_GUIDE.md) for detailed setup
- **Community** - Join discussions in GitHub Discussions

## 🏷️ Version History

- **v1.0.0** - Initial release with Rule of Thirds methodology
- **v1.1.0** - Added signal triangulation tool and improved MCP integration
- **v1.2.0** - Enhanced VS Code Insiders Agent Mode compatibility

---

**Built with ❤️ for strategic product intelligence**

Transform scattered signals into strategic insights with the Rule of Thirds methodology.