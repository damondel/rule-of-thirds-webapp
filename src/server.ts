/**
 * Rule of Thirds MCP Server
 * 
 * A focused MCP server that provides comprehensive product intelligence
 * through parallel analysis of external market trends, internal research,
 * and product usage metrics.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { RuleOfThirdsOrchestrator } from './orchestrator.js';

interface ServerConfig {
    name: string;
    version: string;
    orchestrator?: any;
}

/**
 * Rule of Thirds MCP Server Implementation
 */
class RuleOfThirdsMCPServer {
    private server: Server;
    private orchestrator: RuleOfThirdsOrchestrator;

    constructor(config: ServerConfig = { name: 'rule-of-thirds-server', version: '1.0.0' }) {
        try {
            process.stderr.write('Initializing MCP Server...\n');
            
            // Initialize MCP server
            this.server = new Server(
                {
                    name: config.name,
                    version: config.version,
                },
                {
                    capabilities: {
                        tools: {},
                    },
                }
            );

            process.stderr.write('MCP Server instance created...\n');

            // Set silent mode for MCP operation (no console output)
            process.env.MCP_SILENT = 'true';
            // Delay orchestrator creation until actually needed to avoid startup issues
            this.orchestrator = config.orchestrator;

            process.stderr.write('Setting up handlers...\n');
            this.setupToolHandlers();
            this.setupErrorHandlers();
            
            process.stderr.write('Server initialized (MCP mode)\n');
        } catch (error) {
            process.stderr.write(`Constructor error: ${error}\n`);
            throw error;
        }
    }

    /**
     * Setup tool handlers for MCP protocol
     */
    private setupToolHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.getAvailableTools()
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'analyze_market_trends':
                        return await this.handleMarketAnalysis(args);
                    
                    case 'analyze_internal_research':
                        return await this.handleInternalAnalysis(args);
                        
                    case 'analyze_product_metrics':
                        return await this.handleMetricsAnalysis(args);
                        
                    case 'triangulate_signals':
                        return await this.handleTriangulateAnalysis(args);
                    
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`
                        }
                    ],
                    isError: true,
                };
            }
        });
    }

    /**
     * Setup error handlers
     */
    private setupErrorHandlers(): void {
        // Handle cleanup on shutdown
        process.on('SIGINT', async () => {
            // Shutting down MCP server (no console logging)
            await this.server.close();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            // Shutting down MCP server (no console logging)
            await this.server.close();
            process.exit(0);
        });
    }

    /**
     * Get available MCP tools
     */
    private getAvailableTools(): Tool[] {
        return [
            {
                name: 'analyze_market_trends',
                description: 'Analyze external market signals - news, social media, industry trends, and competitor activity',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'What market area to analyze (e.g., "AI chatbots", "mobile payments", "streaming services")'
                        },
                        focus: {
                            type: 'string',
                            description: 'Optional: specific focus (e.g., "competitor analysis", "consumer sentiment", "emerging trends")'
                        }
                    },
                    required: ['topic']
                }
            },
            {
                name: 'analyze_internal_research',
                description: 'Analyze your internal documents, research files, interviews, and meeting notes for insights',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'What to look for in your research (e.g., "user feedback", "feature requests", "pain points")'
                        },
                        focus: {
                            type: 'string',
                            description: 'Optional: specific focus (e.g., "usability issues", "feature adoption", "customer quotes")'
                        }
                    },
                    required: ['topic']
                }
            },
            {
                name: 'analyze_product_metrics',
                description: 'Analyze usage data, performance metrics, and user behavior analytics from your product',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'What metrics to analyze (e.g., "user engagement", "feature usage", "conversion rates")'
                        },
                        focus: {
                            type: 'string',
                            description: 'Optional: specific focus (e.g., "mobile vs desktop", "power users", "drop-off points")'
                        }
                    },
                    required: ['topic']
                }
            },
            {
                name: 'triangulate_signals',
                description: 'Triangulate insights by combining market trends, internal research, and product metrics using the Rule of Thirds methodology',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'What you want comprehensive analysis on (e.g., "video conferencing features", "payment checkout flow")'
                        },
                        focus_area: {
                            type: 'string',
                            description: 'Optional: specific aspect to focus on (e.g., "user experience", "competitive positioning")'
                        }
                    },
                    required: ['topic']
                }
            }
        ];
    }

    /**
     * Handle market trends analysis
     */
    private async handleMarketAnalysis(args: any) {
        const { topic, focus } = args;

        try {
            if (!this.orchestrator) {
                this.orchestrator = new RuleOfThirdsOrchestrator();
            }
            
            // Run only external signals agent
            const results = await this.orchestrator.external.gatherSignals(topic, focus);

            return {
                content: [
                    {
                        type: 'text',
                        text: `# 🌐 Market Trends Analysis\n\n` +
                              `**Topic:** ${topic}\n` +
                              `**Focus:** ${focus || 'General market analysis'}\n` +
                              `**Status:** ✅ Complete\n` +
                              `**Signals Found:** ${results.signalCount || 0}\n\n` +
                              `## Market Intelligence\n` +
                              `${results.sources?.map(s => `- **${s.type}**: ${s.signals?.length || 0} signals`).join('\n') || 'No external signals found'}\n\n` +
                              `## Key Market Trends\n${results.summary?.topSignalTypes?.map(t => `- ${t.type}: ${t.count} signals`).join('\n') || 'Market analysis complete - see detailed output for trends and insights'}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Market analysis failed: ${error.message}` }],
                isError: true
            };
        }
    }

    /**
     * Handle internal research analysis
     */
    private async handleInternalAnalysis(args: any) {
        const { topic, focus } = args;

        try {
            if (!this.orchestrator) {
                this.orchestrator = new RuleOfThirdsOrchestrator();
            }
            
            // Run only internal research agent
            const results = await this.orchestrator.internal.analyzeResearch(topic, focus);

            return {
                content: [
                    {
                        type: 'text',
                        text: `# 📚 Internal Research Analysis\n\n` +
                              `**Topic:** ${topic}\n` +
                              `**Focus:** ${focus || 'General research review'}\n` +
                              `**Status:** ✅ Complete\n` +
                              `**Documents Analyzed:** ${results.filesProcessed || 0}\n\n` +
                              `## Research Findings\n` +
                              `${results.findings?.map(f => `- **${f.category}**: ${f.insights?.length || 0} insights`).join('\n') || 'No research findings'}\n\n` +
                              `## Key Internal Insights\n${results.summary || 'Internal research analysis complete - see detailed output for findings'}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Internal research analysis failed: ${error.message}` }],
                isError: true
            };
        }
    }

    /**
     * Handle product metrics analysis
     */
    private async handleMetricsAnalysis(args: any) {
        const { topic, focus } = args;

        try {
            if (!this.orchestrator) {
                this.orchestrator = new RuleOfThirdsOrchestrator();
            }
            
            // Run only product metrics agent
            const results = await this.orchestrator.product.collectMetrics(topic, focus);

            return {
                content: [
                    {
                        type: 'text',
                        text: `# 📊 Product Metrics Analysis\n\n` +
                              `**Topic:** ${topic}\n` +
                              `**Focus:** ${focus || 'General metrics review'}\n` +
                              `**Status:** ✅ Complete\n` +
                              `**Data Points:** ${results.dataPointCount || 0}\n\n` +
                              `## Usage Analytics\n` +
                              `${results.summary?.metricTypes?.map(m => `- **${m.type}**: ${m.dataPoints || 0} data points`).join('\n') || 'No metrics collected'}\n\n` +
                              `## Key Performance Insights\n${results.insights?.summary || 'Product metrics analysis complete - see detailed output for performance data'}`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Product metrics analysis failed: ${error.message}` }],
                isError: true
            };
        }
    }

    /**
     * Handle signal triangulation analysis
     */
    private async handleTriangulateAnalysis(args: any) {
        const { topic, focus_area } = args;

        try {
            if (!this.orchestrator) {
                this.orchestrator = new RuleOfThirdsOrchestrator();
            }
            
            const results = await this.orchestrator.orchestrate(topic, focus_area);

            return {
                content: [
                    {
                        type: 'text',
                        text: `# 🔺 Signal Triangulation Analysis\n\n` +
                              `**Topic:** ${topic}\n` +
                              `**Focus Area:** ${focus_area || 'Multi-source triangulation'}\n` +
                              `**Status:** ${results.success ? '✅ Complete' : '❌ Failed'}\n` +
                              `**Analysis Time:** ${results.metadata?.executionTime || 0}ms\n\n` +
                              `## Triangulated Signal Sources\n` +
                              `- **🌐 Market Intelligence:** ${results.signals?.external?.length || 0} external signals\n` +
                              `- **📚 Internal Research:** ${results.signals?.internal?.length || 0} research findings\n` +
                              `- **📊 Usage Analytics:** ${results.signals?.product?.length || 0} product data points\n\n` +
                              `## Triangulated Insights\n${results.insights?.executiveSummary || 'Signal triangulation complete - see generated reports for comprehensive strategic insights'}\n\n` +
                              `📁 **Triangulated analysis reports saved to outputs folder**`
                    }
                ]
            };
        } catch (error) {
            return {
                content: [{ type: 'text', text: `❌ Signal triangulation failed: ${error.message}` }],
                isError: true
            };
        }
    }

    /**
     * Start the MCP server
     */
    async start(): Promise<void> {
        try {
            // Set silent mode before creating any agents
            process.env.MCP_SILENT = 'true';
            
            const transport = new StdioServerTransport();
            // Don't log to console in MCP servers - it interferes with stdio transport
            
            await this.server.connect(transport);
            // Server is now running and ready for MCP protocol communication
        } catch (error) {
            // Log error to stderr (not stdout which interferes with MCP)
            process.stderr.write(`MCP Server start error: ${error}\n`);
            throw error;
        }
    }

    /**
     * Stop the MCP server
     */
    async stop(): Promise<void> {
        await this.server.close();
        // MCP Server stopped
    }
}

/**
 * Main entry point
 */
async function main() {
    try {
        process.stderr.write('Creating server instance...\n');
        
        const server = new RuleOfThirdsMCPServer({
            name: 'rule-of-thirds-server',
            version: '1.0.0'
        });

        process.stderr.write('Starting server...\n');
        await server.start();
        
        process.stderr.write('Server started successfully, setting up signal handlers...\n');
        
        // Keep the server running - wait for process termination signals
        process.on('SIGINT', async () => {
            process.stderr.write('Received SIGINT, shutting down...\n');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            process.stderr.write('Received SIGTERM, shutting down...\n');
            await server.stop();
            process.exit(0);
        });
        
        process.stderr.write('Server running and waiting for requests...\n');
        
        // Keep the process alive
        await new Promise(() => {}); // This keeps the process running indefinitely
        
    } catch (error) {
        process.stderr.write(`Failed to start Rule of Thirds MCP Server: ${error}\n`);
        process.stderr.write(`Stack trace: ${error.stack}\n`);
        process.exit(1);
    }
}

// Start the server
main().catch(error => {
    process.stderr.write(`Fatal error: ${error}\n`);
    process.stderr.write(`Stack trace: ${error.stack}\n`);
    process.exit(1);
});

export { RuleOfThirdsMCPServer };
export default RuleOfThirdsMCPServer;