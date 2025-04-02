import { useFirebase } from './useFirebase';

interface Product {
  id: string;
  name: string;
  reference: string;
  brand: string;
  model: string;
  category: string;
  supplier: {
    name: string;
    contact: string;
    email: string;
  };
  purchasePrice: number;
  stock: {
    current: number;
    minimum: number;
    optimal: number;
  };
  certifications: string[];
  specifications: {
    installationTime?: number;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export function useProducts() {
  const { data, loading, error, add, update, remove } = useFirebase<Product>('products', { orderByField: 'name' });

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    // Ensure we're not sending undefined values
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await update(id, {
      ...cleanUpdates,
      updatedAt: new Date()
    });
  };

  return {
    data,
    loading,
    error,
    add,
    update: updateProduct,
    remove
  };
}