import type { Card, Player } from '../types';
import { applyCardEffect } from '../utils/gameUtils';

// Ejecutar combate entre cartas
export const executeCombat = (
  attacker: Card,
  target: Card | null,
  playerData: Player,
  aiData: Player,
  isPlayerAttacker: boolean,
  updatePlayerData: (updatedPlayer: Player) => void,
  updateAIData: (updatedAI: Player) => void,
  addToLog: (message: string) => void
): void => {
  if (target) {
    // Combate entre cartas
    const attackerDamage = attacker.strength;
    const targetDamage = target.strength;
    
    const newAttackerHealth = Math.max(0, (attacker.currentHealth || attacker.health) - targetDamage);
    const newTargetHealth = Math.max(0, (target.currentHealth || target.health) - attackerDamage);

    addToLog(`${attacker.name} (${attacker.strength}) ataca a ${target.name} (${target.strength}).`);

    // Variables para cartas que mueren
    const attackerDied = newAttackerHealth <= 0;
    const targetDied = newTargetHealth <= 0;

    // Actualizar cartas y cementerio
    if (isPlayerAttacker) {
      // Actualizar jugador (atacante)
      const newPlayerData = { ...playerData };
      
      if (attackerDied) {
        // Atacante muere - va al cementerio
        newPlayerData.field = playerData.field.filter(c => c.uniqueId !== attacker.uniqueId);
        newPlayerData.graveyard = [...playerData.graveyard, { ...attacker, currentHealth: 0 }];
      } else {
        // Atacante sobrevive - actualizar salud
        newPlayerData.field = playerData.field.map(c => 
          c.uniqueId === attacker.uniqueId 
            ? { ...c, currentHealth: newAttackerHealth, canAttack: false, hasAttacked: true }
            : c
        );
      }
      
      updatePlayerData(newPlayerData);

      // Actualizar IA (defensor)
      const newAiData = { ...aiData };
      
      if (targetDied) {
        // Objetivo muere - va al cementerio
        newAiData.field = aiData.field.filter(c => c.uniqueId !== target.uniqueId);
        newAiData.graveyard = [...aiData.graveyard, { ...target, currentHealth: 0 }];
      } else {
        // Objetivo sobrevive - actualizar salud
        newAiData.field = aiData.field.map(c => 
          c.uniqueId === target.uniqueId 
            ? { ...c, currentHealth: newTargetHealth }
            : c
        );
      }
      
      updateAIData(newAiData);
    } else {
      // IA atacante, jugador defensor
      const newAiData = { ...aiData };
      
      if (attackerDied) {
        newAiData.field = aiData.field.filter(c => c.uniqueId !== attacker.uniqueId);
        newAiData.graveyard = [...aiData.graveyard, { ...attacker, currentHealth: 0 }];
      } else {
        newAiData.field = aiData.field.map(c => 
          c.uniqueId === attacker.uniqueId 
            ? { ...c, currentHealth: newAttackerHealth, canAttack: false, hasAttacked: true }
            : c
        );
      }
      
      updateAIData(newAiData);

      const newPlayerData = { ...playerData };
      
      if (targetDied) {
        newPlayerData.field = playerData.field.filter(c => c.uniqueId !== target.uniqueId);
        newPlayerData.graveyard = [...playerData.graveyard, { ...target, currentHealth: 0 }];
      } else {
        newPlayerData.field = playerData.field.map(c => 
          c.uniqueId === target.uniqueId 
            ? { ...c, currentHealth: newTargetHealth }
            : c
        );
      }
      
      updatePlayerData(newPlayerData);
    }

    // Mensajes de muerte y efectos
    if (targetDied) {
      addToLog(`${target.name} es destruido y va al cementerio.`);
      
      // Aplicar efectos de muerte
      setTimeout(() => {
        applyCardEffect(
          target, 
          'onDeath', 
          !isPlayerAttacker,
          playerData.field,
          aiData.field,
          (field, hand, graveyard, health) => {
            const updatedPlayer = { ...playerData };
            if (field) updatedPlayer.field = field;
            if (hand) updatedPlayer.hand = [...playerData.hand, ...hand];
            if (graveyard) updatedPlayer.graveyard = [...playerData.graveyard, ...graveyard];
            if (health) updatedPlayer.health = Math.max(0, playerData.health + health);
            updatePlayerData(updatedPlayer);
          },
          (field, hand, graveyard, health) => {
            const updatedAI = { ...aiData };
            if (field) updatedAI.field = field;
            if (hand) updatedAI.hand = [...aiData.hand, ...hand];
            if (graveyard) updatedAI.graveyard = [...aiData.graveyard, ...graveyard];
            if (health) updatedAI.health = Math.max(0, aiData.health + health);
            updateAIData(updatedAI);
          },
          addToLog
        );
      }, 500);
      
      if (!attackerDied) {
        setTimeout(() => {
          applyCardEffect(
            attacker, 
            'onKill', 
            isPlayerAttacker,
            playerData.field,
            aiData.field,
            (field, hand, graveyard, health) => {
              const updatedPlayer = { ...playerData };
              if (field) updatedPlayer.field = field;
              if (hand) updatedPlayer.hand = [...playerData.hand, ...hand];
              if (graveyard) updatedPlayer.graveyard = [...playerData.graveyard, ...graveyard];
              if (health) updatedPlayer.health = Math.max(0, playerData.health + health);
              updatePlayerData(updatedPlayer);
            },
            (field, hand, graveyard, health) => {
              const updatedAI = { ...aiData };
              if (field) updatedAI.field = field;
              if (hand) updatedAI.hand = [...aiData.hand, ...hand];
              if (graveyard) updatedAI.graveyard = [...aiData.graveyard, ...graveyard];
              if (health) updatedAI.health = Math.max(0, aiData.health + health);
              updateAIData(updatedAI);
            },
            addToLog
          );
        }, 700);
      }
    }
    
    if (attackerDied) {
      addToLog(`${attacker.name} es destruido y va al cementerio.`);
      
      setTimeout(() => {
        applyCardEffect(
          attacker, 
          'onDeath', 
          isPlayerAttacker,
          playerData.field,
          aiData.field,
          (field, hand, graveyard, health) => {
            const updatedPlayer = { ...playerData };
            if (field) updatedPlayer.field = field;
            if (hand) updatedPlayer.hand = [...playerData.hand, ...hand];
            if (graveyard) updatedPlayer.graveyard = [...playerData.graveyard, ...graveyard];
            if (health) updatedPlayer.health = Math.max(0, playerData.health + health);
            updatePlayerData(updatedPlayer);
          },
          (field, hand, graveyard, health) => {
            const updatedAI = { ...aiData };
            if (field) updatedAI.field = field;
            if (hand) updatedAI.hand = [...aiData.hand, ...hand];
            if (graveyard) updatedAI.graveyard = [...aiData.graveyard, ...graveyard];
            if (health) updatedAI.health = Math.max(0, aiData.health + health);
            updateAIData(updatedAI);
          },
          addToLog
        );
      }, 500);
    }
  } else {
    // Ataque directo
    const damage = attacker.strength;
    
    if (isPlayerAttacker) {
      const newAiData = { ...aiData, health: aiData.health - damage };
      updateAIData(newAiData);
      
      const newPlayerData = {
        ...playerData,
        field: playerData.field.map(c => 
          c.uniqueId === attacker.uniqueId 
            ? { ...c, canAttack: false, hasAttacked: true }
            : c
        )
      };
      updatePlayerData(newPlayerData);
      
      addToLog(`${attacker.name} ataca directamente a la IA por ${damage} de daño.`);
    } else {
      const newPlayerData = { ...playerData, health: playerData.health - damage };
      updatePlayerData(newPlayerData);
      
      const newAiData = {
        ...aiData,
        field: aiData.field.map(c => 
          c.uniqueId === attacker.uniqueId 
            ? { ...c, canAttack: false, hasAttacked: true }
            : c
        )
      };
      updateAIData(newAiData);
      
      addToLog(`${attacker.name} ataca directamente al jugador por ${damage} de daño.`);
    }
  }
};
