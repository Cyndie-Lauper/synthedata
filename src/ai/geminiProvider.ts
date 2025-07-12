import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./aiProvider";

/**
 * Class to interact with Google Gemini API.
 */
export class GeminiProvider implements AIProvider {
  private model: any;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error("API key not found. Please provide or set GOOGLE_API_KEY environment variable.");
    }
    const genAI = new GoogleGenerativeAI(key);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const fullPrompt = `Please generate a single, realistic value based on the following request. Only return the value, with no explanation, labels, or extra text.\n\nRequest: ${prompt}`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text().trim().replace(/["']/g, "");
    } catch (e) {
      console.error("Error:", e);
      return `Error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}
