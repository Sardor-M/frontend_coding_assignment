const axios = require('axios');
const researcherPrompt = require('../config/RESEARCHER_PROMPT.json');
const MOCK_RESPONSE = require('../config/MOCK_RESPONSE.json');

const OLLAMA_URL = process.env.OLLAMA_URL || '';
const MODEL_NAME = process.env.MODEL_NAME || '';

async function* streamResponse(prompt) {
    const useOllama = process.env.USE_OLLAMA === 'true';

    if (!useOllama) {
        yield MOCK_RESPONSE.summary + ' ' + MOCK_RESPONSE.citations[0] + ' ';
        await new Promise((resolve) => setTimeout(resolve, 200));

        /* populate the rest with complications */
        for (const comp of MOCK_RESPONSE.complications) {
            yield `**${comp.title}:** ${comp.description} ${comp.citation} `;
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
        return;
    }

    try {
        const response = await axios.post(
            `${OLLAMA_URL}/api/generate`,
            {
                model: MODEL_NAME,
                prompt: `${researcherPrompt.system}\n\nQuestion: ${prompt}\n\nResponse:`,
                stream: true,
            },
            { responseType: 'stream' }
        );

        for await (const chunk of response.data) {
            const lines = chunk
                .toString()
                .split('\n')
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
        console.error('Ollama error:', error);
        yield* streamResponse(prompt);
    }
}

module.exports = { streamResponse };
