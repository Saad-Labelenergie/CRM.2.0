import React, { useState, useEffect } from 'react';
import { MapPin, Search, AlertCircle } from 'lucide-react';

interface AddressFeature {
  properties: {
    label: string;
    postcode: string;
    city: string;
    name: string;
  };
}

interface AddressStepProps {
  formData: {
    address: {
      street: string;
      city: string;
      postalCode: string;
    };
  };
  errors: Record<string, string>;
  onUpdate: (field: string, value: string) => void;
}

export function AddressStep({
  formData,
  errors,
  onUpdate
}: AddressStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchAddress = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'adresse:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchAddress, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectAddress = (feature: AddressFeature) => {
    onUpdate('address.street', feature.properties.name);
    onUpdate('address.postalCode', feature.properties.postcode);
    onUpdate('address.city', feature.properties.city);
    setSearchQuery(feature.properties.label);
    setSuggestions([]);
  };

  return (
    <div className="bg-accent/50 rounded-lg p-4 space-y-4">
      <h3 className="font-medium flex items-center">
        <MapPin className="w-4 h-4 mr-2" />
        Adresse
      </h3>
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Rechercher une adresse *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Commencez à taper une adresse..."
            />
          </div>
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            </div>
          )}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card rounded-lg shadow-lg border border-border/50">
              {suggestions.map((feature, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAddress(feature)}
                  className="w-full px-4 py-2 text-left hover:bg-accent/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {feature.properties.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Code postal *
            </label>
            <input
              type="text"
              value={formData.address.postalCode}
              onChange={(e) => onUpdate('address.postalCode', e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="75001"
            />
            {errors['address.postalCode'] && (
              <p className="text-destructive text-sm mt-1">{errors['address.postalCode']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Ville *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => onUpdate('address.city', e.target.value)}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Paris"
            />
            {errors['address.city'] && (
              <p className="text-destructive text-sm mt-1">{errors['address.city']}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Rue *
          </label>
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => onUpdate('address.street', e.target.value)}
            className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="123 rue Example"
          />
          {errors['address.street'] && (
            <p className="text-destructive text-sm mt-1">{errors['address.street']}</p>
          )}
        </div>
      </div>
    </div>
  );
}