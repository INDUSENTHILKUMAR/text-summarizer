import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

const statusMessage = document.getElementById("api-key-status");
const loadingIndicator = document.getElementById("loadingIndicator");

// Initialize the loading indicator as hidden
loadingIndicator.style.display = "none";


// Live Text Analysis
const textInput = document.getElementById("textInput");
const wordCountEle = document.getElementById("wordCount");
const readTimeEle = document.getElementById("readTime");

textInput.addEventListener("input", () => {
  const text = textInput.value.trim();
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const readTime = Math.ceil(wordCount / 200); // 200 WPM
  wordCountEle.textContent = wordCount;
  readTimeEle.textContent = readTime;
});







document.getElementById("tryNow").addEventListener("click", function () {
  document.getElementById("summarizer").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("save-api-key").addEventListener("click", function () {
  const apiKey = document.getElementById("api-key-input").value.trim();



  if (apiKey) {
    localStorage.setItem("gemini-api-key", apiKey);
    document.getElementById("api-key-input").value = "";
    statusMessage.innerText = "API key saved!";
    statusMessage.style.color = "#27ae60";
  } else {
    statusMessage.innerText = "Please provide a valid API key!";
    statusMessage.style.color = "#e74c3c";
  }
});

document.querySelectorAll(".summary-btn").forEach((button) => {
  button.addEventListener("click", async function () {
    const text = document.getElementById("textInput").value.trim();

    if (!text) {
      alert("Please provide a text to summarize!");
      return;
    }
    // Show the loading indicator before starting
    loadingIndicator.style.display = "flex";

    const summaryLength = this.getAttribute("data-length");
    let summary;
    try {
      summary = await getSummary(text, summaryLength);
    } catch (error) {
      console.error("Error getting the summary: ", error);
      summary = "An error occurred generating the summary. Try again later.";
    } finally {
      // Hide the loading indicator when done (success or failure)
      loadingIndicator.style.display = "none";
    }

    console.log(summary);

    const summaryOutput = document.getElementById("summaryOutput");
    summaryOutput.textContent = summary;
    summaryOutput.style.display = "block";
    summaryOutput.scrollIntoView({ behavior: "smooth" });
    displayReductionStats(text, summary);

  });
});

async function getSummary(text, summaryLength) {
  const promptMap = {
    short: "Provide a short summary of this text (5 sentences):",
    medium: "Provide a balanced summary of this text:",
    detailed: "Provide a detailed summary of this text:",
  };

  const apiKey = localStorage.getItem("gemini-api-key");

  if (!apiKey) {
    throw new Error("No API key was found. Please add one first.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `${promptMap[summaryLength]}\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate summary.");
  }
}




function displayReductionStats(originalText, summaryText) {
  const originalWordCount = originalText.split(/\s+/).filter(word => word.length > 0).length;
  const summaryWordCount = summaryText.split(/\s+/).filter(word => word.length > 0).length;
  const reductionPercent = Math.round(((originalWordCount - summaryWordCount) / originalWordCount) * 100);

  let statsBox = document.getElementById("reductionStats");

  if (!statsBox) {
    statsBox = document.createElement("div");
    statsBox.id = "reductionStats";
    statsBox.className = "reduction-box";

    // Append directly to same parent as summaryOutput
    const summaryOutput = document.getElementById("summaryOutput");
    summaryOutput.parentNode.insertBefore(statsBox, summaryOutput.nextSibling);
  }

  statsBox.textContent = `Summary is ${reductionPercent}% shorter than the original text.`;
}

