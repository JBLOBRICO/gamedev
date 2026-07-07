// ─── Kingdom of Historia — Hero Roster ───────────────────────────────────────
// Each hero has a fantasy identity, passive ability, lore, and visual style.
// Passives are cosmetic/flavor — they map to existing avatar IDs so no DB changes needed.

export interface HeroPassive {
  name: string;
  description: string;
  icon: string; // emoji
}

export interface HeroData {
  avatarId: string;
  name: string;
  title: string;
  heroClass: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  rarityClass: string;
  crest: string; // emoji symbol
  lore: string;
  quote: string;
  passive: HeroPassive;
  colorAccent: string; // Tailwind color class for accent
  borderClass: string;
  bgGradient: string;
}

export const HEROES: HeroData[] = [
  {
    avatarId: 'avatar_1',
    name: 'Sir Aldric',
    title: 'The Unyielding Shield',
    heroClass: 'Royal Knight',
    rarity: 'Legendary',
    rarityClass: 'rarity-legendary',
    crest: '🛡️',
    lore: 'Once a humble farmhand, Aldric defended Historia\'s capital gates against the Dragon Siege of the Third Age. His bravery earned him the King\'s highest honour and a seat at the Round Council.',
    quote: '"Wisdom without courage is parchment in a storm."',
    passive: {
      name: 'Iron Resolve',
      description: 'Earns +2 bonus Royal Gold after 3 consecutive correct answers.',
      icon: '⚔️',
    },
    colorAccent: 'text-amber-400',
    borderClass: 'border-amber-500/60',
    bgGradient: 'from-amber-950/40 to-stone-950/60',
  },
  {
    avatarId: 'avatar_2',
    name: 'Seraphel',
    title: 'Voice of the Arcane Codex',
    heroClass: 'Arcane Scholar',
    rarity: 'Epic',
    rarityClass: 'rarity-epic',
    crest: '📚',
    lore: 'Seraphel memorised the 10,000-volume Library of Historia by age twelve. She now advises the Crown on ancient prophecies, and her mastery of forgotten languages makes her the realm\'s foremost trivia authority.',
    quote: '"Every answer is already written — find the page."',
    passive: {
      name: 'Scholar\'s Edge',
      description: 'Gains +3 seconds on Hard difficulty trials.',
      icon: '📖',
    },
    colorAccent: 'text-purple-400',
    borderClass: 'border-purple-500/60',
    bgGradient: 'from-purple-950/40 to-indigo-950/60',
  },
  {
    avatarId: 'avatar_3',
    name: 'Thorn Willowmere',
    title: 'Warden of the Emerald Paths',
    heroClass: 'Forest Ranger',
    rarity: 'Rare',
    rarityClass: 'rarity-rare',
    crest: '🌿',
    lore: 'Thorn was raised by the Guardians of the Enchanted Forest and can read the land like a map. He discovered three of Historia\'s lost Secret Passages and mapped the Hidden Ruins of the Old Kingdom.',
    quote: '"The forest remembers what men forget."',
    passive: {
      name: 'Pathfinder',
      description: 'Once per match, ignores a Cursed Rune penalty.',
      icon: '🗺️',
    },
    colorAccent: 'text-emerald-400',
    borderClass: 'border-emerald-500/60',
    bgGradient: 'from-emerald-950/40 to-green-950/60',
  },
  {
    avatarId: 'avatar_4',
    name: 'Mira Ashveil',
    title: 'Phantom of the Obsidian Court',
    heroClass: 'Shadow Rogue',
    rarity: 'Epic',
    rarityClass: 'rarity-epic',
    crest: '🌑',
    lore: 'No one knows Mira\'s true origin. She appeared at the Royal Palace claiming to carry sealed documents from the Shadow Council. Her impossible knowledge of secret routes and hidden relics is both revered and feared.',
    quote: '"The shadows know the truth kings dare not speak."',
    passive: {
      name: 'Veil Step',
      description: 'Small chance (+15%) to gain +1 movement on any correct answer.',
      icon: '👻',
    },
    colorAccent: 'text-slate-400',
    borderClass: 'border-slate-400/60',
    bgGradient: 'from-slate-900/60 to-zinc-950/70',
  },
  {
    avatarId: 'avatar_5',
    name: 'Caldwyn',
    title: 'Paladin of the Silver Dawn',
    heroClass: 'Noble Paladin',
    rarity: 'Legendary',
    rarityClass: 'rarity-legendary',
    crest: '☀️',
    lore: 'Caldwyn took his sacred oath at the Shrine of the Eternal Flame. As the last of the Silver Dawn Order, he carries the blessed sword Luminar and vows to restore the Crown of Wisdom to its rightful place.',
    quote: '"Light reveals what darkness conceals."',
    passive: {
      name: 'Holy Aegis',
      description: 'Shield Relic lasts one extra turn before expiring.',
      icon: '✨',
    },
    colorAccent: 'text-yellow-300',
    borderClass: 'border-yellow-400/60',
    bgGradient: 'from-yellow-950/40 to-amber-950/60',
  },
  {
    avatarId: 'avatar_6',
    name: 'Vesper Ironquill',
    title: 'Grand Alchemist of the Obsidian Tower',
    heroClass: 'Battle Alchemist',
    rarity: 'Rare',
    rarityClass: 'rarity-rare',
    crest: '⚗️',
    lore: 'Vesper transformed the Tower of Silence into Historia\'s premier alchemical academy. Her potions have cured plagues, toppled towers, and once turned the Merchant\'s Caravan into solid gold by accident.',
    quote: '"Science and sorcery are merely spells with better documentation."',
    passive: {
      name: 'Transmutation',
      description: 'Gains a 10% discount at the Merchant\'s Caravan.',
      icon: '🧪',
    },
    colorAccent: 'text-lime-400',
    borderClass: 'border-lime-500/60',
    bgGradient: 'from-lime-950/40 to-green-950/60',
  },
  {
    avatarId: 'avatar_7',
    name: 'Gareth Cogsworth',
    title: 'Master Engineer of the Royal Clockworks',
    heroClass: 'Kingdom Engineer',
    rarity: 'Rare',
    rarityClass: 'rarity-rare',
    crest: '⚙️',
    lore: 'Gareth built the Great Clock Tower of Historia that tells not only the time but the tides of fortune. His mechanical dice-rolling contraption is considered cheating by everyone except the King.',
    quote: '"Every problem is a machine waiting to be understood."',
    passive: {
      name: 'Clockwork Precision',
      description: 'Lucky Dice Relic cooldown is reduced by 1 turn.',
      icon: '🔩',
    },
    colorAccent: 'text-cyan-400',
    borderClass: 'border-cyan-500/60',
    bgGradient: 'from-cyan-950/40 to-sky-950/60',
  },
  {
    avatarId: 'avatar_8',
    name: 'Lunara',
    title: 'Oracle of the Moonspire Sanctum',
    heroClass: 'Mystic Oracle',
    rarity: 'Epic',
    rarityClass: 'rarity-epic',
    crest: '🔮',
    lore: 'Lunara communes with the Celestial Scribes — ancient spirits who once wrote the trials that now appear on Historia\'s Trivia Scrolls. She sees not the future, but the shape of questions yet unasked.',
    quote: '"The answer arrives before the question if you know how to listen."',
    passive: {
      name: 'Foresight',
      description: 'Earns +5 bonus XP after completing a match.',
      icon: '🌙',
    },
    colorAccent: 'text-indigo-300',
    borderClass: 'border-indigo-400/60',
    bgGradient: 'from-indigo-950/40 to-violet-950/60',
  },
  {
    avatarId: 'avatar_9',
    name: 'Ragnar Embervein',
    title: 'Dragon Hunter of the Ashen Peaks',
    heroClass: 'Dragon Hunter',
    rarity: 'Legendary',
    rarityClass: 'rarity-legendary',
    crest: '🐉',
    lore: 'Ragnar has slain seven dragons and made boots from two of them. He claims the Crown of Wisdom is hidden inside the ancient dragon Ignarath\'s hoard, which he fully intends to collect — after winning the Quest.',
    quote: '"If it breathes fire, I\'ve already won. The trick is not burning down the library."',
    passive: {
      name: 'Dragonhide',
      description: 'Reduces Cursed Rune (Trap) coin penalty by 3 gold.',
      icon: '🔥',
    },
    colorAccent: 'text-red-400',
    borderClass: 'border-red-500/60',
    bgGradient: 'from-red-950/40 to-rose-950/60',
  },
  {
    avatarId: 'avatar_10',
    name: 'Countess Elara',
    title: 'Royal Tactician of the Iron Banner',
    heroClass: 'Royal Tactician',
    rarity: 'Epic',
    rarityClass: 'rarity-epic',
    crest: '⚜️',
    lore: 'Elara has never lost a battle of strategy or a game of trivia. She commands Historia\'s greatest wartime intelligence network, and she plays board games the same way she commands armies — with ruthless precision.',
    quote: '"The battlefield and the board are one — control information, control victory."',
    passive: {
      name: 'Grand Strategy',
      description: 'Coin Multiplier Relic yields +2 bonus gold on activation.',
      icon: '📜',
    },
    colorAccent: 'text-rose-400',
    borderClass: 'border-rose-500/60',
    bgGradient: 'from-rose-950/40 to-pink-950/60',
  },
];

export function getHeroByAvatarId(avatarId: string): HeroData | undefined {
  return HEROES.find(h => h.avatarId === avatarId);
}

// ─── Fantasy vocabulary replacements ─────────────────────────────────────────
export const FANTASY_LABELS = {
  // UI Labels
  lobby: 'Great Hall',
  shop: "Merchant's Caravan",
  achievements: 'Royal Honours',
  matchHistory: 'Chronicles',
  leaderboard: 'Hall of Legends',
  coins: 'Royal Gold',
  powerups: 'Relics',
  victory: 'Crowned Champion',
  ready: "Answer the King's Call",
  matchStart: 'The Quest Begins',
  // Tile Names
  mysteryTile: 'Ancient Relic',
  trapTile: 'Cursed Rune',
  bonusTile: 'Blessing Shrine',
  treasureTile: 'Royal Treasury',
  shortcutTile: 'Secret Passage',
  challengeTile: "Knight's Trial",
  wildTile: 'Fate Scroll',
  // Flavor messages
  flavorMessages: [
    'The castle bells echo across Historia…',
    'A forgotten relic awakens.',
    "The King's blessing smiles upon you.",
    'The Royal Librarians present another trial.',
    'A hidden passage has been discovered.',
    'The ancient spirits guide your journey.',
    'Wisdom lights your path.',
    'The royal vault reveals its treasures.',
    'Brave heroes never falter in Historia.',
    'The Crown of Wisdom awaits the worthy.',
    'Scholars of old watch from the library walls.',
    'The grand banners of Historia wave in your honour.',
    'A legend is born in the Kingdom of Historia.',
    'The ancient trials demand your best answers.',
    'Your name shall be written in the Chronicles.',
  ],
};

export function getRandomFlavorMessage(): string {
  const msgs = FANTASY_LABELS.flavorMessages;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
