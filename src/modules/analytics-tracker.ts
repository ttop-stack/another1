/**
 * Analytics Tracker Module
 * 
 * Black box that captures user interactions and system metrics.
 * Provides insights without exposing implementation details.
 * Can be replaced with different analytics providers without affecting other modules.
 */

import { AnalyticsTracker, AnalyticsEvent, UserInsights, SystemMetrics } from '../lib/interfaces';

export class FashionAnalyticsTracker implements AnalyticsTracker {
  private events: Map<string, AnalyticsEvent[]> = new Map();
  private systemStats: SystemStats = {
    startTime: Date.now(),
    totalEvents: 0,
    activeUsers: new Set(),
    productViews: new Map(),
    categoryViews: new Map()
  };

  async track(event: AnalyticsEvent): Promise<void> {
    // Store event by session
    const sessionEvents = this.events.get(event.sessionId) || [];
    sessionEvents.push(event);
    this.events.set(event.sessionId, sessionEvents);

    // Update system statistics
    this.updateSystemStats(event);

    // Log event (in real implementation, this would send to analytics service)
    console.log(`Analytics: ${event.type} - Session: ${event.sessionId}`);
  }

  async getInsights(sessionId: string): Promise<UserInsights> {
    const sessionEvents = this.events.get(sessionId) || [];
    
    return this.analyzeUserBehavior(sessionEvents);
  }

  async getMetrics(): Promise<SystemMetrics> {
    const now = Date.now();
    const uptimeHours = (now - this.systemStats.startTime) / (1000 * 60 * 60);

    // Get most popular products
    const popularProducts = Array.from(this.systemStats.productViews.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([productId]) => productId);

    // Calculate average session time
    const averageSessionTime = this.calculateAverageSessionTime();

    return {
      activeUsers: this.systemStats.activeUsers.size,
      popularProducts,
      averageSessionTime
    };
  }

  private updateSystemStats(event: AnalyticsEvent): void {
    this.systemStats.totalEvents++;
    this.systemStats.activeUsers.add(event.sessionId);

    // Track product views
    if (event.type === 'product_view' && event.data.productId) {
      const productId = event.data.productId as string;
      const currentViews = this.systemStats.productViews.get(productId) || 0;
      this.systemStats.productViews.set(productId, currentViews + 1);
    }

    // Track category views
    if (event.type === 'category_view' && event.data.category) {
      const category = event.data.category as string;
      const currentViews = this.systemStats.categoryViews.get(category) || 0;
      this.systemStats.categoryViews.set(category, currentViews + 1);
    }
  }

  private analyzeUserBehavior(events: AnalyticsEvent[]): UserInsights {
    if (events.length === 0) {
      return {
        viewTime: 0,
        interactionCount: 0,
        preferredCategories: [],
        conversionLikelihood: 0
      };
    }

    // Calculate total view time
    const viewTime = this.calculateViewTime(events);

    // Count interactions
    const interactionCount = events.filter(event => 
      ['click', 'scroll', 'zoom', 'like', 'add_to_cart'].includes(event.type)
    ).length;

    // Determine preferred categories
    const preferredCategories = this.getPreferredCategories(events);

    // Calculate conversion likelihood
    const conversionLikelihood = this.calculateConversionLikelihood(events);

    return {
      viewTime,
      interactionCount,
      preferredCategories,
      conversionLikelihood
    };
  }

  private calculateViewTime(events: AnalyticsEvent[]): number {
    if (events.length < 2) return 0;

    const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
    const firstEvent = sortedEvents[0];
    const lastEvent = sortedEvents[sortedEvents.length - 1];

    return lastEvent.timestamp - firstEvent.timestamp;
  }

  private getPreferredCategories(events: AnalyticsEvent[]): readonly string[] {
    const categoryCount = new Map<string, number>();

    events.forEach(event => {
      if (event.data.category) {
        const category = event.data.category as string;
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      }
    });

    return Array.from(categoryCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateConversionLikelihood(events: AnalyticsEvent[]): number {
    let score = 0;

    // Analyze behavior patterns
    const hasProductViews = events.some(e => e.type === 'product_view');
    const hasDetailViews = events.some(e => e.type === 'product_detail');
    const hasLikes = events.some(e => e.type === 'like');
    const hasCartAdds = events.some(e => e.type === 'add_to_cart');
    const hasVirtualTry = events.some(e => e.type === 'virtual_try');

    // Scoring algorithm
    if (hasProductViews) score += 0.1;
    if (hasDetailViews) score += 0.2;
    if (hasLikes) score += 0.3;
    if (hasVirtualTry) score += 0.25;
    if (hasCartAdds) score += 0.4;

    // Time spent factor
    const viewTime = this.calculateViewTime(events);
    const timeScore = Math.min(viewTime / (5 * 60 * 1000), 0.2); // Max 0.2 for 5+ minutes
    score += timeScore;

    // Interaction frequency factor
    const interactionRate = events.length / (viewTime / 60000); // interactions per minute
    const interactionScore = Math.min(interactionRate * 0.05, 0.15);
    score += interactionScore;

    return Math.min(score, 1.0); // Cap at 100%
  }

  private calculateAverageSessionTime(): number {
    if (this.events.size === 0) return 0;

    let totalTime = 0;
    let sessionsWithTime = 0;

    for (const [sessionId, events] of this.events.entries()) {
      const sessionTime = this.calculateViewTime(events);
      if (sessionTime > 0) {
        totalTime += sessionTime;
        sessionsWithTime++;
      }
    }

    return sessionsWithTime > 0 ? totalTime / sessionsWithTime : 0;
  }

  // Utility methods for analytics management
  clearSessionData(sessionId: string): void {
    this.events.delete(sessionId);
    this.systemStats.activeUsers.delete(sessionId);
  }

  getEventCount(sessionId?: string): number {
    if (sessionId) {
      return this.events.get(sessionId)?.length || 0;
    }
    return this.systemStats.totalEvents;
  }

  exportData(sessionId?: string): AnalyticsExport {
    if (sessionId) {
      return {
        sessionId,
        events: this.events.get(sessionId) || [],
        exportedAt: Date.now()
      };
    }

    return {
      allSessions: Object.fromEntries(this.events),
      systemStats: this.systemStats,
      exportedAt: Date.now()
    };
  }
}

interface SystemStats {
  startTime: number;
  totalEvents: number;
  activeUsers: Set<string>;
  productViews: Map<string, number>;
  categoryViews: Map<string, number>;
}

interface AnalyticsExport {
  sessionId?: string;
  events?: AnalyticsEvent[];
  allSessions?: Record<string, AnalyticsEvent[]>;
  systemStats?: SystemStats;
  exportedAt: number;
}
