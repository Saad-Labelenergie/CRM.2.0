import React, { useState } from "react"
import { Dialog } from "@headlessui/react"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { User, Mail, Phone } from "lucide-react"

export default function EditContactModal({ contact, onClose, clientId }) {
  const [form, setForm] = useState(contact)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "clients", clientId), {
        contact: form,
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
        <Dialog.Panel className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">Modifier le contact</Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Prénom"
                  className="w-full border rounded p-2 pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Nom"
                  className="w-full border rounded p-2 pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border rounded p-2 pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Téléphone"
                  className="w-full border rounded p-2 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onClose} className="text-sm text-gray-500">Annuler</button>
            <button
              onClick={handleSave}
              className="bg-black hover:bg-gray-500 transition text-white px-4 py-2 rounded text-sm"
            >
              Enregistrer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
