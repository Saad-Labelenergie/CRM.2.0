import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { Product } from '../../../../lib/hooks/useProducts';


interface ProductsStepProps {
  products: Product[];
  selectedProducts: Product[];
  errors: Record<string, string>;
  onProductSelect: (product: Product) => void;
}

export function ProductsStep({
  products,
  selectedProducts,
  errors,
  onProductSelect
}: ProductsStepProps) {

  // Calculate total installation time
  const totalInstallationTime = selectedProducts.reduce(
    (total, product) => total + (product.specifications?.installationTime || 0),
    0
  );

  // Calculate number of days needed (8 hours per day)
  // const daysNeeded = Math.ceil(totalInstallationTime / (8 * 60));
  const daysNeeded = totalInstallationTime / (8 * 60); // Donne directement la valeur en jours avec décimales

  // Calculate total price
  const totalPrice = selectedProducts.reduce(
    (total, product) => total + (Number(product.price?.ttc) || 0),
    0
  );

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
            products.map((product) => {
              const isSelected = selectedProducts.some(p => p.id === product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onProductSelect(product)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Temps d'installation : {product.specifications?.installationTime} minutes
                      </p>
                    </div>
                    <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                        TVA : {product.price?.tva || '20'}% - TTC : {Number(product.price?.ttc || 0).toFixed(2)} € 
                         </div>
                         <div className="text-sm text-muted-foreground">
                        Type : {product.category}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-background rounded-lg border">
            <h4 className="font-medium mb-2">Récapitulatif</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temps total d'installation</span>
                <span className="font-medium">{(totalInstallationTime / 60).toFixed(1)} heures ({daysNeeded} jour{daysNeeded > 1 ? 's' : ''})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix total</span>
                <span className="font-medium">{totalPrice.toFixed (2)} €</span>
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