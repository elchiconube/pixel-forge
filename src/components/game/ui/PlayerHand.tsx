import React from 'react';
import type { Card } from '../types';
import GameCard from './GameCard';

interface PlayerHandProps {
  cards: Card[];
  playerPixels: number;
  isPlayerTurn: boolean;
  combatPhase: 'none' | 'select-target';
  aiProcessing: boolean;
  onPlayCard: (card: Card) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  playerPixels,
  isPlayerTurn,
  combatPhase,
  aiProcessing,
  onPlayCard
}) => {
  return (
    <div className="bg-black/20 rounded-xl p-4 mb-4">
      <h3 className="text-white font-bold mb-2">Tu Mano</h3>
      <div className="flex gap-2 justify-center overflow-x-auto">
        {cards.map((card) => (
          <GameCard
            key={card.uniqueId}
            card={{
              ...card,
              affordablePixels: playerPixels
            }}
            onClick={() => onPlayCard(card)}
            disabled={!isPlayerTurn || playerPixels < card.pixels_cost || combatPhase !== 'none' || aiProcessing}
          />
        ))}
        {cards.length === 0 && (
          <div className="text-gray-400 text-lg py-8">No tienes cartas en la mano</div>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
