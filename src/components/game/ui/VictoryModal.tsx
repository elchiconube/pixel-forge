import React from 'react';

interface VictoryModalProps {
  winner: 'Jugador' | 'IA';
  turnCount: number;
  onPlayAgain: () => void;
  onGoToMenu: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ winner, turnCount, onPlayAgain, onGoToMenu }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-xl text-center max-w-md">
        <h2 className="text-4xl font-bold text-yellow-400 mb-4">
          {winner === 'Jugador' ? '🎉 ¡Victoria! 🎉' : '💀 ¡Derrota! 💀'}
        </h2>
        <p className="text-xl text-white mb-2">{winner} ha ganado la partida</p>
        <p className="text-sm text-gray-300 mb-6">
          Duración: {turnCount} turnos
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Jugar de Nuevo
          </button>
          <button
            onClick={onGoToMenu}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal;
