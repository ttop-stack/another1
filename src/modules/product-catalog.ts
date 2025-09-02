/**
 * Fashion Product Catalog Module
 * 
 * Black box implementation that manages fashion product inventory.
 * Can be completely replaced with different data sources (API, database, etc.)
 * without breaking the rest of the system.
 */

import { Product } from '../lib/primitives';
import { ProductCatalog, ProductFilters } from '../lib/interfaces';

// Sample fashion products for demonstration
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'Ethereal Silk Dress',
    brand: 'Luna Atelier',
    category: 'clothing',
    price: 450,
    currency: 'USD',
    images: [
      '/api/placeholder/400/600',
      '/api/placeholder/400/600?variant=back',
      '/api/placeholder/400/600?variant=detail'
    ],
    description: 'A flowing silk dress that captures light beautifully. Perfect for evening events or sophisticated daywear.',
    tags: ['silk', 'dress', 'evening', 'luxury', 'sustainable'],
    metadata: {
      material: 'silk',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['midnight', 'champagne', 'rose'],
      season: 'SS25'
    }
  },
  {
    id: 'prod_002',
    name: 'Architectural Blazer',
    brand: 'Forma Studio',
    category: 'clothing',
    price: 680,
    currency: 'USD',
    images: [
      '/api/placeholder/400/600',
      '/api/placeholder/400/600?variant=styled'
    ],
    description: 'Sharp, structured blazer with innovative cut lines. Redefines power dressing for the modern professional.',
    tags: ['blazer', 'structured', 'professional', 'innovative'],
    metadata: {
      material: 'wool-blend',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['charcoal', 'navy', 'cream'],
      season: 'AW25'
    }
  },
  {
    id: 'prod_003',
    name: 'Minimalist Leather Bag',
    brand: 'Essence',
    category: 'bags',
    price: 320,
    currency: 'USD',
    images: [
      '/api/placeholder/300/400',
      '/api/placeholder/300/400?variant=interior'
    ],
    description: 'Clean lines meet functionality. This bag embodies the philosophy that luxury lies in simplicity.',
    tags: ['leather', 'minimalist', 'handbag', 'versatile'],
    metadata: {
      material: 'Italian leather',
      dimensions: '30x25x12cm',
      colors: ['black', 'cognac', 'stone'],
      features: ['detachable strap', 'internal pockets']
    }
  },
  {
    id: 'prod_004',
    name: 'Sculptural Heels',
    brand: 'Kinetic',
    category: 'shoes',
    price: 520,
    currency: 'USD',
    images: [
      '/api/placeholder/300/400',
      '/api/placeholder/300/400?variant=side'
    ],
    description: 'Heels that blur the line between fashion and art. Each step is a statement of creative confidence.',
    tags: ['heels', 'sculptural', 'art', 'statement'],
    metadata: {
      heelHeight: '85mm',
      sizes: ['35', '36', '37', '38', '39', '40'],
      colors: ['black', 'nude', 'metallic'],
      sole: 'leather'
    }
  }
];

export class FashionProductCatalog implements ProductCatalog {
  private products: Map<string, Product> = new Map();

  constructor() {
    // Initialize with sample data
    SAMPLE_PRODUCTS.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getProducts(filters?: ProductFilters): Promise<readonly Product[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      products = products.filter(product => {
        if (filters.category && product.category !== filters.category) {
          return false;
        }
        
        if (filters.brand && product.brand !== filters.brand) {
          return false;
        }
        
        if (filters.priceRange) {
          const { min, max } = filters.priceRange;
          if (product.price < min || product.price > max) {
            return false;
          }
        }
        
        if (filters.tags && filters.tags.length > 0) {
          const hasMatchingTag = filters.tags.some(tag => 
            product.tags.includes(tag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }
        
        return true;
      });
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async searchProducts(query: string): Promise<readonly Product[]> {
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.products.values()).filter(product => {
      return (
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    });
  }

  async getRecommendations(userId: string, limit = 4): Promise<readonly Product[]> {
    // Simple recommendation logic - in real implementation this would use AI/ML
    const products = Array.from(this.products.values());
    
    // Shuffle and return limited results
    const shuffled = products.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  // Additional method for adding products (not in interface - internal implementation)
  private addProduct(product: Product): void {
    this.products.set(product.id, product);
  }
}
