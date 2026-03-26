export interface SummarizeOptions {
  contentType: string;
  maxLength?: number;
}

export interface GenerateOptions {
  type: string;
  context?: Record<string, any>;
}

export interface SuggestOptions {
  type: string;
  data: Record<string, any>;
}

export interface Suggestion {
  text: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface AIProvider {
  summarize(content: string, options: SummarizeOptions): Promise<string>;
  generate(prompt: string, options: GenerateOptions): Promise<any>;
  suggest(options: SuggestOptions): Promise<Suggestion[]>;
}
