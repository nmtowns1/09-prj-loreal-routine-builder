/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/**
 * CLOUDFLARE WORKER CONFIGURATION
 * Replace this URL with your deployed Cloudflare Worker URL
 * Example: "https://loreal-openai-proxy.your-username.workers.dev"
 */
const WORKER_URL = "https://wondebot-worker.ntown2002.workers.dev";

/* Array to track selected products */
let selectedProducts = [];

/* localStorage key for saving selected products */
const STORAGE_KEY = "loreal_selected_products";

/* Load selected products from localStorage */
function loadSelectedProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      selectedProducts = JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading selected products:", error);
    selectedProducts = [];
  }
}

/* Save selected products to localStorage */
function saveSelectedProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProducts));
  } catch (error) {
    console.error("Error saving selected products:", error);
  }
}

/* Clear all selected products */
function clearAllProducts() {
  selectedProducts = [];
  saveSelectedProducts();

  /* Remove selected class from all product cards */
  const allCards = document.querySelectorAll(".product-card.selected");
  allCards.forEach((card) => card.classList.remove("selected"));

  updateSelectedProductsDisplay();
}

/* Load saved selections on page load */
loadSelectedProducts();

/* Array to track conversation history for OpenAI API */
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful beauty and skincare expert for L'Oréal. You help users create personalized routines and answer questions about skincare, haircare, makeup, fragrance, and beauty products. Be specific, helpful, and professional. Stay on topic related to beauty and personal care.",
  },
];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <div class="product-header">
          <div>
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
          </div>
          <button class="info-btn" data-product-id="${product.id}" title="View product description" aria-label="View description for ${product.name}">
            <i class="fa-solid fa-circle-info"></i>
          </button>
        </div>
        <div class="product-description" data-product-id="${product.id}" style="display: none;">
          ${formatProductDescription(product.description)}
        </div>
      </div>
    </div>
  `,
    )
    .join("");

  /* Add click event listeners to all product cards */
  addProductClickHandlers(products);
  /* Add click event listeners to info buttons */
  addInfoButtonHandlers();
  /* Apply selected class to previously selected products */
  applySelectedStates();
}

/* Apply selected class to products that are in the selectedProducts array */
function applySelectedStates() {
  selectedProducts.forEach((selectedProduct) => {
    const card = document.querySelector(
      `.product-card[data-product-id="${selectedProduct.id}"]`,
    );
    if (card) {
      card.classList.add("selected");
    }
  });
}

/* Format product description into structured, readable content */
function formatProductDescription(description) {
  /* Split description by sentences (periods followed by space or end) */
  const sentences = description
    .split(". ")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  /* Create formatted HTML with bullet points for better readability */
  const formattedSentences = sentences
    .map((sentence) => {
      /* Add period back if it doesn't end with one */
      const text = sentence.endsWith(".") ? sentence : sentence + ".";
      return `
        <div class="description-item">
          <i class="fa-solid fa-circle-check description-icon"></i>
          <span>${text}</span>
        </div>
      `;
    })
    .join("");

  return `
    <div class="description-content">
      <div class="description-header">
        <i class="fa-solid fa-info-circle"></i>
        <strong>Product Details</strong>
      </div>
      ${formattedSentences}
    </div>
  `;
}

/* Add click handlers to product cards for selection */
function addProductClickHandlers(products) {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      /* Don't toggle selection if clicking the info button */
      if (e.target.closest(".info-btn")) {
        return;
      }

      const productId = card.getAttribute("data-product-id");
      toggleProductSelection(productId, card, products);
    });
  });
}

/* Add click handlers to info buttons for showing descriptions */
function addInfoButtonHandlers() {
  const infoButtons = document.querySelectorAll(".info-btn");

  infoButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      /* Prevent the click from bubbling to the card */
      e.stopPropagation();

      const productId = button.getAttribute("data-product-id");
      toggleProductDescription(productId);
    });
  });
}

/* Toggle the visibility of a product's description */
function toggleProductDescription(productId) {
  const description = document.querySelector(
    `.product-description[data-product-id="${productId}"]`,
  );
  const button = document.querySelector(
    `.info-btn[data-product-id="${productId}"]`,
  );

  if (description.style.display === "none") {
    /* Show the description */
    description.style.display = "block";
    button.setAttribute("aria-expanded", "true");
    button.title = "Hide product description";
  } else {
    /* Hide the description */
    description.style.display = "none";
    button.setAttribute("aria-expanded", "false");
    button.title = "View product description";
  }
}

/* Toggle product selection when card is clicked */
function toggleProductSelection(productId, card, products) {
  /* Convert productId to a number for comparison since data attributes are strings */
  const id = Number(productId);

  /* Check if product is already selected */
  const index = selectedProducts.findIndex((p) => p.id === id);

  if (index > -1) {
    /* Product is selected, so unselect it */
    selectedProducts.splice(index, 1);
    card.classList.remove("selected");
  } else {
    /* Product is not selected, so select it */
    const product = products.find((p) => p.id === id);
    selectedProducts.push(product);
    card.classList.add("selected");
  }

  /* Save to localStorage */
  saveSelectedProducts();

  /* Update the selected products display */
  updateSelectedProductsDisplay();
}

/* Update the display of selected products */
function updateSelectedProductsDisplay() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <p style="color: #666; font-size: 14px;">No products selected yet. Click on product cards to select them.</p>
    `;
    /* Hide the Clear All button when there are no selections */
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
  } else {
    selectedProductsList.innerHTML = selectedProducts
      .map(
        (product) => `
        <div style="padding: 8px 12px; background: #f0f0f0; border-radius: 4px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
          <span style="flex: 1;">${product.name}</span>
          <button class="remove-product-btn" data-product-id="${product.id}" style="background: none; border: none; cursor: pointer; font-size: 16px; color: #666; padding: 0 4px;" title="Remove product">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `,
      )
      .join("");

    /* Add click handlers to remove buttons */
    addRemoveButtonHandlers();

    /* Show the Clear All button when there are selections */
    const clearBtn = document.getElementById("clearAllBtn");
    if (clearBtn) {
      clearBtn.style.display = "inline-block";
    }
  }
}

/* Add click handlers to remove buttons in selected products list */
function addRemoveButtonHandlers() {
  const removeButtons = document.querySelectorAll(".remove-product-btn");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.getAttribute("data-product-id"));
      removeProduct(productId);
    });
  });
}

/* Remove a product from the selected products list */
function removeProduct(productId) {
  /* Remove from selectedProducts array */
  const index = selectedProducts.findIndex((p) => p.id === productId);
  if (index > -1) {
    selectedProducts.splice(index, 1);
  }

  /* Remove selected class from the product card if it's currently visible */
  const productCard = document.querySelector(
    `.product-card[data-product-id="${productId}"]`,
  );
  if (productCard) {
    productCard.classList.remove("selected");
  }

  /* Save to localStorage */
  saveSelectedProducts();

  /* Update the display */
  updateSelectedProductsDisplay();
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory,
  );

  /* Don't reset selected products - keep them persisted across category changes */
  displayProducts(filteredProducts);
});

/* Initialize the selected products display */
updateSelectedProductsDisplay();

/* Helper function to add a message to the chat window */
function addMessageToChat(message, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = isUser
    ? "chat-message user-message"
    : "chat-message ai-message";

  if (isUser) {
    /* User message styling */
    messageDiv.innerHTML = `
      <div class="message-header">You</div>
      <div class="message-content">${escapeHtml(message)}</div>
    `;
  } else {
    /* AI message styling - format the response for better readability */
    const formattedMessage = formatAIResponse(message);
    messageDiv.innerHTML = `
      <div class="message-header">
        <i class="fa-solid fa-sparkles"></i> AI Assistant
      </div>
      <div class="message-content">${formattedMessage}</div>
    `;
  }

  chatWindow.appendChild(messageDiv);
  /* Scroll to the bottom to show the latest message */
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Format AI response text for better readability */
function formatAIResponse(text) {
  /* Escape HTML to prevent XSS attacks */
  let formatted = escapeHtml(text);

  /* Convert markdown-style bold **text** to <strong> */
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  /* Convert numbered lists (e.g., "1. Item" or "1) Item") */
  formatted = formatted.replace(
    /^(\d+[\.\)])\s+(.+)$/gm,
    '<div class="chat-list-item"><span class="list-number">$1</span> $2</div>',
  );

  /* Convert bullet points (- or * at start of line) */
  formatted = formatted.replace(
    /^[\-\*]\s+(.+)$/gm,
    '<div class="chat-list-item"><i class="fa-solid fa-circle bullet-point"></i> $1</div>',
  );

  /* Convert headings (### Heading or ## Heading) */
  formatted = formatted.replace(
    /^###\s+(.+)$/gm,
    '<h4 class="chat-heading-small">$1</h4>',
  );
  formatted = formatted.replace(
    /^##\s+(.+)$/gm,
    '<h3 class="chat-heading">$1</h3>',
  );

  /* Convert double line breaks to paragraph breaks */
  formatted = formatted.replace(/\n\n+/g, "</p><p>");

  /* Convert single line breaks to <br> */
  formatted = formatted.replace(/\n/g, "<br>");

  /* Wrap in paragraph tags */
  formatted = `<p>${formatted}</p>`;

  /* Clean up empty paragraphs */
  formatted = formatted.replace(/<p><\/p>/g, "");
  formatted = formatted.replace(/<p>\s*<\/p>/g, "");

  return formatted;
}

/* Helper function to escape HTML characters to prevent XSS */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* Helper function to show loading state in chat */
function showChatLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "chatLoading";
  loadingDiv.style.color = "#666";
  loadingDiv.style.padding = "12px";
  loadingDiv.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Thinking...`;
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Helper function to remove loading state */
function removeChatLoading() {
  const loadingDiv = document.getElementById("chatLoading");
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

/* Generate Routine button handler - sends selected products to OpenAI */
generateRoutineBtn.addEventListener("click", async () => {
  /* Check if any products are selected */
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `
      <p style="color: #999;">Please select at least one product to generate a routine.</p>
    `;
    return;
  }

  /* Show loading message while waiting for OpenAI response */
  chatWindow.innerHTML = `
    <p style="color: #666;"><i class="fa-solid fa-spinner fa-spin"></i> Generating your personalized routine...</p>
  `;

  /* Create a formatted list of selected products for the AI */
  const productList = selectedProducts
    .map(
      (product) =>
        `- ${product.name} by ${product.brand} (${product.category}): ${product.description}`,
    )
    .join("\n");

  /* Create the prompt message for OpenAI */
  const userMessage = `I have selected the following products:\n\n${productList}\n\nPlease create a personalized beauty routine using these products. Include the order of application, when to use each product (morning/evening), and any tips for best results.`;

  /* Clear chat window and start fresh conversation */
  chatWindow.innerHTML = "";
  conversationHistory = [
    {
      role: "system",
      content:
        "You are a helpful beauty and skincare expert for L'Oréal. You help users create personalized routines and answer questions about skincare, haircare, makeup, fragrance, and beauty products. Be specific, helpful, and professional. Stay on topic related to beauty and personal care.",
    },
  ];

  /* Add user message to conversation history */
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  /* Display user's message in chat (simplified version) */
  addMessageToChat("Please create a routine using my selected products.", true);

  /* Show loading state */
  showChatLoading();

  /* Call OpenAI API to generate the routine */
  await generateRoutine();
});

/* Function to call OpenAI API via Cloudflare Worker */
async function sendMessageToAI() {
  /* Check if worker URL is configured */
  if (!WORKER_URL || WORKER_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE") {
    removeChatLoading();
    addMessageToChat(
      "Error: Please configure your Cloudflare Worker URL in script.js. See worker.js for deployment instructions.",
      false,
    );
    return;
  }

  try {
    /* Send request to Cloudflare Worker with conversation history */
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: conversationHistory,
        temperature: 0.7,
      }),
    });

    /* Get the response as text first */
    const responseText = await response.text();

    /* Check if response is empty */
    if (!responseText) {
      removeChatLoading();
      addMessageToChat(
        "Error: Received empty response from server. Please check your Cloudflare Worker configuration.",
        false,
      );
      return;
    }

    /* Parse the JSON response from the worker */
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      removeChatLoading();
      addMessageToChat(
        `Error: Invalid response from server. ${parseError.message}`,
        false,
      );
      return;
    }

    /* Remove loading indicator */
    removeChatLoading();

    /* Check if the response was successful */
    if (data.choices && data.choices[0] && data.choices[0].message) {
      /* Get the AI response */
      const aiResponse = data.choices[0].message.content;

      /* Add AI response to conversation history */
      conversationHistory.push({
        role: "assistant",
        content: aiResponse,
      });

      /* Display the AI response in the chat window */
      addMessageToChat(aiResponse, false);
    } else {
      /* Handle error if the response doesn't have the expected format */
      addMessageToChat(
        `Error: ${data.error?.message || "Could not get response. Please try again."}`,
        false,
      );
    }
  } catch (error) {
    /* Handle any network or other errors */
    removeChatLoading();

    /* Provide more detailed error information for debugging */
    let errorMessage = `Network Error: ${error.message}`;

    if (error.message.includes("Failed to fetch")) {
      errorMessage = `Failed to connect to Cloudflare Worker at ${WORKER_URL}. 
      
Possible issues:
- Worker URL might be incorrect
- Worker might not be deployed
- CORS settings might be blocking the request
- Internet connection issue

Please check:
1. Is your worker deployed? Run: wrangler deploy
2. Is the URL correct in script.js?
3. Is OPENAI_API_KEY set in Cloudflare? Run: wrangler secret put OPENAI_API_KEY`;
    }

    addMessageToChat(errorMessage, false);
    console.error("Full error details:", error);
  }
}

/* Function to generate routine (wrapper for backward compatibility) */
async function generateRoutine() {
  await sendMessageToAI();
}

/* Chat form submission handler - send follow-up questions */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* Get the user's input */
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  /* Check if message is not empty */
  if (!message) {
    return;
  }

  /* Add user message to conversation history */
  conversationHistory.push({
    role: "user",
    content: message,
  });

  /* Display user's message in chat */
  addMessageToChat(message, true);

  /* Clear the input field */
  userInput.value = "";

  /* Show loading state */
  showChatLoading();

  /* Send message to OpenAI and get response */
  await sendMessageToAI();
});

/* Clear All button handler - remove all selected products */
const clearAllBtn = document.getElementById("clearAllBtn");
if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    /* Ask for confirmation before clearing */
    if (confirm("Are you sure you want to remove all selected products?")) {
      clearAllProducts();
    }
  });
}
