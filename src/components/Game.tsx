import { useState, useEffect } from 'react';
import Card from './Card';
import CardCombat from './CardCombat';
import { abilityEffects } from '../utils/effects';
import type { CardType } from '../utils/effects';
import cardsData from '../data/cards.json';

// Definir tipos para TypeScript
type GameState = {
  player: {
    hand: CardType[];
    deck: CardType[];
    field: CardType[];
    graveyard: CardType[];
    health: number;
  };
  ai: {
    hand: CardType[];
    deck: CardType[];
    field: CardType[];
    graveyard: CardType[];
    health: number;
  };
  currentTurn: 'player' | 'ai' | 'end';
  gameLog: string[];
  selectedCard: CardType | null; // Carta seleccionada para atacar
  attackMode: boolean; // Indica si estamos en modo de ataque
};

// Función para crear un mazo aleatorio a partir de todas las cartas disponibles
const createRandomDeck = (allCards: CardType[], deckSize: number = 15): CardType[] => {
  // Hacer una copia de todas las cartas para no modificar el original
  const cardPool = [...allCards];
  const deck: CardType[] = [];
  
  // Seleccionar cartas aleatorias hasta llenar el mazo
  while (deck.length < deckSize && cardPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * cardPool.length);
    deck.push(cardPool[randomIndex]);
    cardPool.splice(randomIndex, 1); // Eliminar la carta seleccionada del pool
  }
  
  return deck;
};

export default function Game() {
  // Estado para los píxeles (recursos)
  const [playerPixels, setPlayerPixels] = useState<number>(1);
  const [aiPixels, setAiPixels] = useState<number>(1);
  const [maxPixels, setMaxPixels] = useState<number>(1); // Aumenta cada turno hasta un máximo
  
  // Estado para controlar cuándo mostrar el componente de combate
  const [showCombat, setShowCombat] = useState<boolean>(false);
  
  // Estado del juego
  const [gameState, setGameState] = useState<GameState>({
    player: {
      hand: [],
      deck: [],
      field: [],
      graveyard: [],
      health: 20
    },
    ai: {
      hand: [],
      deck: [],
      field: [],
      graveyard: [],
      health: 20
    },
    currentTurn: 'player',
    gameLog: ['¡Comienza la partida!'],
    selectedCard: null,
    attackMode: false
  });
  
  // Eliminamos las variables no utilizadas

  // Función para barajar un mazo
  const shuffleDeck = (deck: CardType[]): CardType[] => {
    return [...deck].sort(() => Math.random() - 0.5);
  };
  
  // Función para iniciar el combate entre cartas
  const startCombat = () => {
    if (gameState.player.field.length === 0 || gameState.ai.field.length === 0) {
      addToGameLog('No hay suficientes cartas en el campo para iniciar un combate.');
      return;
    }
    
    setShowCombat(true);
    addToGameLog('¡Comienza el combate entre cartas!');
  };
  
  // Función para manejar el resultado del combate
  const handleCombatEnd = (playerCards: CardType[], aiCards: CardType[], combatLog: string[]) => {
    // Actualizar el estado del juego con las cartas que sobrevivieron
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        field: playerCards
      },
      ai: {
        ...prev.ai,
        field: aiCards
      },
      gameLog: [...prev.gameLog, ...combatLog]
    }));
    
    setShowCombat(false);
  };

  // Inicializar el juego
  useEffect(() => {
    // Crear mazos aleatorios diferentes para jugador e IA
    const playerDeck = shuffleDeck(createRandomDeck(cardsData as CardType[], 15));
    const aiDeck = shuffleDeck(createRandomDeck(cardsData as CardType[], 15));
    
    // Repartir cartas iniciales
    const playerInitialHand = playerDeck.slice(0, 3);
    const aiInitialHand = aiDeck.slice(0, 3);
    
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        hand: playerInitialHand,
        deck: playerDeck.slice(3)
      },
      ai: {
        ...prev.ai,
        hand: aiInitialHand,
        deck: aiDeck.slice(3)
      },
      gameLog: [...prev.gameLog, 'Cada jugador roba 3 cartas.']
    }));
    
    // Inicializar píxeles
    setPlayerPixels(1);
    setAiPixels(1);
    setMaxPixels(1);
  }, []);

  // Función para jugar una carta
  const playCard = (card: CardType) => {
    if (gameState.currentTurn !== 'player') {
      addToGameLog('No es tu turno.');
      return;
    }
    
    // Verificar si hay suficientes píxeles para jugar la carta
    const cost = card.pixels_cost ?? 0;
    if (cost > playerPixels) {
      addToGameLog(`No tienes suficientes píxeles para jugar esta carta. Necesitas ${cost} píxeles.`);
      return;
    }
    
    // Restar el coste de píxeles
    setPlayerPixels(prev => prev - cost);

    // Quitar la carta de la mano y ponerla en el campo
    const newHand = gameState.player.hand.filter(c => c.id !== card.id);
    const newField = [...gameState.player.field, card];

    // Actualizar el estado
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        hand: newHand,
        field: newField
      },
      gameLog: [...prev.gameLog, `Has jugado a ${card.name}.`]
    }));

    // Aplicar habilidad onPlay si existe
    if (card.id in abilityEffects && abilityEffects[card.id]?.onPlay) {
      const tempGameState = {
        ...gameState,
        player: {
          ...gameState.player,
          hand: newHand,
          field: newField
        }
      };
      
      abilityEffects[card.id].onPlay?.(card, tempGameState);
      
      // Actualizar el estado con los cambios de la habilidad
      setGameState(tempGameState);
      addToGameLog(`Se activa la habilidad de ${card.name}: ${card.ability_description ?? 'efecto especial'}`);
    }

    // Atacar al oponente
    const newAiHealth = gameState.ai.health - card.strength;
    
    setGameState(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        health: newAiHealth
      },
      gameLog: [...prev.gameLog, `${card.name} ataca y causa ${card.strength} de daño.`]
    }));

    // Comprobar si el juego ha terminado
    if (newAiHealth <= 0) {
      setGameState(prev => ({
        ...prev,
        ai: {
          ...prev.ai,
          health: 0
        },
        gameLog: [...prev.gameLog, '¡Has ganado la partida!'],
        currentTurn: 'end'
      }));
      return;
    }

    // Terminar el turno del jugador y comenzar el de la IA
    setTimeout(() => {
      endTurn();
    }, 1000);
  };

  // Función para terminar el turno
  const endTurn = () => {
    setGameState(prev => ({
      ...prev,
      currentTurn: 'ai',
      gameLog: [...prev.gameLog, 'Termina tu turno. Comienza el turno del oponente.']
    }));
    
    // Incrementar píxeles máximos para el siguiente turno (hasta 10)
    const newMaxPixels = Math.min(maxPixels + 1, 10);
    setMaxPixels(newMaxPixels);
    
    // Establecer píxeles de la IA para su turno
    setAiPixels(newMaxPixels);

    // La IA juega su turno
    setTimeout(() => {
      aiTurn();
    }, 1500);
  };

  // Función para el turno de la IA
  const aiTurn = () => {
    // Si la IA tiene cartas en la mano, juega una
    if (gameState.ai.hand.length > 0) {
      // Buscar la carta más cara que la IA puede permitirse jugar
      const playableCards = gameState.ai.hand
        .filter(card => (card.pixels_cost ?? 0) <= aiPixels)
        .sort((a, b) => (b.pixels_cost ?? 0) - (a.pixels_cost ?? 0));
      
      // Si no hay cartas jugables, pasar turno
      if (playableCards.length === 0) {
        addToGameLog('El oponente no puede jugar ninguna carta este turno.');
        endAiTurn();
        return;
      }
      
      const cardToPlay = playableCards[0]; // La IA juega la carta más cara que puede permitirse
      
      // Restar el coste de píxeles
      setAiPixels(prev => prev - (cardToPlay.pixels_cost ?? 0));
      
      // Quitar la carta de la mano y ponerla en el campo
      const newHand = gameState.ai.hand.filter(c => c.id !== cardToPlay.id);
      const newField = [...gameState.ai.field, cardToPlay];
      
      // Actualizar el estado
      setGameState(prev => ({
        ...prev,
        ai: {
          ...prev.ai,
          hand: newHand,
          field: newField
        },
        gameLog: [...prev.gameLog, `El oponente juega a ${cardToPlay.name}.`]
      }));

      // Aplicar habilidad onPlay si existe
      if (cardToPlay.id in abilityEffects && abilityEffects[cardToPlay.id]?.onPlay) {
        const tempGameState = {
          ...gameState,
          ai: {
            ...gameState.ai,
            hand: newHand,
            field: newField
          }
        };
        
        abilityEffects[cardToPlay.id].onPlay?.(cardToPlay, tempGameState);
        
        // Actualizar el estado con los cambios de la habilidad
        setGameState(tempGameState);
        addToGameLog(`Se activa la habilidad de ${cardToPlay.name}.`);
      }

      // Atacar al jugador
      const newPlayerHealth = gameState.player.health - cardToPlay.strength;
      
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          health: newPlayerHealth
        },
        gameLog: [...prev.gameLog, `${cardToPlay.name} ataca y causa ${cardToPlay.strength} de daño.`]
      }));

      // Comprobar si el juego ha terminado
      if (newPlayerHealth <= 0) {
        setGameState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            health: 0
          },
          gameLog: [...prev.gameLog, '¡Has perdido la partida!'],
          currentTurn: 'end'
        }));
        return;
      }
    } else {
      addToGameLog('El oponente no tiene cartas para jugar.');
    }

    // La IA termina su turno
    setTimeout(() => {
      endAiTurn();
    }, 1000);
  };
  
  // Función para finalizar el turno de la IA
  const endAiTurn = () => {
    // Robar una carta para el jugador
    drawCard('player');
    
    // Incrementar píxeles máximos para el siguiente turno (hasta 10)
    const newMaxPixels = Math.min(maxPixels + 1, 10);
    setMaxPixels(newMaxPixels);
    
    // Establecer píxeles del jugador para su turno
    setPlayerPixels(newMaxPixels);
    
    setGameState(prev => ({
      ...prev,
      currentTurn: 'player',
      gameLog: [...prev.gameLog, 'Comienza tu turno.']
    }));
  };

  // Función para robar una carta
  const drawCard = (who: 'player' | 'ai') => {
    const state = gameState[who];
    
    if (state.deck.length === 0) {
      addToGameLog(`${who === 'player' ? 'Tu' : 'El'} mazo está vacío.`);
      return;
    }
    
    const drawnCard = state.deck[0];
    const newHand = [...state.hand, drawnCard];
    const newDeck = state.deck.slice(1);
    
    setGameState(prev => ({
      ...prev,
      [who]: {
        ...prev[who],
        hand: newHand,
        deck: newDeck
      },
      gameLog: [...prev.gameLog, `${who === 'player' ? 'Has robado' : 'El oponente ha robado'} una carta.`]
    }));
  };

  // Función para añadir mensajes al log del juego
  const addToGameLog = (message: string) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog, message]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Pixel Forge - Batalla</h1>

      {showCombat ? (
        <CardCombat 
          playerCards={gameState.player.field}
          aiCards={gameState.ai.field}
          onCombatEnd={handleCombatEnd}
        />
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Área principal del juego */}
          <div className="flex-1">
            {/* Información del oponente */}
            <div className="text-center mb-2 bg-slate-700 p-2 rounded-lg">
              <div className="font-bold">Oponente</div>
              <div className="flex justify-between px-4">
                <span>❤️ Salud: {gameState.ai.health}</span>
                <span>🃏 Mano: {gameState.ai.hand.length}</span>
                <span>📚 Mazo: {gameState.ai.deck.length}</span>
              </div>
              <div className="mt-1 bg-red-600 text-white py-1 px-2 rounded-md">
                Píxeles: {aiPixels}/{maxPixels}
              </div>
            </div>
            
            {/* Campo del oponente */}
            <div className="bg-slate-700/50 p-4 rounded-lg mb-4 min-h-[120px] flex justify-center items-center">
              {gameState.ai.field.map((card) => (
                <Card key={card.id} card={card} />
              ))}
              {gameState.ai.field.length === 0 && <div className="text-gray-400 italic">Campo vacío</div>}
            </div>
            
            {/* Área central */}
            <div className="h-16 relative my-2">
              <div className="absolute left-1/2 transform -translate-x-1/2 bg-slate-600 px-4 py-1 rounded-full">
                {gameState.currentTurn === 'player' && '¡Es tu turno!'}
                {gameState.currentTurn === 'ai' && 'El oponente está jugando...'}
                {gameState.currentTurn === 'end' && '¡Partida finalizada!'}
              </div>
            </div>
            
            {/* Campo del jugador */}
            <div className="bg-slate-700/50 p-4 rounded-lg mb-4 min-h-[120px] flex flex-col justify-center items-center">
              <div className="flex justify-center items-center w-full">
                {gameState.player.field.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
                {gameState.player.field.length === 0 && <div className="text-gray-400 italic">Campo vacío</div>}
              </div>
              
              {/* Botón para iniciar el combate entre cartas */}
              {gameState.player.field.length > 0 && gameState.ai.field.length > 0 && gameState.currentTurn === 'player' && (
                <button 
                  onClick={startCombat}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  Iniciar Combate entre Cartas
                </button>
              )}
            </div>

            {/* Información del jugador */}
            <div className="text-center mb-4 bg-slate-700 p-2 rounded-lg">
              <div className="font-bold">Tu Héroe</div>
              <div className="flex justify-between px-4">
                <span>❤️ Salud: {gameState.player.health}</span>
                <span>🃏 Mano: {gameState.player.hand.length}</span>
                <span>📚 Mazo: {gameState.player.deck.length}</span>
              </div>
              <div className="mt-1 bg-blue-600 text-white py-1 px-2 rounded-md">
                Píxeles: {playerPixels}/{maxPixels}
              </div>
            </div>
            
            {/* Mano del jugador */}
            <div className="flex justify-center gap-2 mb-4 overflow-x-auto py-2">
              {gameState.player.hand.map((card) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  onClick={() => gameState.currentTurn === 'player' ? playCard(card) : null} 
                  disabled={gameState.currentTurn !== 'player'}
                  playable={(card.pixels_cost ?? 0) <= playerPixels}
                />
              ))}
              {gameState.player.hand.length === 0 && <div className="text-gray-400 italic p-4">No tienes cartas en la mano</div>}
            </div>
            
            {/* Botón de terminar turno */}
            {gameState.currentTurn === 'player' && (
              <div className="text-center mt-4">
                <button 
                  onClick={endTurn}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105"
                >
                  Terminar turno
                </button>
              </div>
            )}
          </div>
          
          {/* Log del juego (lateral) */}
          <div className="w-full md:w-80 bg-slate-700 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-2 text-center font-bold">
              Registro de Batalla
            </div>
            <div className="flex-1 p-3 overflow-y-auto max-h-[500px] flex flex-col-reverse">
              <ul className="text-sm space-y-2">
                {gameState.gameLog.slice().reverse().map((log, index) => (
                  <li 
                    key={`log-${gameState.gameLog.length - 1 - index}`} 
                    className="p-2 bg-slate-600/50 rounded-lg"
                  >
                    {log}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


