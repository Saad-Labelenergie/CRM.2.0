import React from 'react';

interface StepIndicatorProps {
  currentStep: 'contact' | 'address' | 'products' | 'planning';
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'contact' ? 'bg-primary text-primary-foreground' : 'bg-accent'
          }`}>
            1
          </div>
          <div className={`h-1 w-16 ${
            currentStep === 'contact' ? 'bg-primary' : 'bg-accent'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'address' ? 'bg-primary text-primary-foreground' : 'bg-accent'
          }`}>
            2
          </div>
          <div className={`h-1 w-16 ${
            currentStep === 'address' ? 'bg-primary' : 'bg-accent'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'products' ? 'bg-primary text-primary-foreground' : 'bg-accent'
          }`}>
            3
          </div>
          <div className={`h-1 w-16 ${
            currentStep === 'products' || currentStep === 'planning' ? 'bg-primary' : 'bg-accent'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'planning' ? 'bg-primary text-primary-foreground' : 'bg-accent'
          }`}>
            4
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentStep === 'contact' && 'Informations de contact'}
          {currentStep === 'address' && 'Adresse'}
          {currentStep === 'products' && 'Sélection des produits'}
          {currentStep === 'planning' && 'Planification'}
        </div>
      </div>
    </div>
  );
}