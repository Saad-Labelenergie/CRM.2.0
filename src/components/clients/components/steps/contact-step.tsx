import React from 'react';
import { Tags, User, AlertCircle, Phone, Mail } from 'lucide-react';

const TAGS = ['MPR', 'Financement'] as const;
type Tag = typeof TAGS[number];

interface ContactStepProps {
  formData: {
    contact: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      secondaryEmail: string;
      secondaryPhone: string;
    };
    tag: Tag | null;
  };
  errors: Record<string, string>;
  onUpdate: (field: string, value: any) => void;
}

export function ContactStep({ formData, errors, onUpdate }: ContactStepProps) {
const phoneRegex = /^0\d{9}$/;
const nameRegex = /^[A-Za-zÀ-ÿ\s\-']+$/;

  return (
    <div className="space-y-6">
      {/* Étiquettes */}
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Tags className="w-4 h-4 mr-2" />
          Étiquette
        </h3>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onUpdate('tag', formData.tag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                formData.tag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-accent/50 rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <User className="w-4 h-4 mr-2" />
          Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Nom *
            </label>
            <input
  type="text"
  value={formData.contact.lastName}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '' || nameRegex.test(value)) {
      onUpdate('contact.lastName', value);
    }
  }}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nom"
            />
            {errors['contact.lastName'] && (
              <div className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['contact.lastName']}
              </div>
            )}
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Prénom *
            </label>
            <input
  type="text"
  value={formData.contact.firstName}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '' || nameRegex.test(value)) {
      onUpdate('contact.firstName', value);
    }
  }}
              className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Prénom"
            />
            {errors['contact.firstName'] && (
              <div className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['contact.firstName']}
              </div>
            )}
          </div>

          {/* Téléphone principal */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Téléphone principal *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
  type="tel"
  value={formData.contact.phone}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      onUpdate('contact.phone', value);
    }
  }}
                className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+33 1 23 45 67 89"
              />

            </div>
            {formData.contact.phone && !phoneRegex.test(formData.contact.phone) && (
  <div className="text-destructive text-sm mt-1 flex items-center">
    <AlertCircle className="w-4 h-4 mr-1" />
    Le numéro de téléphone n'est pas valide.
  </div>
)}
            {errors['contact.phone'] && (
              <div className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['contact.phone']}
              </div>
            )}
          </div>

          {/* Téléphone secondaire */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Téléphone secondaire
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
  type="tel"
  value={formData.contact.secondaryPhone}
  onChange={(e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      onUpdate('contact.secondaryPhone', value);
    }
  }}
                className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+33 1 23 45 67 89"
              />

            </div>
            {formData.contact.secondaryPhone && !phoneRegex.test(formData.contact.secondaryPhone) && (
  <div className="text-destructive text-sm mt-1 flex items-center">
    <AlertCircle className="w-4 h-4 mr-1" />
    Le numéro de téléphone n'est pas valide.
  </div>
)}     
          </div>

          {/* Email principal */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email principal *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => onUpdate('contact.email', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@example.com"
              />
            </div>
            {errors['contact.email'] && (
              <div className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['contact.email']}
              </div>
            )}
          </div>

          {/* Email secondaire */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Email secondaire
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={formData.contact.secondaryEmail}
                onChange={(e) => onUpdate('contact.secondaryEmail', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email2@example.com"
              />
            </div>
            {errors['contact.secondaryEmail'] && (
              <div className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['contact.secondaryEmail']}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}