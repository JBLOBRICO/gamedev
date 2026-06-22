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
  | 'EVENT'
  | 'TELEPORT'
  | 'ITEM_REWARD'
  | 'MOVE_FORWARD'
  | 'MOVE_BACK'
  | 'SKIP_TURN'
  | 'DICE_AGAIN'
  | 'SWAP'
  | 'COIN_BONUS'
  | 'COIN_DRAIN';

export interface BoardTile {
  index: number;
  type: TileType;
  name: string;
  description: string;
  color: string;
  bgClass: string;
  gridX: number; // Column index (0-9)
  gridY: number; // Row index (0-4)
}

// 46 tiles (0-45) in a 10-column × 5-row serpentine layout
// Row 0: left→right (0–9)
// Row 1: right→left (10–19)
// Row 2: left→right (20–29)
// Row 3: right→left (30–39)
// Row 4: left→right (40–45), FINISH at 45

export const BOARD_TILES: BoardTile[] = [
  // ── Row 0: left to right (col 0 → 9) ──────────────────────────────────────
  { index: 0,  type: 'START',       name: 'Start',           description: 'The beginning of your adventure!',                    color: '#22c55e', bgClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',   gridX: 0, gridY: 0 },
  { index: 1,  type: 'NORMAL',      name: 'Grasslands',      description: 'A peaceful path — answer trivia to move forward.',    color: '#64748b', bgClass: 'bg-slate-500/20 border-slate-500 text-slate-400',         gridX: 1, gridY: 0 },
  { index: 2,  type: 'COIN_BONUS',  name: 'Gold Pile',       description: 'Scoop up +8 free coins!',                             color: '#eab308', bgClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',       gridX: 2, gridY: 0 },
  { index: 3,  type: 'TRAP',        name: 'Spike Trap',      description: 'Lose 10 coins and fall back 2 tiles unless shielded.',color: '#ef4444', bgClass: 'bg-red-500/20 border-red-500 text-red-400',               gridX: 3, gridY: 0 },
  { index: 4,  type: 'MOVE_FORWARD',name: 'Tailwind',        description: 'A gust carries you forward +3 tiles for free!',       color: '#06b6d4', bgClass: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',           gridX: 4, gridY: 0 },
  { index: 5,  type: 'MYSTERY',     name: 'Mystery Tile',    description: 'A random effect awaits — could be great or terrible!',color: '#a855f7', bgClass: 'bg-purple-500/20 border-purple-500 text-purple-400',     gridX: 5, gridY: 0 },
  { index: 6,  type: 'CHALLENGE',   name: 'Challenge Tile',  description: 'Answer a Hard question for double coin rewards.',      color: '#3b82f6', bgClass: 'bg-blue-500/20 border-blue-500 text-blue-400',           gridX: 6, gridY: 0 },
  { index: 7,  type: 'DICE_AGAIN',  name: 'Roll Again',      description: 'Roll the dice one more time this turn!',              color: '#f59e0b', bgClass: 'bg-amber-400/20 border-amber-400 text-amber-300',         gridX: 7, gridY: 0 },
  { index: 8,  type: 'TRAP',        name: 'Snare Pit',       description: 'You are snared — lose 8 coins.',                      color: '#ef4444', bgClass: 'bg-red-500/20 border-red-500 text-red-400',               gridX: 8, gridY: 0 },
  { index: 9,  type: 'WILD',        name: 'Wild Category',   description: 'Pick any trivia category for your next question.',     color: '#14b8a6', bgClass: 'bg-teal-500/20 border-teal-500 text-teal-400',           gridX: 9, gridY: 0 },

  // ── Row 1: right to left (col 9 → 0) ──────────────────────────────────────
  { index: 10, type: 'EVENT',       name: 'Event Tile',      description: 'A global event erupts and affects all players!',      color: '#ec4899', bgClass: 'bg-pink-500/20 border-pink-500 text-pink-400',           gridX: 9, gridY: 1 },
  { index: 11, type: 'SHORTCUT',    name: 'Wind Tunnel',     description: 'Ride the winds forward +3 tiles!',                    color: '#06b6d4', bgClass: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',           gridX: 8, gridY: 1 },
  { index: 12, type: 'COIN_DRAIN',  name: 'Tax Collector',   description: 'Pay your taxes — lose 12 coins.',                     color: '#f97316', bgClass: 'bg-orange-500/20 border-orange-500 text-orange-400',     gridX: 7, gridY: 1 },
  { index: 13, type: 'BONUS',       name: 'Coin Fountain',   description: 'A fountain of fortune — collect +10 free coins.',     color: '#eab308', bgClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',   gridX: 6, gridY: 1 },
  { index: 14, type: 'TELEPORT',    name: 'Teleporter',      description: 'Zap! You teleport to a random tile on the board.',    color: '#8b5cf6', bgClass: 'bg-violet-500/20 border-violet-500 text-violet-400',   gridX: 5, gridY: 1 },
  { index: 15, type: 'NORMAL',      name: 'Plains',          description: 'A quiet stretch of the path.',                        color: '#64748b', bgClass: 'bg-slate-500/20 border-slate-500 text-slate-400',       gridX: 4, gridY: 1 },
  { index: 16, type: 'TRAP',        name: 'Quicksand',       description: 'Sinking fast — lose 10 coins, move back 3.',          color: '#ef4444', bgClass: 'bg-red-500/20 border-red-500 text-red-400',             gridX: 3, gridY: 1 },
  { index: 17, type: 'ITEM_REWARD', name: 'Gift Box',        description: 'Lucky find! Receive a free random item.',             color: '#a3e635', bgClass: 'bg-lime-500/20 border-lime-500 text-lime-400',           gridX: 2, gridY: 1 },
  { index: 18, type: 'RISK',        name: 'Risk Tile',       description: 'Gamble your coins — double or lose half!',            color: '#f97316', bgClass: 'bg-orange-500/20 border-orange-500 text-orange-400',   gridX: 1, gridY: 1 },
  { index: 19, type: 'MYSTERY',     name: 'Dimensional Rift',description: 'Reality warps — something unexpected happens.',       color: '#a855f7', bgClass: 'bg-purple-500/20 border-purple-500 text-purple-400',   gridX: 0, gridY: 1 },

  // ── Row 2: left to right (col 0 → 9) ──────────────────────────────────────
  { index: 20, type: 'EVENT',       name: 'Cosmic Event',    description: 'A cosmic shift triggers a new global event!',         color: '#ec4899', bgClass: 'bg-pink-500/20 border-pink-500 text-pink-400',           gridX: 0, gridY: 2 },
  { index: 21, type: 'SKIP_TURN',   name: 'Frozen Path',     description: 'You are frozen! Skip your next turn.',                color: '#38bdf8', bgClass: 'bg-sky-500/20 border-sky-500 text-sky-300',             gridX: 1, gridY: 2 },
  { index: 22, type: 'CHALLENGE',   name: 'Boss Fight',      description: 'Face the boss with a Hard question for 2× rewards.',  color: '#3b82f6', bgClass: 'bg-blue-500/20 border-blue-500 text-blue-400',         gridX: 2, gridY: 2 },
  { index: 23, type: 'COIN_BONUS',  name: 'Treasure Cache',  description: 'Hidden riches — collect +15 free coins!',             color: '#eab308', bgClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400', gridX: 3, gridY: 2 },
  { index: 24, type: 'SWAP',        name: 'Swap Pad',        description: 'Swap board positions with a random opponent!',        color: '#f43f5e', bgClass: 'bg-rose-500/20 border-rose-500 text-rose-400',         gridX: 4, gridY: 2 },
  { index: 25, type: 'TREASURE',    name: 'Sunken Chest',    description: 'Spend 10 coins for a mystery prize or trap!',         color: '#eab308', bgClass: 'bg-amber-500/20 border-amber-500 text-amber-400',     gridX: 5, gridY: 2 },
  { index: 26, type: 'MOVE_BACK',   name: 'Sinkhole',        description: 'The ground gives way — move back 4 tiles.',           color: '#78716c', bgClass: 'bg-stone-500/20 border-stone-500 text-stone-400',     gridX: 6, gridY: 2 },
  { index: 27, type: 'WILD',        name: 'Riddle Tile',     description: 'Choose your own trivia category challenge.',          color: '#14b8a6', bgClass: 'bg-teal-500/20 border-teal-500 text-teal-400',         gridX: 7, gridY: 2 },
  { index: 28, type: 'DICE_AGAIN',  name: 'Momentum',        description: 'Keep going! Roll the dice one more time.',            color: '#f59e0b', bgClass: 'bg-amber-400/20 border-amber-400 text-amber-300',     gridX: 8, gridY: 2 },
  { index: 29, type: 'TRAP',        name: 'Poison Spore',    description: 'Breathe the spores — lose 15 coins.',                 color: '#ef4444', bgClass: 'bg-red-500/20 border-red-500 text-red-400',           gridX: 9, gridY: 2 },

  // ── Row 3: right to left (col 9 → 0) ──────────────────────────────────────
  { index: 30, type: 'MYSTERY',     name: 'Warp Gate',       description: 'Strange forces act — the outcome is a mystery.',      color: '#a855f7', bgClass: 'bg-purple-500/20 border-purple-500 text-purple-400', gridX: 9, gridY: 3 },
  { index: 31, type: 'COIN_BONUS',  name: 'Star Chest',      description: 'A glittering star chest — grab +20 coins!',           color: '#eab308', bgClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400', gridX: 8, gridY: 3 },
  { index: 32, type: 'SKIP_TURN',   name: 'Time Warp',       description: 'Time loops on you — skip the next 2 turns.',          color: '#38bdf8', bgClass: 'bg-sky-500/20 border-sky-500 text-sky-300',           gridX: 7, gridY: 3 },
  { index: 33, type: 'ITEM_REWARD', name: 'Enchanted Crate', description: 'An enchanted crate drops a free item for you!',       color: '#a3e635', bgClass: 'bg-lime-500/20 border-lime-500 text-lime-400',       gridX: 6, gridY: 3 },
  { index: 34, type: 'TELEPORT',    name: 'Nexus Portal',    description: 'Step into the nexus — teleport to a random tile!',    color: '#8b5cf6', bgClass: 'bg-violet-500/20 border-violet-500 text-violet-400', gridX: 5, gridY: 3 },
  { index: 35, type: 'EVENT',       name: 'Supernova',       description: 'A supernova triggers a powerful global event!',       color: '#ec4899', bgClass: 'bg-pink-500/20 border-pink-500 text-pink-400',         gridX: 4, gridY: 3 },
  { index: 36, type: 'CHALLENGE',   name: 'Final Quiz Duel', description: 'Hard question — double or nothing on coin rewards!',  color: '#3b82f6', bgClass: 'bg-blue-500/20 border-blue-500 text-blue-400',         gridX: 3, gridY: 3 },
  { index: 37, type: 'RISK',        name: 'Dangerous Gamble',description: 'High-stakes gamble: all or nothing on a coin flip!',  color: '#f97316', bgClass: 'bg-orange-500/20 border-orange-500 text-orange-400',  gridX: 2, gridY: 3 },
  { index: 38, type: 'MOVE_FORWARD',name: 'Launch Pad',      description: 'A spring launches you +4 tiles ahead!',               color: '#06b6d4', bgClass: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',       gridX: 1, gridY: 3 },
  { index: 39, type: 'TRAP',        name: 'Gravity Well',    description: 'Pulled back — lose 12 coins and move back 2 tiles.',  color: '#ef4444', bgClass: 'bg-red-500/20 border-red-500 text-red-400',           gridX: 0, gridY: 3 },

  // ── Row 4: left to right (col 0 → 5) ──────────────────────────────────────
  { index: 40, type: 'WILD',        name: 'Grand Nexus',     description: 'Final stretch — choose your trivia category!',        color: '#14b8a6', bgClass: 'bg-teal-500/20 border-teal-500 text-teal-400',         gridX: 0, gridY: 4 },
  { index: 41, type: 'TREASURE',    name: 'Vault of Legends',description: 'The legendary vault — spend 10g for a huge reward!',  color: '#eab308', bgClass: 'bg-amber-500/20 border-amber-500 text-amber-400',     gridX: 1, gridY: 4 },
  { index: 42, type: 'SWAP',        name: 'Mirror World',    description: 'Dimensions collide — swap with the closest opponent!',color: '#f43f5e', bgClass: 'bg-rose-500/20 border-rose-500 text-rose-400',       gridX: 2, gridY: 4 },
  { index: 43, type: 'MYSTERY',     name: 'Final Mystery',   description: 'A last wild card — anything could happen!',           color: '#a855f7', bgClass: 'bg-purple-500/20 border-purple-500 text-purple-400', gridX: 3, gridY: 4 },
  { index: 44, type: 'COIN_BONUS',  name: 'Victory Cache',   description: 'So close to victory — grab +25 free coins!',         color: '#eab308', bgClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400', gridX: 4, gridY: 4 },
  { index: 45, type: 'FINISH',      name: 'Finish Line',     description: 'Reach here to claim ultimate victory!',               color: '#ef4444', bgClass: 'bg-red-600/30 border-red-500 text-red-300 font-bold', gridX: 5, gridY: 4 },
];

/** How many tiles on the board (0..BOARD_SIZE-1 is valid, BOARD_SIZE = finish) */
export const BOARD_SIZE = BOARD_TILES.length; // 46

export function getTileByIndex(index: number): BoardTile {
  if (index >= BOARD_TILES.length) return BOARD_TILES[BOARD_TILES.length - 1];
  if (index < 0) return BOARD_TILES[0];
  return BOARD_TILES[index];
}
