export type TileType =
  | 'START'
  | 'FINISH'
  | 'NORMAL'
  | 'MYSTERY'
  | 'TREASURE'
  | 'TRAP'
  | 'WILD'
  | 'BONUS'
  | 'SHORTCUT'
  | 'CHALLENGE'
  | 'RISK'
  | 'EVENT';

export interface BoardTile {
  index: number;
  type: TileType;
  name: string;
  description: string;
  color: string;
  bgClass: string;
  gridX: number; // Column index (0-7)
  gridY: number; // Row index (0-3)
}

export const BOARD_TILES: BoardTile[] = [
  // Row 0: left to right (Col 0 to 7, Row 0)
  { index: 0, type: 'START', name: "Start", description: "Beginning of the journey", color: "#22c55e", bgClass: "bg-emerald-500/20 border-emerald-500 text-emerald-400", gridX: 0, gridY: 0 },
  { index: 1, type: 'NORMAL', name: "Grasslands", description: "A peaceful path tile", color: "#64748b", bgClass: "bg-slate-500/20 border-slate-500 text-slate-400", gridX: 1, gridY: 0 },
  { index: 2, type: 'BONUS', name: "Bonus Tile", description: "Collect +5 free coins", color: "#eab308", bgClass: "bg-yellow-500/20 border-yellow-500 text-yellow-400", gridX: 2, gridY: 0 },
  { index: 3, type: 'TRAP', name: "Trap Tile", description: "Loses coins or moves back unless protected", color: "#ef4444", bgClass: "bg-red-500/20 border-red-500 text-red-400", gridX: 3, gridY: 0 },
  { index: 4, type: 'MYSTERY', name: "Mystery Tile", description: "Triggers a random board effect", color: "#a855f7", bgClass: "bg-purple-500/20 border-purple-500 text-purple-400", gridX: 4, gridY: 0 },
  { index: 5, type: 'SHORTCUT', name: "Shortcut", description: "Advance +2 tiles forward", color: "#06b6d4", bgClass: "bg-cyan-500/20 border-cyan-500 text-cyan-400", gridX: 5, gridY: 0 },
  { index: 6, type: 'CHALLENGE', name: "Challenge Tile", description: "Answer a Hard question for double rewards", color: "#3b82f6", bgClass: "bg-blue-500/20 border-blue-500 text-blue-400", gridX: 6, gridY: 0 },
  { index: 7, type: 'RISK', name: "Risk Tile", description: "Double or nothing coin gamble on trivia", color: "#f97316", bgClass: "bg-orange-500/20 border-orange-500 text-orange-400", gridX: 7, gridY: 0 },

  // Row 1: right to left (Col 7 to 0, Row 1)
  { index: 8, type: 'EVENT', name: "Event Tile", description: "Triggers a new global event", color: "#ec4899", bgClass: "bg-pink-500/20 border-pink-500 text-pink-400", gridX: 7, gridY: 1 },
  { index: 9, type: 'WILD', name: "Wild Category", description: "Choose your next question category", color: "#14b8a6", bgClass: "bg-teal-500/20 border-teal-500 text-teal-400", gridX: 6, gridY: 1 },
  { index: 10, type: 'TREASURE', name: "Treasure Chest", description: "Spend 10 coins to unlock a random power-up or trap", color: "#eab308", bgClass: "bg-amber-500/20 border-amber-500 text-amber-400", gridX: 5, gridY: 1 },
  { index: 11, type: 'NORMAL', name: "Plains", description: "A peaceful path tile", color: "#64748b", bgClass: "bg-slate-500/20 border-slate-500 text-slate-400", gridX: 4, gridY: 1 },
  { index: 12, type: 'TRAP', name: "Spike Trap", description: "Loses coins or moves back unless protected", color: "#ef4444", bgClass: "bg-red-500/20 border-red-500 text-red-400", gridX: 3, gridY: 1 },
  { index: 13, type: 'SHORTCUT', name: "Wind Tunnel", description: "Advance +3 tiles forward", color: "#06b6d4", bgClass: "bg-cyan-500/20 border-cyan-500 text-cyan-400", gridX: 2, gridY: 1 },
  { index: 14, type: 'MYSTERY', name: "Dimensional Rift", description: "Triggers a random board effect", color: "#a855f7", bgClass: "bg-purple-500/20 border-purple-500 text-purple-400", gridX: 1, gridY: 1 },
  { index: 15, type: 'BONUS', name: "Coin Fountain", description: "Collect +10 free coins", color: "#eab308", bgClass: "bg-yellow-500/20 border-yellow-500 text-yellow-400", gridX: 0, gridY: 1 },

  // Row 2: left to right (Col 0 to 7, Row 2)
  { index: 16, type: 'EVENT', name: "Cosmic Event", description: "Triggers a new global event", color: "#ec4899", bgClass: "bg-pink-500/20 border-pink-500 text-pink-400", gridX: 0, gridY: 2 },
  { index: 17, type: 'NORMAL', name: "Forest Path", description: "A peaceful path tile", color: "#64748b", bgClass: "bg-slate-500/20 border-slate-500 text-slate-400", gridX: 1, gridY: 2 },
  { index: 18, type: 'CHALLENGE', name: "Boss Fight", description: "Answer a Hard question for double rewards", color: "#3b82f6", bgClass: "bg-blue-500/20 border-blue-500 text-blue-400", gridX: 2, gridY: 2 },
  { index: 19, type: 'RISK', name: "Lava Pit", description: "Double or nothing coin gamble on trivia", color: "#f97316", bgClass: "bg-orange-500/20 border-orange-500 text-orange-400", gridX: 3, gridY: 2 },
  { index: 20, type: 'WILD', name: "Riddle Tile", description: "Choose your next question category", color: "#14b8a6", bgClass: "bg-teal-500/20 border-teal-500 text-teal-400", gridX: 4, gridY: 2 },
  { index: 21, type: 'TREASURE', name: "Sunken Chest", description: "Spend 10 coins to unlock a random power-up or trap", color: "#eab308", bgClass: "bg-amber-500/20 border-amber-500 text-amber-400", gridX: 5, gridY: 2 },
  { index: 22, type: 'TRAP', name: "Quicksand", description: "Loses coins or moves back unless protected", color: "#ef4444", bgClass: "bg-red-500/20 border-red-500 text-red-400", gridX: 6, gridY: 2 },
  { index: 23, type: 'SHORTCUT', name: "Springpad", description: "Advance +2 tiles forward", color: "#06b6d4", bgClass: "bg-cyan-500/20 border-cyan-500 text-cyan-400", gridX: 7, gridY: 2 },

  // Row 3: right to left (Col 7 to 0, Row 3)
  { index: 24, type: 'MYSTERY', name: "Warp Gate", description: "Triggers a random board effect", color: "#a855f7", bgClass: "bg-purple-500/20 border-purple-500 text-purple-400", gridX: 7, gridY: 3 },
  { index: 25, type: 'BONUS', name: "Star Chest", description: "Collect +15 free coins", color: "#eab308", bgClass: "bg-yellow-500/20 border-yellow-500 text-yellow-400", gridX: 6, gridY: 3 },
  { index: 26, type: 'EVENT', name: "Supernova Event", description: "Triggers a new global event", color: "#ec4899", bgClass: "bg-pink-500/20 border-pink-500 text-pink-400", gridX: 5, gridY: 3 },
  { index: 27, type: 'CHALLENGE', name: "Final Quiz Duel", description: "Answer a Hard question for double rewards", color: "#3b82f6", bgClass: "bg-blue-500/20 border-blue-500 text-blue-400", gridX: 4, gridY: 3 },
  { index: 28, type: 'RISK', name: "Dangerous Gamble", description: "Double or nothing coin gamble on trivia", color: "#f97316", bgClass: "bg-orange-500/20 border-orange-500 text-orange-400", gridX: 3, gridY: 3 },
  { index: 29, type: 'WILD', name: "Grand Nexus", description: "Choose your next question category", color: "#14b8a6", bgClass: "bg-teal-500/20 border-teal-500 text-teal-400", gridX: 2, gridY: 3 },
  { index: 30, type: 'TREASURE', name: "Vault of Legends", description: "Spend 10 coins to unlock a random power-up or trap", color: "#eab308", bgClass: "bg-amber-500/20 border-amber-500 text-amber-400", gridX: 1, gridY: 3 },
  { index: 31, type: 'FINISH', name: "Finish Line", description: "Reach here to end the game and claim victory!", color: "#ef4444", bgClass: "bg-red-600/30 border-red-500 text-red-300 font-bold", gridX: 0, gridY: 3 },
];

export function getTileByIndex(index: number): BoardTile {
  if (index >= BOARD_TILES.length) return BOARD_TILES[BOARD_TILES.length - 1];
  if (index < 0) return BOARD_TILES[0];
  return BOARD_TILES[index];
}
