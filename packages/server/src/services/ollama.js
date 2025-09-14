const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "";
const MODEL_NAME = process.env.MODEL_NAME || "";

/* mock response for testing without Ollama */
const MOCK_RESPONSE = `Heat shock protein (HSP) related therapies present a promising avenue for cancer treatment. [1-1] However, several potential complications need consideration.
**Therapeutic Resistance:** HSP90 inhibition can lead to therapeutic resistance. [2-1]

**Side Effects:** High dosages can cause organ burden and accumulation. [3-1]`;

async function* streamResponse(prompt) {
  const useOllama = process.env.USE_OLLAMA === "true";

  if (!useOllama) {
    const words = MOCK_RESPONSE.split(" ");
    for (const word of words) {
      yield word;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return;
  }

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: MODEL_NAME,
        prompt: `
            You are a helpful senior researcher. Always format your response in clean Markdown with clear structure:
                ## Main Topic

                1. **Section Title**
                - Bullet point
                - Bullet point

                2. **Next Section**
                - Sub-points
            Use headings, bullet points, and bold text to enhance readability.
            Cite sources in brackets like [1-1], [2-3] corresponding to the provided context.
            If you don't know the answer, just say you don't know. Do not make up an answer.

            Context: 
            [1-1] Heat shock proteins (HSPs) are a family of proteins that are produced by cells in response to stressful conditions. They play a crucial role in protein folding, repair, and degradation, helping to maintain cellular homeostasis. In cancer, HSPs are often overexpressed and can contribute to tumor growth and survival by stabilizing oncoproteins and inhibiting apoptosis. Targeting HSPs has emerged as a potential therapeutic strategy in oncology.

            [2-1] Therapeutic resistance is a significant challenge in cancer treatment, often leading to relapse and poor prognosis. Resistance can be intrinsic or acquired and may involve various mechanisms such as drug efflux, target mutations, activation of alternative signaling pathways, and changes in the
            tumor micro environment. Understanding these mechanisms is crucial for developing effective treatment strategies and overcoming resistance.
        
            [3-1] Side effects of cancer therapies can significantly impact patient quality of life and treatment adherence. Common side effects include fatigue, nausea, vomiting, hair loss, and increased susceptibility to infections. More severe side effects may involve organ toxicity, neuropathy, and cognitive changes. Managing these side effects through supportive care and dose adjustments is essential for optimizing treatment outcomes.

            User question: ${prompt}
        `,
        stream: true,
      },
      { responseType: "stream" }
    );

    for await (const chunk of response.data) {
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim());
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            yield json.response;
          }
        } catch (e) {
          /* we ignore json parse errors */
        }
      }
    }
  } catch (error) {
    console.error("Ollama error:", error);
    yield* streamResponse(prompt);
  }
}

module.exports = { streamResponse };
