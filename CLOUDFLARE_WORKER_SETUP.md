# Cloudflare Worker Deployment Guide

This guide will help you deploy a Cloudflare Worker to securely proxy your OpenAI API requests.

## Why Use a Cloudflare Worker?

- **Security**: Your OpenAI API key stays on the server, never exposed in frontend code
- **Free Tier**: Cloudflare Workers offers 100,000 requests per day for free
- **Fast**: Workers run on Cloudflare's global edge network
- **Simple**: No complex server setup required

## Prerequisites

- A Cloudflare account (free): https://dash.cloudflare.com/sign-up
- Node.js installed on your computer
- Your OpenAI API key

## Step-by-Step Deployment

### 1. Install Wrangler CLI

Wrangler is Cloudflare's command-line tool for managing Workers.

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authorize Wrangler with your Cloudflare account.

### 3. Create a New Worker Project

```bash
cd /path/to/your/project
wrangler init loreal-openai-proxy
```

When prompted:

- Select "Hello World" Worker template
- Choose TypeScript or JavaScript (choose JavaScript for simplicity)
- Say "No" to git repository (if you already have one)
- Say "No" to deploying (we'll do this manually)

### 4. Copy the Worker Code

Replace the content of `src/index.js` (or `worker.js`) with the code from `worker.js` in this project.

### 5. Add Your OpenAI API Key as a Secret

Secrets are encrypted environment variables that are not visible in your code.

```bash
wrangler secret put OPENAI_API_KEY
```

When prompted, paste your OpenAI API key and press Enter.

### 6. Deploy the Worker

```bash
wrangler deploy
```

After deployment, you'll see a URL like:

```
https://loreal-openai-proxy.your-username.workers.dev
```

**Copy this URL!** You'll need it for the next step.

### 7. Update Your Frontend Code

Open `script.js` and find this line:

```javascript
const WORKER_URL = "YOUR_CLOUDFLARE_WORKER_URL_HERE";
```

Replace it with your worker URL:

```javascript
const WORKER_URL = "https://loreal-openai-proxy.your-username.workers.dev";
```

### 8. Test Your Application

1. Open your `index.html` in a browser
2. Select some products
3. Click "Generate Routine"
4. You should see the AI-generated routine appear!

## Updating Your Worker

If you need to update the worker code:

1. Edit the worker code
2. Run `wrangler deploy` again

## Security Best Practices for Production

### Update CORS Settings

In `worker.js`, change this line:

```javascript
"Access-Control-Allow-Origin": "*", // Change to your domain in production
```

To your specific domain:

```javascript
"Access-Control-Allow-Origin": "https://yourdomain.com",
```

### Optional: Add Rate Limiting

To prevent abuse, consider adding rate limiting to your worker.

## Troubleshooting

### Error: "Unauthorized"

- Make sure you ran `wrangler secret put OPENAI_API_KEY`
- Verify your OpenAI API key is valid

### Error: "CORS error"

- Check that the worker URL in `script.js` is correct
- Ensure the worker is deployed

### Error: "Worker not found"

- Run `wrangler deploy` again
- Check that you're using the correct worker URL

### Error: "Too many requests"

- You've exceeded Cloudflare's free tier limits (100k/day)
- Consider upgrading to a paid plan

## Cost Information

**Cloudflare Workers Free Tier:**

- 100,000 requests per day
- 10ms CPU time per request

**OpenAI API Costs:**

- GPT-4o: ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- Check current pricing: https://openai.com/pricing

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Need Help?

If you run into issues:

1. Check the Cloudflare Workers logs in your dashboard
2. Review the browser console for errors
3. Verify all environment variables are set correctly

---

Made with ❤️ for L'Oréal Routine Builder
