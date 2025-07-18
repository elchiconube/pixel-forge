import type { Card } from '../types';
import cardsData from '../../../data/cards.json';

// Función para generar ID único
export const generateUniqueId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Función para crear un mazo aleatorio sin repeticiones
export const createRandomDeck = (size = 8): Card[] => {
  if (size > cardsData.length) {
    size = cardsData.length;
  }

  const availableCards = [...cardsData];
  const deck = [];
  
  while (deck.length < size && availableCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];
    
    deck.push({
      ...selectedCard,
      currentHealth: selectedCard.health,
      canAttack: false,
      hasAttacked: false,
      uniqueId: generateUniqueId()
    });
    
    availableCards.splice(randomIndex, 1);
  }
  
  return shuffleDeck(deck);
};

// Función para barajar
export const shuffleDeck = (deck: Card[]): Card[] => {
  return [...deck].sort(() => Math.random() - 0.5);
};

// Función para obtener el color según la rareza
export const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'legendaria': return 'from-yellow-500 to-orange-500';
    case 'épica': return 'from-purple-500 to-pink-500';
    case 'rara': return 'from-blue-500 to-cyan-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

// Función para aplicar efectos especiales de cartas
export const applyCardEffect = (
  card: Card, 
  effectType: 'onDeath' | 'onKill', 
  isPlayerCard: boolean,
  playerField: Card[],
  aiField: Card[],
  updatePlayerData: (field: Card[], hand?: Card[], graveyard?: Card[], health?: number) => void,
  updateAIData: (field: Card[], hand?: Card[], graveyard?: Card[], health?: number) => void,
  addToLog: (message: string) => void
): void => {
  // Efectos especiales simples
  if (effectType === 'onDeath' && card.id === 'link-001') {
    // Link vuelve a la mano
    if (isPlayerCard) {
      updatePlayerData(playerField, [...(card.currentHealth ? [{ ...card, currentHealth: card.health }] : [])]);
      addToLog(`${card.name} vuelve a tu mano gracias a "¡Despierta Link!"`);
    } else {
      updateAIData(aiField, [...(card.currentHealth ? [{ ...card, currentHealth: card.health }] : [])]);
      addToLog(`${card.name} de la IA vuelve a su mano.`);
    }
  }
  
  if (effectType === 'onDeath' && card.id === 'ori-017') {
    // Ori destruye una carta enemiga
    if (isPlayerCard && aiField.length > 0) {
      const target = aiField[0];
      const newAiField = aiField.filter(c => c.uniqueId !== target.uniqueId);
      updateAIData(newAiField, undefined, [target]);
      addToLog(`¡Estallido de luz! ${card.name} destruye a ${target.name} al morir.`);
    } else if (!isPlayerCard && playerField.length > 0) {
      const target = playerField[0];
      const newPlayerField = playerField.filter(c => c.uniqueId !== target.uniqueId);
      updatePlayerData(newPlayerField, undefined, [target]);
      addToLog(`¡Estallido de luz! ${card.name} destruye a ${target.name} al morir.`);
    }
  }

  if (effectType === 'onKill' && card.id === 'joel-008') {
    // Joel hace daño extra
    if (isPlayerCard) {
      updateAIData(aiField, undefined, undefined, -2);
      addToLog(`${card.name} inflige 2 de daño adicional a la IA. "Lo haría de nuevo"`);
    } else {
      updatePlayerData(playerField, undefined, undefined, -2);
      addToLog(`${card.name} inflige 2 de daño adicional al jugador.`);
    }
  }
};
