import React, { useState } from 'react';
import Card from './Card';
import type { CardType } from '../utils/effects';

interface CardCombatProps {
  playerCards: CardType[];
  aiCards: CardType[];
  onCombatEnd: (playerCards: CardType[], aiCards: CardType[], log: string[]) => void;
}

// Componente para manejar el combate entre cartas
const CardCombat: React.FC<CardCombatProps> = ({ playerCards, aiCards, onCombatEnd }) => {
  // Estado para rastrear la salud actual de cada carta
  const [cardHealth, setCardHealth] = useState<Record<string, number>>(() => {
    const initialHealth: Record<string, number> = {};
    
    // Inicializar la salud de las cartas del jugador
    playerCards.forEach(card => {
      initialHealth[`player-${card.id}`] = card.health;
    });
    
    // Inicializar la salud de las cartas de la IA
    aiCards.forEach(card => {
      initialHealth[`ai-${card.id}`] = card.health;
    });
    
    return initialHealth;
  });
  
  // Estado para rastrear qué carta está seleccionada para atacar
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  
  // Estado para rastrear qué cartas pueden atacar este turno
  const [canAttack, setCanAttack] = useState<Record<string, boolean>>(() => {
    const initialCanAttack: Record<string, boolean> = {};
    
    // Todas las cartas del jugador pueden atacar inicialmente
    playerCards.forEach(card => {
      initialCanAttack[`player-${card.id}`] = true;
    });
    
    return initialCanAttack;
  });
  
  // Estado para el log de combate
  const [combatLog, setCombatLog] = useState<string[]>(['¡Comienza el combate!']);
  
  // Función para seleccionar una carta para atacar
  const selectCardToAttack = (cardId: string) => {
    // Solo se pueden seleccionar cartas del jugador que puedan atacar
    if (cardId.startsWith('player-') && canAttack[cardId]) {
      setSelectedCard(cardId);
      addToCombatLog(`Has seleccionado ${getCardById(cardId)?.name} para atacar.`);
    }
  };
  
  // Función para atacar a una carta enemiga
  const attackCard = (targetCardId: string) => {
    if (!selectedCard || !targetCardId.startsWith('ai-')) return;
    
    const attackingCard = getCardById(selectedCard);
    const targetCard = getCardById(targetCardId);
    
    if (!attackingCard || !targetCard) return;
    
    // Calcular el daño
    const attackerHealth = cardHealth[selectedCard];
    const targetHealth = cardHealth[targetCardId];
    
    // Aplicar daño a la carta objetivo
    const newTargetHealth = Math.max(0, targetHealth - attackingCard.strength);
    setCardHealth(prev => ({ ...prev, [targetCardId]: newTargetHealth }));
    
    // La carta atacante también recibe daño
    const newAttackerHealth = Math.max(0, attackerHealth - targetCard.strength);
    setCardHealth(prev => ({ ...prev, [selectedCard]: newAttackerHealth }));
    
    // Marcar la carta como que ya ha atacado este turno
    setCanAttack(prev => ({ ...prev, [selectedCard]: false }));
    
    // Añadir al log
    addToCombatLog(`${attackingCard.name} ataca a ${targetCard.name}.`);
    addToCombatLog(`${attackingCard.name} causa ${attackingCard.strength} de daño a ${targetCard.name}.`);
    addToCombatLog(`${targetCard.name} contraataca y causa ${targetCard.strength} de daño a ${attackingCard.name}.`);
    
    if (newTargetHealth <= 0) {
      addToCombatLog(`¡${targetCard.name} ha sido destruido!`);
    }
    
    if (newAttackerHealth <= 0) {
      addToCombatLog(`¡${attackingCard.name} ha sido destruido!`);
    }
    
    // Limpiar la selección
    setSelectedCard(null);
    
    // Comprobar si el combate ha terminado
    checkCombatEnd();
  };
  
  // Función para obtener una carta por su ID
  const getCardById = (cardId: string): CardType | undefined => {
    const [owner, ...rest] = cardId.split('-');
    const cardIdWithoutOwner = rest.join('-');
    
    if (owner === 'player') {
      return playerCards.find(card => card.id === cardIdWithoutOwner);
    } else {
      return aiCards.find(card => card.id === cardIdWithoutOwner);
    }
  };
  
  // Función para añadir un mensaje al log de combate
  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev, message]);
  };
  
  // Función para terminar el turno
  const endTurn = () => {
    // Resetear qué cartas pueden atacar
    const newCanAttack: Record<string, boolean> = {};
    playerCards.forEach(card => {
      const cardId = `player-${card.id}`;
      // Solo resetear si la carta sigue viva
      if (cardHealth[cardId] > 0) {
        newCanAttack[cardId] = true;
      }
    });
    
    setCanAttack(newCanAttack);
    addToCombatLog('Termina tu turno. Todas tus cartas pueden atacar de nuevo.');
    
    // La IA ataca automáticamente
    aiAttack();
  };
  
  // Función para que la IA ataque
  const aiAttack = () => {
    addToCombatLog('La IA comienza su turno de ataque.');
    
    // Filtrar cartas vivas
    const liveAiCards = aiCards.filter(card => cardHealth[`ai-${card.id}`] > 0);
    const livePlayerCards = playerCards.filter(card => cardHealth[`player-${card.id}`] > 0);
    
    if (liveAiCards.length === 0 || livePlayerCards.length === 0) {
      checkCombatEnd();
      return;
    }
    
    // La IA ataca con cada carta
    liveAiCards.forEach(aiCard => {
      // Seleccionar una carta del jugador al azar para atacar
      const randomIndex = Math.floor(Math.random() * livePlayerCards.length);
      const targetCard = livePlayerCards[randomIndex];
      
      const aiCardId = `ai-${aiCard.id}`;
      const targetCardId = `player-${targetCard.id}`;
      
      // Calcular el daño
      const attackerHealth = cardHealth[aiCardId];
      const targetHealth = cardHealth[targetCardId];
      
      // Aplicar daño a la carta objetivo
      const newTargetHealth = Math.max(0, targetHealth - aiCard.strength);
      setCardHealth(prev => ({ ...prev, [targetCardId]: newTargetHealth }));
      
      // La carta atacante también recibe daño
      const newAttackerHealth = Math.max(0, attackerHealth - targetCard.strength);
      setCardHealth(prev => ({ ...prev, [aiCardId]: newAttackerHealth }));
      
      // Añadir al log
      addToCombatLog(`La IA ataca con ${aiCard.name} a ${targetCard.name}.`);
      addToCombatLog(`${aiCard.name} causa ${aiCard.strength} de daño a ${targetCard.name}.`);
      addToCombatLog(`${targetCard.name} contraataca y causa ${targetCard.strength} de daño a ${aiCard.name}.`);
      
      if (newTargetHealth <= 0) {
        addToCombatLog(`¡${targetCard.name} ha sido destruido!`);
        // Eliminar la carta destruida de la lista de cartas vivas
        const index = livePlayerCards.findIndex(c => c.id === targetCard.id);
        if (index !== -1) {
          livePlayerCards.splice(index, 1);
        }
      }
      
      if (newAttackerHealth <= 0) {
        addToCombatLog(`¡${aiCard.name} ha sido destruido!`);
      }
    });
    
    // Comprobar si el combate ha terminado
    checkCombatEnd();
  };
  
  // Función para comprobar si el combate ha terminado
  const checkCombatEnd = () => {
    // Filtrar cartas vivas
    const livePlayerCards = playerCards.filter(card => cardHealth[`player-${card.id}`] > 0);
    const liveAiCards = aiCards.filter(card => cardHealth[`ai-${card.id}`] > 0);
    
    if (livePlayerCards.length === 0 || liveAiCards.length === 0) {
      // El combate ha terminado
      if (livePlayerCards.length === 0 && liveAiCards.length === 0) {
        addToCombatLog('¡El combate ha terminado en empate!');
      } else if (livePlayerCards.length === 0) {
        addToCombatLog('¡Has perdido el combate!');
      } else {
        addToCombatLog('¡Has ganado el combate!');
      }
      
      // Notificar al componente padre
      onCombatEnd(livePlayerCards, liveAiCards, combatLog);
    }
  };
  
  // Renderizar las cartas con su salud actual
  return (
    <div className="card-combat">
      <div className="combat-log bg-gray-800 text-white p-4 rounded-lg mb-4 max-h-40 overflow-y-auto">
        <h3 className="text-xl font-bold mb-2">Log de Combate</h3>
        <ul>
          {combatLog.map((log, index) => (
            <li key={`combat-log-${index}-${log.substring(0, 10).replace(/\s+/g, '-')}`} className="mb-1">{log}</li>
          ))}
        </ul>
      </div>
      
      <div className="player-field mb-4">
        <h3 className="text-xl font-bold mb-2">Tu Campo</h3>
        <div className="flex gap-2 flex-wrap">
          {playerCards.map(card => {
            const cardId = `player-${card.id}`;
            const isAlive = cardHealth[cardId] > 0;
            
            if (!isAlive) return null;
            
            return (
              <button 
                key={cardId} 
                onClick={() => selectCardToAttack(cardId)}
                className="bg-transparent border-0 p-0 m-0"
                disabled={!canAttack[cardId]}
                aria-label={`Seleccionar carta ${card.name} para atacar`}
              >
                <Card 
                  card={card} 
                  currentHealth={cardHealth[cardId]}
                  inField={true}
                  canAttack={canAttack[cardId]}
                  disabled={!canAttack[cardId]}
                  playable={true}
                />
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="ai-field mb-4">
        <h3 className="text-xl font-bold mb-2">Campo del Oponente</h3>
        <div className="flex gap-2 flex-wrap">
          {aiCards.map(card => {
            const cardId = `ai-${card.id}`;
            const isAlive = cardHealth[cardId] > 0;
            
            if (!isAlive) return null;
            
            return (
              <button 
                key={cardId} 
                onClick={() => selectedCard && attackCard(cardId)}
                className={`bg-transparent border-0 p-0 m-0 ${selectedCard ? 'cursor-pointer' : ''}`}
                disabled={!selectedCard}
                aria-label={`Atacar carta ${card.name} del oponente`}
              >
                <Card 
                  card={card} 
                  currentHealth={cardHealth[cardId]}
                  inField={true}
                  disabled={!selectedCard}
                  playable={true}
                />
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="combat-controls mt-4">
        <button 
          onClick={endTurn}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Terminar Turno
        </button>
      </div>
    </div>
  );
};

export default CardCombat;
