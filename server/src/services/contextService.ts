import { v4 as uuidv4 } from 'uuid';
import {
  createContext as dbCreateContext,
  getContext as dbGetContext,
  updateContextReadme as dbUpdateContextReadme,
  addContextEntry as dbAddContextEntry,
  getContextEntries,
} from '../db/queries';
import {
  Context,
  ContextEntry,
  ContextEntryResponse,
} from '../types/index';

export class ContextService {
  async createContext(
    entries?: Array<{ content: string }>,
    readme?: string
  ): Promise<{ uri: string; contextId: string }> {
    const contextUri = uuidv4();
    const context = await dbCreateContext(
      contextUri,
      readme
    );

    if (entries && entries.length > 0) {
      for (const entry of entries) {
        await dbAddContextEntry(context.id, entry.content);
      }
    }

    return {
      uri: context.uri,
      contextId: context.id,
    };
  }

  async getContext(
    contextId: string,
    order: 'asc' | 'desc',
    limit: number,
    offset: number
  ): Promise<{
    entries: ContextEntryResponse[];
    total: number;
  }> {
    const result = await getContextEntries(
      contextId,
      order,
      limit,
      offset
    );

    const entries = result.entries.map((entry: ContextEntry) =>
      this.formatEntry(entry)
    );

    return {
      entries,
      total: result.total,
    };
  }

  async getReadme(contextId: string): Promise<string | null> {
    const context = await dbGetContext(contextId);
    if (!context) {
      throw new Error('Context not found');
    }
    return context.readme;
  }

  async updateReadme(
    contextId: string,
    readme: string
  ): Promise<boolean> {
    const context = await dbGetContext(contextId);
    if (!context) {
      throw new Error('Context not found');
    }
    return dbUpdateContextReadme(contextId, readme);
  }

  async addEntry(
    contextId: string,
    content: string
  ): Promise<{
    id: string;
    timestamp: number;
  }> {
    const context = await dbGetContext(contextId);
    if (!context) {
      throw new Error('Context not found');
    }

    const entry = await dbAddContextEntry(
      contextId,
      content
    );
    return {
      id: entry.id,
      timestamp: new Date(entry.createdAt).getTime(),
    };
  }

  private formatEntry(
    entry: ContextEntry
  ): ContextEntryResponse {
    return {
      id: entry.id,
      content: entry.content,
      timestamp: new Date(entry.createdAt).getTime(),
    };
  }
}

export const contextService = new ContextService();
