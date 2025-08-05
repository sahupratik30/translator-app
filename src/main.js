import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// DOM ELEMENTS
const input = document.getElementById("input");
const responseElement = document.getElementById("response");
const submitBtn = document.getElementById("submit");
const charCount = document.getElementById("char-count");
const copyBtn = document.getElementById("copy-btn");

// Initialize model
const model = new ChatOllama({
  baseUrl: "http://127.0.0.1:11434",
  model: "llama3.2",
  temperature: 0,
});

// Character counter functionality
input.addEventListener("input", () => {
  const count = input.value.length;
  charCount.textContent = count;
  
  // Change color based on character count
  if (count > 800) {
    charCount.style.color = "var(--error)";
  } else if (count > 600) {
    charCount.style.color = "orange";
  } else {
    charCount.style.color = "var(--text-secondary)";
  }
});

// Enable submit on Enter (Ctrl+Enter)
input.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    submitBtn.click();
  }
});

// Main translation function
async function translateText() {
  const inputText = input.value.trim();
  
  if (!inputText) {
    showError("Please enter some text to translate.");
    return;
  }

  // Set loading state
  setLoadingState(true);
  clearResponse();

  try {
    const systemTemplate = "Translate the following from English into {language}";
    
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["user", "{text}"],
    ]);

    const promptValue = await promptTemplate.invoke({
      language: "hindi",
      text: inputText,
    });

    const response = await model.invoke(promptValue);
    console.log("Translation response:", response);

    // Display the response
    showResponse(response.content);
    
  } catch (error) {
    console.error("Translation error:", error);
    showError("Failed to translate. Please check if Ollama is running and try again.");
  } finally {
    setLoadingState(false);
  }
}

// Set loading state
function setLoadingState(isLoading) {
  if (isLoading) {
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    input.disabled = true;
  } else {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
    input.disabled = false;
  }
}

// Show successful response
function showResponse(content) {
  responseElement.innerHTML = content;
  responseElement.classList.remove("placeholder");
  responseElement.classList.add("animated");
  copyBtn.style.display = "block";
  
  // Remove animation class after animation completes
  setTimeout(() => {
    responseElement.classList.remove("animated");
  }, 300);
}

// Show error message
function showError(message) {
  responseElement.innerHTML = `<div style="color: var(--error); font-weight: 500;">❌ ${message}</div>`;
  responseElement.classList.remove("placeholder");
  copyBtn.style.display = "none";
}

// Clear response area
function clearResponse() {
  responseElement.innerHTML = '<div class="placeholder">Your translation will appear here...</div>';
  responseElement.classList.add("placeholder");
  copyBtn.style.display = "none";
}

// Copy functionality
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(responseElement.textContent);
    
    // Show feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "✅ Copied!";
    copyBtn.style.background = "var(--success)";
    copyBtn.style.color = "white";
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = "";
      copyBtn.style.color = "";
    }, 2000);
    
  } catch (error) {
    console.error("Failed to copy:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = responseElement.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => {
      copyBtn.textContent = "📋 Copy";
    }, 2000);
  }
});

// Submit button event listener
submitBtn.addEventListener("click", translateText);

// Initialize character count
charCount.textContent = "0";
