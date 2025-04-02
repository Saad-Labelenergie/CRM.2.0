import { useFirebase } from './useFirebase';

interface Category {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useCategories() {
  return useFirebase<Category>('product_categories', { orderByField: 'name' });
}