/**
 * Fashion Shopping System Orchestrator
 * 
 * Central coordinator that manages all black box modules.
 * Provides a single entry point for the application while maintaining
 * clean separation between modules.
 */

import { Product, ExperienceState, ExperienceEvent } from '../lib/primitives';
import { 
  ProductCatalog, 
  ExperienceEngine, 
  SessionManager, 
  VisualRenderer, 
  AnalyticsTracker,
  ProductFilters,
  ExperiencePersonalization,
  UserInsights,
  SystemMetrics
} from '../lib/interfaces';

export class FashionShoppingSystem {
  constructor(
    private productCatalog: ProductCatalog,
    private experienceEngine: ExperienceEngine,
    private sessionManager: SessionManager,
    private visualRenderer: VisualRenderer,
    private analyticsTracker: AnalyticsTracker
  ) {}

  // Session Management
  async createShoppingSession(): Promise<string> {
    const sessionId = await this.experienceEngine.createSession();
    
    // Track session creation
    await this.analyticsTracker.track({
      type: 'session_start',
      sessionId,
      timestamp: Date.now(),
      data: {}
    });

    return sessionId;
  }

  async getSessionState(sessionId: string): Promise<ExperienceState | null> {
    return this.experienceEngine.getState(sessionId);
  }

  // Product Discovery
  async browseProducts(sessionId: string, filters?: ProductFilters): Promise<readonly Product[]> {
    const products = await this.productCatalog.getProducts(filters);
    
    // Track browsing activity
    await this.analyticsTracker.track({
      type: 'browse_products',
      sessionId,
      timestamp: Date.now(),
      data: { 
        filterCount: filters ? Object.keys(filters).length : 0,
        resultCount: products.length
      }
    });

    // Render product gallery
    await this.visualRenderer.renderProductGallery(products);

    return products;
  }

  async searchProducts(sessionId: string, query: string): Promise<readonly Product[]> {
    const products = await this.productCatalog.searchProducts(query);
    
    // Track search activity
    await this.analyticsTracker.track({
      type: 'search_products',
      sessionId,
      timestamp: Date.now(),
      data: { 
        query,
        resultCount: products.length
      }
    });

    return products;
  }

  async getRecommendations(sessionId: string): Promise<readonly Product[]> {
    const products = await this.productCatalog.getRecommendations(sessionId);
    
    await this.analyticsTracker.track({
      type: 'view_recommendations',
      sessionId,
      timestamp: Date.now(),
      data: { count: products.length }
    });

    return products;
  }

  // Product Interaction
  async viewProduct(sessionId: string, productId: string): Promise<Product | null> {
    const product = await this.productCatalog.getProduct(productId);
    
    if (product) {
      // Record experience event
      await this.experienceEngine.recordEvent(sessionId, {
        type: 'view',
        productId,
        timestamp: Date.now(),
        metadata: { category: product.category }
      });

      // Track analytics
      await this.analyticsTracker.track({
        type: 'product_view',
        sessionId,
        timestamp: Date.now(),
        data: { 
          productId,
          productName: product.name,
          category: product.category,
          brand: product.brand
        }
      });

      // Render product detail
      await this.visualRenderer.renderProductDetail(product);
    }

    return product;
  }

  async likeProduct(sessionId: string, productId: string): Promise<void> {
    // Record experience event
    await this.experienceEngine.recordEvent(sessionId, {
      type: 'like',
      productId,
      timestamp: Date.now(),
      metadata: {}
    });

    // Track analytics
    await this.analyticsTracker.track({
      type: 'like_product',
      sessionId,
      timestamp: Date.now(),
      data: { productId }
    });
  }

  async addToCart(sessionId: string, productId: string): Promise<void> {
    // Record experience event
    await this.experienceEngine.recordEvent(sessionId, {
      type: 'add-to-cart',
      productId,
      timestamp: Date.now(),
      metadata: {}
    });

    // Track analytics
    await this.analyticsTracker.track({
      type: 'add_to_cart',
      sessionId,
      timestamp: Date.now(),
      data: { productId }
    });
  }

  // Virtual Try-On Experience
  async startVirtualTryOn(sessionId: string, productId: string): Promise<boolean> {
    const product = await this.productCatalog.getProduct(productId);
    
    if (!product) {
      return false;
    }

    // Record experience event
    await this.experienceEngine.recordEvent(sessionId, {
      type: 'try-virtual',
      productId,
      timestamp: Date.now(),
      metadata: {}
    });

    // Update experience state
    await this.experienceEngine.updateState(sessionId, {
      experienceMode: 'virtual-try',
      currentProduct: product
    });

    // Render virtual try-on
    await this.visualRenderer.renderVirtualTryOn(product);

    // Track analytics
    await this.analyticsTracker.track({
      type: 'virtual_try_start',
      sessionId,
      timestamp: Date.now(),
      data: { productId }
    });

    return true;
  }

  // Personalization
  async getPersonalization(sessionId: string): Promise<ExperiencePersonalization> {
    return this.experienceEngine.getPersonalizedExperience(sessionId);
  }

  // Analytics & Insights
  async getUserInsights(sessionId: string): Promise<UserInsights> {
    return this.analyticsTracker.getInsights(sessionId);
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.analyticsTracker.getMetrics();
  }

  // System Health
  async performHealthCheck(): Promise<SystemHealth> {
    const health: SystemHealth = {
      timestamp: Date.now(),
      modules: {
        productCatalog: await this.checkModuleHealth('productCatalog'),
        experienceEngine: await this.checkModuleHealth('experienceEngine'),
        sessionManager: await this.checkModuleHealth('sessionManager'),
        visualRenderer: await this.checkModuleHealth('visualRenderer'),
        analyticsTracker: await this.checkModuleHealth('analyticsTracker')
      },
      overall: 'healthy'
    };

    // Determine overall health
    const moduleStates = Object.values(health.modules);
    if (moduleStates.some(state => state === 'unhealthy')) {
      health.overall = 'unhealthy';
    } else if (moduleStates.some(state => state === 'degraded')) {
      health.overall = 'degraded';
    }

    return health;
  }

  private async checkModuleHealth(moduleName: string): Promise<ModuleHealth> {
    try {
      // Simple health checks for each module
      switch (moduleName) {
        case 'productCatalog':
          await this.productCatalog.getProducts();
          return 'healthy';
        case 'experienceEngine':
          const testSession = await this.experienceEngine.createSession();
          await this.experienceEngine.getState(testSession);
          return 'healthy';
        case 'sessionManager':
          const testSessionId = await this.sessionManager.create();
          await this.sessionManager.get(testSessionId);
          return 'healthy';
        default:
          return 'healthy';
      }
    } catch (error) {
      console.error(`Health check failed for ${moduleName}:`, error);
      return 'unhealthy';
    }
  }
}

export interface SystemHealth {
  timestamp: number;
  modules: {
    productCatalog: ModuleHealth;
    experienceEngine: ModuleHealth;
    sessionManager: ModuleHealth;
    visualRenderer: ModuleHealth;
    analyticsTracker: ModuleHealth;
  };
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

type ModuleHealth = 'healthy' | 'degraded' | 'unhealthy';
