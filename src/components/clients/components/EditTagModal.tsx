import React, { useState } from "react"
import { Dialog } from "@headlessui/react"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "../../../lib/firebase"

export default function EditTagModal({ clientId, currentTag, onClose }) {
  const [selectedTag, setSelectedTag] = useState(currentTag)

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "clients", clientId), {
        tag: selectedTag,
      })
      onClose()
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">Modifier l’étiquette</Dialog.Title>

          <div className="space-y-2">
            {["MPR", "Financement"].map((tag) => (
              <label
                key={tag}
                className={`flex items-center space-x-2 p-2 border rounded cursor-pointer ${
                  selectedTag === tag ? "border-primary bg-primary/10 text-primary" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="tag"
                  value={tag}
                  checked={selectedTag === tag}
                  onChange={() => setSelectedTag(tag)}
                  className="accent-primary"
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>

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
