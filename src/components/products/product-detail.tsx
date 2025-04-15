import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Building2, 
  Tag, 
  Award,
  History,
  Edit2,
  Trash2,
  Plus,
  Minus,
  Users,
  MapPin,
  Calendar
} from 'lucide-react';
import { useProducts } from '../../lib/hooks/useProducts';
import { useScheduling } from '../../lib/scheduling/scheduling-context';
import { EditProductModal } from './components/edit-product-modal';
import { DeleteProductModal } from './components/delete-product-modal';
import { Toast } from '../ui/toast';

interface StockMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  client?: {
    id: number;
    name: string;
  };
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products = [], loading, update: updateProduct, remove: removeProduct } = useProducts();
  const { projects } = useScheduling();
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isAddingMovement, setIsAddingMovement] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [newMovement, setNewMovement] = useState<Omit<StockMovement, 'id' | 'date'>>({
    type: 'in',
    quantity: 1,
    reason: ''
  });

  const product = products.find(p => p.id === id);

  const installations = projects
    .filter(project => 
      project.name.toLowerCase().includes(product?.name.toLowerCase() || '') ||
      project.materials?.some(m => m.name === product?.name)
    )
    .map(project => ({
      id: project.id,
      client: project.client,
      date: project.startDate,
      status: project.status,
      team: project.team
    }));

  const handleAddMovement = () => {
    if (newMovement.quantity > 0 && newMovement.reason) {
      const movement: StockMovement = {
        id: Math.random().toString(36).substr(2, 9),
        ...newMovement,
        date: new Date().toISOString().split('T')[0]
      };
      setStockMovements([movement, ...stockMovements]);
      setIsAddingMovement(false);
      setNewMovement({
        type: 'in',
        quantity: 1,
        reason: ''
      });
    }
  };

  const handleEditProduct = async (updatedProduct: any) => {
    try {
      await updateProduct(updatedProduct.id, {
        ...updatedProduct,
        supplier: {
          name: updatedProduct.supplier.name,
          contact: updatedProduct.supplier.contact,
          email: updatedProduct.supplier.email
        }
      });
      setToastMessage('Le produit a été modifié avec succès');
      setShowSuccessToast(true);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la modification du produit:', error);
    }
  };

  const handleDeleteProduct = async () => {
   try {
     await removeProduct(product!.id);
       setToastMessage('Le produit a été supprimé avec succès');
       setShowSuccessToast(true);
       setTimeout(() => {
         navigate('/products');
      }, 1500);
   } catch (error) {
       console.error('Erreur lors de la suppression du produit:', error);
     }
   };
  
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold mt-4">Chargement du produit...</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Produit non trouvé</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-primary hover:underline"
          >
            Retour à la liste des produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{product.name}</h1>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Tag className="w-4 h-4 mr-1" />
              {product.reference}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-500" />
              Informations du produit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Marque</div>
                  <div className="font-medium mt-1">{product.brand}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Modèle</div>
                  <div className="font-medium mt-1">{product.model}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Catégorie</div>
                  <div className="font-medium mt-1">{product.category}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Prix d'achat</div>
                  <div className="font-medium mt-1">{product.purchasePrice?.toFixed(2)} €</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stock actuel</div>
                  <div className="font-medium mt-1">{product.stock?.current || 0} unités</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stock minimum</div>
                  <div className="font-medium mt-1">{product.stock?.minimum || 0} unités</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Installations
              </h2>
            </div>

            <div className="space-y-4">
              {installations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune installation enregistrée
                </div>
              ) : (
                installations.map((installation) => (
                  <div
                    key={installation.id}
                    className="bg-accent/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{installation.client.name}</div>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {installation.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          installation.status === 'terminer' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : installation.status === 'en_cours'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {installation.status === 'terminer' ? 'Terminé' : 
                           installation.status === 'en_cours' ? 'En cours' : 
                           'En attente'}
                        </div>
                        {installation.team && (
                          <div className="text-sm text-muted-foreground mt-2">
                            {installation.team}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <History className="w-5 h-5 mr-2 text-purple-500" />
                Mouvements de stock
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingMovement(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau mouvement
              </motion.button>
            </div>

            {isAddingMovement && (
              <div className="bg-accent/50 rounded-lg p-4 mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Type de mouvement
                    </label>
                    <select
                      value={newMovement.type}
                      onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value as 'in' | 'out' })}
                      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="in">Entrée</option>
                      <option value="out">Sortie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newMovement.quantity}
                      onChange={(e) => setNewMovement({ ...newMovement, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Raison
                  </label>
                  <input
                    type="text"
                    value={newMovement.reason}
                    onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Raison du mouvement..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddingMovement(false)}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddMovement}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Confirmer
                  </motion.button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {stockMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun mouvement de stock enregistré
                </div>
              ) : (
                stockMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="bg-accent/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {movement.type === 'in' ? (
                          <Plus className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <Minus className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className="font-medium">
                          {movement.type === 'in' ? 'Entrée' : 'Sortie'} de {movement.quantity} unité(s)
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {movement.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {movement.reason}
                    </p>
                    {movement.client && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4 mr-1" />
                        {movement.client.name}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-orange-500" />
              Fournisseur
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Nom</div>
                <div className="font-medium mt-1">{product.supplier?.name || 'Non renseigné'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contact</div>
                <div className="font-medium mt-1">{product.supplier?.contact || 'Non renseigné'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium mt-1">{product.supplier?.email || 'Non renseigné'}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-card p-6 rounded-xl shadow-lg border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Certifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.certifications?.length > 0 ? (
                product.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {cert}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground">Aucune certification</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditProduct}
          product={product}
        />
      )}

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        productName={product.name}
      />

      <Toast
        message={toastMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </motion.div>
  );
}