import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, SummarizeOptions, GenerateOptions, SuggestOptions, Suggestion } from './ai.provider';

export class ClaudeAdapter implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async summarize(content: string, options: SummarizeOptions): Promise<string> {
    const maxLength = options.maxLength ?? 500;
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Summarize the following ${options.contentType} in ${maxLength} characters or less:\n\n${content}`,
        },
      ],
    });

    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  async generate(prompt: string, options: GenerateOptions): Promise<any> {
    const systemPrompt = `You are a productivity assistant. Generate ${options.type} content based on the user's prompt. Return well-structured JSON content.`;
    const contextStr = options.context ? `\n\nContext: ${JSON.stringify(options.context)}` : '';

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${prompt}${contextStr}`,
        },
      ],
    });

    const block = response.content[0];
    const text = block.type === 'text' ? block.text : '';

    try {
      return JSON.parse(text);
    } catch {
      return { content: text };
    }
  }

  async suggest(options: SuggestOptions): Promise<Suggestion[]> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are a productivity assistant. Provide suggestions as a JSON array of objects with "text" (string), "confidence" (number 0-1), and optional "metadata" (object) fields.',
      messages: [
        {
          role: 'user',
          content: `Provide ${options.type} suggestions based on:\n${JSON.stringify(options.data)}`,
        },
      ],
    });

    const block = response.content[0];
    const text = block.type === 'text' ? block.text : '[]';

    try {
      return JSON.parse(text);
    } catch {
      return [{ text, confidence: 0.5 }];
    }
  }
}
