/**
 * Core Primitives for Virtual Fashion Shopping Experience
 * 
 * These are the fundamental data types that flow through our system.
 * Designed for simplicity, consistency, and future extensibility.
 */

// Core product primitive - everything a fashion item needs
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly category: 'clothing' | 'accessories' | 'shoes' | 'bags';
  readonly price: number;
  readonly currency: string;
  readonly images: readonly string[];
  readonly description: string;
  readonly tags: readonly string[];
  readonly metadata: Record<string, unknown>;
}

// Shopping experience state - what the user is currently doing
export interface ExperienceState {
  readonly sessionId: string;
  readonly currentProduct?: Product;
  readonly viewedProducts: readonly string[];
  readonly favorites: readonly string[];
  readonly cartItems: readonly CartItem[];
  readonly experienceMode: 'browse' | 'detailed' | 'virtual-try' | 'checkout';
  readonly timestamp: number;
}

// Shopping cart item with quantity and customizations
export interface CartItem {
  readonly productId: string;
  readonly quantity: number;
  readonly selectedOptions: Record<string, string>;
  readonly addedAt: number;
}

// Interactive experience event - captures user actions
export interface ExperienceEvent {
  readonly type: 'view' | 'like' | 'add-to-cart' | 'try-virtual' | 'share';
  readonly productId?: string;
  readonly timestamp: number;
  readonly metadata: Record<string, unknown>;
}

// Visual content for immersive experience
export interface VisualContent {
  readonly id: string;
  readonly type: 'image' | 'video' | '3d-model' | 'ar-overlay';
  readonly url: string;
  readonly alt: string;
  readonly metadata: Record<string, unknown>;
}
