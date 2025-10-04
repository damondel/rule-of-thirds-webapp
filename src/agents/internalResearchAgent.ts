/**
 * Internal Research Agent - Analyzes internal documents and research files
 * 
 * This agent processes:
 * - Research documents (markdown, text, PDF)
 * - Interview transcripts and VTT files
 * - Internal reports and analysis
 * - Meeting notes and recordings
 * - Product documentation and specs
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Helper to resolve paths relative to project root
function resolvePath(dirPath: string): string {
    if (path.isAbsolute(dirPath)) {
        return dirPath;
    }
    // Resolve relative to process.cwd() which should be project root
    return path.resolve(process.cwd(), dirPath);
}

// Helper function to log only when not in MCP silent mode
function log(...args: any[]): void {
    if (!process.env.MCP_SILENT) {
        console.log(...args);
    }
}

export class InternalResearchAgent {
    private config: any;
    private supportedExtensions: string[];
    private contentCache: Map<string, any>;

    constructor(config: any = {}) {
        this.config = {
            maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
            fileTypes: config.fileTypes || ['.md', '.txt', '.vtt', '.json', '.csv'],
            directories: config.directories || ['./processed-research', './research-outputs', './docs'],
            excludePatterns: config.excludePatterns || ['node_modules', '.git', 'build', 'dist'],
            maxResults: config.maxResults || 50,
            ...config
        };
        
        this.supportedExtensions = this.config.fileTypes;
        this.contentCache = new Map();
        
        log('📚 Internal Research Agent initialized');
    }
    
    /**
     * Main research analysis method
     */
    async analyzeResearch(topic: any, productArea: any = null) {
        log(`🔍 Internal Research Agent analyzing for: ${topic}`);
        
        const startTime = Date.now();
        const analysisResults = {
            timestamp: new Date().toISOString(),
            topic,
            productArea,
            filesProcessed: 0,
            contentAnalysis: {} as any
        };
        
        try {
            // Discover and process research files
            const researchFiles = await this.discoverResearchFiles();
            log(`   📁 Found ${researchFiles.length} research files`);
            
            if (researchFiles.length === 0) {
                return this.generateEmptyResults(topic, productArea, startTime);
            }
            
            // Process files and extract relevant content
            const processedContent = await this.processResearchFiles(researchFiles, topic, productArea);
            analysisResults.filesProcessed = processedContent.length;
            
            // Analyze content for themes and insights
            const contentAnalysis = await this.analyzeContent(processedContent, topic, productArea);
            analysisResults.contentAnalysis = contentAnalysis;
            
            // Rank findings by relevance
            const rankedFindings = this.rankFindings(contentAnalysis.findings || [], topic, productArea);
            
            const executionTime = Date.now() - startTime;
            
            log(`📊 Internal research analysis complete: ${rankedFindings.length} findings`);
            
            return {
                status: 'success',
                findingCount: rankedFindings.length,
                executionTime,
                timestamp: analysisResults.timestamp,
                topic,
                productArea,
                filesProcessed: analysisResults.filesProcessed,
                contentTypes: this.getContentTypes(processedContent),
                rankedFindings: rankedFindings.slice(0, this.config.maxResults),
                summary: {
                    totalFiles: researchFiles.length,
                    processedFiles: processedContent.length,
                    keyThemes: contentAnalysis.themes || [],
                    insightTypes: this.getInsightTypes(rankedFindings)
                },
                rawAnalysis: contentAnalysis
            };
            
        } catch (error) {
            console.error('💥 Internal Research Agent failed:', error);
            return {
                status: 'failed',
                error: (error as Error).message,
                findingCount: 0,
                executionTime: Date.now() - startTime
            };
        }
    }
    
    /**
     * Discover research files in configured directories
     */
    async discoverResearchFiles(): Promise<string[]> {
        log('   🔍 Discovering research files...');
        log(`   📁 Working directory: ${process.cwd()}`);

        const allFiles: string[] = [];

        for (const directory of this.config.directories) {
            try {
                // Resolve directory to absolute path
                const absoluteDir = resolvePath(directory);
                log(`   📂 Checking directory: ${directory} -> ${absoluteDir}`);

                // Check if directory exists
                if (!fs.existsSync(absoluteDir)) {
                    log(`   ⚠️  Directory not found: ${absoluteDir}`);
                    continue;
                }

                // Build glob pattern for supported file types
                const extensions = this.supportedExtensions.map(ext => ext.replace('.', '')).join(',');
                const globPattern = `${absoluteDir}/**/*.{${extensions}}`;
                log(`   🔍 Glob pattern: ${globPattern}`);

                const files = await glob(globPattern, {
                    ignore: this.config.excludePatterns.map((p: string) => `**/${p}/**`)
                });

                log(`   📄 Found ${files.length} files matching pattern`);

                // Filter by file size
                const validFiles = files.filter(file => {
                    try {
                        const stats = fs.statSync(file);
                        return stats.size <= this.config.maxFileSize;
                    } catch {
                        return false;
                    }
                });

                allFiles.push(...validFiles);
                log(`     ✅ ${directory}: ${validFiles.length} valid files`);

            } catch (error) {
                log(`   ⚠️  Error scanning directory ${directory}: ${(error as Error).message}`);
            }
        }

        log(`   📊 Total files discovered: ${allFiles.length}`);
        return [...new Set(allFiles)]; // Remove duplicates
    }
    
    /**
     * Process research files and extract content
     */
    async processResearchFiles(files: string[], topic: any, productArea: any) {
        log('   📖 Processing research files...');
        
        const processedContent: any[] = [];
        const processingPromises = files.map(async (filePath) => {
            try {
                const content = await this.extractFileContent(filePath);
                
                if (content && this.isRelevantContent(content.text, topic, productArea)) {
                    return {
                        filePath,
                        fileName: path.basename(filePath),
                        fileType: path.extname(filePath),
                        content: content.text,
                        metadata: content.metadata,
                        relevanceScore: this.calculateContentRelevance(content.text, topic, productArea),
                        processedAt: new Date().toISOString()
                    };
                }
                
                return null;
            } catch (error) {
                log(`     ❌ Failed to process ${filePath}: ${(error as Error).message}`);
                return null;
            }
        });
        
        const results = await Promise.all(processingPromises);
        return results.filter(result => result !== null);
    }
    
    /**
     * Extract content from different file types
     */
    async extractFileContent(filePath: string): Promise<any> {
        const extension = path.extname(filePath).toLowerCase();
        const cacheKey = `${filePath}:${fs.statSync(filePath).mtime.getTime()}`;
        
        // Check cache first
        if (this.contentCache.has(cacheKey)) {
            return this.contentCache.get(cacheKey);
        }
        
        let result: any = null;
        
        try {
            const rawContent = fs.readFileSync(filePath, 'utf-8');
            
            switch (extension) {
                case '.md':
                    result = this.parseMarkdown(rawContent, filePath);
                    break;
                    
                case '.vtt':
                    result = this.parseVTT(rawContent, filePath);
                    break;
                    
                case '.json':
                    result = this.parseJSON(rawContent, filePath);
                    break;
                    
                case '.csv':
                    result = this.parseCSV(rawContent, filePath);
                    break;
                    
                case '.txt':
                default:
                    result = this.parseText(rawContent, filePath);
                    break;
            }
            
            // Cache the result
            if (result) {
                this.contentCache.set(cacheKey, result);
            }
            
            return result;
            
        } catch (error) {
            throw new Error(`Failed to extract content from ${filePath}: ${(error as Error).message}`);
        }
    }
    
    /**
     * Parse markdown files
     */
    parseMarkdown(content: string, filePath: string): any {
        const lines = content.split('\n');
        let title = path.basename(filePath, '.md');
        
        // Extract title from first heading
        const titleMatch = lines.find(line => line.startsWith('# '));
        if (titleMatch) {
            title = titleMatch.replace('# ', '').trim();
        }
        
        // Extract headings structure
        const headings = lines
            .filter(line => line.match(/^#{1,6}\s/))
            .map(line => {
                const level = (line.match(/^#+/) || [''])[0].length;
                const text = line.replace(/^#+\s/, '').trim();
                return { level, text };
            });
        
        return {
            text: content,
            metadata: {
                title,
                type: 'markdown',
                headings,
                wordCount: content.split(/\s+/).length,
                filePath
            }
        };
    }
    
    /**
     * Parse VTT (transcript) files
     */
    parseVTT(content: string, filePath: string): any {
        const lines = content.split('\n');
        const title = path.basename(filePath, '.vtt');
        
        // Extract transcript text (skip timestamps and metadata)
        const textLines = lines.filter(line => 
            !line.startsWith('WEBVTT') &&
            !line.match(/^\d{2}:\d{2}:\d{2}/) &&
            !line.match(/^NOTE/) &&
            line.trim() !== ''
        );
        
        const transcriptText = textLines.join(' ');
        
        // Extract speakers if mentioned
        const speakers = [...new Set(
            textLines
                .filter(line => line.includes(':'))
                .map(line => line.split(':')[0])
                .filter(speaker => speaker.length < 50) // Filter out long lines that aren't speakers
        )];
        
        return {
            text: transcriptText,
            metadata: {
                title,
                type: 'transcript',
                speakers,
                duration: this.extractVTTDuration(content),
                wordCount: transcriptText.split(/\s+/).length,
                filePath
            }
        };
    }
    
    /**
     * Parse JSON files
     */
    parseJSON(content: string, filePath: string): any {
        try {
            const data = JSON.parse(content);
            const title = path.basename(filePath, '.json');
            
            // Convert JSON to searchable text
            const textContent = this.jsonToText(data);
            
            return {
                text: textContent,
                metadata: {
                    title,
                    type: 'json',
                    structure: this.analyzeJSONStructure(data),
                    wordCount: textContent.split(/\s+/).length,
                    filePath
                }
            };
            
        } catch (error) {
            throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
        }
    }
    
    /**
     * Parse CSV files
     */
    parseCSV(content: string, filePath: string): any {
        const lines = content.split('\n');
        const title = path.basename(filePath, '.csv');
        
        if (lines.length < 2) {
            throw new Error(`CSV file ${filePath} has insufficient data`);
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).filter(line => line.trim() !== '');
        
        // Convert CSV to searchable text
        const textContent = rows.map(row => 
            row.split(',').map(cell => cell.trim()).join(' ')
        ).join('\n');
        
        return {
            text: textContent,
            metadata: {
                title,
                type: 'csv',
                headers,
                rowCount: rows.length,
                wordCount: textContent.split(/\s+/).length,
                filePath
            }
        };
    }
    
    /**
     * Parse plain text files
     */
    parseText(content: string, filePath: string): any {
        const title = path.basename(filePath, path.extname(filePath));
        
        return {
            text: content,
            metadata: {
                title,
                type: 'text',
                wordCount: content.split(/\s+/).length,
                filePath
            }
        };
    }
    
    /**
     * Check if content is relevant to the topic
     */
    isRelevantContent(content: string, topic: any, productArea: any): boolean {
        if (!content || content.length < 100) return false; // Skip very short content
        
        const normalizedContent = content.toLowerCase();
        const normalizedTopic = topic.toLowerCase();
        const normalizedProductArea = productArea ? productArea.toLowerCase() : '';
        
        // Check for topic mentions
        const topicMentions = normalizedContent.includes(normalizedTopic);
        
        // Check for product area mentions
        const productMentions = normalizedProductArea ? 
            normalizedContent.includes(normalizedProductArea) : false;
        
        // Check for related keywords
        const topicKeywords = normalizedTopic.split(' ');
        const keywordMatches = topicKeywords.some((keyword: any) => 
            normalizedContent.includes(keyword)
        );
        
        return topicMentions || productMentions || keywordMatches;
    }
    
    /**
     * Calculate content relevance score
     */
    calculateContentRelevance(content: string, topic: any, productArea: any): number {
        const normalizedContent = content.toLowerCase();
        const normalizedTopic = topic.toLowerCase();
        const normalizedProductArea = productArea ? productArea.toLowerCase() : '';
        
        let score = 0;
        
        // Direct topic mentions
        const topicMatches = (normalizedContent.match(new RegExp(normalizedTopic, 'g')) || []).length;
        score += topicMatches * 0.3;
        
        // Product area mentions
        if (normalizedProductArea) {
            const productMatches = (normalizedContent.match(new RegExp(normalizedProductArea, 'g')) || []).length;
            score += productMatches * 0.2;
        }
        
        // Keyword density
        const topicWords = normalizedTopic.split(' ');
        topicWords.forEach((word: any) => {
            const wordMatches = (normalizedContent.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
            score += wordMatches * 0.1;
        });
        
        // Content quality indicators
        if (content.length > 1000) score += 0.1; // Substantial content
        if (content.includes('interview') || content.includes('research')) score += 0.1;
        
        return Math.min(score, 1.0); // Cap at 1.0
    }
    
    /**
     * Analyze processed content for themes and insights
     */
    async analyzeContent(processedContent: any[], topic: any, productArea: any) {
        log('   🧠 Analyzing content themes...');
        
        // Extract key themes and patterns
        const themes = this.extractThemes(processedContent);
        
        // Generate findings from content
        const findings = this.generateFindings(processedContent, topic, productArea);
        
        // Identify content patterns
        const patterns = this.identifyPatterns(processedContent);
        
        return {
            themes,
            findings,
            patterns,
            contentSummary: {
                totalDocuments: processedContent.length,
                totalWords: processedContent.reduce((sum, doc) => sum + (doc.metadata?.wordCount || 0), 0),
                fileTypes: [...new Set(processedContent.map(doc => doc.fileType))]
            }
        };
    }
    
    /**
     * Extract themes from content
     */
    extractThemes(processedContent: any[]): any[] {
        const wordFrequency = new Map();
        const phraseFrequency = new Map();
        
        processedContent.forEach(doc => {
            const text = doc.content.toLowerCase();
            
            // Count word frequency
            const words = text.match(/\b\w{4,}\b/g) || []; // Words with 4+ chars
            words.forEach((word: any) => {
                wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
            });
            
            // Count phrase frequency (2-3 word combinations)
            const phrases = this.extractPhrases(text);
            phrases.forEach(phrase => {
                phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
            });
        });
        
        // Get top themes
        const topWords = Array.from(wordFrequency.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .map(([word, count]) => ({ word, count, type: 'keyword' }));
            
        const topPhrases = Array.from(phraseFrequency.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([phrase, count]) => ({ phrase, count, type: 'phrase' }));
        
        return [...topWords, ...topPhrases];
    }
    
    /**
     * Generate findings from content
     */
    generateFindings(processedContent: any[], topic: any, productArea: any): any[] {
        const findings: any[] = [];
        
        processedContent.forEach(doc => {
            // Extract sentences containing the topic
            const sentences = doc.content.split(/[.!?]+/);
            const relevantSentences = sentences.filter((sentence: string) => {
                const normalizedSentence = sentence.toLowerCase();
                return normalizedSentence.includes(topic.toLowerCase()) ||
                       (productArea && normalizedSentence.includes(productArea.toLowerCase()));
            });
            
            // Create findings from relevant sentences
            relevantSentences.forEach((sentence: string) => {
                const trimmedSentence = sentence.trim();
                if (trimmedSentence.length > 50) { // Skip very short findings
                    findings.push({
                        type: 'textual_evidence',
                        content: trimmedSentence,
                        source: doc.fileName,
                        filePath: doc.filePath,
                        relevanceScore: doc.relevanceScore,
                        metadata: {
                            fileType: doc.fileType,
                            extractedAt: new Date().toISOString()
                        }
                    });
                }
            });
        });
        
        return findings;
    }
    
    /**
     * Identify patterns in content
     */
    identifyPatterns(processedContent: any[]): any[] {
        const patterns = [];
        
        // File type distribution
        const fileTypes = processedContent.reduce((acc: any, doc) => {
            acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
            return acc;
        }, {});
        
        patterns.push({
            type: 'file_type_distribution',
            data: fileTypes,
            insight: `Most common file type: ${Object.entries(fileTypes).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown'}`
        });
        
        // Content length distribution
        const avgWordCount = processedContent.length > 0 ? 
            processedContent.reduce((sum, doc) => sum + (doc.metadata?.wordCount || 0), 0) / processedContent.length : 0;
            
        patterns.push({
            type: 'content_length',
            data: { averageWordCount: avgWordCount },
            insight: `Average document length: ${Math.round(avgWordCount)} words`
        });
        
        return patterns;
    }
    
    /**
     * Rank findings by relevance and quality
     */
    rankFindings(findings: any[], topic: any, productArea: any): any[] {
        return findings
            .map(finding => ({
                ...finding,
                combinedScore: this.calculateFindingScore(finding, topic, productArea)
            }))
            .sort((a, b) => b.combinedScore - a.combinedScore);
    }
    
    /**
     * Calculate combined relevance and quality score for findings
     */
    calculateFindingScore(finding: any, topic: any, productArea: any): number {
        let score = finding.relevanceScore || 0;
        
        // Boost score for longer, more detailed findings
        const contentLength = finding.content?.length || 0;
        if (contentLength > 200) score += 0.2;
        if (contentLength > 500) score += 0.2;
        
        // Boost score for findings from structured sources
        if (finding.metadata?.fileType === '.md') score += 0.1;
        if (finding.metadata?.fileType === '.vtt') score += 0.15; // Interviews often valuable
        
        return Math.min(score, 1.0);
    }
    
    // Helper methods
    
    extractVTTDuration(content: string): string | null {
        const durationMatch = content.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
        return durationMatch ? durationMatch[2] : null;
    }
    
    extractPhrases(text: string): string[] {
        const words = text.match(/\b\w+\b/g) || [];
        const phrases = [];
        
        for (let i = 0; i < words.length - 1; i++) {
            if (words[i].length > 3 && words[i + 1].length > 3) {
                phrases.push(`${words[i]} ${words[i + 1]}`);
            }
            
            if (i < words.length - 2 && words[i + 2].length > 3) {
                phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
            }
        }
        
        return phrases;
    }
    
    jsonToText(obj: any, depth = 0): string {
        if (depth > 5) return '[nested object]'; // Prevent infinite recursion
        
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'number' || typeof obj === 'boolean') return obj.toString();
        if (obj === null || obj === undefined) return '';
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.jsonToText(item, depth + 1)).join(' ');
        }
        
        if (typeof obj === 'object') {
            return Object.entries(obj)
                .map(([key, value]) => `${key}: ${this.jsonToText(value, depth + 1)}`)
                .join(' ');
        }
        
        return '';
    }
    
    analyzeJSONStructure(obj: any): any {
        if (Array.isArray(obj)) {
            return {
                type: 'array',
                length: obj.length,
                itemTypes: [...new Set(obj.map((item: any) => typeof item))]
            };
        }
        
        if (typeof obj === 'object' && obj !== null) {
            return {
                type: 'object',
                keys: Object.keys(obj),
                keyCount: Object.keys(obj).length
            };
        }
        
        return { type: typeof obj };
    }
    
    getContentTypes(processedContent: any[]): any {
        const types = processedContent.reduce((acc: any, doc) => {
            acc[doc.fileType] = (acc[doc.fileType] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(types).map(([type, count]) => ({ type, count }));
    }
    
    getInsightTypes(findings: any[]): any[] {
        const types = findings.reduce((acc: any, finding) => {
            acc[finding.type] = (acc[finding.type] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(types)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }));
    }
    
    generateEmptyResults(topic: any, productArea: any, startTime: number): any {
        return {
            status: 'success',
            findingCount: 0,
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            topic,
            productArea,
            filesProcessed: 0,
            contentTypes: [],
            rankedFindings: [],
            summary: {
                totalFiles: 0,
                processedFiles: 0,
                keyThemes: [],
                insightTypes: []
            },
            message: 'No research files found in configured directories'
        };
    }
}
