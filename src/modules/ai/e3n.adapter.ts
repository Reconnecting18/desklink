import type {
  AIProvider,
  SummarizeOptions,
  GenerateOptions,
  SuggestOptions,
  Suggestion,
} from './ai.provider';

export class E3nAdapter implements AIProvider {
  private apiUrl: string;
  private timeoutMs: number;

  constructor(apiUrl: string, timeoutMs: number) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  private async post<T>(path: string, body: Record<string, any>): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED' || err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT') {
        throw new Error(`E3N service is not reachable at ${this.apiUrl}. Is it running?`);
      }
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new Error(`E3N request to ${path} timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`E3N request to ${path} failed with status ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async summarize(content: string, options: SummarizeOptions): Promise<string> {
    const result = await this.post<{ summary: string }>('/e3n/summarize', {
      content,
      contentType: options.contentType,
      maxLength: options.maxLength,
    });
    return result.summary;
  }

  async generate(prompt: string, options: GenerateOptions): Promise<any> {
    const result = await this.post<{ content: any }>('/e3n/generate', {
      prompt,
      type: options.type,
      context: options.context,
    });
    return result.content;
  }

  async suggest(options: SuggestOptions): Promise<Suggestion[]> {
    const result = await this.post<{ suggestions: Suggestion[] }>('/e3n/suggest', {
      type: options.type,
      data: options.data,
    });
    return result.suggestions;
  }
}
