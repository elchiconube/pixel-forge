import React from 'react';

interface GameControlsProps {
  isPlayerTurn: boolean;
  winner: 'Jugador' | 'IA' | null;
  combatPhase: 'none' | 'select-target';
  aiProcessing: boolean;
  onEndTurn: () => void;
  onCancelAttack: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlayerTurn,
  winner,
  combatPhase,
  aiProcessing,
  onEndTurn,
  onCancelAttack
}) => {
  return (
    <div className="text-center mb-4">
      <div className="bg-black/30 rounded-lg px-6 py-3 inline-block">
        <span className="text-white font-bold">
          {winner ? `🎉 ¡${winner} gana! 🎉` : 
           combatPhase === 'select-target' ? '⚔️ Selecciona objetivo para atacar' :
           aiProcessing ? 'Turno de la IA...' :
           isPlayerTurn ? '¡Tu turno!' : 'Procesando...'}
        </span>
      </div>
      
      {isPlayerTurn && !winner && combatPhase === 'none' && !aiProcessing && (
        <button
          onClick={onEndTurn}
          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Terminar Turno
        </button>
      )}

      {combatPhase === 'select-target' && (
        <button
          onClick={onCancelAttack}
          className="ml-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Cancelar Ataque
        </button>
      )}
    </div>
  );
};

export default GameControls;
