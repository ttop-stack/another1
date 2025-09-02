/**
 * Black Box Interfaces for Virtual Fashion Shopping
 * 
 * Each interface defines WHAT a module does, not HOW it does it.
 * Any module can be completely replaced as long as it implements these interfaces.
 */

import { Product, ExperienceState, ExperienceEvent, VisualContent, CartItem } from '../lib/primitives';

// Product Catalog Black Box - manages fashion inventory
export interface ProductCatalog {
  // Get products with optional filtering
  getProducts(filters?: ProductFilters): Promise<readonly Product[]>;
  
  // Get single product by ID
  getProduct(id: string): Promise<Product | null>;
  
  // Search products by query
  searchProducts(query: string): Promise<readonly Product[]>;
  
  // Get recommended products based on user behavior
  getRecommendations(userId: string, limit?: number): Promise<readonly Product[]>;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  priceRange?: { min: number; max: number };
  tags?: readonly string[];
}

// Experience Engine Black Box - handles interactive shopping
export interface ExperienceEngine {
  // Initialize new shopping session
  createSession(): Promise<string>;
  
  // Get current experience state
  getState(sessionId: string): Promise<ExperienceState | null>;
  
  // Update experience state
  updateState(sessionId: string, updates: Partial<ExperienceState>): Promise<void>;
  
  // Record user interaction
  recordEvent(sessionId: string, event: ExperienceEvent): Promise<void>;
  
  // Get personalized experience for user
  getPersonalizedExperience(sessionId: string): Promise<ExperiencePersonalization>;
}

export interface ExperiencePersonalization {
  recommendedProducts: readonly string[];
  preferredCategories: readonly string[];
  suggestedExperiences: readonly string[];
}

// Session Manager Black Box - tracks user state
export interface SessionManager {
  // Create new session
  create(): Promise<string>;
  
  // Get session data
  get(sessionId: string): Promise<SessionData | null>;
  
  // Update session data
  update(sessionId: string, data: Partial<SessionData>): Promise<void>;
  
  // Clean up expired sessions
  cleanup(): Promise<void>;
}

export interface SessionData {
  id: string;
  createdAt: number;
  lastActivity: number;
  userId?: string;
  preferences: Record<string, unknown>;
}

// Visual Renderer Black Box - displays content
export interface VisualRenderer {
  // Render product gallery
  renderProductGallery(products: readonly Product[]): Promise<void>;
  
  // Render detailed product view
  renderProductDetail(product: Product): Promise<void>;
  
  // Render virtual try-on experience
  renderVirtualTryOn(product: Product): Promise<void>;
  
  // Get visual content for product
  getVisualContent(productId: string): Promise<readonly VisualContent[]>;
}

// Analytics Tracker Black Box - captures insights
export interface AnalyticsTracker {
  // Track user event
  track(event: AnalyticsEvent): Promise<void>;
  
  // Get user behavior insights
  getInsights(sessionId: string): Promise<UserInsights>;
  
  // Get system performance metrics
  getMetrics(): Promise<SystemMetrics>;
}

export interface AnalyticsEvent {
  type: string;
  sessionId: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface UserInsights {
  viewTime: number;
  interactionCount: number;
  preferredCategories: readonly string[];
  conversionLikelihood: number;
}

export interface SystemMetrics {
  activeUsers: number;
  popularProducts: readonly string[];
  averageSessionTime: number;
}
