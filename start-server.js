import RuleOfThirdsHttpServer from './build/httpServer.js';

console.log('🚀 Starting Rule of Thirds HTTP Server...');

const port = parseInt(process.env.PORT || '3001');
const server = new RuleOfThirdsHttpServer(port);

try {
    await server.start();
    console.log(`🌐 Server running on http://localhost:${port}`);
    console.log(`📊 API endpoints available at http://localhost:${port}/api/`);
    console.log(`🎯 Web interface available at http://localhost:${port}`);
    
    // Keep the process alive
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down HTTP server...');
        process.exit(0);
    });
    
} catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
}