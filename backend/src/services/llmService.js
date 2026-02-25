import Cohere from "cohere-ai";
import { COHERE_API_KEY } from "../config/serverConfig.js";

dotenv.config();

Cohere.init(COHERE_API_KEY);

export async function generateAnswer({ docs, history, question }) {
  const prompt = `
You are a support assistant.

You MUST answer ONLY using the documentation below.
If the answer is not found, respond exactly:
"Sorry, I don’t have information about that."

Documentation:
${docs.map((d) => d.content).join("\n")}

Conversation History:
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

User Question:
${question}

Answer:
`;

  const response = await Cohere.generate({
    model: "command",
    prompt,
    max_tokens: 150,
  });

  return {
    reply: response.body.generations[0].text.trim(),
    tokensUsed: response.body.meta?.billed_units?.output_tokens || 0,
  };
}
