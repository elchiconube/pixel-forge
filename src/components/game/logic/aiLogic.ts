import type { Player, Card } from '../types';
import { executeCombat } from './combatLogic';

// Procesar turno de IA
export const processAITurn = (
  aiData: Player,
  updateAIData: (updatedAI: Player) => void,
  addToLog: (message: string) => void,
  executeAIActions: () => void
): void => {
  const newMaxPixels = Math.min(aiData.maxPixels + 1, 10);
  
  const updatedAI = {
    ...aiData,
    pixels: newMaxPixels, // RECARGAR píxeles al máximo para el nuevo turno
    maxPixels: newMaxPixels,
    field: aiData.field.map(c => ({ ...c, canAttack: true, hasAttacked: false }))
  };

  if (updatedAI.deck.length > 0) {
    const drawnCard = updatedAI.deck[0];
    updatedAI.hand = [...updatedAI.hand, drawnCard];
    updatedAI.deck = updatedAI.deck.slice(1);
    addToLog('La IA roba una carta.');
  }

  updateAIData(updatedAI);
  addToLog(`Turno de la IA. (${newMaxPixels} píxeles disponibles)`);
};

// Ejecutar acciones de IA
export const executeAIActions = (
  aiData: Player,
  playerData: Player,
  updateAIData: (updatedAI: Player) => void,
  updatePlayerData: (updatedPlayer: Player) => void,
  addToLog: (message: string) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  setTurnCount: (turnCount: number) => void,
  turnCount: number,
  setAiProcessing: (processing: boolean) => void
): void => {
  // Jugar carta si puede
  const playableCards = aiData.hand.filter(card => card.pixels_cost <= aiData.pixels);
  
  if (playableCards.length > 0) {
    // Estrategia simple: jugar la carta más costosa que pueda permitirse
    const cardToPlay = playableCards.reduce((best, card) => 
      card.pixels_cost > best.pixels_cost ? card : best
    );
    
    const updatedAI = {
      ...aiData,
      hand: aiData.hand.filter(c => c.uniqueId !== cardToPlay.uniqueId),
      field: [...aiData.field, { ...cardToPlay, canAttack: false, hasAttacked: false }],
      pixels: aiData.pixels - cardToPlay.pixels_cost
    };
    
    updateAIData(updatedAI);
    addToLog(`La IA juega ${cardToPlay.name} (${cardToPlay.pixels_cost} píxeles). Le quedan ${aiData.pixels - cardToPlay.pixels_cost} píxeles.`);
  }

  // Atacar si puede
  setTimeout(() => {
    const attackableCards = aiData.field.filter(c => c.canAttack && !c.hasAttacked);
    
    if (attackableCards.length > 0) {
      const attacker = attackableCards[0];
      
      if (playerData.field.length > 0) {
        // Estrategia simple: atacar a la carta más débil
        const target = playerData.field.reduce((weakest, card) => {
          const weakestHealth = weakest.currentHealth || weakest.health;
          const cardHealth = card.currentHealth || card.health;
          return cardHealth < weakestHealth ? card : weakest;
        });
        
        executeCombat(
          attacker,
          target,
          playerData,
          aiData,
          false, // IA es el atacante
          updatePlayerData,
          updateAIData,
          addToLog
        );
      } else {
        // Ataque directo al jugador
        executeCombat(
          attacker,
          null,
          playerData,
          aiData,
          false, // IA es el atacante
          updatePlayerData,
          updateAIData,
          addToLog
        );
      }
    }
    
    // Terminar turno después de un tiempo
    setTimeout(() => {
      // Llamar a endAITurn directamente con los parámetros disponibles
      endAITurn(
        playerData,
        updatePlayerData,
        setIsPlayerTurn,
        setTurnCount,
        turnCount,
        setAiProcessing,
        addToLog
      );
    }, 1500);
  }, 1000);
};



// Terminar turno de IA
export const endAITurn = (
  playerData: Player,
  updatePlayerData: (updatedPlayer: Player) => void,
  setIsPlayerTurn: (isPlayerTurn: boolean) => void,
  setTurnCount: (turnCount: number) => void,
  turnCount: number,
  setAiProcessing: (processing: boolean) => void,
  addToLog: (message: string) => void
): void => {
  const newMaxPixels = Math.min(playerData.maxPixels + 1, 10);
  
  const updatedPlayer = {
    ...playerData,
    pixels: playerData.pixels + 1, // Incrementar píxeles en 1
    maxPixels: newMaxPixels,
    field: playerData.field.map(c => ({ ...c, canAttack: true, hasAttacked: false }))
  };

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
};
