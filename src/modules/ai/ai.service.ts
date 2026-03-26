import { config } from '../../config';
import { prisma } from '../../config/database';
import type { AIProvider } from './ai.provider';
import { ClaudeAdapter } from './claude.adapter';
import { MockAdapter } from './mock.adapter';
import type { SummarizeInput, GenerateInput, SuggestInput } from './ai.schema';

let provider: AIProvider | null = null;

function getProvider(): AIProvider {
  if (!provider) {
    if (config.AI_PROVIDER === 'claude' && config.ANTHROPIC_API_KEY) {
      provider = new ClaudeAdapter(config.ANTHROPIC_API_KEY);
    } else {
      provider = new MockAdapter();
    }
  }
  return provider;
}

export async function summarize(userId: string, input: SummarizeInput) {
  const startTime = Date.now();
  const aiProvider = getProvider();

  const request = await prisma.aiRequest.create({
    data: {
      type: 'summarize',
      input: input as any,
      status: 'pending',
      userId,
      workspaceId: input.workspaceId,
    },
  });

  try {
    const summary = await aiProvider.summarize(input.content, {
      contentType: input.contentType,
      maxLength: input.maxLength,
    });

    const durationMs = Date.now() - startTime;
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { output: { summary } as any, status: 'completed', durationMs },
    });

    return { summary, requestId: request.id };
  } catch (err) {
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { status: 'failed', durationMs: Date.now() - startTime },
    });
    throw err;
  }
}

export async function generate(userId: string, input: GenerateInput) {
  const startTime = Date.now();
  const aiProvider = getProvider();

  const request = await prisma.aiRequest.create({
    data: {
      type: 'generate',
      input: input as any,
      status: 'pending',
      userId,
      workspaceId: input.workspaceId,
    },
  });

  try {
    const content = await aiProvider.generate(input.prompt, {
      type: input.type,
      context: input.context,
    });

    const durationMs = Date.now() - startTime;
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { output: { content } as any, status: 'completed', durationMs },
    });

    return { content, requestId: request.id };
  } catch (err) {
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { status: 'failed', durationMs: Date.now() - startTime },
    });
    throw err;
  }
}

export async function suggest(userId: string, input: SuggestInput) {
  const startTime = Date.now();
  const aiProvider = getProvider();

  const request = await prisma.aiRequest.create({
    data: {
      type: 'suggest',
      input: input as any,
      status: 'pending',
      userId,
      workspaceId: input.workspaceId,
    },
  });

  try {
    const suggestions = await aiProvider.suggest({
      type: input.context.type,
      data: input.context.data,
    });

    const durationMs = Date.now() - startTime;
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { output: { suggestions } as any, status: 'completed', durationMs },
    });

    return { suggestions, requestId: request.id };
  } catch (err) {
    await prisma.aiRequest.update({
      where: { id: request.id },
      data: { status: 'failed', durationMs: Date.now() - startTime },
    });
    throw err;
  }
}

export async function getHistory(userId: string) {
  return prisma.aiRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
