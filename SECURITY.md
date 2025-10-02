# Security & Environment Variables Guide

## 🔐 Managing Secrets in Your Repository

### Local Development

For local development, use a `.env` file:

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your actual credentials** to `.env` (this file is gitignored)

3. **NEVER commit `.env`** - it's automatically ignored by git

### For Bolt.new Environment

Since you're working in Bolt.new, you have a few options:

#### Option 1: Use Bolt.new Environment Variables (Recommended)

Bolt.new can access environment variables directly. You can set them in your shell before starting:

```bash
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com"
export AZURE_OPENAI_API_KEY="your-key"
export AZURE_OPENAI_DEPLOYMENT="your-deployment"
npm run dev
```

#### Option 2: Create .env file locally in Bolt

You can create a `.env` file directly in the Bolt.new environment:

```bash
cat > .env << 'EOF'
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-actual-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
EOF
```

This file won't be committed because it's in `.gitignore`.

### For GitHub Repository

**DO NOT** store secrets directly in the repo. Instead, use GitHub Secrets:

#### Setting Up GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `AZURE_OPENAI_ENDPOINT`
   - Value: `https://your-resource.openai.azure.com`
   - Click **Add secret**
5. Repeat for:
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT`
   - `NEWS_API_KEY` (optional)
   - `YOUTUBE_API_KEY` (optional)

#### Using Secrets in GitHub Actions

If you add CI/CD workflows, reference secrets like this:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        env:
          AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
          AZURE_OPENAI_DEPLOYMENT: ${{ secrets.AZURE_OPENAI_DEPLOYMENT }}
        run: npm run build
```

## 🛡️ Security Best Practices

### What's Already Protected

✅ `.env` is in `.gitignore` - won't be committed
✅ `.env.example` only has placeholder values - safe to commit
✅ API keys are only loaded from environment variables
✅ No secrets are logged or exposed in error messages

### Additional Recommendations

1. **Rotate Keys Regularly**: Change your API keys every 90 days
2. **Use Separate Keys**: Different keys for dev/staging/production
3. **Monitor Usage**: Check Azure portal for unexpected API usage
4. **Limit Permissions**: Use least-privilege access for API keys
5. **Enable IP Restrictions**: If possible, restrict API access by IP

## 🚨 If You Accidentally Commit Secrets

If you accidentally commit a `.env` file or expose secrets:

1. **Immediately rotate the keys** in Azure Portal
2. **Remove from git history:**
   ```bash
   # Install BFG Repo Cleaner
   brew install bfg  # or download from rtyley.github.io/bfg-repo-cleaner

   # Remove .env from all history
   bfg --delete-files .env

   # Clean up and force push
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

3. **Contact GitHub Support** to clear cached secrets

## 📝 Environment Variable Reference

### Azure OpenAI (Recommended for your setup)

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_DEPLOYMENT=your-model-deployment-name
```

**Where to find these:**
- Go to [Azure Portal](https://portal.azure.com)
- Navigate to your Azure OpenAI resource
- Endpoint: Overview page
- API Key: Keys and Endpoint section
- Deployment: Model deployments section

### Standard OpenAI (Alternative)

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

**Where to get:**
- [OpenAI Platform](https://platform.openai.com/api-keys)

### Optional External APIs

```bash
NEWS_API_KEY=your-newsapi-key        # newsapi.org
YOUTUBE_API_KEY=your-youtube-key     # console.cloud.google.com
```

## 🔍 Verifying Your Setup

Test that environment variables are loaded correctly:

```bash
# Start the server
npm run dev

# In another terminal, check health
curl http://localhost:3001/api/health

# Check capabilities (shows if LLM is configured)
curl http://localhost:3001/api/capabilities
```

If Azure OpenAI is properly configured, you'll see:
```
🤖 Azure OpenAI client initialized (deployment: your-deployment)
```

If not configured:
```
⚠️  No OpenAI credentials provided - LLM synthesis will be skipped
```

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure OpenAI Security Best Practices](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity)
- [Environment Variables in Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
