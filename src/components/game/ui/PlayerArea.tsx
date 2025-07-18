import React from 'react';
import { Heart, Shield } from 'lucide-react';
import type { Player, Card } from '../types';
import GameCard from './GameCard';

interface PlayerAreaProps {
  player: Player;
  isPlayerTurn: boolean;
  combatPhase: 'none' | 'select-target';
  aiProcessing: boolean;
  selectedCard: Card | null;
  onCardClick: (card: Card) => void;
  isPlayer: boolean;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({
  player,
  isPlayerTurn,
  combatPhase,
  aiProcessing,
  selectedCard,
  onCardClick,
  isPlayer
}) => {
  return (
    <div className="bg-black/20 rounded-xl p-4 mb-4">
      {!isPlayer && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <div className="flex items-center gap-2 text-white">
              <Heart className="text-red-400" size={20} />
              <span className="font-bold">{player.health}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Shield className="text-blue-400" size={20} />
              <span>{player.pixels}/{player.maxPixels}</span>
              {player.pixels < player.maxPixels && (
                <span className="text-xs text-gray-400">({player.maxPixels - player.pixels} gastados)</span>
              )}
            </div>
            <div className="text-gray-300">
              Mano: {player.hand.length} | Mazo: {player.deck.length} | Cementerio: {player.graveyard.length}
            </div>
          </div>
        </div>
      )}
      
      {/* Campo de cartas */}
      <div className="flex gap-2 justify-center min-h-48 items-center">
        {player.field.length > 0 ? (
          player.field.map((card) => (
            <GameCard
              key={card.uniqueId}
              card={card}
              onClick={() => onCardClick(card)}
              inField={true}
              disabled={
                isPlayer 
                  ? !isPlayerTurn || !card.canAttack || card.hasAttacked || combatPhase !== 'none' || aiProcessing
                  : combatPhase !== 'select-target'
              }
              selected={selectedCard?.uniqueId === card.uniqueId}
              canBeTarget={!isPlayer && combatPhase === 'select-target'}
            />
          ))
        ) : (
          <div 
            className="text-gray-400 text-lg cursor-pointer hover:text-gray-300"
            onClick={() => {
              if (!isPlayer && combatPhase === 'select-target') {
                onCardClick(null as any); // Para ataque directo
              }
            }}
          >
            {!isPlayer && combatPhase === 'select-target' 
              ? 'Clic aquí para ataque directo' 
              : isPlayer ? 'Tu campo está vacío' : 'Campo vacío'}
          </div>
        )}
      </div>
      
      {/* Información del jugador (solo para el jugador) */}
      {isPlayer && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <div className="flex items-center gap-2 text-white">
              <Heart className="text-red-400" size={20} />
              <span className="font-bold">{player.health}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Shield className="text-blue-400" size={20} />
              <span>{player.pixels}/{player.maxPixels}</span>
              {player.pixels < player.maxPixels && (
                <span className="text-xs text-gray-400">({player.maxPixels - player.pixels} gastados)</span>
              )}
            </div>
            <div className="text-gray-300">
              Mano: {player.hand.length} | Mazo: {player.deck.length} | Cementerio: {player.graveyard.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerArea;
