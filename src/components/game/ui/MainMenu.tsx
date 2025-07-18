import React from 'react';
import { ChevronRight, Bot, Trophy, Play } from 'lucide-react';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            PIXEL FORGE
          </h1>
          <p className="text-xl text-gray-300">Juego de Cartas Online</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={onStartGame}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-xl flex items-center justify-between transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <Bot size={32} />
              <div className="text-left">
                <h3 className="text-xl font-bold">Vs IA</h3>
                <p className="text-sm opacity-80">Juega contra la inteligencia artificial</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>

          <button
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-6 rounded-xl flex items-center justify-between transition-all duration-200 transform hover:scale-105 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center gap-4">
              <Trophy size={32} />
              <div className="text-left">
                <h3 className="text-xl font-bold">Torneo</h3>
                <p className="text-sm opacity-80">Próximamente</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>

          <button
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white p-6 rounded-xl flex items-center justify-between transition-all duration-200 transform hover:scale-105 opacity-50 cursor-not-allowed"
            disabled
          >
            <div className="flex items-center gap-4">
              <Play size={32} />
              <div className="text-left">
                <h3 className="text-xl font-bold">Tutorial</h3>
                <p className="text-sm opacity-80">Próximamente</p>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
