import React, { useState, useEffect } from "react"
import { Dialog } from "@headlessui/react"
import { updateDoc, doc } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { MapPin, Mail, Building2, Globe } from "lucide-react"

export default function EditAddressModal({ address, onClose, clientId }) {
  const [form, setForm] = useState(address)
  const [suggestions, setSuggestions] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === "street" && value.length > 3) {
      fetch(`https://api-adresse.data.gouv.fr/search/?q=${value}&limit=5`)
        .then(res => res.json())
        .then(data => setSuggestions(data.features))
    } else {
      setSuggestions([])
    }
  }

  const handleSelectSuggestion = (feature) => {
    const props = feature.properties
    setForm({
      street: props.name,
      postalCode: props.postcode,
      city: props.city,
      country: "France"
    })
    setSuggestions([])
  }

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "clients", clientId), {
        address: form,
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
          <Dialog.Title className="text-lg font-semibold">Modifier l'adresse</Dialog.Title>

          <div className="space-y-4">
            {/* Rue */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Rue</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="Rue"
                  className="w-full border rounded p-2 pl-10"
                  autoComplete="off"
                />
              </div>
              {suggestions.length > 0 && (
                <ul className="border rounded bg-white mt-1 max-h-40 overflow-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectSuggestion(s)}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {s.properties.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Code postal */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Code postal</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="Code postal"
                  className="w-full border rounded p-2 pl-10"
                />
              </div>
            </div>

            {/* Ville */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Ville</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Ville"
                  className="w-full border rounded p-2 pl-10"
                />
              </div>
            </div>

            {/* Pays */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Pays</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Pays"
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
