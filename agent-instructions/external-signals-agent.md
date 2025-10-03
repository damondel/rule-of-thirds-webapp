# External Signals Agent Instructions

## Purpose

Gather market intelligence and external indicators to understand the broader market context around a given topic or product area.

## Core Responsibilities

### Data Collection Sources

- **News API**: Market trends and competitor mentions from news articles
- **YouTube API**: Video content analysis for market sentiment and educational content
- **RSS Feeds**: Industry sources and thought leadership content
- **Social Media Trends**: When configured, analyze social media signals
- **Industry Reports**: External research and market analysis

### Signal Processing

1. **Relevance Scoring**: Calculate relevance scores based on topic and product area mentions
2. **Content Analysis**: Extract key insights from titles, descriptions, and content
3. **Trend Identification**: Identify patterns across different signal sources
4. **Recency Weighting**: Prioritize more recent signals while maintaining historical context

## Analysis Methodology

### Relevance Calculation

- **Topic Matching** (50% weight): Direct mentions of the target topic
- **Product Area Matching** (30% weight): Mentions of specific product areas
- **Keyword Density** (20% weight): Frequency of related terms and concepts

### Combined Scoring Formula

```text
Combined Score = (Relevance Score × 0.7) + (Recency Score × 0.3)
```

### Recency Scoring

- **1 day old**: 1.0 score
- **1-7 days old**: 0.8 score  
- **1-30 days old**: 0.6 score
- **30+ days old**: 0.3 score

## Output Structure

### Signal Classification

Each signal should be classified with:

- **Type**: `news_article`, `youtube_video`, `rss_article`
- **Title**: Clear, descriptive title
- **Content**: Summary or excerpt of relevant content
- **Source**: Origin of the signal (publication, channel, etc.)
- **URL**: Link to original content
- **Published Date**: When the content was published
- **Relevance Score**: Calculated relevance (0.0 - 1.0)
- **Metadata**: Additional context (author, categories, etc.)

### Aggregated Results

- **Signal Count**: Total number of relevant signals found
- **Source Breakdown**: Distribution across different signal sources
- **Top Signal Types**: Most common types of signals discovered
- **Trend Summary**: Key patterns identified across signals

## Error Handling & Fallbacks

### API Failures

- Gracefully handle API rate limits and errors
- Fall back to simulated data when APIs are unavailable
- Log warnings for failed sources while continuing analysis

### Data Quality

- Filter out signals shorter than 50 characters
- Validate signal quality and relevance before inclusion
- Remove duplicate signals from the same source

## Configuration Options

### Customizable Parameters

- **Max Results**: Limit total signals returned (default: 20)
- **Timeframe**: How far back to search (default: 7 days)
- **Source Selection**: Enable/disable specific signal sources
- **RSS Sources**: Custom list of RSS feeds to monitor

### API Integration

- Support for optional API keys (News API, YouTube API)
- Graceful degradation when APIs are not configured
- Rate limiting and quota management

## Best Practices

### Signal Quality

1. Prioritize authoritative sources over unknown publishers
2. Weight longer, more detailed content higher than brief mentions
3. Consider source credibility in relevance calculations
4. Filter out promotional or advertising content when possible

### Performance

1. Execute API calls in parallel to minimize latency
2. Cache frequently accessed content to reduce API calls
3. Implement proper error boundaries for individual sources
4. Use exponential backoff for failed API requests

### Analysis Depth

1. Extract not just mentions but context around the topic
2. Identify sentiment and tone where possible
3. Look for emerging themes and patterns across signals
4. Track signal volume changes over time

## Output Examples

### News Signal

```json
{
  "type": "news_article",
  "title": "Industry Analysis: [Topic] Trends Reshape Market Landscape",
  "content": "Recent market analysis reveals significant shifts in [topic] adoption...",
  "source": "Tech Industry Report",
  "url": "https://example.com/news/[topic]-trends",
  "publishedAt": "2025-09-28T10:00:00Z",
  "relevanceScore": 0.85,
  "metadata": {
    "author": "Jane Tech",
    "urlToImage": "https://example.com/image.jpg"
  }
}
```

### YouTube Signal

```json
{
  "type": "youtube_video",
  "title": "[Topic] Explained: Complete Guide for Professionals",
  "content": "Comprehensive tutorial covering [topic] implementation...",
  "channel": "Tech Education Hub",
  "videoId": "abc123456789",
  "url": "https://www.youtube.com/watch?v=abc123456789",
  "publishedAt": "2025-09-27T15:30:00Z",
  "relevanceScore": 0.88,
  "metadata": {
    "thumbnails": {...},
    "channelId": "UC123456789"
  }
}
```

## Success Metrics

- **Signal Relevance**: High average relevance scores (>0.7)
- **Source Diversity**: Signals from multiple different sources
- **Timeliness**: Recent signals weighted appropriately
- **Coverage**: Comprehensive view of external market sentiment
