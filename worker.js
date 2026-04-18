/**
 * ═══════════════════════════════════════════════════════════════════════
 * CLOUDFLARE WORKER - OPENAI API PROXY
 * ═══════════════════════════════════════════════════════════════════════
 *
 * This worker securely proxies requests to the OpenAI API, keeping your
 * API key safe on the server side instead of exposing it in the frontend.
 *
 * DEPLOYMENT INSTRUCTIONS:
 *
 * 1. Install Wrangler CLI (Cloudflare's deployment tool):
 *    npm install -g wrangler
 *
 * 2. Login to Cloudflare:
 *    wrangler login
 *
 * 3. Create a new worker:
 *    wrangler init loreal-openai-proxy
 *
 * 4. Copy this worker.js content to the worker file
 *
 * 5. Add your OpenAI API key as a secret:
 *    wrangler secret put OPENAI_API_KEY
 *    (Then paste your API key when prompted)
 *
 * 6. Deploy the worker:
 *    wrangler deploy
 *
 * 7. Copy the deployed worker URL and update WORKER_URL in your script.js
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

export default {
  async fetch(request, env) {
    /* Enable CORS for your frontend */
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // Change to your domain in production
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    /* Handle CORS preflight requests FIRST */
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    /* Only allow POST requests */
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      /* Parse the incoming request from your frontend */
      const text = await request.text();

      /* Check if request body is empty */
      if (!text) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Request body is empty",
            },
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          },
        );
      }

      const requestData = JSON.parse(text);

      /* Forward the request to OpenAI API */
      const openAIResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            /* Use the secret API key stored in Cloudflare */
            Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify(requestData),
        },
      );

      /* Get the response from OpenAI */
      const responseText = await openAIResponse.text();

      /* Check if response is empty */
      if (!responseText) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Empty response from OpenAI",
            },
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          },
        );
      }

      const data = JSON.parse(responseText);

      /* Return the response to your frontend with CORS headers */
      return new Response(JSON.stringify(data), {
        status: openAIResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (error) {
      /* Handle any errors */
      return new Response(
        JSON.stringify({
          error: {
            message: error.message || "An error occurred",
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }
  },
};
