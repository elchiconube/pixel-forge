import React, { useEffect } from 'react';
import { useGameContext } from './context/GameContext';
import { playCard, startCombat, endPlayerTurn } from './logic/playerLogic';
import { initializeGame } from './logic/gameInitialization';
import { executeCombat } from './logic/combatLogic';

// Componentes UI
import GameHeader from './ui/GameHeader';
import PlayerArea from './ui/PlayerArea';
import PlayerHand from './ui/PlayerHand';
import GameControls from './ui/GameControls';
import GameLog from './ui/GameLog';
import CombatInstructionsModal from './ui/CombatInstructionsModal';
import VictoryModal from './ui/VictoryModal';

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGameContext();
  const { 
    playerData, 
    aiData, 
    isPlayerTurn, 
    selectedCard, 
    combatPhase, 
    gameLog, 
    winner, 
    turnCount, 
    aiProcessing 
  } = state;

  // Verificar condiciones de victoria
  useEffect(() => {
    if (playerData && aiData) {
      if (playerData.health <= 0) {
        dispatch({ type: 'SET_WINNER', payload: 'IA' });
        dispatch({ type: 'ADD_TO_LOG', payload: '¡La IA gana la partida!' });
      } else if (aiData.health <= 0) {
        dispatch({ type: 'SET_WINNER', payload: 'Jugador' });
        dispatch({ type: 'ADD_TO_LOG', payload: '¡Has ganado la partida!' });
      }
    }
  }, [playerData?.health, aiData?.health, dispatch]);

  // Funciones auxiliares para actualizar el estado
  const updatePlayerData = (updatedPlayer) => {
    dispatch({ type: 'UPDATE_PLAYER_DATA', payload: updatedPlayer });
  };

  const updateAIData = (updatedAI) => {
    dispatch({ type: 'UPDATE_AI_DATA', payload: updatedAI });
  };

  const addToLog = (message) => {
    dispatch({ type: 'ADD_TO_LOG', payload: message });
  };

  // Manejadores de eventos
  const handleGoToMenu = () => {
    dispatch({ type: 'SET_GAME_MODE', payload: 'menu' });
  };

  const handleRestart = () => {
    const { player, ai } = initializeGame();
    dispatch({ 
      type: 'INITIALIZE_GAME', 
      payload: { playerData: player, aiData: ai } 
    });
  };

  const handlePlayCard = (card) => {
    if (!isPlayerTurn || aiProcessing || combatPhase !== 'none') return;
    playCard(card, playerData, updatePlayerData, addToLog);
  };

  const handleCardClick = (card) => {
    if (!isPlayerTurn || aiProcessing) return;

    if (combatPhase === 'none' && card.canAttack && !card.hasAttacked) {
      // Iniciar ataque
      startCombat(
        card,
        (card) => dispatch({ type: 'SET_SELECTED_CARD', payload: card }),
        (phase) => dispatch({ type: 'SET_COMBAT_PHASE', payload: phase }),
        addToLog
      );
    } else if (combatPhase === 'select-target' && selectedCard) {
      // Ejecutar ataque
      executeCombat(
        selectedCard,
        card,
        playerData,
        aiData,
        true, // Jugador es el atacante
        updatePlayerData,
        updateAIData,
        addToLog
      );
      dispatch({ type: 'SET_SELECTED_CARD', payload: null });
      dispatch({ type: 'SET_COMBAT_PHASE', payload: 'none' });
    }
  };

  const handleDirectAttack = () => {
    if (combatPhase === 'select-target' && selectedCard) {
      executeCombat(
        selectedCard,
        null,
        playerData,
        aiData,
        true, // Jugador es el atacante
        updatePlayerData,
        updateAIData,
        addToLog
      );
      dispatch({ type: 'SET_SELECTED_CARD', payload: null });
      dispatch({ type: 'SET_COMBAT_PHASE', payload: 'none' });
    }
  };

  const handleEndTurn = () => {
    if (!isPlayerTurn || aiProcessing) return;
    
    endPlayerTurn(
      playerData,
      aiData,
      updatePlayerData,
      updateAIData,
      (isPlayerTurn) => dispatch({ type: 'SET_PLAYER_TURN', payload: isPlayerTurn }),
      (processing) => dispatch({ type: 'SET_AI_PROCESSING', payload: processing }),
      addToLog,
      (count) => dispatch({ type: 'SET_TURN_COUNT', payload: count }),
      turnCount
    );
  };

  const handleCancelAttack = () => {
    dispatch({ type: 'SET_SELECTED_CARD', payload: null });
    dispatch({ type: 'SET_COMBAT_PHASE', payload: 'none' });
    addToLog('Ataque cancelado.');
  };

  // Ya no necesitamos las funciones de procesamiento de IA ya que todo está integrado en endPlayerTurn

  // Si no hay datos de jugador o IA, no renderizar nada
  if (!playerData || !aiData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
      {/* Header */}
      <GameHeader 
        turnCount={turnCount} 
        onGoToMenu={handleGoToMenu} 
        onRestart={handleRestart} 
      />

      {/* Área de la IA */}
      <PlayerArea
        player={aiData}
        isPlayerTurn={isPlayerTurn}
        combatPhase={combatPhase}
        aiProcessing={aiProcessing}
        selectedCard={selectedCard}
        onCardClick={handleCardClick}
        isPlayer={false}
      />

      {/* Área central */}
      <GameControls
        isPlayerTurn={isPlayerTurn}
        winner={winner}
        combatPhase={combatPhase}
        aiProcessing={aiProcessing}
        onEndTurn={handleEndTurn}
        onCancelAttack={handleCancelAttack}
      />

      {/* Campo del jugador */}
      <PlayerArea
        player={playerData}
        isPlayerTurn={isPlayerTurn}
        combatPhase={combatPhase}
        aiProcessing={aiProcessing}
        selectedCard={selectedCard}
        onCardClick={handleCardClick}
        isPlayer={true}
      />

      {/* Mano del jugador */}
      <PlayerHand
        cards={playerData.hand}
        playerPixels={playerData.pixels}
        isPlayerTurn={isPlayerTurn}
        combatPhase={combatPhase}
        aiProcessing={aiProcessing}
        onPlayCard={handlePlayCard}
      />

      {/* Log del juego */}
      <GameLog messages={gameLog} />

      {/* Instrucciones de combate */}
      {combatPhase === 'select-target' && selectedCard && (
        <CombatInstructionsModal
          selectedCard={selectedCard}
          onCancel={handleCancelAttack}
        />
      )}

      {/* Modal de victoria */}
      {winner && (
        <VictoryModal
          winner={winner}
          turnCount={turnCount}
          onPlayAgain={handleRestart}
          onGoToMenu={handleGoToMenu}
        />
      )}
    </div>
  );
};

export default GameBoard;
