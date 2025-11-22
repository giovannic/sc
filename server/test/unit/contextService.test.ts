import { ContextService } from '../../src/services/contextService';
import * as queries from '../../src/db/queries';

jest.mock('../../src/db/queries');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('ContextService', () => {
  let contextService: ContextService;

  beforeEach(() => {
    contextService = new ContextService();
    jest.clearAllMocks();
  });

  describe('createContext', () => {
    it('should create a new context with generated URI',
      async () => {
        const mockContext = {
          id: 'context-1',
          uri: 'test-uuid-1234',
          readme: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (queries.createContext as jest.Mock)
          .mockResolvedValue(mockContext);

        const result = await contextService.createContext();

        expect(queries.createContext)
          .toHaveBeenCalledWith('test-uuid-1234', undefined);
        expect(result).toEqual({
          uri: 'test-uuid-1234',
          contextId: 'context-1',
        });
      }
    );

    it('should create a context with initial entries',
      async () => {
        const mockContext = {
          id: 'context-1',
          uri: 'test-uuid-1234',
          readme: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (queries.createContext as jest.Mock)
          .mockResolvedValue(mockContext);
        (queries.addContextEntry as jest.Mock)
          .mockResolvedValue({
            id: 'entry-1',
            contextId: 'context-1',
            content: 'Entry 1',
            createdAt: new Date(),
          });

        const entries = [
          { content: 'Entry 1' },
          { content: 'Entry 2' },
        ];
        const result = await contextService.createContext(
          entries
        );

        expect(queries.addContextEntry)
          .toHaveBeenCalledTimes(2);
        expect(result.contextId).toBe('context-1');
      }
    );

    it('should create a context with README text', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uuid-1234',
        readme: 'Test readme',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (queries.createContext as jest.Mock)
        .mockResolvedValue(mockContext);

      const result = await contextService.createContext(
        undefined,
        'Test readme'
      );

      expect(queries.createContext)
        .toHaveBeenCalledWith('test-uuid-1234', 'Test readme');
      expect(result.uri).toBe('test-uuid-1234');
    });

    it('should return context URI and ID', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uuid-1234',
        readme: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (queries.createContext as jest.Mock)
        .mockResolvedValue(mockContext);

      const result = await contextService.createContext();

      expect(result.uri).toBe('test-uuid-1234');
      expect(result.contextId).toBe('context-1');
    });
  });

  describe('getContext', () => {
    it('should retrieve entries in ascending order',
      async () => {
        const mockEntries = [
          {
            id: 'entry-1',
            contextId: 'context-1',
            content: 'Entry 1',
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'entry-2',
            contextId: 'context-1',
            content: 'Entry 2',
            createdAt: new Date('2024-01-02'),
          },
        ];

        (queries.getContextEntries as jest.Mock)
          .mockResolvedValue({
            entries: mockEntries,
            total: 2,
          });

        const result = await contextService.getContext(
          'context-1',
          'asc',
          20,
          0
        );

        expect(queries.getContextEntries)
          .toHaveBeenCalledWith(
            'context-1',
            'asc',
            20,
            0
          );
        expect(result.entries[0].id).toBe('entry-1');
      }
    );

    it('should retrieve entries in descending order',
      async () => {
        const mockEntries = [
          {
            id: 'entry-2',
            contextId: 'context-1',
            content: 'Entry 2',
            createdAt: new Date('2024-01-02'),
          },
        ];

        (queries.getContextEntries as jest.Mock)
          .mockResolvedValue({
            entries: mockEntries,
            total: 1,
          });

        const result = await contextService.getContext(
          'context-1',
          'desc',
          20,
          0
        );

        expect(result.entries[0].content).toBe('Entry 2');
      }
    );

    it('should support pagination with limit and offset',
      async () => {
        (queries.getContextEntries as jest.Mock)
          .mockResolvedValue({
            entries: [],
            total: 100,
          });

        await contextService.getContext(
          'context-1',
          'asc',
          10,
          50
        );

        expect(queries.getContextEntries)
          .toHaveBeenCalledWith(
            'context-1',
            'asc',
            10,
            50
          );
      }
    );

    it('should return total count of entries', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          contextId: 'context-1',
          content: 'Entry 1',
          createdAt: new Date(),
        },
      ];

      (queries.getContextEntries as jest.Mock)
        .mockResolvedValue({
          entries: mockEntries,
          total: 100,
        });

      const result = await contextService.getContext(
        'context-1',
        'asc',
        20,
        0
      );

      expect(result.total).toBe(100);
    });
  });

  describe('getReadme', () => {
    it('should retrieve README for a context', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uri',
        readme: 'Test readme',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (queries.getContext as jest.Mock)
        .mockResolvedValue(mockContext);

      const result = await contextService.getReadme(
        'context-1'
      );

      expect(queries.getContext)
        .toHaveBeenCalledWith('context-1');
      expect(result).toBe('Test readme');
    });

    it('should return empty string if README not set',
      async () => {
        const mockContext = {
          id: 'context-1',
          uri: 'test-uri',
          readme: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (queries.getContext as jest.Mock)
          .mockResolvedValue(mockContext);

        const result = await contextService.getReadme(
          'context-1'
        );

        expect(result).toBeNull();
      }
    );
  });

  describe('updateReadme', () => {
    it('should update README for a context', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uri',
        readme: 'Old readme',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (queries.getContext as jest.Mock)
        .mockResolvedValue(mockContext);
      (queries.updateContextReadme as jest.Mock)
        .mockResolvedValue(true);

      const result = await contextService.updateReadme(
        'context-1',
        'New readme'
      );

      expect(queries.updateContextReadme)
        .toHaveBeenCalledWith('context-1', 'New readme');
      expect(result).toBe(true);
    });

    it('should set README to empty string', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uri',
        readme: 'Old readme',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (queries.getContext as jest.Mock)
        .mockResolvedValue(mockContext);
      (queries.updateContextReadme as jest.Mock)
        .mockResolvedValue(true);

      const result = await contextService.updateReadme(
        'context-1',
        ''
      );

      expect(queries.updateContextReadme)
        .toHaveBeenCalledWith('context-1', '');
      expect(result).toBe(true);
    });
  });

  describe('addEntry', () => {
    it('should add a new entry to a context', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uri',
        readme: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEntry = {
        id: 'entry-1',
        contextId: 'context-1',
        content: 'Test content',
        createdAt: new Date(),
      };

      (queries.getContext as jest.Mock)
        .mockResolvedValue(mockContext);
      (queries.addContextEntry as jest.Mock)
        .mockResolvedValue(mockEntry);

      const result = await contextService.addEntry(
        'context-1',
        'Test content'
      );

      expect(queries.addContextEntry)
        .toHaveBeenCalledWith('context-1', 'Test content');
      expect(result.id).toBe('entry-1');
    });

    it('should return entry ID and timestamp', async () => {
      const testDate = new Date('2024-01-01T12:00:00Z');
      const mockContext = {
        id: 'context-1',
        uri: 'test-uri',
        readme: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEntry = {
        id: 'entry-1',
        contextId: 'context-1',
        content: 'Test content',
        createdAt: testDate,
      };

      (queries.getContext as jest.Mock)
        .mockResolvedValue(mockContext);
      (queries.addContextEntry as jest.Mock)
        .mockResolvedValue(mockEntry);

      const result = await contextService.addEntry(
        'context-1',
        'Test content'
      );

      expect(result.id).toBe('entry-1');
      expect(result.timestamp).toBe(testDate.getTime());
    });

    it('should maintain chronological order', async () => {
      const mockContext = {
        id: 'context-1',
        uri: 'test-uri',
        readme: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entry1Date = new Date('2024-01-01T10:00:00Z');
      const entry2Date = new Date('2024-01-01T11:00:00Z');

      const mockEntry1 = {
        id: 'entry-1',
        contextId: 'context-1',
        content: 'Entry 1',
        createdAt: entry1Date,
      };

      const mockEntry2 = {
        id: 'entry-2',
        contextId: 'context-1',
        content: 'Entry 2',
        createdAt: entry2Date,
      };

      (queries.getContext as jest.Mock)
        .mockResolvedValue(mockContext);
      (queries.addContextEntry as jest.Mock)
        .mockResolvedValueOnce(mockEntry1)
        .mockResolvedValueOnce(mockEntry2);

      const result1 = await contextService.addEntry(
        'context-1',
        'Entry 1'
      );
      const result2 = await contextService.addEntry(
        'context-1',
        'Entry 2'
      );

      expect(result1.timestamp).toBeLessThan(result2.timestamp);
    });
  });
});
