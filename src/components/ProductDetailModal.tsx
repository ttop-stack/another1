/**
 * Product Detail Modal Component
 * 
 * Immersive product detail view with virtual try-on capabilities.
 * Designed to showcase fashion products in a premium way.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../lib/primitives';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  onLike: (productId: string) => void;
  onVirtualTryOn: (productId: string) => void;
  isLiked: boolean;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onLike,
  onVirtualTryOn,
  isLiked
}: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setSelectedSize('');
      setSelectedColor('');
      setIsZoomed(false);
    }
  }, [product]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const sizes = product.metadata.sizes as string[] || [];
  const colors = product.metadata.colors as string[] || [];
  const supportsVirtualTryOn = ['shoes', 'accessories', 'bags'].includes(product.category);

  const handleAddToCart = () => {
    onAddToCart(product.id);
  };

  const handleVirtualTryOn = () => {
    onVirtualTryOn(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl max-h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
            {/* Image Section */}
            <div className="relative bg-gray-50">
              {/* Main Image */}
              <div 
                className={`relative h-full min-h-[50vh] lg:min-h-full cursor-zoom-in transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src={product.images[selectedImageIndex] || '/api/placeholder/600/800'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index
                            ? 'border-black'
                            : 'border-white/50 hover:border-white'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          width={64}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Virtual Try-On Button */}
              {supportsVirtualTryOn && (
                <div className="absolute top-6 left-6">
                  <button
                    onClick={handleVirtualTryOn}
                    className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
                  >
                    Try in AR
                  </button>
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="p-8 overflow-y-auto">
              <div className="max-w-lg">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-light text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600 uppercase tracking-wide mb-4">
                    {product.brand}
                  </p>
                  <p className="text-2xl font-medium text-gray-900">
                    ${product.price}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-6 mb-8">
                  {/* Colors */}
                  {colors.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                      <div className="flex space-x-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 border rounded-md text-sm transition-colors capitalize ${
                              selectedColor === color
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`py-2 border rounded-md text-sm transition-colors ${
                              selectedSize === size
                                ? 'border-black bg-black text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    onClick={() => onLike(product.id)}
                    className={`w-full py-3 border rounded-md font-medium transition-colors ${
                      isLiked
                        ? 'border-red-500 text-red-500 bg-red-50'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                </div>

                {/* Tags */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {product.metadata.material && (
                      <p><span className="font-medium">Material:</span> {String(product.metadata.material)}</p>
                    )}
                    {product.metadata.season && (
                      <p><span className="font-medium">Season:</span> {String(product.metadata.season)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
