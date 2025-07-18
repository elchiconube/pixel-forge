import React from 'react';
import { Heart, Zap } from 'lucide-react';
import type { Card } from '../types';
import { getRarityColor } from '../utils/gameUtils';

interface GameCardProps {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  inField?: boolean;
  showStats?: boolean;
  canBeTarget?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  card, 
  onClick, 
  disabled = false, 
  selected = false, 
  inField = false, 
  showStats = true, 
  canBeTarget = false 
}) => {
  const canAfford = card.pixels_cost <= (card.affordablePixels || 0);
  const isDamaged = card.currentHealth !== undefined && card.currentHealth < card.health;

  return (
    <div 
      className={`relative w-32 h-44 bg-gradient-to-br ${getRarityColor(card.rarity)} rounded-xl shadow-lg cursor-pointer transform transition-all duration-200 ${
        !disabled ? 'hover:scale-105 hover:shadow-xl' : 'opacity-60 cursor-not-allowed'
      } ${selected ? 'ring-4 ring-yellow-400 scale-105' : ''} ${
        inField ? 'border-2 border-green-400' : ''
      } ${!canAfford && !inField ? 'opacity-50' : ''} ${
        canBeTarget ? 'ring-2 ring-red-300' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Coste de píxeles */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
        {card.pixels_cost}
      </div>
      
      {/* Indicador de ataque disponible */}
      {card.canAttack && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg">
          ⚔️
        </div>
      )}
      
      {/* Contenido de la carta */}
      <div className="p-3 h-full flex flex-col text-white">
        <div className="flex-1 bg-black/20 rounded-lg p-2 mb-2">
          <h3 className="text-xs font-bold mb-1 truncate">{card.name}</h3>
          <p className="text-xs opacity-80 truncate">{card.title}</p>
          <p className="text-xs opacity-60 mt-1">{card.card_class}</p>
        </div>
        
        {showStats && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <Zap size={14} />
              <span>{card.strength}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={14} />
              <span className={isDamaged ? 'text-red-300 font-bold' : ''}>
                {card.currentHealth !== undefined ? card.currentHealth : card.health}
                {isDamaged && `/${card.health}`}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Tooltip con habilidad */}
      {card.ability_description && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-black/90 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-48">
          {card.ability_description}
        </div>
      )}
    </div>
  );
};

export default GameCard;
