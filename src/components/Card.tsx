
interface CardProps {
  readonly card: {
    readonly id: string;
    readonly name: string;
    readonly title: string;
    readonly strength: number;
    readonly health: number;
    readonly image: string;
    readonly ability_description?: string;
    readonly pixels_cost?: number;
  };
  readonly currentHealth?: number; // Salud actual de la carta
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly playable?: boolean;
  readonly inField?: boolean; // Indica si la carta está en el campo de juego
  readonly canAttack?: boolean; // Indica si la carta puede atacar
  readonly onAttack?: () => void; // Función para atacar con esta carta
}

function Card({ 
  card, 
  onClick, 
  disabled = false, 
  playable = true,
  currentHealth,
  inField = false,
  canAttack = false,
  onAttack
}: CardProps) {
  // Si no se proporciona currentHealth, usar el valor de health de la carta
  const health = currentHealth !== undefined ? currentHealth : card.health;
  const isDamaged = health < card.health;
  
  return (
    <div
      onClick={onClick}
      className={`w-40 h-60 bg-white text-black border rounded-2xl shadow-lg p-2 transition-transform relative
        ${!disabled ? 'hover:scale-105 cursor-pointer' : 'opacity-70'}
        ${playable ? '' : 'border-red-500 border-2'}
        ${inField ? 'border-green-500 border-2' : ''}
        ${canAttack ? 'ring-4 ring-yellow-400' : ''}`}
    >
      {/* Coste de píxeles */}
      {card.pixels_cost !== undefined && (
        <div className="absolute -top-2 -left-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
          {card.pixels_cost}
        </div>
      )}
      
      {/* Indicador de carta que puede atacar */}
      {canAttack && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
          ⚔️
        </div>
      )}
      
      <img
        src={card.image}
        alt={card.name}
        className="w-full h-28 object-cover rounded"
      />
      <h3 className="text-md font-bold mt-1">{card.name}</h3>
      <p className="text-xs italic text-slate-600">{card.title}</p>
      <div className="flex justify-between mt-2 text-sm">
        <span>💥 {card.strength}</span>
        <span className={`${isDamaged ? 'text-red-600 font-bold' : ''}`}>❤️ {health}/{card.health}</span>
      </div>
      
      {/* Botón de ataque para cartas en el campo */}
      {inField && canAttack && onAttack && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAttack();
          }}
          className="absolute bottom-1 right-1 bg-yellow-500 text-xs text-white px-2 py-1 rounded hover:bg-yellow-600"
        >
          Atacar
        </button>
      )}
    </div>
  );
}

export default Card;
