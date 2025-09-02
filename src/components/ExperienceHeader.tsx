/**
 * Experience Header Component
 * 
 * Header bar with search, navigation, and session info.
 */

'use client';

import { useState } from 'react';
import { ExperienceState } from '../lib/primitives';

interface ExperienceHeaderProps {
  experienceState: ExperienceState | null;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function ExperienceHeader({ experienceState, onSearch, searchQuery }: ExperienceHeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    
    // Debounced search (optional - could be improved with actual debouncing)
    if (value.length === 0) {
      onSearch('');
    }
  };

  const cartItemCount = experienceState?.cartItems.length || 0;
  const favoriteCount = experienceState?.favorites.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-light text-gray-900">
              Atelier<span className="font-medium">Virtual</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleSearchChange}
                placeholder="Search luxury fashion..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Favorites */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {favoriteCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Experience Mode Indicator */}
            {experienceState?.experienceMode && experienceState.experienceMode !== 'browse' && (
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {experienceState.experienceMode === 'virtual-try' && '🕶️ AR Mode'}
                {experienceState.experienceMode === 'detailed' && '🔍 Detail View'}
                {experienceState.experienceMode === 'checkout' && '🛒 Checkout'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
