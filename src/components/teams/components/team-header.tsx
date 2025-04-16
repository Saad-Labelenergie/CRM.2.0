import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, PenSquare, Palette, Check, X, Copy } from 'lucide-react';
import { EditNameModal } from './edit-name-modal';
import * as Popover from '@radix-ui/react-popover';

interface TeamHeaderProps {
  teamId: string; // 👈 ajoute ceci
  teamName: string;
  teamColor: string;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
}


const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function TeamHeader({ teamId,teamName, teamColor, onNameChange, onColorChange }: TeamHeaderProps) {
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [colorInput, setColorInput] = useState(teamColor);
  const [isEyeDropperSupported, setIsEyeDropperSupported] = useState(
    typeof window !== 'undefined' && 'EyeDropper' in window
  );

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorInput(value);
    
    // Validate if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onColorChange(value);
    }
  };

  const handleEyeDropper = async () => {
    try {
      // @ts-ignore - EyeDropper is not in the TypeScript DOM lib yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      setColorInput(result.sRGBHex);
      onColorChange(result.sRGBHex);
    } catch (e) {
      console.error('Error using eyedropper:', e);
    }
  };

  const copyColorToClipboard = () => {
    navigator.clipboard.writeText(teamColor);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold text-primary">{teamName}</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsNameModalOpen(true)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            <PenSquare className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>
        <div className="flex items-center mt-1">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="ml-1 text-lg font-semibold">4.8</span>
          </div>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-sm font-medium">
            Actif
          </span>
          <span className="mx-2 text-muted-foreground">•</span>
          <Popover.Root>
            <Popover.Trigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-accent"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-border/50"
                  style={{ backgroundColor: teamColor }}
                />
                <Palette className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-card rounded-lg shadow-lg border border-border/50 p-4 w-64"
                sideOffset={5}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Code hexadécimal
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={colorInput}
                          onChange={handleColorInputChange}
                          className="w-full pl-8 pr-3 py-1.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="#000000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                        <div 
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border/50"
                          style={{ backgroundColor: colorInput }}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyColorToClipboard}
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                      {isEyeDropperSupported && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleEyeDropper}
                          className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                          title="Pipette"
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-muted-foreground"
                          >
                            <path d="m2 22 1-1h3l9-9" />
                            <path d="M3 21v-3l9-9" />
                            <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z" />
                            <path d="M15 9 9 15" />
                          </svg>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Couleurs prédéfinies
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setColorInput(color);
                            onColorChange(color);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary relative group"
                          style={{ backgroundColor: color }}
                        >
                          {color === teamColor && (
                            <Check className="w-4 h-4 text-white absolute" />
                          )}
                          <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      <EditNameModal
  isOpen={isNameModalOpen}
  onClose={() => setIsNameModalOpen(false)}
  currentName={teamName}
  teamId={teamId}
  onSave={(updated) => {
    onNameChange(updated.name);
  }}
/>
    </div>
  );
}