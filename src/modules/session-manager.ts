/**
 * Session Manager Module
 * 
 * Black box that handles user session lifecycle.
 * Manages session creation, persistence, and cleanup.
 * Can be replaced with Redis, database, or other storage without affecting other modules.
 */

import { SessionManager, SessionData } from '../lib/interfaces';

export class InMemorySessionManager implements SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(autoCleanupInterval?: number) {
    if (autoCleanupInterval) {
      this.startAutoCleanup(autoCleanupInterval);
    }
  }

  async create(): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionData: SessionData = {
      id: sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      preferences: {}
    };

    this.sessions.set(sessionId, sessionData);
    return sessionId;
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Update last activity
      const updatedSession: SessionData = {
        ...session,
        lastActivity: Date.now()
      };
      this.sessions.set(sessionId, updatedSession);
      return updatedSession;
    }
    
    return null;
  }

  async update(sessionId: string, data: Partial<SessionData>): Promise<void> {
    const existingSession = this.sessions.get(sessionId);
    
    if (!existingSession) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedSession: SessionData = {
      ...existingSession,
      ...data,
      id: sessionId, // Ensure ID doesn't change
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, updatedSession);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${randomPart}`;
  }

  private startAutoCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch(error => {
        console.error('Auto cleanup failed:', error);
      });
    }, intervalMs);
  }

  // Method to stop auto cleanup
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get session statistics (not in interface - internal utility)
  getStats(): { totalSessions: number; activeSessions: number } {
    const now = Date.now();
    const activeThreshold = 30 * 60 * 1000; // 30 minutes
    
    let activeSessions = 0;
    
    for (const session of this.sessions.values()) {
      if (now - session.lastActivity <= activeThreshold) {
        activeSessions++;
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions
    };
  }
}
