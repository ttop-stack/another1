/**
 * System Factory
 * 
 * Creates and configures all system modules with proper dependency injection.
 * Demonstrates how modules can be easily swapped out.
 */

import { FashionShoppingSystem } from './system';
import { FashionProductCatalog } from '../modules/product-catalog';
import { VirtualExperienceEngine } from '../modules/experience-engine';
import { InMemorySessionManager } from '../modules/session-manager';
import { ImmersiveVisualRenderer } from '../modules/visual-renderer';
import { FashionAnalyticsTracker } from '../modules/analytics-tracker';

export class SystemFactory {
  static createFashionShoppingSystem(): FashionShoppingSystem {
    // Initialize all modules
    const productCatalog = new FashionProductCatalog();
    const experienceEngine = new VirtualExperienceEngine();
    const sessionManager = new InMemorySessionManager(5 * 60 * 1000); // 5 min cleanup
    const visualRenderer = new ImmersiveVisualRenderer({
      enableAnimations: true,
      imageQuality: 'high',
      loadingStrategy: 'lazy'
    });
    const analyticsTracker = new FashionAnalyticsTracker();

    // Create the coordinated system
    return new FashionShoppingSystem(
      productCatalog,
      experienceEngine,
      sessionManager,
      visualRenderer,
      analyticsTracker
    );
  }

  static createDevelopmentSystem(): FashionShoppingSystem {
    // Development configuration with different settings
    const productCatalog = new FashionProductCatalog();
    const experienceEngine = new VirtualExperienceEngine();
    const sessionManager = new InMemorySessionManager(); // No auto cleanup for dev
    const visualRenderer = new ImmersiveVisualRenderer({
      enableAnimations: false, // Faster for development
      imageQuality: 'medium',
      loadingStrategy: 'eager'
    });
    const analyticsTracker = new FashionAnalyticsTracker();

    return new FashionShoppingSystem(
      productCatalog,
      experienceEngine,
      sessionManager,
      visualRenderer,
      analyticsTracker
    );
  }

  static createProductionSystem(): FashionShoppingSystem {
    // Production configuration with optimized settings
    const productCatalog = new FashionProductCatalog();
    const experienceEngine = new VirtualExperienceEngine();
    const sessionManager = new InMemorySessionManager(60 * 60 * 1000); // 1 hour cleanup
    const visualRenderer = new ImmersiveVisualRenderer({
      enableAnimations: true,
      imageQuality: 'high',
      loadingStrategy: 'lazy'
    });
    const analyticsTracker = new FashionAnalyticsTracker();

    return new FashionShoppingSystem(
      productCatalog,
      experienceEngine,
      sessionManager,
      visualRenderer,
      analyticsTracker
    );
  }
}
