import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { X } from "lucide-react"
import { getDocs, collection, updateDoc, doc } from "firebase/firestore"
import { db } from "../../../lib/firebase"

export default function EditProductsStepModal({ clientId, initialSelectedProducts, onClose }) {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<any[]>(initialSelectedProducts || [])

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"))
      const products = snapshot.docs.map(doc => {
        const data = doc.data()
        const installTime = data?.specifications?.installationTime ?? data.installationTime ?? 0
        return {
          id: doc.id,
          ...data,
          installationTime: parseInt(installTime) || 0
        }
      })
      setAllProducts(products)
    }

    fetchProducts()
  }, [])

  const toggleProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id)
    if (existing) {
      if (existing.quantity > 1) {
        setSelectedProducts(prev =>
          prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p)
        )
      } else {
        setSelectedProducts(prev => prev.filter(p => p.id !== product.id))
      }
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }])
    }
  }

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "clients", clientId), {
        productsIds: selectedProducts.map(p => p.id)
      })
      onClose()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Modifier les produits</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
          </div>

          {allProducts.length === 0 ? (
            <p className="text-muted-foreground">Chargement des produits...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allProducts.map(product => {
                const isSelected = selectedProducts.find(p => p.id === product.id)
                const quantity = isSelected?.quantity || 0

                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      isSelected ? "bg-gray-200" : "border-border"
                    }`}
                  >
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.brand}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {Number(product.price.ttc).toFixed(2)} € TTC
                    </div>

                  </div>
                )
              })}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onClose} className="text-sm text-gray-500">Annuler</button>
            <button
              onClick={handleSave}
              className="bg-black hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
            >
              Enregistrer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
