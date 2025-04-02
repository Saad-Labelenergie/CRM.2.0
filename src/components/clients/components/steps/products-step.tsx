import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { useProducts } from '../../../../lib/hooks/useProducts';

interface Product {
  id: string;
  name: string;
  type: string;
  installationTime: number;
  price: number;
}

interface ProductsStepProps {
  selectedProducts: Product[];
  errors: Record<string, string>;
  onProductSelect: (product: Product) => void;
}

export function ProductsStep({
  selectedProducts,
  errors,
  onProductSelect
}: ProductsStepProps) {
  const { data: products = [], loading } = useProducts();

  // Calculate total installation time
  const totalInstallationTime = selectedProducts.reduce(
    (total, product) => total + (product.installationTime || 0),
    0
  );

  // Calculate number of days needed (8 hours per day)
  const daysNeeded = Math.ceil(totalInstallationTime / (8 * 60));

  // Calculate total price - ensure we're working with numbers
  const totalPrice = selectedProducts.reduce(
    (total, product) => total + (Number(product.price) || 0),
    0
  );

  if (loading) {
    return (
      <div className="bg-accent/50 rounded-lg p-4">
        <div className="flex items-center justify-center py-8">
          <Package className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Sélection des produits
        </h3>
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun produit disponible
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductSelect({
                  id: product.id,
                  name: product.name,
                  type: product.category,
                  installationTime: product.specifications?.installationTime || 240,
                  price: product.purchasePrice || 0
                })}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedProducts.some(p => p.id === product.id)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background hover:bg-accent'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Temps d'installation : {product.specifications?.installationTime || 240} minutes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.purchasePrice?.toFixed(2) || '0.00'} €</div>
                    <div className="text-sm text-muted-foreground">
                      Type : {product.category}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-background rounded-lg border">
            <h4 className="font-medium mb-2">Récapitulatif</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temps total d'installation</span>
                <span className="font-medium">{totalInstallationTime / 60} heures ({daysNeeded} jour{daysNeeded > 1 ? 's' : ''})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix total</span>
                <span className="font-medium">{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}

        {errors['products'] && (
          <div className="text-destructive text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors['products']}
          </div>
        )}
      </div>
    </div>
  );
}