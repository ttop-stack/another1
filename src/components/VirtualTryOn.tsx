/**
 * Virtual Try-On AR Component
 * 
 * Provides an immersive AR experience for fashion items.
 * Uses Web APIs when available, with fallback to 3D preview.
 */

'use client';

import { useState, useEffect } from 'react';
import { Product } from '../lib/primitives';

interface VirtualTryOnProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function VirtualTryOn({ product, isOpen, onClose }: VirtualTryOnProps) {
  const [arSupported, setArSupported] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkArSupport();
      checkCameraPermission();
    }
  }, [isOpen]);

  const checkArSupport = async () => {
    setIsLoading(true);
    
    // Check if WebXR is supported
    if ('xr' in navigator) {
      try {
        const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        setArSupported(supported);
      } catch (error) {
        console.log('WebXR not available:', error);
        setArSupported(false);
      }
    } else {
      setArSupported(false);
    }
    
    setIsLoading(false);
  };

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.log('Permission query not supported:', error);
    }
  };

  const startArSession = async () => {
    if (!arSupported) {
      alert('AR not supported on this device. Showing 3D preview instead.');
      return;
    }

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Stop the stream immediately - we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      
      // In a real implementation, this would start the AR session
      alert(`🔮 AR Experience Starting for ${product.name}!\n\n` +
            `✨ Point your camera at yourself\n` +
            `👆 Tap to place the item\n` +
            `📸 Take photos to share\n\n` +
            `(This is a demo - real AR would launch here)`);
      
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required for AR try-on. Please enable camera permissions and try again.');
    }
  };

  const start3DPreview = () => {
    alert(`🎭 3D Preview for ${product.name}\n\n` +
          `🔄 Rotate to see all angles\n` +
          `🔍 Pinch to zoom\n` +
          `🎨 Tap colors to change variants\n\n` +
          `(This is a demo - 3D viewer would launch here)`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Virtual Try-On
          </h2>
          <p className="text-gray-600">
            Experience {product.name} in AR
          </p>
        </div>

        {/* Product Info */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">
              {product.category === 'shoes' ? '👠' : 
               product.category === 'bags' ? '👜' : 
               product.category === 'accessories' ? '👓' : '👗'}
            </span>
          </div>
          <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
          <p className="text-gray-600">{product.brand}</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Checking AR capabilities...</p>
          </div>
        )}

        {/* AR Options */}
        {!isLoading && (
          <div className="space-y-4 mb-6">
            {/* AR Try-On Option */}
            <button
              onClick={startArSession}
              disabled={!arSupported || cameraPermission === 'denied'}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                arSupported && cameraPermission !== 'denied'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Try in AR</span>
                {arSupported && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">LIVE</span>}
              </div>
              {!arSupported && (
                <p className="text-xs mt-1 text-gray-500">AR not supported on this device</p>
              )}
              {cameraPermission === 'denied' && (
                <p className="text-xs mt-1 text-red-400">Camera permission required</p>
              )}
            </button>

            {/* 3D Preview Option */}
            <button
              onClick={start3DPreview}
              className="w-full py-4 px-6 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🎭</span>
                <span>3D Preview</span>
              </div>
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mb-8 text-left">
          <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <span>✨</span>
              <span>Realistic size and fit preview</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Try different colors instantly</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>📸</span>
              <span>Share photos with friends</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>💾</span>
              <span>Save to your try-on history</span>
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>

        {/* Tech Info */}
        <div className="mt-4 text-xs text-gray-400">
          <p>Powered by WebXR & Computer Vision</p>
          {arSupported ? (
            <p className="text-green-500">✓ AR Ready</p>
          ) : (
            <p>Fallback to 3D preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
