import type { Player } from '../types';
import { createRandomDeck } from '../utils/gameUtils';

// Inicializar juego
export const initializeGame = (): { player: Player; ai: Player } => {
  const playerDeck = createRandomDeck();
  const aiDeck = createRandomDeck();

  const player = {
    id: 'player',
    name: 'Jugador',
    hand: playerDeck.splice(0, 3),
    field: [],
    deck: playerDeck,
    graveyard: [],
    health: 20,
    pixels: 1,
    maxPixels: 1,
    score: 0
  };

  const ai = {
    id: 'ai',
    name: 'IA',
    hand: aiDeck.splice(0, 3),
    field: [],
    deck: aiDeck,
    graveyard: [],
    health: 20,
    pixels: 1,
    maxPixels: 1,
    score: 0
  };

  return { player, ai };
};
