import { SubscriptionManager } from '../../src/services/subscriptionManager';
import { SubscriptionMessage } from '../../src/types/index';

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager;

  beforeEach(() => {
    manager = new SubscriptionManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  describe('subscribe', () => {
    it('should register a subscriber for a context', () => {
      const callback = jest.fn();

      const subId = manager.subscribe('context-1', callback);

      expect(subId).toBeDefined();
      expect(typeof subId).toBe('string');
      expect(manager.getSubscriberCount('context-1'))
        .toBe(1);
    });

    it('should support multiple subscribers per context', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      manager.subscribe('context-1', callback1);
      manager.subscribe('context-1', callback2);
      manager.subscribe('context-1', callback3);

      expect(manager.getSubscriberCount('context-1'))
        .toBe(3);
    });

    it('should return a subscription ID', () => {
      const callback = jest.fn();

      const subId1 = manager.subscribe('context-1', callback);
      const subId2 = manager.subscribe(
        'context-1',
        callback
      );

      expect(subId1).not.toBe(subId2);
      expect(subId1).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('unsubscribe', () => {
    it('should remove a subscriber from a context', () => {
      const callback = jest.fn();

      const subId = manager.subscribe('context-1', callback);
      expect(manager.getSubscriberCount('context-1'))
        .toBe(1);

      const result = manager.unsubscribe('context-1', subId);

      expect(result).toBe(true);
      expect(manager.getSubscriberCount('context-1'))
        .toBe(0);
    });

    it('should handle unsubscribing non-existent subscriber',
      () => {
        const callback = jest.fn();
        manager.subscribe('context-1', callback);

        const result = manager.unsubscribe(
          'context-1',
          'nonexistent-id'
        );

        expect(result).toBe(false);
        expect(manager.getSubscriberCount('context-1'))
          .toBe(1);
      }
    );
  });

  describe('broadcast', () => {
    it('should send message to all subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      manager.subscribe('context-1', callback1);
      manager.subscribe('context-1', callback2);
      manager.subscribe('context-2', callback3);

      const message: SubscriptionMessage = {
        type: 'update',
        id: 'entry-1',
        content: 'Test',
        timestamp: Date.now(),
      };

      const count = manager.broadcast('context-1', message);

      expect(count).toBe(2);
      expect(callback1).toHaveBeenCalledWith(message);
      expect(callback2).toHaveBeenCalledWith(message);
      expect(callback3).not.toHaveBeenCalled();
    });

    it('should include message type and content', () => {
      const callback = jest.fn();
      manager.subscribe('context-1', callback);

      const testTime = Date.now();
      const message: SubscriptionMessage = {
        type: 'update',
        id: 'entry-1',
        content: 'Test content',
        timestamp: testTime,
      };

      manager.broadcast('context-1', message);

      expect(callback).toHaveBeenCalledWith({
        type: 'update',
        id: 'entry-1',
        content: 'Test content',
        timestamp: testTime,
      });
    });

    it('should not send to unsubscribed contexts', () => {
      const callback = jest.fn();
      manager.subscribe('context-1', callback);

      const message: SubscriptionMessage = {
        type: 'update',
        id: 'entry-1',
        content: 'Test',
        timestamp: Date.now(),
      };

      const count = manager.broadcast('context-2', message);

      expect(count).toBe(0);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getSubscriberCount', () => {
    it('should return count of subscribers for context', () => {
      const callback = jest.fn();

      manager.subscribe('context-1', callback);
      manager.subscribe('context-1', callback);
      manager.subscribe('context-2', callback);

      expect(manager.getSubscriberCount('context-1'))
        .toBe(2);
      expect(manager.getSubscriberCount('context-2'))
        .toBe(1);
    });

    it('should return 0 for context with no subscribers', () => {
      expect(manager.getSubscriberCount('context-1'))
        .toBe(0);
    });
  });
});
