import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Card, Player, Winner, CombatPhase } from '../types';

// Acciones del reducer
type GameAction =
  | { type: 'SET_GAME_MODE'; payload: 'menu' | 'game' }
  | { type: 'INITIALIZE_GAME'; payload: { playerData: Player; aiData: Player } }
  | { type: 'SET_PLAYER_TURN'; payload: boolean }
  | { type: 'SET_SELECTED_CARD'; payload: Card | null }
  | { type: 'SET_COMBAT_PHASE'; payload: CombatPhase }
  | { type: 'ADD_TO_LOG'; payload: string }
  | { type: 'SET_WINNER'; payload: Winner }
  | { type: 'SET_TURN_COUNT'; payload: number }
  | { type: 'SET_AI_PROCESSING'; payload: boolean }
  | { type: 'UPDATE_PLAYER_DATA'; payload: Player }
  | { type: 'UPDATE_AI_DATA'; payload: Player };

// Estado inicial
const initialState: GameState = {
  gameMode: 'menu',
  playerData: null,
  aiData: null,
  isPlayerTurn: true,
  selectedCard: null,
  combatPhase: 'none',
  gameLog: ['¡Bienvenido a Pixel Forge!'],
  winner: null,
  turnCount: 1,
  aiProcessing: false,
};

// Reducer para manejar las acciones
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };
    case 'INITIALIZE_GAME':
      return {
        ...state,
        playerData: action.payload.playerData,
        aiData: action.payload.aiData,
        isPlayerTurn: true,
        gameMode: 'game',
        gameLog: ['¡La batalla comienza!', 'Cada jugador roba 3 cartas iniciales.'],
        winner: null,
        selectedCard: null,
        combatPhase: 'none',
        turnCount: 1,
        aiProcessing: false,
      };
    case 'SET_PLAYER_TURN':
      return { ...state, isPlayerTurn: action.payload };
    case 'SET_SELECTED_CARD':
      return { ...state, selectedCard: action.payload };
    case 'SET_COMBAT_PHASE':
      return { ...state, combatPhase: action.payload };
    case 'ADD_TO_LOG':
      return { ...state, gameLog: [...state.gameLog.slice(-8), action.payload] };
    case 'SET_WINNER':
      return { ...state, winner: action.payload };
    case 'SET_TURN_COUNT':
      return { ...state, turnCount: action.payload };
    case 'SET_AI_PROCESSING':
      return { ...state, aiProcessing: action.payload };
    case 'UPDATE_PLAYER_DATA':
      return { ...state, playerData: action.payload };
    case 'UPDATE_AI_DATA':
      return { ...state, aiData: action.payload };
    default:
      return state;
  }
};

// Crear el contexto
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Proveedor del contexto
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Usar useMemo para evitar recrear el objeto de contexto en cada renderizado
  const contextValue = React.useMemo(() => {
    return { state, dispatch };
  }, [state]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext debe ser usado dentro de un GameProvider');
  }
  return context;
};
