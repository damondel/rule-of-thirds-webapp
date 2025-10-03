# Getting Preview to Work in Bolt.new

## The Problem
Bolt.new's preview wasn't showing because the dev server wasn't started automatically.

## The Solution - 3 Easy Steps

### Step 1: Add Your Azure Credentials to .env

Edit your `.env` file and add:

```bash
# Azure OpenAI (add your actual values)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-actual-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

You should already have the Supabase values there.

### Step 2: Build the Application

In the Bolt.new terminal, run:

```bash
npm run build
```

Wait for it to complete (about 5-10 seconds).

### Step 3: Start the Development Server

```bash
npm run dev
```

You should see:
```
🚀 Backend server script starting...
🔧 Initializing RuleOfThirdsOrchestrator...
🤖 Azure OpenAI client initialized (deployment: your-deployment)
🌐 Rule of Thirds HTTP Server running on http://localhost:3001
📊 API endpoints available at http://localhost:3001/api/
🎯 Web interface available at http://localhost:3001
```

### Step 4: Open the Preview

In Bolt.new:
1. Click the "Preview" button/icon
2. The app should open at `http://localhost:3001`
3. You should see the **Rule of Thirds** triangular interface!

## If Preview Still Doesn't Work

### Option A: Use Direct URL

Open your browser manually to:
- **http://localhost:3001** (main app)
- **http://localhost:3001/api/health** (health check)

### Option B: Check if Server is Running

```bash
# Check if port 3001 is in use
lsof -i :3001

# Test the API
curl http://localhost:3001/api/health
```

You should see:
```json
{"status":"healthy","timestamp":"2025-10-02T...","version":"1.0.0"}
```

### Option C: Kill and Restart

If the server is stuck:

```bash
# Kill any existing servers
pkill -f "node.*httpServer"

# Rebuild and restart
npm run build
npm run dev
```

## Understanding the Setup

### What npm run dev Does

1. Builds the TypeScript backend → `build/`
2. Builds the React frontend → `web/dist/`
3. Starts Express server on port 3001
4. Serves the React app from the Express server

### Why One Server?

Bolt.new works best with a single server. So we:
- ✅ Backend serves the API at `/api/*`
- ✅ Backend serves the React app at `/`
- ✅ Everything runs on port 3001
- ❌ No separate Vite dev server needed

### For Hot Reload Development

If you want hot reload while developing:

```bash
# Terminal 1: Run backend
npm run dev:backend

# Terminal 2: Run frontend with hot reload
npm run dev:frontend
```

Then open:
- Frontend: http://localhost:5173 (hot reload)
- Backend: http://localhost:3001 (API)

## Troubleshooting

### "Cannot find module"
```bash
npm install
cd web && npm install && cd ..
```

### "Port already in use"
```bash
pkill -f "node.*httpServer"
```

### "Frontend not built"
```bash
npm run build
```

### "ENOENT: no such file"
This means the frontend wasn't built. Run:
```bash
npm run build
```

## Quick Commands Reference

```bash
# Full rebuild and start
npm run build && npm run dev

# Just start (if already built)
npm start

# Development with hot reload
npm run dev:full

# Check if working
curl http://localhost:3001/api/health
```

## Success Indicators

When everything is working, you should see:

1. ✅ Build completes without errors
2. ✅ Server starts on port 3001
3. ✅ Azure OpenAI client initialized (if configured)
4. ✅ Preview shows the triangular Rule of Thirds interface
5. ✅ You can enter a topic and click "Start Analysis"

## Still Having Issues?

1. Check the console output for error messages
2. Verify `.env` has your Azure credentials
3. Make sure `npm run build` completes successfully
4. Try accessing http://localhost:3001 directly in your browser
5. Check the browser console for JavaScript errors (F12)

The app is designed to work even without Azure credentials (it uses simulated data), so you should at least see the interface!
