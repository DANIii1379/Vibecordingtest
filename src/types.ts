/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Direction = "up" | "right" | "down" | "left";

export type TileType = "empty" | "normal" | "source" | "core" | "obstacle";

export interface TileState {
  id: string; // "tile-x-y"
  x: number;
  y: number;
  type: TileType;
  initialPorts: Direction[];
  ports: Direction[]; // Current absolute ports after rotation
  rotation: number; // 0, 90, 180, 270 degrees
  entanglementId: string | null; // ID representing the entangled pair/group
  entanglementType?: "direct" | "inverse" | "clockwise-90" | "counter-90"; // link behavior
  locked: boolean; // cannot be manually rotated
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Quantum";
  quantumConcept: string; // Explanatory subtitle (e.g., "Bell State", "Superposition")
  width: number;
  height: number;
  parMoves: number;
  tiles: Omit<TileState, "ports">[]; // Port absolute state will be computed on load
}

export interface AIMessage {
  id: string;
  sender: "player" | "erwin";
  text: string;
  timestamp: string;
  isHint?: boolean;
}

export interface GameState {
  currentLevelIndex: number;
  activeLevel: LevelConfig | null;
  board: TileState[][];
  moveCount: number;
  energizedIds: Set<string>;
  completed: boolean;
  history: string[][]; // For undo operations (serialization of orientations)
  aiChat: AIMessage[];
  isThinkingAI: boolean;
  score: number; // calculated from parMoves
}
