// Character sheet types based on iHunt JSON structure
export interface Aspecto {
  tipo: string;
  descricao: string;
}

export interface Habilidade {
  nome: string;
  nivel: number;
}

export interface Manobra {
  id: string;
  nome: string;
  descricao?: string;
}

export interface Consequencia {
  nivel: string;
  descricao: string;
}

export interface Dom {
  id: string;
  nome: string;
  descricao: string;
  categoria?: string;
  custo_essencia?: number;
  nivel?: number;
}

export interface CharacterSheet {
  nome: string;
  drive?: string;
  aspectos: Aspecto[];
  habilidades: Habilidade[];
  manobras: Manobra[];
  manobras_habilidade: Manobra[];
  stress_fisico: boolean[];
  stress_mental: boolean[];
  consequencias: Consequencia[];
  pontos_destino: number;
  pontos_destino_max: number;
  dons: Dom[];
  notas?: string;
}

// Room and player types
export interface Player {
  id: string;
  name: string;
  isMaster: boolean;
  sheet?: CharacterSheet;
  online_at: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  type: 'message' | 'roll' | 'system';
  timestamp: string;
  rollResult?: DiceRollResult;
}

export interface DiceRollResult {
  dice: number[];
  bonusDie?: number; // For advantage roll (d6)
  total: number;
  modifier: number;
  diceType: 'fate' | 'advantage' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  description?: string;
}

export interface Room {
  code: string;
  password: string;
}

export interface SceneInfo {
  title: string;
  description: string;
  pinnedBy: string;
  timestamp: string;
}
