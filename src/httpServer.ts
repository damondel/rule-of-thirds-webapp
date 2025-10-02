/**
 * HTTP Server for Rule of Thirds Web Interface
 * 
 * Provides a REST API wrapper around the RuleOfThirdsOrchestrator
 * and serves the static web application files.
 */

import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { RuleOfThirdsOrchestrator } from './orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class RuleOfThirdsHttpServer {
    private app: express.Application;
    private orchestrator: RuleOfThirdsOrchestrator;
    private port: number;

    constructor(port: number = parseInt(process.env.PORT || '3001')) {
        this.app = express();
        this.port = port;
        
        try {
            console.log('🔧 Initializing RuleOfThirdsOrchestrator...');
            this.orchestrator = new RuleOfThirdsOrchestrator({
                // Standard OpenAI
                openaiApiKey: process.env.OPENAI_API_KEY,
                openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                // Azure OpenAI
                azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
                azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
                azureOpenAIDeployment: process.env.AZURE_OPENAI_DEPLOYMENT,
                enableLlmSynthesis: true
            });
            console.log('✅ RuleOfThirdsOrchestrator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize RuleOfThirdsOrchestrator:', error);
            console.error('📋 Error details:', {
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            throw error;
        }
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        // Parse JSON bodies
        this.app.use(express.json());
        
        // CORS middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });

        // Serve static files from web build directory
        const webDistPath = join(__dirname, '../web/dist');
        this.app.use(express.static(webDistPath));
    }

    private setupRoutes(): void {
        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // Main orchestration endpoint
        this.app.post('/api/orchestrate', async (req, res) => {
            try {
                const { topic, focus_area } = req.body;

                if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
                    return res.status(400).json({
                        error: 'Topic is required and must be a non-empty string'
                    });
                }

                console.log(`🚀 Starting analysis for topic: "${topic}"${focus_area ? `, focus: "${focus_area}"` : ''}`);

                const startTime = Date.now();
                const results = await this.orchestrator.orchestrate(
                    topic.trim(), 
                    focus_area && typeof focus_area === 'string' ? focus_area.trim() : null
                );

                const executionTime = Date.now() - startTime;
                console.log(`✅ Analysis completed in ${executionTime}ms`);

                // Transform the results to match the expected frontend interface
                const response = {
                    success: results.success,
                    timestamp: results.timestamp,
                    topic: results.topic,
                    productArea: results.productArea,
                    insights: results.insights,
                    signals: {
                        external: {
                            status: results.signals?.external?.status || 'failed',
                            signalCount: results.signals?.external?.signalCount || 0
                        },
                        internal: {
                            status: results.signals?.internal?.status || 'failed',
                            findingCount: results.signals?.internal?.findingCount || 0
                        },
                        product: {
                            status: results.signals?.product?.status || 'failed',
                            dataPointCount: results.signals?.product?.dataPointCount || 0
                        }
                    },
                    metadata: {
                        executionTime: results.metadata?.executionTime || executionTime,
                        totalSignals: results.metadata?.totalSignals || 0,
                        agentStatus: results.metadata?.agentStatus || {
                            external: false,
                            internal: false,
                            product: false
                        }
                    },
                    outputs: results.outputs
                };

                res.json(response);

            } catch (error) {
                console.error('❌ Analysis failed:', error);
                
                res.status(500).json({
                    error: 'Analysis failed',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    success: false
                });
            }
        });

        // Get orchestrator status
        this.app.get('/api/status', async (req, res) => {
            try {
                const status = await this.orchestrator.getStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to get status',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Get orchestrator capabilities
        this.app.get('/api/capabilities', async (req, res) => {
            try {
                const capabilities = await this.orchestrator.getCapabilities();
                res.json(capabilities);
            } catch (error) {
                res.status(500).json({
                    error: 'Failed to get capabilities',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Serve the React app for all other routes (SPA routing)
        this.app.get('*', (req, res) => {
            const webDistPath = join(__dirname, '../web/dist');
            const indexPath = join(webDistPath, 'index.html');

            res.sendFile(indexPath, (err) => {
                if (err) {
                    console.error('Error serving index.html:', err.message);
                    res.status(500).send('Frontend not built. Run: npm run build');
                }
            });
        });
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const server = this.app.listen(this.port, () => {
                console.log(`🌐 Rule of Thirds HTTP Server running on http://localhost:${this.port}`);
                console.log(`📊 API endpoints available at http://localhost:${this.port}/api/`);
                console.log(`🎯 Web interface available at http://localhost:${this.port}`);
                resolve();
            });

            server.on('error', (error: any) => {
                console.error('❌ Failed to start HTTP server:', error);
                if (error.code === 'EADDRINUSE') {
                    console.error(`🚫 Port ${this.port} is already in use. Please try a different port or stop the existing process.`);
                } else if (error.code === 'EACCES') {
                    console.error(`🚫 Permission denied to bind to port ${this.port}. Try using a port number above 1024.`);
                }
                reject(error);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}

// Main entry point when run directly
async function main() {
    try {
        console.log('🚀 Backend server script starting...');
        console.log('📁 Current working directory:', process.cwd());
        console.log('📦 Node version:', process.version);

        const port = parseInt(process.env.PORT || '3001');
        const server = new RuleOfThirdsHttpServer(port);
        console.log('🔧 Server instance created, attempting to start...');
        await server.start();
        
        // Keep the process alive to handle requests
        await new Promise(() => {});
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down HTTP server...');
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down HTTP server...');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('💥 Failed to start HTTP server:', error);
        console.error('📋 Error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        process.exit(1);
    }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🚀 Backend server script starting...');
    main().catch(error => {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    });
}

export default RuleOfThirdsHttpServer;