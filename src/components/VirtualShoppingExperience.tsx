/**
 * Virtual Fashion Shopping Experience
 * 
 * Main component that orchestrates the entire shopping experience.
 * Demonstrates the black box architecture in action.
 */

'use client';

import { useState, useEffect } from 'react';
import { Product, ExperienceState } from '../lib/primitives';
import { FashionShoppingSystem } from '../lib/system';
import { SystemFactory } from '../lib/factory';
import { ProductGallery } from './ProductGallery';
import { ProductDetailModal } from './ProductDetailModal';
import { ShoppingFilters } from './ShoppingFilters';
import { ExperienceHeader } from './ExperienceHeader';

export function VirtualShoppingExperience() {
  // System instance
  const [system] = useState(() => SystemFactory.createFashionShoppingSystem());
  
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [experienceState, setExperienceState] = useState<ExperienceState | null>(null);
  
  // UI state
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const newSessionId = await system.createShoppingSession();
        setSessionId(newSessionId);
        
        // Load initial products
        const initialProducts = await system.browseProducts(newSessionId);
        setProducts(initialProducts);
        
        // Get initial state
        const state = await system.getSessionState(newSessionId);
        setExperienceState(state);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [system]);

  // Handle product search
  const handleSearch = async (query: string) => {
    if (!sessionId) return;
    
    setSearchQuery(query);
    setIsLoading(true);
    
    try {
      const searchResults = query 
        ? await system.searchProducts(sessionId, query)
        : await system.browseProducts(sessionId);
      
      setProducts(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category filter
  const handleCategoryFilter = async (category: string) => {
    if (!sessionId) return;
    
    setActiveCategory(category);
    setIsLoading(true);
    
    try {
      const filters = category === 'all' ? undefined : { category };
      const filteredProducts = await system.browseProducts(sessionId, filters);
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product interactions
  const handleProductClick = async (product: Product) => {
    if (!sessionId) return;
    
    try {
      const fullProduct = await system.viewProduct(sessionId, product.id);
      if (fullProduct) {
        setSelectedProduct(fullProduct);
        setIsDetailModalOpen(true);
        
        // Update experience state
        const updatedState = await system.getSessionState(sessionId);
        setExperienceState(updatedState);
      }
    } catch (error) {
      console.error('Failed to view product:', error);
    }
  };

  const handleProductLike = async (productId: string) => {
    if (!sessionId) return;
    
    try {
      await system.likeProduct(sessionId, productId);
      
      // Update experience state
      const updatedState = await system.getSessionState(sessionId);
      setExperienceState(updatedState);
    } catch (error) {
      console.error('Failed to like product:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!sessionId) return;
    
    try {
      await system.addToCart(sessionId, productId);
      
      // Update experience state
      const updatedState = await system.getSessionState(sessionId);
      setExperienceState(updatedState);
      
      // Close modal after adding to cart
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleVirtualTryOn = async (productId: string) => {
    if (!sessionId) return;
    
    try {
      const success = await system.startVirtualTryOn(sessionId, productId);
      
      if (success) {
        // Update experience state
        const updatedState = await system.getSessionState(sessionId);
        setExperienceState(updatedState);
        
        // For demo purposes, show a notification
        alert('Virtual try-on experience started! 🕶️✨');
      }
    } catch (error) {
      console.error('Failed to start virtual try-on:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All', count: products.length },
    { id: 'clothing', name: 'Clothing', count: products.filter(p => p.category === 'clothing').length },
    { id: 'shoes', name: 'Shoes', count: products.filter(p => p.category === 'shoes').length },
    { id: 'bags', name: 'Bags', count: products.filter(p => p.category === 'bags').length },
    { id: 'accessories', name: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
  ];

  if (isLoading && !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing your fashion experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <ExperienceHeader
        experienceState={experienceState}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <ShoppingFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryFilter}
          className="mb-8"
        />

        {/* Product Gallery */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading products...</span>
          </div>
        ) : products.length > 0 ? (
          <ProductGallery
            products={products}
            onProductClick={handleProductClick}
            onProductLike={handleProductLike}
            likedProducts={experienceState?.favorites || []}
          />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.43-.937-5.96-2.457M16.5 12V6a4.5 4.5 0 00-9 0v6.5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAddToCart={handleAddToCart}
        onLike={handleProductLike}
        onVirtualTryOn={handleVirtualTryOn}
        isLiked={selectedProduct ? (experienceState?.favorites || []).includes(selectedProduct.id) : false}
      />
    </div>
  );
}
