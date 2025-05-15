import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Check, Search } from "lucide-react";
import { getDocs, collection, updateDoc, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { motion } from "framer-motion";

interface EditProjectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentProducts?: any[];
}

export function EditProjectProductModal({ isOpen, onClose, projectId, currentProducts = [] }: EditProjectProductModalProps) {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>(currentProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Récupérer les produits actuels du projet lors de l'ouverture du modal
  useEffect(() => {
    const fetchCurrentProjectProducts = async () => {
      if (!projectId || !isOpen) return;
      
      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          if (projectData.products && Array.isArray(projectData.products)) {
            setSelectedProducts(projectData.products);
          } else {
            // Si le projet a un seul produit défini par son nom
            const productName = projectData.name;
            if (productName) {
              setSelectedProducts([{ name: productName, id: "unknown", type: "unknown-type" }]);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des produits du projet:", error);
      }
    };

    fetchCurrentProjectProducts();
  }, [projectId, isOpen]);

  // Récupérer tous les produits disponibles
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        setAllProducts(products);
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Gérer la sélection/désélection d'un produit
  const toggleProductSelection = (product: any) => {
    setSelectedProducts(prev => {
      // Vérifier si le produit est déjà sélectionné
      const isSelected = prev.some(p => p.id === product.id);
      
      if (isSelected) {
        // Retirer le produit de la sélection
        return prev.filter(p => p.id !== product.id);
      } else {
        // Ajouter le produit à la sélection
        return [...prev, { 
          id: product.id, 
          name: product.name,
          type: product.type || "unknown-type",
          status: "charger" // Statut par défaut pour les nouveaux produits
        }];
      }
    });
  };

  // Filtrer les produits selon le terme de recherche
  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!projectId || selectedProducts.length === 0) return;
    
    setIsLoading(true);
    try {
      console.log("Tentative de mise à jour des produits pour le projet:", projectId);
      console.log("Produits sélectionnés à enregistrer:", selectedProducts);
      
      // Mettre à jour le projet avec les produits sélectionnés
      await updateDoc(doc(db, "projects", projectId), {
        products: selectedProducts,
        name: selectedProducts[0]?.name, // Utiliser le nom du premier produit comme nom du projet
        updatedAt: new Date()
      });
      
      console.log("Mise à jour réussie dans Firestore");
      
      // Mettre à jour également l'appointment associé si nécessaire
      try {
        // Rechercher les rendez-vous associés à ce projet
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, where('projectId', '==', projectId));

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`${querySnapshot.docs.length} rendez-vous trouvés associés à ce projet`);
          
          // Mettre à jour chaque rendez-vous trouvé
          for (const appointmentDoc of querySnapshot.docs) {
            console.log("Mise à jour du rendez-vous:", appointmentDoc.id);
            await updateDoc(doc(db, 'appointments', appointmentDoc.id), {
              title: selectedProducts[0]?.name,
              updatedAt: new Date()
            });
          }
        } else {
          console.log("Aucun rendez-vous trouvé avec ce projectId, recherche par titre...");
          
          // Si aucun rendez-vous n'est trouvé avec projectId, essayer de chercher par titre
          const titleQuery = query(appointmentsRef, where('title', '==', selectedProducts[0]?.name));
          const titleQuerySnapshot = await getDocs(titleQuery);
          
          if (!titleQuerySnapshot.empty) {
            console.log(`${titleQuerySnapshot.docs.length} rendez-vous trouvés par titre`);
            
            // Mettre à jour chaque rendez-vous trouvé
            for (const appointmentDoc of titleQuerySnapshot.docs) {
              console.log("Mise à jour du rendez-vous par titre:", appointmentDoc.id);
              await updateDoc(doc(db, 'appointments', appointmentDoc.id), {
                title: selectedProducts[0]?.name,
                projectId: projectId, // Lier explicitement le rendez-vous au projet
                updatedAt: new Date()
              });
            }
          } else {
            console.log("Aucun rendez-vous trouvé à mettre à jour");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des rendez-vous associés:", error);
      }
      
      // Forcer le rafraîchissement de la vue du calendrier
      window.dispatchEvent(new CustomEvent('project-product-updated', { 
        detail: { 
          projectId,
          products: selectedProducts
        } 
      }));
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si un produit est sélectionné
  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-card rounded-xl p-6 w-full max-w-2xl shadow-lg space-y-6 max-h-[90vh] overflow-y-auto border border-border/50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Modifier les produits</h2>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Liste des produits sélectionnés */}
          {selectedProducts.length > 0 && (
            <div className="bg-accent/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Produits sélectionnés ({selectedProducts.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{product.name}</span>
                    <button 
                      onClick={() => toggleProductSelection({ id: product.id })}
                      className="hover:bg-primary/20 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allProducts.length === 0 ? (
            <p className="text-muted-foreground">Chargement des produits...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleProductSelection(product)}
                  className={`p-4 border rounded-lg cursor-pointer transition flex justify-between items-start ${
                    isProductSelected(product.id) ? "bg-accent border-primary" : "border-border"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.brand}</div>
                    {product.price && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {Number(product.price.ttc).toFixed(2)} € TTC
                      </div>
                    )}
                  </div>
                  {isProductSelected(product.id) && (
                    <Check className="text-primary w-5 h-5" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || selectedProducts.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}