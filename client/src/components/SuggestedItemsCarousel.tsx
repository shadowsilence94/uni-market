import React from 'react';
import ProductCard from './ProductCard';
import type { Item } from '../types';

interface CarouselProps {
  items: Item[];
}

const SuggestedItemsCarousel: React.FC<CarouselProps> = ({ items }) => {
  // We need at least a few items to make a carousel meaningful
  if (items.length === 0) return null;

  // Duplicate items to create a seamless loop effect
  const extendedItems = [...items, ...items];

  return (
    <div className="w-full relative group">
      <div className="scrolling-container">
        <div className="scrolling-wrapper">
          {extendedItems.map((item, index) => (
            <div key={index} className="card-item">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      </div>
      {/* Fades on the sides */}
      <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
    </div>
  );
};

export default SuggestedItemsCarousel;