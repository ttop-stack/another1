/**
 * Shopping Filters Component
 * 
 * Category and filter controls for the shopping experience.
 */

'use client';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface ShoppingFiltersProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export function ShoppingFilters({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  className = '' 
}: ShoppingFiltersProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Category Filters */}
      <div className="flex items-center space-x-1 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
            {category.count > 0 && (
              <span className={`ml-2 text-xs ${
                activeCategory === category.id ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {category.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Sort by:</span>
        <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
    </div>
  );
}
