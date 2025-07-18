// Tipos para el juego Pixel Forge

export interface Card {
  id: string;
  name: string;
  title: string;
  card_class: string;
  rarity: string;
  pixels_cost: number;
  strength: number;
  health: number;
  currentHealth?: number;
  ability_description?: string;
  canAttack?: boolean;
  hasAttacked?: boolean;
  uniqueId?: string;
  affordablePixels?: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  field: Card[];
  deck: Card[];
  graveyard: Card[];
  health: number;
  pixels: number;
  maxPixels: number;
  score: number;
}

export type GameMode = 'menu' | 'game';
export type CombatPhase = 'none' | 'select-target';
export type Winner = 'Jugador' | 'IA' | null;

export interface GameState {
  gameMode: GameMode;
  playerData: Player | null;
  aiData: Player | null;
  isPlayerTurn: boolean;
  selectedCard: Card | null;
  combatPhase: CombatPhase;
  gameLog: string[];
  winner: Winner;
  turnCount: number;
  aiProcessing: boolean;
}
