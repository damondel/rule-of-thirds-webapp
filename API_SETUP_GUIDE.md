# API Integration Setup Guide

This guide provides step-by-step instructions for connecting the Rule of Thirds MCP Server with real data sources to replace simulated data with actual API integrations.

## 🎯 Overview

The Rule of Thirds MCP Server supports multiple API integrations across three agent types:

- **External Signals Agent**: News API, YouTube API, RSS feeds
- **Internal Research Agent**: File system access (no API setup required)
- **Product Metrics Agent**: Amplitude Analytics, custom metrics endpoints

By default, the server uses simulated data when APIs aren't configured. This guide shows how to wire up real data sources.

## 📋 Quick Setup Checklist

- [ ] Set up News API key
- [ ] Configure YouTube Data API key  
- [ ] Set up Amplitude Analytics (optional)
- [ ] Configure custom metrics endpoints (optional)
- [ ] Create environment configuration
- [ ] Test API connections
- [ ] Verify data collection

## 🔧 API Key Setup Instructions

### 1. News API Setup

**Purpose**: Collect recent news articles and market intelligence signals

1. **Get API Key**:
   - Visit [newsapi.org](https://newsapi.org/register)
   - Create free account (supports 1,000 requests/day)
   - Copy your API key from the dashboard

2. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:NEWS_API_KEY="your-news-api-key-here"
   
   # Linux/macOS
   export NEWS_API_KEY="your-news-api-key-here"
   ```

3. **Verify Setup**:
   ```bash
   # Test API connection
   curl -H "X-API-Key: your-news-api-key-here" \
     "https://newsapi.org/v2/everything?q=AI&pageSize=5"
   ```

### 2. YouTube Data API Setup

**Purpose**: Analyze video content and social signals around topics

1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing one
   - Enable YouTube Data API v3
   - Create credentials → API Key
   - Restrict key to YouTube Data API (recommended)

2. **Set Environment Variable**:
   ```bash
   # Windows PowerShell
   $env:YOUTUBE_API_KEY="your-youtube-api-key-here"
   
   # Linux/macOS  
   export YOUTUBE_API_KEY="your-youtube-api-key-here"
   ```

3. **Verify Setup**:
   ```bash
   # Test API connection
   curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=AI&key=your-youtube-api-key-here"
   ```

### 3. Amplitude Analytics Setup (Optional)

**Purpose**: Collect real product usage metrics and analytics data

1. **Get API Keys**:
   - Log in to [Amplitude](https://amplitude.com/)
   - Go to Settings → Projects → [Your Project] → General
   - Copy API Key and Secret Key

2. **Set Environment Variables**:
   ```bash
   # Windows PowerShell
   $env:AMPLITUDE_API_KEY="your-amplitude-api-key"
   $env:AMPLITUDE_SECRET_KEY="your-amplitude-secret-key"
   
   # Linux/macOS
   export AMPLITUDE_API_KEY="your-amplitude-api-key"
   export AMPLITUDE_SECRET_KEY="your-amplitude-secret-key"
   ```

### 4. Custom Metrics Endpoints Setup (Optional)

**Purpose**: Connect to your own analytics or metrics APIs

1. **Configure Endpoints**:
   ```bash
   # Windows PowerShell  
   $env:METRICS_ENDPOINTS='["https://api.yourcompany.com/metrics","https://api.yourapp.com/analytics"]'
   
   # Linux/macOS
   export METRICS_ENDPOINTS='["https://api.yourcompany.com/metrics","https://api.yourapp.com/analytics"]'
   ```

## ⚙️ Environment Configuration

### Option 1: Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
# News API Configuration
NEWS_API_KEY=your-news-api-key-here

# YouTube API Configuration  
YOUTUBE_API_KEY=your-youtube-api-key-here

# Amplitude Analytics (Optional)
AMPLITUDE_API_KEY=your-amplitude-api-key
AMPLITUDE_SECRET_KEY=your-amplitude-secret-key

# Custom Metrics Endpoints (Optional)
METRICS_ENDPOINTS=["https://api.yourcompany.com/metrics"]
```

### Option 2: Runtime Configuration

Pass configuration when initializing the orchestrator:

```javascript
import { RuleOfThirdsOrchestrator } from './build/orchestrator.js';

const orchestrator = new RuleOfThirdsOrchestrator({
    apis: {
        newsApiKey: 'your-news-api-key',
        youtubeApiKey: 'your-youtube-api-key',
        amplitudeApiKey: 'your-amplitude-api-key',
        amplitudeSecretKey: 'your-amplitude-secret-key',
        metricsEndpoints: ['https://api.yourcompany.com/metrics']
    }
});
```

## 🧪 Testing API Connections

### 1. Quick Connection Test

Create a test script to verify all APIs are working:

```javascript
// test-apis.js
import { RuleOfThirdsOrchestrator } from './build/orchestrator.js';

async function testAPIs() {
    const orchestrator = new RuleOfThirdsOrchestrator({
        output: { generateFiles: false, logLevel: 'debug' }
    });
    
    console.log('🧪 Testing API connections...');
    
    try {
        const results = await orchestrator.orchestrate(
            'test topic', 
            'test area'
        );
        
        console.log('✅ API Test Results:');
        console.log(`   External Signals: ${results.signals?.external?.length || 0} signals`);
        console.log(`   Product Metrics: ${results.signals?.product?.length || 0} metrics`);
        console.log(`   Success: ${results.success}`);
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
    }
}

testAPIs();
```

Run the test:
```bash
node test-apis.js
```

### 2. Individual API Testing

**Test News API**:
```bash
node -e "
const fetch = require('node-fetch');
fetch('https://newsapi.org/v2/everything?q=test&pageSize=1', {
    headers: { 'X-API-Key': process.env.NEWS_API_KEY }
}).then(r => r.json()).then(d => console.log('News API:', d.status));
"
```

**Test YouTube API**:
```bash
node -e "
const fetch = require('node-fetch');
fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=' + process.env.YOUTUBE_API_KEY)
.then(r => r.json()).then(d => console.log('YouTube API:', d.items ? 'OK' : 'Error'));
"
```

## 📊 Monitoring & Validation

### Expected Data Flow

When APIs are properly configured, you should see:

1. **Startup Logs**:
   ```
   🌐 External Signals Agent initialized
   📚 Internal Research Agent initialized  
   📊 Product Metrics Agent initialized
   ```

2. **API Connection Logs**:
   ```
   📰 Gathering news signals...
   📺 Gathering YouTube signals...
   📊 Collecting Amplitude metrics...
   ```

3. **Success Indicators**:
   ```
   📊 External signals collected: 14 total
   📊 Metrics collection complete: 56 data points
   ```

### Warning Signs of Missing APIs

- `⚠️ No News API key, using simulated data`
- `⚠️ No YouTube API key, using simulated data`  
- `❌ Amplitude metrics failed: [error message]`

## 🔒 Security Best Practices

### API Key Security

1. **Never commit API keys to version control**
2. **Use environment variables or secure key management**
3. **Rotate keys regularly**
4. **Restrict API key permissions when possible**

### Rate Limiting

The server includes built-in rate limiting:
- News API: Max 100 articles per request
- YouTube API: Max 25 videos per request
- Amplitude: Batched requests with retry logic

### Error Handling

All APIs include graceful fallbacks:
- Network failures → Retry with exponential backoff
- API errors → Log error and use simulated data
- Missing keys → Use simulated data (no errors)

## 🚀 Production Deployment

### Environment Setup for Production

```bash
# Production environment variables
NEWS_API_KEY=prod-news-api-key
YOUTUBE_API_KEY=prod-youtube-api-key
AMPLITUDE_API_KEY=prod-amplitude-key
AMPLITUDE_SECRET_KEY=prod-amplitude-secret

# Production configuration
NODE_ENV=production
LOG_LEVEL=info
OUTPUT_DIR=/app/outputs
```

### Scaling Considerations

- **API Rate Limits**: Monitor usage against plan limits
- **Caching**: Consider caching API responses for repeated queries
- **Load Balancing**: Multiple server instances can share API quotas
- **Monitoring**: Set up alerts for API failures or rate limit hits

## 🎯 Next Steps

After completing API setup:

1. **Run Full Demo**: `npm run demo` to see real data collection
2. **Review Output Files**: Check `./outputs/` for markdown reports  
3. **Integrate with MCP Client**: Use the MCP server tools in your AI application
4. **Monitor Usage**: Track API quotas and performance
5. **Scale as Needed**: Add more data sources or increase API limits

## 📞 Support & Troubleshooting

### Common Issues

**"No signals collected"**:
- Verify API keys are set correctly
- Check network connectivity
- Review API quota limits

**"API key invalid"**:
- Regenerate API keys
- Check key format and restrictions
- Verify API is enabled in provider console

**"Rate limit exceeded"**:  
- Reduce maxResults in configuration
- Wait for quota reset
- Upgrade API plan if needed

### Debug Mode

Enable debug logging for detailed troubleshooting:

```javascript
const orchestrator = new RuleOfThirdsOrchestrator({
    output: { logLevel: 'debug' }
});
```

This will show detailed API request/response information and error details.

---

## ✅ Completion Checklist

Once you've completed the setup:

- [ ] All desired API keys are configured
- [ ] Environment variables are set correctly  
- [ ] Test script runs without errors
- [ ] Demo generates real data (not simulated)
- [ ] Output files contain actual API data
- [ ] No warning messages about missing API keys
- [ ] Production environment is configured
- [ ] Monitoring and alerts are in place

**🎉 Congratulations!** Your Rule of Thirds MCP Server is now connected to real data sources and ready for production use.