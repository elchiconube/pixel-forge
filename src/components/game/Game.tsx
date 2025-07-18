import React, { useState, useEffect } from 'react';
import { GameProvider, useGameContext } from './context/GameContext';
import MainMenu from './ui/MainMenu';
import GameBoard from './GameBoard';
import { initializeGame } from './logic/gameInitialization';

const Game: React.FC = () => {
  const [gameMode, setGameMode] = useState<'menu' | 'game'>('menu');
  const [gameInitialized, setGameInitialized] = useState(false);

  const handleStartGame = () => {
    // Cambiar al modo de juego y marcar que debe inicializarse
    setGameMode('game');
    setGameInitialized(true);
  };

  return (
    <GameProvider>
      {gameMode === 'menu' ? (
        <MainMenu onStartGame={handleStartGame} />
      ) : (
        <GameInitializer initialized={gameInitialized} />
      )}
    </GameProvider>
  );
};

// Componente para inicializar el juego y renderizar GameBoard
const GameInitializer: React.FC<{ initialized: boolean }> = ({ initialized }) => {
  const { state, dispatch } = useGameContext();
  
  // Efecto para inicializar el juego cuando se monta el componente
  useEffect(() => {
    if (initialized && (!state.playerData || !state.aiData)) {
      const { player, ai } = initializeGame();
      dispatch({ 
        type: 'INITIALIZE_GAME', 
        payload: { playerData: player, aiData: ai } 
      });
    }
  }, [initialized, dispatch, state.playerData, state.aiData]);
  
  return <GameBoard />;
};

export default Game;
