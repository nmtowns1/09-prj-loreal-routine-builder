# Quick Start: Cloudflare Worker Setup

## What I've Set Up For You

✅ Created `worker.js` - Your Cloudflare Worker code  
✅ Created `wrangler.toml` - Worker configuration file  
✅ Updated `script.js` - Now uses Cloudflare Worker instead of direct API calls  
✅ Updated `index.html` - Removed secrets.js dependency  
✅ Created `CLOUDFLARE_WORKER_SETUP.md` - Complete deployment guide

## What You Need to Do

### 1. Install Wrangler (One-time setup)

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Deploy Your Worker

```bash
wrangler deploy
```

### 4. Add Your OpenAI API Key (One-time)

```bash
wrangler secret put OPENAI_API_KEY
```

Then paste your API key when prompted.

### 5. Update script.js

Copy your deployed worker URL and update this line in `script.js`:

```javascript
const WORKER_URL = "https://loreal-openai-proxy.YOUR-USERNAME.workers.dev";
```

### 6. Test It!

Open `index.html` in your browser and try generating a routine!

## That's It! 🎉

Your API key is now secure on Cloudflare's servers and never exposed in your frontend code.

## Need Help?

See the complete guide: [CLOUDFLARE_WORKER_SETUP.md](CLOUDFLARE_WORKER_SETUP.md)
