import type { Card, Player } from '../types';

// Jugar una carta
export const playCard = (
  cardToPlay: Card,
  playerData: Player,
  updatePlayerData: (updatedPlayer: Player) => void,
  addToLog: (message: string) => void
): void => {
  if (playerData.pixels < cardToPlay.pixels_cost) {
    addToLog('No tienes suficientes píxeles para jugar esta carta.');
    return;
  }

  const newPixels = playerData.pixels - cardToPlay.pixels_cost;
  
  const updatedPlayer = {
    ...playerData,
    hand: playerData.hand.filter(c => c.uniqueId !== cardToPlay.uniqueId),
    field: [...playerData.field, { ...cardToPlay, canAttack: false, hasAttacked: false }],
    pixels: newPixels
  };

  updatePlayerData(updatedPlayer);
  addToLog(`Has jugado ${cardToPlay.name} (${cardToPlay.pixels_cost} píxeles). Te quedan ${newPixels} píxeles.`);
};

// Iniciar combate
export const startCombat = (
  attackerCard: Card,
  setSelectedCard: (card: Card | null) => void,
  setCombatPhase: (phase: 'none' | 'select-target') => void,
  addToLog: (message: string) => void
): void => {
  setSelectedCard(attackerCard);
  setCombatPhase('select-target');
  addToLog(`${attackerCard.name} está listo para atacar. Selecciona un objetivo.`);
};

// Terminar turno del jugador
export const endPlayerTurn = (
  playerData: Player,
  aiData: Player,
  updatePlayerData: (updatedPlayer: Player) => void,
  updateAIData: (updatedAI: Player) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  setAiProcessing: (processing: boolean) => void,
  addToLog: (message: string) => void,
  setTurnCount: (turnCount: number) => void,
  turnCount: number
): void => {
  // 1. Cambiar el estado a turno de la IA
  setIsPlayerTurn(false);
  setAiProcessing(true);
  addToLog('Terminas tu turno.');
  
  // 2. Procesar el turno de la IA (incrementar píxeles, robar carta)
  setTimeout(() => {
    // Incrementar píxeles de la IA
    const newMaxPixels = Math.min(aiData.maxPixels + 1, 10);
    
    const updatedAI = {
      ...aiData,
      pixels: newMaxPixels, // RECARGAR píxeles al máximo para el nuevo turno
      maxPixels: newMaxPixels,
      field: aiData.field.map(c => ({ ...c, canAttack: true, hasAttacked: false }))
    };

    // Robar carta para la IA
    if (updatedAI.deck.length > 0) {
      const drawnCard = updatedAI.deck[0];
      updatedAI.hand = [...updatedAI.hand, drawnCard];
      updatedAI.deck = updatedAI.deck.slice(1);
      addToLog('La IA roba una carta.');
    }

    updateAIData(updatedAI);
    addToLog(`Turno de la IA. (${newMaxPixels} píxeles disponibles)`);
    
    // 3. Ejecutar acciones de la IA (jugar cartas, atacar)
    setTimeout(() => {
      // Jugar carta si puede
      const playableCards = updatedAI.hand.filter(card => card.pixels_cost <= updatedAI.pixels);
      
      if (playableCards.length > 0) {
        // Estrategia simple: jugar la carta más costosa que pueda permitirse
        const cardToPlay = playableCards.reduce((best, card) => 
          card.pixels_cost > best.pixels_cost ? card : best, playableCards[0]
        );
        
        const aiAfterPlay = {
          ...updatedAI,
          hand: updatedAI.hand.filter(c => c.uniqueId !== cardToPlay.uniqueId),
          field: [...updatedAI.field, { ...cardToPlay, canAttack: false, hasAttacked: false }],
          pixels: updatedAI.pixels - cardToPlay.pixels_cost
        };
        
        updateAIData(aiAfterPlay);
        addToLog(`La IA juega ${cardToPlay.name} (${cardToPlay.pixels_cost} píxeles). Le quedan ${aiAfterPlay.pixels} píxeles.`);
        
        // Usar aiAfterPlay para los siguientes pasos en lugar de updatedAI
      }

      // 4. Finalizar el turno de la IA y comenzar el turno del jugador
      setTimeout(() => {
        // Incrementar píxeles del jugador
        const newPlayerMaxPixels = Math.min(playerData.maxPixels + 1, 10);
        
        const updatedPlayer = {
          ...playerData,
          pixels: playerData.pixels + 1, // Incrementar píxeles en 1
          maxPixels: newPlayerMaxPixels,
          field: playerData.field.map(c => ({ ...c, canAttack: true, hasAttacked: false }))
        };

        // Robar carta para el jugador
        if (updatedPlayer.deck.length > 0) {
          const drawnCard = updatedPlayer.deck[0];
          updatedPlayer.hand = [...updatedPlayer.hand, drawnCard];
          updatedPlayer.deck = updatedPlayer.deck.slice(1);
          addToLog('Robas una carta.');
        }

        updatePlayerData(updatedPlayer);
        setIsPlayerTurn(true);
        setTurnCount(turnCount + 1);
        setAiProcessing(false);
        addToLog(`Turno ${turnCount + 1} - Tu turno. (${updatedPlayer.pixels} píxeles disponibles)`);
      }, 1500);
    }, 1000);
  }, 1000);
};
