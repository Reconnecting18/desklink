import type { AIProvider, SummarizeOptions, GenerateOptions, SuggestOptions, Suggestion } from './ai.provider';

export class MockAdapter implements AIProvider {
  async summarize(content: string, options: SummarizeOptions): Promise<string> {
    const maxLen = options.maxLength ?? 200;
    const truncated = content.slice(0, maxLen);
    return `[Mock Summary] ${truncated}${content.length > maxLen ? '...' : ''}`;
  }

  async generate(_prompt: string, options: GenerateOptions): Promise<any> {
    switch (options.type) {
      case 'document':
        return { blocks: [{ type: 'paragraph', content: '[Mock] Generated document content based on your prompt.' }] };
      case 'spreadsheet':
        return { sheets: [{ name: 'Sheet 1', rows: { '1': { A: { value: 'Mock Data' }, B: { value: '100' } } } }] };
      case 'presentation':
        return { slides: [{ elements: [{ type: 'title', content: '[Mock] Generated Presentation' }] }] };
      case 'task':
        return { title: '[Mock] Generated Task', description: 'This is a mock-generated task.', priority: 'MEDIUM' };
      case 'email':
        return { subject: '[Mock] Generated Email', body: 'This is a mock-generated email body.' };
      default:
        return { content: '[Mock] Generated content' };
    }
  }

  async suggest(options: SuggestOptions): Promise<Suggestion[]> {
    const suggestions: Record<string, Suggestion[]> = {
      task_priority: [
        { text: 'Consider raising priority to HIGH based on deadline proximity', confidence: 0.85 },
        { text: 'This task has dependencies that should be completed first', confidence: 0.7 },
      ],
      next_steps: [
        { text: 'Review the current implementation and identify gaps', confidence: 0.9 },
        { text: 'Schedule a sync meeting with stakeholders', confidence: 0.75 },
      ],
      related_items: [
        { text: 'Similar task found in project backlog', confidence: 0.8 },
      ],
      improvements: [
        { text: 'Consider breaking this into smaller subtasks', confidence: 0.85 },
        { text: 'Add acceptance criteria for better clarity', confidence: 0.7 },
      ],
    };

    return suggestions[options.type] || [{ text: 'No suggestions available', confidence: 0.5 }];
  }
}
