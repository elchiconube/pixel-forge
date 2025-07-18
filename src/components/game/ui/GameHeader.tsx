import React from 'react';
import { Home, RotateCcw } from 'lucide-react';

interface GameHeaderProps {
  turnCount: number;
  onGoToMenu: () => void;
  onRestart: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ turnCount, onGoToMenu, onRestart }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={onGoToMenu}
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Home size={20} />
        Menú
      </button>
      
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">PIXEL FORGE</h1>
        <p className="text-sm text-gray-300">Turno {turnCount}</p>
      </div>
      
      <button
        onClick={onRestart}
        className="flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <RotateCcw size={20} />
        Reiniciar
      </button>
    </div>
  );
};

export default GameHeader;
