import React from 'react';
import type { TestCategory } from '../types/api';

interface CategoryBadgeProps {
  category: TestCategory | string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const normCategory = (category || 'CRUD').toLowerCase();
  return (
    <span className={`category-badge ${normCategory}`}>
      {category}
    </span>
  );
};
