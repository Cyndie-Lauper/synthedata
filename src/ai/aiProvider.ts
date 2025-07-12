/**
 * Interface for an AI provider.
 */
export interface AIProvider {
  generateText(prompt: string): Promise<string>;
}
