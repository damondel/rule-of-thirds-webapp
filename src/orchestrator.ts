/**
 * Rule of Thirds Orchestrator - Core orchestration engine for parallel signal gathering
 * 
 * This orchestrator manages three specialized agents in parallel:
 * - External Signals Agent (market intelligence, news, social trends)
 * - Internal Research Agent (documents, transcripts, surveys)
 * - Product Metrics Agent (analytics, usage data, performance metrics)
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { OpenAIApi } from '@azure/openai';
import { AzureKeyCredential } from '@azure/core-auth';
import { ExternalSignalsAgent } from './agents/externalSignalsAgent.js';
import { InternalResearchAgent } from './agents/internalResearchAgent.js';
import { ProductMetricsAgent } from './agents/productMetricsAgent.js';

// Helper function to log only when not in MCP silent mode
function log(...args: any[]): void {
    if (!process.env.MCP_SILENT) {
        console.log(...args);
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class RuleOfThirdsOrchestrator {
    private config: any;
    private externalAgent: ExternalSignalsAgent;
    private internalAgent: InternalResearchAgent;
    private productAgent: ProductMetricsAgent;
    private startTime: number;
    private azureOpenAI: OpenAIApi | null = null;

    constructor(config: any = {}) {
        this.config = {
            retries: config.retries || 2,
            timeout: config.timeout || 30000,
            outputDir: config.outputDir || './outputs',
            azureOpenAIEndpoint: config.azureOpenAIEndpoint || process.env.AZURE_OPENAI_ENDPOINT,
            azureOpenAIApiKey: config.azureOpenAIApiKey || process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIDeploymentName: config.azureOpenAIDeploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            azureOpenAIApiVersion: config.azureOpenAIApiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
            enableLlmSynthesis: config.enableLlmSynthesis !== false, // Default to true
            ...config
        };
        
        // Initialize Azure OpenAI client if credentials are provided
        if (this.config.azureOpenAIEndpoint && this.config.azureOpenAIApiKey && this.config.azureOpenAIDeploymentName) {
            try {
                this.azureOpenAI = new OpenAIApi(
                    this.config.azureOpenAIEndpoint,
                    new AzureKeyCredential(this.config.azureOpenAIApiKey),
                    {
                        apiVersion: this.config.azureOpenAIApiVersion
                    }
                );
                log('🤖 Azure OpenAI client initialized for LLM synthesis');
            } catch (error) {
                log('⚠️  Failed to initialize Azure OpenAI client:', error.message);
            }
        } else {
            const missingVars = [];
            if (!this.config.azureOpenAIEndpoint) missingVars.push('AZURE_OPENAI_ENDPOINT');
            if (!this.config.azureOpenAIApiKey) missingVars.push('AZURE_OPENAI_API_KEY');
            if (!this.config.azureOpenAIDeploymentName) missingVars.push('AZURE_OPENAI_DEPLOYMENT_NAME');
            
            if (missingVars.length > 0) {
                log(`⚠️  Missing Azure OpenAI configuration: ${missingVars.join(', ')} - LLM synthesis will be skipped`);
            }
        }
        
        // Initialize agents with configuration
        this.externalAgent = new ExternalSignalsAgent(config.external || {});
        this.internalAgent = new InternalResearchAgent(config.internal || {});
        this.productAgent = new ProductMetricsAgent(config.product || {});
        
        log('🎯 Rule of Thirds Orchestrator initializing...');
        
        this.startTime = Date.now();
    }

                });
                log('🤖 OpenAI client initialized for LLM synthesis');
            } catch (error) {
                log('⚠️  Failed to initialize OpenAI client:', error.message);
            }
        } else {
            log('⚠️  No OpenAI API key provided - LLM synthesis will be skipped');
        }
        
        // Initialize agents with configuration
        this.externalAgent = new ExternalSignalsAgent(config.external || {});
        this.internalAgent = new InternalResearchAgent(config.internal || {});
        this.productAgent = new ProductMetricsAgent(config.product || {});
        
                log('🎯 Rule of Thirds Orchestrator initializing...');
        
        this.startTime = Date.now();
        
        // Configuration setup
    }

    /**
     * Public accessors for individual agents (for MCP tool handlers)
     */
    get external(): ExternalSignalsAgent {
        return this.externalAgent;
    }

    get internal(): InternalResearchAgent {
        return this.internalAgent;
    }

    get product(): ProductMetricsAgent {
        return this.productAgent;
    }
    
    /**
     * Main orchestration method - runs all three agents in parallel
     */
    async orchestrate(topic: string, productArea: string | null = null) {
        const startTime = Date.now();
        const timestamp = new Date().toISOString();
        
        log(`\n🚀 Starting Rule of Thirds orchestration for: "${topic}"`);
        if (productArea) {
            log(`📍 Product Area: ${productArea}`);
        }
        
        try {
            // Ensure output directory exists
            await this.ensureOutputDirectory();
            
            // Run all three agents in parallel with timeout and retry logic
            log('\n⚡ Running agents in parallel...');
            const results = await Promise.allSettled([
                this.runWithRetry('external', () => this.externalAgent.gatherSignals(topic, productArea)),
                this.runWithRetry('internal', () => this.internalAgent.analyzeResearch(topic, productArea)),
                this.runWithRetry('product', () => this.productAgent.collectMetrics(topic, productArea))
            ]);
            
            // Process results and extract data
            const [externalResult, internalResult, productResult] = results;
            const executionTime = Date.now() - startTime;
            
            // Calculate success metrics
            const successfulAgents = results.filter(r => r.status === 'fulfilled').length;
            const totalAgents = results.length;
            const agentStatus = {
                external: externalResult.status === 'fulfilled',
                internal: internalResult.status === 'fulfilled',
                product: productResult.status === 'fulfilled'
            };
            
            // Extract signal data (with fallbacks for failed agents)
            const externalData = externalResult.status === 'fulfilled' ? externalResult.value : { status: 'failed', error: externalResult.reason?.message, signalCount: 0, data: [] };
            const internalData = internalResult.status === 'fulfilled' ? internalResult.value : { status: 'failed', error: internalResult.reason?.message, signalCount: 0, data: [] };
            const productData = productResult.status === 'fulfilled' ? productResult.value : { status: 'failed', error: productResult.reason?.message, signalCount: 0, data: [] };
            
            // Calculate total signals
            const totalSignals = (externalData.signalCount || 0) + (internalData.signalCount || 0) + (productData.signalCount || 0);
            
            log(`\n📊 Orchestration Results:`);
            log(`   ✅ Successful Agents: ${successfulAgents}/${totalAgents}`);
            log(`   📈 Total Signals: ${totalSignals}`);
            log(`   ⏱️  Execution Time: ${executionTime}ms`);
            
            // Generate comprehensive insights and prompts
            const insights = await this.synthesizeInsights(topic, productArea, {
                external: externalData,
                internal: internalData,
                product: productData
            }, {
                timestamp,
                executionTime,
                totalSignals,
                agentStatus,
                successfulAgents,
                totalAgents
            });
            
            // Generate all output files
            const outputs = await this.generateOutputs(topic, productArea, timestamp, {
                external: externalData,
                internal: internalData,
                product: productData,
                insights,
                metadata: {
                    timestamp,
                    executionTime,
                    totalSignals,
                    agentStatus,
                    successfulAgents,
                    totalAgents
                }
            });
            
            return {
                success: true,
                timestamp,
                topic,
                productArea,
                signals: {
                    external: externalData,
                    internal: internalData,
                    product: productData
                },
                insights,
                metadata: {
                    timestamp,
                    executionTime,
                    totalSignals,
                    agentStatus,
                    successfulAgents,
                    totalAgents
                },
                outputs
            };
            
        } catch (error) {
            console.error('💥 Orchestration failed:', error);
            return {
                success: false,
                error: error.message,
                timestamp
            };
        }
    }
    
    /**
     * Run agent with retry logic and timeout
     */
    async runWithRetry(agentName, agentFn) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.config.retries; attempt++) {
            try {
                log(`   🔄 ${agentName} agent (attempt ${attempt}/${this.config.retries})`);
                
                // Add timeout wrapper
                const result = await Promise.race([
                    agentFn(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Agent timeout')), this.config.timeout)
                    )
                ]);
                
                log(`   ✅ ${agentName} agent completed`);
                return result;
                
            } catch (error) {
                lastError = error;
                log(`   ⚠️  ${agentName} agent failed (attempt ${attempt}): ${error.message}`);
                
                if (attempt < this.config.retries) {
                    const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
                    log(`   ⏳ Retrying ${agentName} in ${backoffTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }
        }
        
        throw new Error(`${agentName} agent failed after ${this.config.retries} attempts: ${lastError.message}`);
    }
    
    /**
     * Synthesize insights and generate LLM analysis prompts
     */
    async synthesizeInsights(topic, productArea, signals, metadata) {
        log('🧠 Synthesizing insights and generating analysis prompts...');
        
        // Load LLM synthesis prompts
        const templates = await this.loadTemplates();
        
        // Create cross-reference opportunities
        const crossReferenceInsights = this.identifyCrossReferences(signals);
        
        // Prepare primary synthesis prompt with actual data
        const primarySynthesisPrompt = templates.primarySynthesis
            .replace(/\{topic\}/g, topic)
            .replace(/\{productArea\}/g, productArea || 'General')
            .replace(/\{totalSignals\}/g, metadata.totalSignals)
            .replace(/\{executionTime\}/g, metadata.executionTime)
            .replace(/\{externalSignalCount\}/g, signals.external.signalCount || 0)
            .replace(/\{internalSignalCount\}/g, signals.internal.signalCount || 0)
            .replace(/\{productSignalCount\}/g, signals.product.signalCount || 0);
        
        // Add actual signal data to the prompt
        const enrichedPrompt = this.enrichPromptWithSignalData(primarySynthesisPrompt, signals);
        
        // Call LLM for synthesis if available
        let llmSynthesis = null;
        if (this.config.enableLlmSynthesis && this.azureOpenAI) {
            try {
                log('🤖 Calling Azure OpenAI for strategic synthesis...');
                llmSynthesis = await this.callLlmApi(enrichedPrompt);
                log('✅ LLM synthesis completed');
            } catch (error) {
                log('❌ LLM synthesis failed:', error.message);
                llmSynthesis = {
                    error: error.message,
                    fallback: 'LLM synthesis unavailable - using template prompts for manual analysis'
                };
            }
        }
        
        // Generate executive summary
        const executiveSummary = {
            totalSignals: metadata.totalSignals,
            coverage: {
                percentage: Math.round((metadata.successfulAgents / metadata.totalAgents) * 100),
                successful: metadata.successfulAgents,
                total: metadata.totalAgents,
                status: metadata.successfulAgents === metadata.totalAgents ? 'complete' : 'partial'
            },
            signalStrength: [
                {
                    source: 'external',
                    strength: signals.external.signalCount > 15 ? 'strong' : signals.external.signalCount > 5 ? 'medium' : 'weak',
                    count: signals.external.signalCount || 0
                },
                {
                    source: 'internal',
                    strength: signals.internal.signalCount > 10 ? 'strong' : signals.internal.signalCount > 3 ? 'medium' : 'weak',
                    count: signals.internal.signalCount || 0
                },
                {
                    source: 'product',
                    strength: signals.product.signalCount > 20 ? 'strong' : signals.product.signalCount > 8 ? 'medium' : 'weak',
                    count: signals.product.signalCount || 0
                }
            ],
            keyTrends: [
                'Trend analysis pending - requires AI agent synthesis'
            ],
            criticalFindings: [
                'Critical findings analysis pending - requires AI agent synthesis'
            ]
        };
        
        // Quality assessment
        const qualityAssessment = {
            coverage: Math.round((metadata.successfulAgents / metadata.totalAgents) * 100),
            signalReliability: metadata.totalSignals > 30 ? 'High' : metadata.totalSignals > 15 ? 'Medium' : 'Low',
            analysisConfidence: metadata.successfulAgents === metadata.totalAgents ? 'High' : metadata.successfulAgents >= 2 ? 'Medium' : 'Low'
        };
        
        return {
            executiveSummary,
            qualityAssessment,
            crossReferenceInsights,
            llmSynthesis,
            llmPrompts: {
                primarySynthesis: enrichedPrompt,
                crossReference: templates.crossReference,
                actionableInsights: templates.actionableInsights,
                riskAssessment: templates.riskAssessment
            }
        };
    }
    
    /**
     * Identify cross-reference opportunities between signal sources
     */
    identifyCrossReferences(signals) {
        const opportunities = [];
        
        // Check which sources have data
        const hasExternal = signals.external.status === 'success' && signals.external.signalCount > 0;
        const hasInternal = signals.internal.status === 'success' && signals.internal.signalCount > 0;
        const hasProduct = signals.product.status === 'success' && signals.product.signalCount > 0;
        
        if (hasExternal && hasInternal && hasProduct) {
            opportunities.push({
                type: 'multi_source_validation',
                description: '3 signal sources available for cross-validation',
                sources: ['external', 'internal', 'product'],
                priority: 'high'
            });
        }
        
        if (hasExternal && hasInternal) {
            opportunities.push({
                type: 'market_research_alignment',
                description: 'Compare external market signals with internal research findings',
                sources: ['external', 'internal'],
                priority: 'high'
            });
        }
        
        if (hasInternal && hasProduct) {
            opportunities.push({
                type: 'metrics_research_validation',
                description: 'Validate qualitative research with quantitative product metrics',
                sources: ['internal', 'product'],
                priority: 'medium'
            });
        }
        
        return opportunities;
    }
    
    /**
     * Call Azure OpenAI API for LLM synthesis
     */
    async callLlmApi(prompt: string): Promise<any> {
        if (!this.azureOpenAI) {
            throw new Error('Azure OpenAI client not initialized');
        }
        
        const startTime = Date.now();
        
        try {
            const completion = await this.azureOpenAI.getChatCompletions(
                this.config.azureOpenAIDeploymentName,
                {
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert strategic analyst specializing in product intelligence and market analysis. Provide comprehensive, actionable insights based on the Rule of Thirds methodology that combines external market signals, internal research, and product metrics.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                maxTokens: 4000,
                temperature: 0.7
                }
            );
            
            const executionTime = Date.now() - startTime;
            
            return {
                content: completion.choices[0]?.message?.content || 'No response generated', 
                model: this.config.azureOpenAIDeploymentName,
                usage: completion.usage,
                executionTime,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            throw new Error(`Azure OpenAI API call failed: ${error.message}`);
        }
    }
    
    /**
     * Enrich the synthesis prompt with actual signal data
     */
    enrichPromptWithSignalData(basePrompt: string, signals: any): string {
        let enrichedPrompt = basePrompt;
        
        // Add external signals data
        if (signals.external && signals.external.rankedSignals) {
            const topExternalSignals = signals.external.rankedSignals.slice(0, 5);
            const externalData = topExternalSignals.map(signal => 
                `- ${signal.title} (${signal.source}): ${signal.content?.substring(0, 200)}...`
            ).join('\n');
            
            enrichedPrompt += `\n\n## Top External Market Signals:\n${externalData}`;
        }
        
        // Add internal research data
        if (signals.internal && signals.internal.rankedFindings) {
            const topInternalFindings = signals.internal.rankedFindings.slice(0, 5);
            const internalData = topInternalFindings.map(finding => 
                `- ${finding.source}: ${finding.content?.substring(0, 200)}...`
            ).join('\n');
            
            enrichedPrompt += `\n\n## Top Internal Research Findings:\n${internalData}`;
        }
        
        // Add product metrics data
        if (signals.product && signals.product.insights) {
            const trends = signals.product.insights.trends || [];
            const topTrends = trends.slice(0, 5);
            const metricsData = topTrends.map(trend => 
                `- ${trend.metric}: ${trend.direction} (${trend.percentChange}% change)`
            ).join('\n');
            
            enrichedPrompt += `\n\n## Key Product Metrics Trends:\n${metricsData}`;
        }
        
        return enrichedPrompt;
    }
    
    /**
     * Load LLM synthesis prompt templates
     */
    async loadTemplates() {
        const templateDir = join(__dirname, '../templates');
        
        try {
            const [primarySynthesis, crossReference, actionableInsights, riskAssessment] = await Promise.all([
                fs.readFile(join(templateDir, 'llmSynthesisPrompt.txt'), 'utf-8'),
                fs.readFile(join(templateDir, 'crossReferencePrompt.txt'), 'utf-8'),
                fs.readFile(join(templateDir, 'actionableInsightsPrompt.txt'), 'utf-8'),
                fs.readFile(join(templateDir, 'riskAssessmentPrompt.txt'), 'utf-8')
            ]);
            
            return { primarySynthesis, crossReference, actionableInsights, riskAssessment };
        } catch (error) {
            log('⚠️  Template files not found, using built-in templates');
            return this.getBuiltInTemplates();
        }
    }
    
    /**
     * Built-in fallback templates
     */
    getBuiltInTemplates() {
        return {
            primarySynthesis: `# Rule of Thirds Signal Analysis for {topic}

Analyze the comprehensive signals gathered for {topic} across all three sources:

## Signal Summary
- Total Signals: {totalSignals}
- Execution Time: {executionTime}ms
- Topic: {topic}
- Product Area: {productArea}
- External Signals: {externalSignalCount}
- Internal Research: {internalSignalCount}  
- Product Metrics: {productSignalCount}

## Analysis Framework
1. Identify convergent signals across all sources
2. Highlight divergent signals requiring investigation
3. Assess signal strength and reliability
4. Generate actionable insights for product strategy
5. Provide confidence levels for each insight

Focus on strategic implications and actionable recommendations.

## Strategic Analysis Requirements
Please provide:
1. **Executive Summary** - Key findings in 2-3 sentences
2. **Cross-Source Validation** - Where do signals align or conflict?
3. **Strategic Opportunities** - What actions should be prioritized?
4. **Risk Assessment** - What threats or gaps need attention?
5. **Confidence Levels** - Rate each insight (High/Medium/Low confidence)

Format your response with clear headings and actionable recommendations.`,

            crossReference: `# Cross-Reference Analysis

Compare findings across the three signal sources:
1. Where do multiple sources align?
2. What contradictions exist?
3. Which insights have strongest evidence?
4. What additional data is needed?

Prioritize insights by evidence strength and strategic impact.`,

            actionableInsights: `# Actionable Insights Generation

Based on the Rule of Thirds analysis:

## Immediate Actions (0-30 days)
- What can be acted on immediately?

## Short-term Initiatives (1-3 months)  
- What product decisions should be made?

## Strategic Planning (3-12 months)
- How should long-term strategy adapt?

Focus on insights with multiple source validation.`,

            riskAssessment: `# Risk Assessment Analysis

Evaluate risks from the Rule of Thirds analysis:

## Signal Gaps
- What critical information is missing?

## Conflicting Signals
- What contradictions need resolution?

## Market Risks
- What external threats or opportunities?

Prioritize by impact and likelihood with mitigation strategies.`
        };
    }
    
    /**
     * Generate all output files
     */
    async generateOutputs(topic, productArea, timestamp, data) {
        const sanitizedTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileTimestamp = timestamp.replace(/[:.]/g, '-');
        const baseFilename = `${sanitizedTopic}_${fileTimestamp}`;
        
        const files = [];
        
        // Generate combined insight report (JSON)
        const combinedReport = {
            timestamp: data.metadata.timestamp,
            topic,
            productArea,
            executiveSummary: data.insights.executiveSummary,
            externalSignalsAnalysis: {
                status: data.external.status || 'unknown',
                signalCount: data.external.signalCount || 0,
                data: data.external
            },
            internalResearchAnalysis: {
                status: data.internal.status || 'unknown',
                signalCount: data.internal.signalCount || 0,
                data: data.internal
            },
            productMetricsAnalysis: {
                status: data.product.status || 'unknown',
                signalCount: data.product.signalCount || 0,
                data: data.product
            },
            crossReferenceOpportunities: data.insights.crossReferenceInsights,
            llmSynthesisPrompts: data.insights.llmPrompts,
            qualityAssessment: data.insights.qualityAssessment
        };
        
        const combinedReportFile = join(this.config.outputDir, `${baseFilename}_combined_insight_report.json`);
        await fs.writeFile(combinedReportFile, JSON.stringify(combinedReport, null, 2));
        files.push(combinedReportFile);
        
        // Generate human-readable summary
        const humanSummary = this.generateHumanReadableSummary(topic, productArea, data);
        const summaryFile = join(this.config.outputDir, `${baseFilename}_human_readable_summary.md`);
        await fs.writeFile(summaryFile, humanSummary);
        files.push(summaryFile);
        
        // Generate individual signal files
        const externalFile = join(this.config.outputDir, `${baseFilename}_external_signals.json`);
        await fs.writeFile(externalFile, JSON.stringify(data.external, null, 2));
        files.push(externalFile);
        
        const internalFile = join(this.config.outputDir, `${baseFilename}_internal_signals.json`);
        await fs.writeFile(internalFile, JSON.stringify(data.internal, null, 2));
        files.push(internalFile);
        
        const productFile = join(this.config.outputDir, `${baseFilename}_product_signals.json`);
        await fs.writeFile(productFile, JSON.stringify(data.product, null, 2));
        files.push(productFile);
        
        // Generate orchestration metadata
        const metadataFile = join(this.config.outputDir, `${baseFilename}_orchestration_metadata.json`);
        await fs.writeFile(metadataFile, JSON.stringify(data.metadata, null, 2));
        files.push(metadataFile);
        
        log(`📁 Generated ${files.length} output files in ${this.config.outputDir}`);
        
        return {
            files: files.map(f => f.replace(this.config.outputDir + '/', '')),
            directory: this.config.outputDir,
            combinedReport: combinedReportFile,
            humanSummary: summaryFile
        };
    }
    
    /**
     * Generate human-readable summary
     */
    generateHumanReadableSummary(topic, productArea, data) {
        const date = new Date(data.metadata.timestamp);
        
        // Include LLM synthesis if available
        let llmSynthesisSection = '';
        if (data.insights.llmSynthesis && data.insights.llmSynthesis.content) {
            llmSynthesisSection = `

## 🤖 AI Strategic Synthesis

${data.insights.llmSynthesis.content}

*Generated by ${data.insights.llmSynthesis.model} in ${data.insights.llmSynthesis.executionTime}ms*

---`;
        } else if (data.insights.llmSynthesis && data.insights.llmSynthesis.error) {
            llmSynthesisSection = `

## ⚠️ AI Synthesis Status

LLM synthesis failed: ${data.insights.llmSynthesis.error}

${data.insights.llmSynthesis.fallback}

---`;
        }
        
        return `# Rule of Thirds Analysis Summary

**Topic**: ${topic}
**Product Area**: ${productArea || 'General'}
**Generated**: ${date.toLocaleString()}
**Execution Time**: ${data.metadata.executionTime}ms${llmSynthesisSection}

## Coverage Assessment
- **Total Signals Collected**: ${data.metadata.totalSignals}
- **Agent Success Rate**: ${data.metadata.successfulAgents}/${data.metadata.totalAgents} agents successful
- **External Signals**: ${data.metadata.agentStatus.external ? '✅' : '❌'}
- **Internal Research**: ${data.metadata.agentStatus.internal ? '✅' : '❌'}  
- **Product Metrics**: ${data.metadata.agentStatus.product ? '✅' : '❌'}

## Key Insights Summary

### Signal Strength Assessment
${data.insights.qualityAssessment.signalReliability} reliability assessment - requires AI agent analysis for detailed insights

### Cross-Reference Opportunities
${data.insights.crossReferenceInsights.length} opportunities identified for cross-validation

### Recommended Next Steps
Complete AI agent synthesis using provided prompts
- Review cross-reference opportunities for convergent signals
- Validate findings with additional data sources if needed

---

## AI Agent Analysis Prompts

### Primary Synthesis Prompt:
${data.insights.llmPrompts.primarySynthesis}

### Cross-Reference Analysis:
${data.insights.llmPrompts.crossReference}

### Actionable Insights Generation:
${data.insights.llmPrompts.actionableInsights}

### Risk Assessment:
${data.insights.llmPrompts.riskAssessment}

---

*This summary provides the framework for AI agent analysis. Use the synthesis prompts above to complete the strategic analysis.*

`;
    }
    
    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    /**
     * Get orchestrator status
     */
    async getStatus() {
        return {
            status: 'ready',
            version: '1.0.0',
            agents: {
                external: 'ready',
                internal: 'ready',
                product: 'ready'
            },
            config: this.config,
            activeProcesses: 0,
            lastExecution: null,
            details: {
                uptime: Date.now() - this.startTime || 0,
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version
            }
        };
    }

    /**
     * Configure orchestrator
     */
    async configure(config: any) {
        this.config = { ...this.config, ...config };
        return {
            success: true,
            config: this.config
        };
    }

    /**
     * Get orchestrator capabilities
     */
    async getCapabilities() {
        return {
            version: '1.0.0',
            agents: ['external', 'internal', 'product'],
            outputs: ['json', 'markdown', 'templates'],
            formats: ['analysis-report', 'llm-synthesis-prompt'],
            outputFormats: ['analysis-report', 'llm-synthesis-prompt'],
            features: ['parallel-execution', 'retry-logic', 'template-generation'],
            maxConcurrentAgents: 3,
            configOptions: {
                retries: 'number (0-10)',
                timeout: 'number (1000-300000ms)',
                outputDir: 'string (directory path)'
            }
        };
    }

    /**
     * Validate configuration
     */
    async validateConfig(config: any) {
        const errors = [];
        const warnings = [];
        
        if (config.retries && (config.retries < 0 || config.retries > 10)) {
            errors.push('retries must be between 0 and 10');
        }
        if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
            errors.push('timeout must be between 1000ms and 300000ms');
        }
        
        if (config.outputDir && !config.outputDir.startsWith('./')) {
            warnings.push('outputDir should typically start with "./" for relative paths');
        }
        
        return {
            valid: errors.length === 0,
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
