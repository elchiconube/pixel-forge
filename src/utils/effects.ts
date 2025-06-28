// Definir tipos para las cartas y el estado del juego
export type CardType = {
  id: string;
  name: string;
  title: string;
  card_class?: string;
  strength: number;
  health: number;
  ability?: string;
  ability_description?: string;
  image: string;
  pixels_cost?: number;
};

export type GameStateType = {
  player: {
    hand: CardType[];
    deck: CardType[];
    field?: CardType[];
    graveyard?: CardType[];
    health: number;
  };
  ai: {
    hand: CardType[];
    deck: CardType[];
    field?: CardType[];
    graveyard?: CardType[];
    health: number;
  };
  currentTurn?: 'player' | 'ai' | 'end';
  gameLog?: string[];
};

// Definir el tipo para los efectos de habilidades
export type AbilityEffectsType = {
  [key: string]: {
    onDeath?: (card: CardType, gameState: GameStateType) => void;
    onPlay?: (card: CardType, gameState: GameStateType) => void;
    onChallengeMaster?: (card: CardType, gameState: GameStateType) => void;
  };
};

// Implementar los efectos de las habilidades
export const abilityEffects: AbilityEffectsType = {
  "link-001": {
    // Triggered when the card is defeated
    onDeath: (card, gameState) => {
      gameState.player.hand.push({ ...card });
      if (gameState.gameLog) {
        gameState.gameLog.push(`${card.name} vuelve a tu mano al ser derrotado.`);
      }
    },
    // Example placeholder: could be used if card is played
    onPlay: (card, gameState) => {
      // Optional: no effect on play for Link
      if (gameState.gameLog) {
        gameState.gameLog.push(`${card.name} no tiene efecto al ser jugado.`);
      }
    }
  },

  "luigi-002": {
    // Triggered when Luigi challenges a Pixel Master
    onChallengeMaster: (card, gameState) => {
      gameState.player.deck.push(card); // Assume you manage a deck array
      shuffle(gameState.player.deck);
      const drawn = gameState.player.deck.splice(0, 3);
      gameState.player.hand.push(...drawn);
      if (gameState.gameLog) {
        gameState.gameLog.push("Luigi se baraja y robas 3 cartas.");
      }
    },
    onPlay: (card, gameState) => {
      // Implementación simple: siempre activar la habilidad de Luigi
      if (gameState.player.deck.length >= 3) {
        // Devolver la carta al mazo
        gameState.player.deck.push({ ...card });
        
        // Barajar el mazo
        shuffle(gameState.player.deck);
        
        // Robar 3 cartas
        const drawn = gameState.player.deck.splice(0, 3);
        gameState.player.hand.push(...drawn);
        
        if (gameState.gameLog) {
          gameState.gameLog.push(`${card.name} se baraja en tu mazo y robas 3 cartas.`);
        }
      } else if (gameState.gameLog) {
        gameState.gameLog.push(`No hay suficientes cartas en el mazo para activar la habilidad de ${card.name}.`);
      }
    }
  }
};

// Utility to shuffle a deck
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}