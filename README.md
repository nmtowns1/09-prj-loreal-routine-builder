# Project 9: L'Oréal Routine Builder

L’Oréal is expanding what’s possible with AI, and now your chatbot is getting smarter. This week, you’ll upgrade it into a product-aware routine builder.

Users will be able to browse real L’Oréal brand products, select the ones they want, and generate a personalized routine using AI. They can also ask follow-up questions about their routine—just like chatting with a real advisor.

## Features

- 📦 **Product Selection**: Browse and select products from multiple categories
- 🤖 **AI-Powered Routines**: Generate personalized beauty routines with OpenAI
- 💬 **Conversation History**: Ask follow-up questions about your routine
- 💾 **Persistent Selections**: Your product selections are saved in localStorage
- 🔒 **Secure API**: Uses Cloudflare Workers to keep your API key safe
- 🎨 **Formatted Responses**: AI responses with proper formatting, lists, and structure
- ♿ **Accessible Design**: Full keyboard navigation and screen reader support

## Setup Instructions

### Option 1: Using Cloudflare Worker (Recommended for Security)

1. Follow the complete guide in [CLOUDFLARE_WORKER_SETUP.md](CLOUDFLARE_WORKER_SETUP.md)
2. Deploy the worker using the provided [worker.js](worker.js) file
3. Update `WORKER_URL` in [script.js](script.js) with your deployed worker URL
4. Open `index.html` in your browser

### Option 2: Using API Key Locally (Development Only)

⚠️ **Warning**: This exposes your API key in the frontend code. Never use in production!

1. Uncomment the `<script src="secrets.js"></script>` line in [index.html](index.html)
2. Add your API key to [secrets.js](secrets.js):
   ```javascript
   const OPENAI_API_KEY = "sk-your-api-key-here";
   ```
3. Update [script.js](script.js) to use the direct API method (see commented code)
4. Open `index.html` in your browser

## Project Structure

```
├── index.html              # Main HTML file
├── style.css              # Styles and layout
├── script.js              # Frontend JavaScript logic
├── products.json          # Product database
├── worker.js              # Cloudflare Worker code
├── wrangler.toml          # Worker configuration
├── secrets.js             # API key (for local dev only)
├── CLOUDFLARE_WORKER_SETUP.md  # Deployment guide
└── README.md              # This file
```

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- OpenAI GPT-4o API
- Cloudflare Workers (serverless)
- localStorage for persistence
- Font Awesome icons

## Security Notes

✅ **Do**: Use Cloudflare Workers for production  
❌ **Don't**: Commit your API keys to GitHub  
✅ **Do**: Use environment variables and secrets  
❌ **Don't**: Expose API keys in frontend code

## License

This project is for educational purposes.
