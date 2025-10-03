import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Enable JSON parsing
app.use(express.json());

// Serve static files from web/dist
app.use(express.static(join(__dirname, 'web/dist')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.post('/api/orchestrate', (req, res) => {
    const { topic, focus_area } = req.body;
    
    res.json({
        success: true,
        message: 'Test response',
        topic,
        focus_area,
        signals: {
            external: { status: 'test', signalCount: 5 },
            internal: { status: 'test', findingCount: 3 },
            product: { status: 'test', dataPointCount: 10 }
        },
        metadata: {
            executionTime: 500,
            totalSignals: 18
        }
    });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'web/dist/index.html'));
});

app.listen(port, () => {
    console.log(`🌐 Server running at http://localhost:${port}`);
    console.log(`📱 Frontend available at http://localhost:${port}`);
    console.log(`🔧 API health check: http://localhost:${port}/api/health`);
});