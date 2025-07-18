import React from 'react';
import { Swords } from 'lucide-react';

interface GameLogProps {
  messages: string[];
}

const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  return (
    <div className="bg-black/30 rounded-xl p-4">
      <h3 className="text-white font-bold mb-2 flex items-center gap-2">
        <Swords size={20} />
        Log de Batalla
      </h3>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {messages.map((message, index) => (
          <div key={index} className="text-gray-300 text-sm">
            • {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLog;
