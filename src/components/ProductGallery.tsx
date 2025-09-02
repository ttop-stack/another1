/**
 * Product Gallery Component
 * 
 * Displays products in an immersive grid layout optimized for fashion.
 * Showcases the visual-first approach needed for fashion house presentations.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../lib/primitives';

interface ProductGalleryProps {
  products: readonly Product[];
  onProductClick: (product: Product) => void;
  onProductLike: (productId: string) => void;
  likedProducts: readonly string[];
  className?: string;
}

export function ProductGallery({ 
  products, 
  onProductClick, 
  onProductLike, 
  likedProducts,
  className = ''
}: ProductGalleryProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isHovered={hoveredProduct === product.id}
          isLiked={likedProducts.includes(product.id)}
          onMouseEnter={() => setHoveredProduct(product.id)}
          onMouseLeave={() => setHoveredProduct(null)}
          onClick={() => onProductClick(product)}
          onLike={() => onProductLike(product.id)}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  isHovered: boolean;
  isLiked: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onLike: () => void;
}

function ProductCard({ 
  product, 
  isHovered, 
  isLiked, 
  onMouseEnter, 
  onMouseLeave, 
  onClick, 
  onLike 
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cycle through images on hover
  useEffect(() => {
    if (isHovered && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [isHovered, product.images.length]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  };

  return (
    <div
      className={`group cursor-pointer transition-all duration-300 ${
        isHovered ? 'scale-105' : ''
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-4">
        {/* Main Product Image */}
        <Image
          src={product.images[currentImageIndex] || '/api/placeholder/400/600'}
          alt={product.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Overlay Controls */}
        <div className={`absolute top-4 right-4 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleLikeClick}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Virtual Try-On Badge */}
        {(product.category === 'shoes' || product.category === 'accessories') && (
          <div className={`absolute bottom-4 left-4 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="px-3 py-1 text-xs font-medium text-white bg-black/80 rounded-full backdrop-blur-sm">
              Try AR
            </span>
          </div>
        )}

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className={`absolute bottom-4 right-4 flex space-x-1 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-sm font-medium text-gray-900">
            ${product.price}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 uppercase tracking-wide">
          {product.brand}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
