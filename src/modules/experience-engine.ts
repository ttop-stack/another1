/**
 * Virtual Shopping Experience Engine
 * 
 * Black box that manages immersive shopping experiences.
 * Handles user sessions, interactions, and personalization.
 * Can be completely replaced without affecting other modules.
 */

import { ExperienceState, ExperienceEvent, CartItem, Product } from '../lib/primitives';
import { ExperienceEngine, ExperiencePersonalization } from '../lib/interfaces';

interface StoredExperienceState {
  sessionId: string;
  currentProduct?: Product;
  viewedProducts: string[];
  favorites: string[];
  cartItems: CartItem[];
  experienceMode: 'browse' | 'detailed' | 'virtual-try' | 'checkout';
  timestamp: number;
  events: ExperienceEvent[];
}

export class VirtualExperienceEngine implements ExperienceEngine {
  private sessions: Map<string, StoredExperienceState> = new Map();
  private eventHandlers: Map<string, (event: ExperienceEvent) => void> = new Map();

  constructor() {
    this.setupEventHandlers();
  }

  async createSession(): Promise<string> {
    const sessionId = this.generateSessionId();
    
    const initialState: StoredExperienceState = {
      sessionId,
      viewedProducts: [],
      favorites: [],
      cartItems: [],
      experienceMode: 'browse',
      timestamp: Date.now(),
      events: []
    };
    
    this.sessions.set(sessionId, initialState);
    return sessionId;
  }

  async getState(sessionId: string): Promise<ExperienceState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Return clean state without internal events array
    const { events, ...cleanState } = session;
    return cleanState;
  }

  async updateState(sessionId: string, updates: Partial<ExperienceState>): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Create new session object with updates
    const updatedSession: StoredExperienceState = {
      ...session,
      ...updates,
      viewedProducts: updates.viewedProducts ? [...updates.viewedProducts] : session.viewedProducts,
      favorites: updates.favorites ? [...updates.favorites] : session.favorites,
      cartItems: updates.cartItems ? [...updates.cartItems] : session.cartItems,
      timestamp: Date.now(),
      events: session.events
    };

    this.sessions.set(sessionId, updatedSession);
  }

  async recordEvent(sessionId: string, event: ExperienceEvent): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add event to session history
    const updatedSession = { ...session };
    updatedSession.events.push(event);
    updatedSession.timestamp = Date.now();
    this.sessions.set(sessionId, updatedSession);
    
    // Handle the event
    await this.handleEvent(sessionId, event);
  }

  async getPersonalizedExperience(sessionId: string): Promise<ExperiencePersonalization> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return this.generatePersonalization(session);
  }

  private setupEventHandlers(): void {
    this.eventHandlers.set('view', this.handleViewEvent.bind(this));
    this.eventHandlers.set('like', this.handleLikeEvent.bind(this));
    this.eventHandlers.set('add-to-cart', this.handleAddToCartEvent.bind(this));
    this.eventHandlers.set('try-virtual', this.handleVirtualTryEvent.bind(this));
  }

  private async handleEvent(sessionId: string, event: ExperienceEvent): Promise<void> {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      handler(event);
    }

    // Update relevant state based on event
    await this.updateStateFromEvent(sessionId, event);
  }

  private async updateStateFromEvent(sessionId: string, event: ExperienceEvent): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !event.productId) return;

    let updatedSession = { ...session };

    switch (event.type) {
      case 'view':
        if (!updatedSession.viewedProducts.includes(event.productId)) {
          updatedSession.viewedProducts = [...updatedSession.viewedProducts, event.productId];
        }
        break;
        
      case 'like':
        if (!updatedSession.favorites.includes(event.productId)) {
          updatedSession.favorites = [...updatedSession.favorites, event.productId];
        }
        break;
        
      case 'add-to-cart':
        const existingItem = updatedSession.cartItems.find(item => item.productId === event.productId);
        if (existingItem) {
          // Increase quantity
          updatedSession.cartItems = updatedSession.cartItems.map(item =>
            item.productId === event.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item
          const newItem: CartItem = {
            productId: event.productId,
            quantity: 1,
            selectedOptions: {},
            addedAt: Date.now()
          };
          updatedSession.cartItems = [...updatedSession.cartItems, newItem];
        }
        break;
        
      case 'try-virtual':
        updatedSession.experienceMode = 'virtual-try';
        updatedSession.currentProduct = undefined; // Will be set by external call
        break;
    }

    updatedSession.timestamp = Date.now();
    this.sessions.set(sessionId, updatedSession);
  }

  private handleViewEvent(event: ExperienceEvent): void {
    // Analytics tracking could happen here
    console.log(`Product viewed: ${event.productId}`);
  }

  private handleLikeEvent(event: ExperienceEvent): void {
    console.log(`Product liked: ${event.productId}`);
  }

  private handleAddToCartEvent(event: ExperienceEvent): void {
    console.log(`Product added to cart: ${event.productId}`);
  }

  private handleVirtualTryEvent(event: ExperienceEvent): void {
    console.log(`Virtual try initiated: ${event.productId}`);
  }

  private generatePersonalization(session: StoredExperienceState): ExperiencePersonalization {
    // Analyze user behavior to create personalization
    const viewedCategories = new Map<string, number>();
    const likedProducts = session.favorites;
    
    // Count category preferences from events
    session.events.forEach(event => {
      if (event.type === 'view' && event.metadata?.category) {
        const category = event.metadata.category as string;
        viewedCategories.set(category, (viewedCategories.get(category) || 0) + 1);
      }
    });

    // Get preferred categories
    const preferredCategories = Array.from(viewedCategories.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      recommendedProducts: this.getRecommendedProductIds(session),
      preferredCategories,
      suggestedExperiences: this.getSuggestedExperiences(session)
    };
  }

  private getRecommendedProductIds(session: StoredExperienceState): readonly string[] {
    // Simple recommendation based on viewed and liked products
    // In real implementation, this would use sophisticated algorithms
    return session.favorites.slice(0, 4);
  }

  private getSuggestedExperiences(session: StoredExperienceState): readonly string[] {
    const suggestions: string[] = [];
    
    if (session.favorites.length > 0) {
      suggestions.push('virtual-styling');
    }
    
    if (session.cartItems.length > 0) {
      suggestions.push('complete-the-look');
    }
    
    if (session.viewedProducts.length > 5) {
      suggestions.push('personalized-collection');
    }
    
    return suggestions;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method for session management
  cleanExpiredSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.timestamp > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
