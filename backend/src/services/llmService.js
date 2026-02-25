import { CohereClient } from "cohere-ai";
import { COHERE_API_KEY } from "../config/serverConfig.js";

const cohere = new CohereClient({
  token: COHERE_API_KEY,
});

export async function generateAnswer({ docs, history, question }) {
  const systemPrompt = `
You are a support assistant.

You MUST answer ONLY using the provided documentation.

If the answer is NOT found in the documentation, respond exactly:
"Sorry, I don’t have information about that."
`;

  const documentation = docs.map((d) => d.content).join("\n");

  const chatHistory = history.map((h) => ({
    role: h.role === "assistant" ? "CHATBOT" : "USER",
    message: h.content,
  }));

  const response = await cohere.chat({
    model: "command-a-03-2025",
    message: question,
    chatHistory: chatHistory,
    preamble: `${systemPrompt}\n\nDocumentation:\n${documentation}`,
    maxTokens: 150,
  });

  return {
    reply: response.text.trim(),
    tokensUsed: response.meta?.billedUnits?.outputTokens || 0,
  };
}
