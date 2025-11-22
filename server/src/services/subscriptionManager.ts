import { SubscriptionMessage } from '../types/index';

export type SubscriptionCallback = (
  message: SubscriptionMessage
) => void;

interface Subscriber {
  id: string;
  callback: SubscriptionCallback;
}

export class SubscriptionManager {
  private subscriptions: Map<string, Subscriber[]> = new Map();

  subscribe(
    contextId: string,
    callback: SubscriptionCallback
  ): string {
    const subscriberId = this.generateId();

    if (!this.subscriptions.has(contextId)) {
      this.subscriptions.set(contextId, []);
    }

    const subscribers = this.subscriptions.get(contextId);
    if (subscribers) {
      subscribers.push({
        id: subscriberId,
        callback,
      });
    }

    return subscriberId;
  }

  unsubscribe(contextId: string, subscriberId: string): boolean {
    const subscribers = this.subscriptions.get(contextId);
    if (!subscribers) {
      return false;
    }

    const initialLength = subscribers.length;
    const filtered = subscribers.filter(
      (sub) => sub.id !== subscriberId
    );

    if (filtered.length === initialLength) {
      return false;
    }

    if (filtered.length === 0) {
      this.subscriptions.delete(contextId);
    } else {
      this.subscriptions.set(contextId, filtered);
    }

    return true;
  }

  broadcast(
    contextId: string,
    message: SubscriptionMessage
  ): number {
    const subscribers = this.subscriptions.get(contextId);
    if (!subscribers) {
      return 0;
    }

    let count = 0;
    for (const subscriber of subscribers) {
      try {
        subscriber.callback(message);
        count++;
      } catch {
        // Silently fail for individual subscribers
      }
    }

    return count;
  }

  getSubscriberCount(contextId: string): number {
    const subscribers = this.subscriptions.get(contextId);
    return subscribers ? subscribers.length : 0;
  }

  getAllSubscriptions(): Map<string, Subscriber[]> {
    return new Map(this.subscriptions);
  }

  clearAll(): void {
    this.subscriptions.clear();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
}

export const subscriptionManager = new SubscriptionManager();
