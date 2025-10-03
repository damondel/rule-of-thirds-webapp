# Quick Start Guide

Get your Rule of Thirds application running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
cd web && npm install && cd ..
```

## Step 2: Set Up Environment Variables

### Option A: For Local Development

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your favorite editor
nano .env  # or vim, code, etc.
```

Add your Azure OpenAI credentials:

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-actual-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### Option B: For Bolt.new Environment

Create a `.env` file directly:

```bash
cat > .env << 'EOF'
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-actual-key-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
EOF
```

## Step 3: Build the Application

```bash
npm run build
```

You should see:
```
✓ Backend compiled successfully
✓ Frontend built successfully
```

## Step 4: Start the Application

### Development Mode (Hot Reload)

```bash
npm run dev
```

This starts:
- Backend API at `http://localhost:3001`
- Frontend at `http://localhost:5173`

### Production Mode

```bash
npm start
```

Everything served from `http://localhost:3001`

## Step 5: Test It Works

Open your browser to:
- **Development**: http://localhost:5173
- **Production**: http://localhost:3001

You should see the Rule of Thirds triangular interface!

### Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Check if Azure OpenAI is connected
curl http://localhost:3001/api/capabilities
```

## 🎯 Try Your First Analysis

1. Enter a topic: "AI productivity tools"
2. Add focus area: "enterprise adoption"
3. Click "Start Analysis"
4. Watch as the three agents gather signals in parallel!

## 🐛 Troubleshooting

### "No OpenAI credentials provided"

Make sure your `.env` file exists and has the correct values:

```bash
# Check if .env exists
ls -la .env

# Check if it has content (without revealing secrets)
grep "AZURE_OPENAI" .env | sed 's/=.*/=***/'
```

### "Frontend not built"

Run the build command:

```bash
npm run build
```

### "Port 3001 already in use"

Kill the existing process:

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Or change the port in .env
echo "PORT=3002" >> .env
```

### "Cannot find module"

Reinstall dependencies:

```bash
rm -rf node_modules web/node_modules
npm install
cd web && npm install && cd ..
```

## 📚 Next Steps

- Read [SECURITY.md](./SECURITY.md) for managing secrets safely
- Check [README.md](./README.md) for full documentation
- Explore the API endpoints at `/api/`

## 🎉 You're Ready!

Your Rule of Thirds application is now running. Start analyzing signals and gathering strategic intelligence!
