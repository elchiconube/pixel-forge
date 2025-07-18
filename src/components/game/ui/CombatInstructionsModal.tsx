import React from 'react';
import type { Card } from '../types';

interface CombatInstructionsModalProps {
  selectedCard: Card;
  onCancel: () => void;
}

const CombatInstructionsModal: React.FC<CombatInstructionsModalProps> = ({ selectedCard, onCancel }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white p-6 rounded-xl border-2 border-yellow-400 z-50">
      <h3 className="font-bold mb-2 text-center">⚔️ {selectedCard.name} está listo para atacar!</h3>
      <div className="space-y-2 text-sm">
        <p>• <strong>Haz clic en una carta enemiga</strong> para combate directo</p>
        <p>• <strong>Haz clic en "Campo vacío"</strong> para ataque directo al jugador</p>
        <p>• <strong>Daño mutuo:</strong> Ambas cartas se dañan simultáneamente</p>
      </div>
      <div className="flex gap-2 mt-4 justify-center">
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default CombatInstructionsModal;
