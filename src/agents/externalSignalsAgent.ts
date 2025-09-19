/**
 * External Signals Agent - Gathers market intelligence and external indicators
 * 
 * This agent collects signals from:
 * - News API for market trends and competitor mentions
 * - YouTube API for video content analysis
 * - RSS feeds from industry sources
 * - Social media trends (when configured)
 * - Industry reports and external research
 */

import fetch from 'node-fetch';
import Parser from 'rss-parser';

// Helper function to log only when not in MCP silent mode
function log(...args: any[]): void {
    if (!process.env.MCP_SILENT) {
        console.log(...args);
    }
}

export class ExternalSignalsAgent {
    private config: any;
    private newsApiKey?: string;
    private youtubeApiKey?: string;
    private rssParser: any;
    private rssSources: string[];

    constructor(config: any = {}) {
        this.config = {
            maxResults: config.maxResults || 20,
            timeframe: config.timeframe || '7d',
            sources: config.sources || {
                news: true,
                youtube: true,
                rss: true
            },
            ...config
        };
        
        // API Keys (optional - will fall back to simulated data)
        this.newsApiKey = config.newsApiKey || process.env.NEWS_API_KEY;
        this.youtubeApiKey = config.youtubeApiKey || process.env.YOUTUBE_API_KEY;
        
        // RSS Parser setup
        this.rssParser = new Parser({
            customFields: {
                item: ['description', 'content:encoded', 'summary']
            }
        });
        
        // Default RSS feeds for industry intelligence
        this.rssSources = config.rssSources || [
            'https://techcrunch.com/feed/',
            'https://feeds.feedburner.com/venturebeat',
            'https://blog.ycombinator.com/feed',
            'https://a16z.com/feed/',
            'https://www.producthunt.com/feed'
        ];
        
        log('🌐 External Signals Agent initialized');
    }
    
    /**
     * Main signal gathering method
     */
    async gatherSignals(topic: any, productArea: any = null) {
        log(`📡 External Signals Agent gathering signals for: ${topic}`);
        
        const startTime = Date.now();
        const signals: any = {
            timestamp: new Date().toISOString(),
            topic,
            productArea,
            sources: []
        };
        
        try {
            // Gather from multiple sources in parallel
            const sourcePromises = [];
            
            if (this.config.sources.news) {
                sourcePromises.push(this.gatherNewsSignals(topic, productArea));
            }
            
            if (this.config.sources.youtube) {
                sourcePromises.push(this.gatherYouTubeSignals(topic, productArea));
            }
            
            if (this.config.sources.rss) {
                sourcePromises.push(this.gatherRSSSignals(topic, productArea));
            }
            
            // Wait for all sources with individual error handling
            const sourceResults = await Promise.allSettled(sourcePromises);
            
            // Process results
            sourceResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    signals.sources.push(result.value);
                } else {
                    log(`⚠️  External source ${index + 1} failed: ${result.reason.message}`);
                    signals.sources.push({
                        type: `source_${index + 1}`,
                        status: 'failed',
                        error: result.reason.message,
                        count: 0
                    });
                }
            });
            
            // Calculate total signal count and rank by relevance
            const allSignals = signals.sources.flatMap(source => source.signals || []);
            const rankedSignals = this.rankSignalsByRelevance(allSignals, topic, productArea);
            
            const executionTime = Date.now() - startTime;
            
            log(`📊 External signals collected: ${rankedSignals.length} total`);
            
            return {
                status: 'success',
                signalCount: rankedSignals.length,
                executionTime,
                timestamp: signals.timestamp,
                topic,
                productArea,
                sources: signals.sources,
                rankedSignals: rankedSignals.slice(0, this.config.maxResults), // Limit results
                summary: {
                    totalSources: signals.sources.length,
                    successfulSources: signals.sources.filter(s => s.status === 'success').length,
                    topSignalTypes: this.getTopSignalTypes(rankedSignals)
                }
            };
            
        } catch (error) {
            console.error('💥 External Signals Agent failed:', error);
            return {
                status: 'failed',
                error: (error as Error).message,
                signalCount: 0,
                executionTime: Date.now() - startTime
            };
        }
    }
    
    /**
     * Gather signals from News API
     */
    async gatherNewsSignals(topic: any, productArea: any) {
        log('   📰 Gathering news signals...');
        
        if (!this.newsApiKey) {
            log('   ⚠️  No News API key, using simulated data');
            return this.generateSimulatedNewsData(topic, productArea);
        }
        
        try {
            // Build search query
            const query = productArea ? `"${topic}" AND "${productArea}"` : `"${topic}"`;
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${Math.min(this.config.maxResults, 100)}`;
            
            const response = await fetch(url, {
                headers: {
                    'X-API-Key': this.newsApiKey,
                    'User-Agent': 'Rule-of-Thirds-Agent/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`News API error: ${await response.text()}`);
            }
            
            const data = await response.json() as any;
            
            if (data.status !== 'ok') {
                throw new Error(`News API error: ${data.message}`);
            }
            
            const signals = data.articles.map((article: any) => ({
                type: 'news_article',
                title: article.title,
                content: article.description || article.content,
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt,
                relevanceScore: this.calculateRelevance(
                    article.title + ' ' + (article.description || ''),
                    topic,
                    productArea
                ),
                metadata: {
                    author: article.author,
                    urlToImage: article.urlToImage
                }
            }));
            
            return {
                type: 'news',
                status: 'success',
                count: signals.length,
                signals,
                source: 'News API'
            };
            
        } catch (error) {
            log(`   ❌ News API failed: ${(error as Error).message}, falling back to simulated data`);
            return this.generateSimulatedNewsData(topic, productArea);
        }
    }
    
    /**
     * Gather signals from YouTube API
     */
    async gatherYouTubeSignals(topic: any, productArea: any) {
        log('   📺 Gathering YouTube signals...');
        
        if (!this.youtubeApiKey) {
            log('   ⚠️  No YouTube API key, using simulated data');
            return this.generateSimulatedYouTubeData(topic, productArea);
        }
        
        try {
            const query = productArea ? `${topic} ${productArea}` : topic;
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=relevance&maxResults=${Math.min(this.config.maxResults / 2, 25)}&key=${this.youtubeApiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json() as any;
            
            if (data.error) {
                throw new Error(`YouTube API error: ${data.error.message}`);
            }
            
            const signals = data.items.map((item: any) => ({
                type: 'youtube_video',
                title: item.snippet.title,
                content: item.snippet.description,
                channel: item.snippet.channelTitle,
                videoId: item.id.videoId,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                publishedAt: item.snippet.publishedAt,
                relevanceScore: this.calculateRelevance(
                    item.snippet.title + ' ' + item.snippet.description,
                    topic,
                    productArea
                ),
                metadata: {
                    thumbnails: item.snippet.thumbnails,
                    channelId: item.snippet.channelId
                }
            }));
            
            return {
                type: 'youtube',
                status: 'success',
                count: signals.length,
                signals,
                source: 'YouTube API'
            };
            
        } catch (error) {
            log(`   ❌ YouTube API failed: ${(error as Error).message}`);
            return {
                type: 'youtube',
                status: 'failed',
                count: 0,
                error: (error as Error).message
            };
        }
    }
    
    /**
     * Gather signals from RSS feeds
     */
    async gatherRSSSignals(topic: any, productArea: any) {
        log('   📡 Gathering RSS signals...');
        
        try {
            const feedPromises = this.rssSources.map(async feedUrl => {
                try {
                    const feed = await this.rssParser.parseURL(feedUrl);
                    return {
                        feedTitle: feed.title,
                        feedUrl,
                        items: feed.items.slice(0, 10) // Limit per feed
                    };
                } catch (error) {
                    log(`   ⚠️  RSS feed failed: ${feedUrl} - ${error.message}`);
                    return null;
                }
            });
            
            const feedResults = await Promise.all(feedPromises);
            const validFeeds = feedResults.filter(f => f !== null);
            
            const signals = validFeeds.flatMap(feed =>
                feed.items
                    .filter(item => {
                        const content = (item.title + ' ' + (item.contentSnippet || item.description || '')).toLowerCase();
                        return content.includes(topic.toLowerCase()) || 
                               (productArea && content.includes(productArea.toLowerCase()));
                    })
                    .map(item => ({
                        type: 'rss_article',
                        title: item.title,
                        content: item.contentSnippet || item.description || item.summary || '',
                        source: feed.feedTitle,
                        url: item.link,
                        publishedAt: item.pubDate || item.isoDate,
                        relevanceScore: this.calculateRelevance(
                            item.title + ' ' + (item.contentSnippet || item.description || ''),
                            topic,
                            productArea
                        ),
                        metadata: {
                            feedUrl: feed.feedUrl,
                            categories: item.categories || []
                        }
                    }))
            );
            
            return {
                type: 'rss',
                status: 'success',
                count: signals.length,
                signals,
                source: `${validFeeds.length} RSS feeds`
            };
            
        } catch (error) {
            log(`   ❌ RSS gathering failed: ${error.message}`);
            return {
                type: 'rss',
                status: 'failed',
                count: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Calculate relevance score for a piece of content
     */
    calculateRelevance(content, topic, productArea) {
        if (!content) return 0;
        
        const normalizedContent = content.toLowerCase();
        const normalizedTopic = topic.toLowerCase();
        const normalizedProductArea = productArea ? productArea.toLowerCase() : '';
        
        let score = 0;
        
        // Topic matches
        if (normalizedContent.includes(normalizedTopic)) {
            score += 0.5;
        }
        
        // Product area matches
        if (normalizedProductArea && normalizedContent.includes(normalizedProductArea)) {
            score += 0.3;
        }
        
        // Keyword density
        const topicWords = normalizedTopic.split(' ');
        const productWords = normalizedProductArea ? normalizedProductArea.split(' ') : [];
        const allKeywords = [...topicWords, ...productWords];
        
        allKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = (normalizedContent.match(regex) || []).length;
            score += matches * 0.1;
        });
        
        return Math.min(score, 1.0); // Cap at 1.0
    }
    
    /**
     * Rank signals by relevance and recency
     */
    rankSignalsByRelevance(signals, topic, productArea) {
        return signals
            .map(signal => ({
                ...signal,
                combinedScore: this.calculateCombinedScore(signal, topic, productArea)
            }))
            .sort((a: any, b: any) => b.combinedScore - a.combinedScore);
    }
    
    /**
     * Calculate combined relevance + recency score
     */
    calculateCombinedScore(signal, topic, productArea) {
        const relevanceWeight = 0.7;
        const recencyWeight = 0.3;
        
        // Recency score (newer is better)
        let recencyScore = 0;
        if (signal.publishedAt) {
            const now = Date.now();
            const publishDate = new Date(signal.publishedAt).getTime();
            const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff <= 1) recencyScore = 1.0;
            else if (daysDiff <= 7) recencyScore = 0.8;
            else if (daysDiff <= 30) recencyScore = 0.6;
            else recencyScore = 0.3;
        }
        
        return (signal.relevanceScore || 0) * relevanceWeight + recencyScore * recencyWeight;
    }
    
    /**
     * Get top signal types for summary
     */
    getTopSignalTypes(signals) {
        const typeCounts = {};
        signals.forEach(signal => {
            typeCounts[signal.type] = (typeCounts[signal.type] || 0) + 1;
        });
        
        return Object.entries(typeCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }
    
    /**
     * Generate simulated news data when API is not available
     */
    generateSimulatedNewsData(topic, productArea) {
        const simulatedArticles = [
            {
                type: 'news_article',
                title: `Industry Analysis: ${topic} Trends Reshape Market Landscape`,
                content: `Recent market analysis reveals significant shifts in ${topic} adoption patterns. Key industry players are investing heavily in ${productArea || 'related technologies'} to capture emerging opportunities.`,
                source: 'Tech Industry Report',
                url: 'https://example.com/news/1',
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                relevanceScore: 0.85,
                metadata: { simulated: true }
            },
            {
                type: 'news_article',
                title: `Breaking: Major Investment in ${topic} Solutions`,
                content: `Venture capital firms announce $50M funding round for startups focusing on ${topic} innovation, signaling strong market confidence.`,
                source: 'Business News Daily',
                url: 'https://example.com/news/2',
                publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                relevanceScore: 0.78,
                metadata: { simulated: true }
            },
            {
                type: 'news_article',
                title: `Research Report: Consumer Adoption of ${topic} Accelerates`,
                content: `New consumer research indicates 67% increase in ${topic} adoption over the past quarter, driven by improved user experience and cost reduction.`,
                source: 'Market Research Weekly',
                url: 'https://example.com/news/3',
                publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                relevanceScore: 0.72,
                metadata: { simulated: true }
            }
        ];
        
        return {
            type: 'news',
            status: 'success',
            count: simulatedArticles.length,
            signals: simulatedArticles,
            source: 'Simulated News Data'
        };
    }
    
    /**
     * Generate simulated YouTube data when API is not available
     */
    generateSimulatedYouTubeData(topic, productArea) {
        const simulatedVideos = [
            {
                type: 'youtube_video',
                title: `${topic} Explained: Complete Guide for ${productArea || 'Professionals'}`,
                content: `Comprehensive tutorial covering ${topic} implementation, best practices, and real-world case studies. Perfect for teams looking to adopt ${topic} solutions.`,
                channel: 'Tech Education Hub',
                videoId: 'sim123456789',
                url: 'https://www.youtube.com/watch?v=sim123456789',
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                relevanceScore: 0.88,
                metadata: { simulated: true }
            },
            {
                type: 'youtube_video',
                title: `Industry Leaders Discuss ${topic} Future Trends`,
                content: `Panel discussion featuring CTOs from leading companies sharing insights on ${topic} evolution and market opportunities.`,
                channel: 'Industry Insights',
                videoId: 'sim987654321',
                url: 'https://www.youtube.com/watch?v=sim987654321',
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                relevanceScore: 0.81,
                metadata: { simulated: true }
            }
        ];
        
        return {
            type: 'youtube',
            status: 'success',
            count: simulatedVideos.length,
            signals: simulatedVideos,
            source: 'Simulated YouTube Data'
        };
    }
}
