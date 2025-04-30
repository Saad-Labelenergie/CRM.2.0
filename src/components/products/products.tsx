import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  LayoutGrid,
  List,
  TrendingUp,
  Star,
  Users,
  ArrowRight,
  ChevronRight,
  Package,
  Settings,
  Tag,
  Factory,
  Box,
  ShoppingCart,
  Percent,
  Layers,
  AlertTriangle,
  PieChart,
  
} from 'lucide-react';
import { NewProductModal } from './components/new-product-modal';
import { ManageFournisseursModal } from './components/manage-fournisseur-modal';
import { ManageCategoriesModal } from './components/manage-categories-modal';
import { Toast } from '../ui/toast';
import { useProducts } from '../../lib/hooks/useProducts';
import { Bar,BarChart, CartesianGrid, Cell, Legend, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';




const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

type ViewMode = 'grid' | 'list';

export function Products() {
  const navigate = useNavigate();
  const { data: products = [], loading, add: addProduct } = useProducts();
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isFournisseurModalOpen, setIsFournisseurModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSaveProduct = async (productData: any) => {
    try {
      await addProduct({
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowSuccessToast(true);
      setIsNewProductModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold mt-4">Chargement des produits...</h2>
        </div>
      </div>
    );
  }

  //Les données du chart Nombre de produits par marque 

  const brandBarData = Object.entries(
    products.reduce((acc: Record<string, number>, product) => {
      const brand = product.brand || 'Inconnu';
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {})
  ).map(([brand, count]) => ({ brand, count }));
  

  //Les données du chart Stock Dispo par produit 
  const barData = products.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    stock: (p.stock?.current ?? 0) - (p.stock?.reserved ?? 0)
  }));


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Catalogue Produits</h1>
          <p className="text-muted-foreground mt-1">Gérez votre catalogue de produits et stocks</p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCategoriesModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl transition-colors"
          >
            <Tag className="w-4 h-4 mr-2" />
            Catégories
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFournisseurModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl transition-colors"
          >
            <Factory className="w-4 h-4 mr-2" />
            Fournisseurs
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsNewProductModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </motion.button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
  {/* Carte Nombre total de produits */}
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card p-4 rounded-xl border border-border/50 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Total Produits</p>
        <h3 className="text-2xl font-bold mt-1">{products.length}</h3>
      </div>
      <div className="p-3 bg-blue-100/20 rounded-lg text-blue-500">
        <Package className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
  {/* Carte Produits par catégorie */}
<motion.div
  whileHover={{ y: -5 }}
  className="bg-card p-4 rounded-xl border border-border/50 shadow-sm"
>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">Catégories</p>
      <h3 className="text-2xl font-bold mt-1">
        {new Set(products.map(p => p.category)).size}
      </h3>
    </div>
    <div className="p-3 bg-violet-100/20 rounded-lg text-violet-500">
      <Tag className="w-6 h-6" />
    </div>
  </div>
</motion.div>

{/* Carte Marques utilisées */}
<motion.div
  whileHover={{ y: -5 }}
  className="bg-card p-4 rounded-xl border border-border/50 shadow-sm"
>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">Marques</p>
      <h3 className="text-2xl font-bold mt-1">
        {new Set(products.map(p => p.brand)).size}
      </h3>
    </div>
    <div className="p-3 bg-cyan-100/20 rounded-lg text-cyan-500">
      <Star className="w-6 h-6" />
    </div>
  </div>
</motion.div>


  {/* Carte Valeur totale du stock */}
  {/* <motion.div
    whileHover={{ y: -5 }}
    className="bg-card p-4 rounded-xl border border-border/50 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Valeur du stock</p>
        <h3 className="text-2xl font-bold mt-1">
          {products.reduce((acc, product) => acc + (product.stock?.current || 0) * (product.price?.ht || 0), 0).toFixed(2)} € HT
        </h3>
      </div>
      <div className="p-3 bg-green-100/20 rounded-lg text-green-500">
        <ShoppingCart className="w-6 h-6" />
      </div>
    </div>
  </motion.div> */}

  {/* Carte Produits en rupture */}
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card p-4 rounded-xl border border-border/50 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">En rupture</p>
        <h3 className="text-2xl font-bold mt-1">
          {products.filter(p => (p.stock?.current || 0) <= 0).length}
        </h3>
      </div>
      <div className="p-3 bg-red-100/20 rounded-lg text-red-500">
        <AlertTriangle className="w-6 h-6" />
      </div>
    </div>
  </motion.div>

  {/* Carte Produits à réapprovisionner */}
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card p-4 rounded-xl border border-border/50 shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">À réapprovisionner</p>
        <h3 className="text-2xl font-bold mt-1">
          {products.filter(p => {
            const current = p.stock?.current || 0;
            const optimal = p.stock?.optimal || 0;
            return current > 0 && current < optimal;
          }).length}
        </h3>
      </div>
      <div className="p-3 bg-orange-100/20 rounded-lg text-orange-500">
        <Layers className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
 
</div>
<div className="mt-12 bg-card rounded-xl shadow-lg border border-border/50 p-6">
  <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
    
    {/* Chart 1 : Stock disponible par produit */}
    <div className="flex-1 w-full">
      <h2 className="text-lg font-semibold mb-4">Stock disponible par produit</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="stock" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Chart 2 : Nombre de produits par marque */}
    <div className="flex-1 w-full">
      <h2 className="text-lg font-semibold mb-4">Nombre de produits par marque</h2>
      <ResponsiveContainer width="100%" height={300}>
  <BarChart data={brandBarData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="brand" tick= {{ fontSize: 12 }} />
    <YAxis allowDecimals={false} /> {/* Affiche uniquement des entiers */}
    <Tooltip />
    <Bar dataKey="count" fill="#10B981" />
  </BarChart>
</ResponsiveContainer>

    </div>

  </div>
</div>



      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
        <div className="flex items-center bg-card rounded-xl border border-border/50 p-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent'
            }`}
          >
            <List className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border/50">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
          <p className="text-muted-foreground">
            Commencez par ajouter un nouveau produit en cliquant sur le bouton "Nouveau Produit"
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/products/${product.id}`)}
              className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {/* <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm ml-1 text-muted-foreground">4.8</span>
                  </div> */}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{product.stock?.current || 0} unités</span>
                </div>

                {/* <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prix</span>
                  <span className="font-medium">{product.purchasePrice?.toFixed(2) || '0.00'} €</span>
                </div> */}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Produit</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Marque</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Stock Réel</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Stock Réservé</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Stock Retour</th>

                {/* <th className="text-right p-4 font-medium text-muted-foreground">Prix</th> */}
                {/* <th className="text-center p-4 font-medium text-muted-foreground">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  variants={itemVariants}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.reference}</div>
                  </td>
                  <td className="p-4">
                    <span className="capitalize">{product.category}</span>
                  </td>
                  <td>
                    <span className='p-4 text-right'>{product.brand}</span>
                  </td>
                  <td className="p-4">
                    {(product.stock?.current ?? 0) - (product.stock?.reserved ?? 0)} unités
                  </td>
                  <td className='p-4'>
                    {product.stock?.reserved || 0} unités
                  </td>
                  <td>
                    {product.stock?.returned || 0} unités
                  </td>
                  {/* <td className="p-4 text-right">
                    {product.purchasePrice?.toFixed(2) || '0.00'} €
                  </td> */}
                  {/* <td className="p-4">
                    <div className="flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td> */}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        onSave={(categories) => {
          // Handle saving categories
          console.log('Categories saved:', categories);
          setShowSuccessToast(true);
        }}
      />
      <ManageFournisseursModal
      isOpen={isFournisseurModalOpen}
       onClose={() => setIsFournisseurModalOpen(false)}
      onSave={(fournisseurs) => {
    console.log('Fournisseurs saved:', fournisseurs);
    setShowSuccessToast(true);
  }}
/>

      <Toast
        message="Les modifications ont été enregistrées avec succès !"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </motion.div>
  );
}