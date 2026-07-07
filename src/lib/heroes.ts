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
  fullName: string;
  title: string;
  heroClass: string;
  kingdomOrigin: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  rarityClass: string;
  crest: string; // emoji symbol
  symbol: string; // another visual symbol representation
  lore: string;
  biography: string;
  personality: string;
  strengths: string;
  weaknesses: string;
  quote: string;
  goal: string;
  passive: HeroPassive;
  colorAccent: string; // Tailwind color class for accent
  borderClass: string;
  bgGradient: string;
  walkingAnim: string; // CSS class for walking personality
  idleAnim: string; // CSS class for idle personality
  victoryAnim: string;
  defeatAnim: string;
}

export const HEROES: HeroData[] = [
  {
    avatarId: 'avatar_2',
    name: 'Seraphel',
    fullName: 'Seraphel the Archivist',
    title: 'Voice of the Arcane Codex',
    heroClass: 'Arcane Scholar',
    kingdomOrigin: 'Arcane Academy of Oakhaven',
    rarity: 'Epic',
    rarityClass: 'rarity-epic',
    crest: '📚',
    symbol: '📜',
    lore: 'Seraphel memorised the 10,000-volume Library of Historia by age twelve. She now advises the Crown on ancient prophecies.',
    biography: 'Born in the floating spires of the Arcane Academy, Seraphel was a child prodigy who decoded the lost language of the First Scholars. She carries a magical tome that records every event in the kingdom in real-time, making her the ultimate authority on trivia.',
    personality: 'Highly intelligent, slightly arrogant, and obsessively curious.',
    strengths: 'Flawless memory, rapid problem-solving, vast magical knowledge.',
    weaknesses: 'Lacks practical real-world experience, physically frail.',
    quote: '"Every answer is already written — find the page."',
    goal: 'To document every single Relic of Wisdom before they are lost again.',
    passive: {
      name: 'Scholar\'s Edge',
      description: 'Gains +3 seconds on Hard difficulty trials.',
      icon: '📖',
    },
    colorAccent: 'text-purple-400',
    borderClass: 'border-purple-500/60',
    bgGradient: 'from-purple-950/40 to-indigo-950/60',
    walkingAnim: 'anim-walk-float',
    idleAnim: 'anim-idle-read-book',
    victoryAnim: 'anim-victory-magic-burst',
    defeatAnim: 'anim-defeat-drop-book',
  },
  {
    avatarId: 'avatar_3',
    name: 'Thorn Willowmere',
    fullName: 'Thorn of the Elder Trees',
    title: 'Warden of the Emerald Paths',
    heroClass: 'Forest Ranger',
    kingdomOrigin: 'The Whispering Forest',
    rarity: 'Rare',
    rarityClass: 'rarity-rare',
    crest: '🌿',
    symbol: '🏹',
    lore: 'Raised by the Guardians of the Enchanted Forest, Thorn can read the land like a map and knows all of Historia\'s Secret Passages.',
    biography: 'Found abandoned in the Whispering Forest, Thorn was raised by the ancient treants. He serves as the silent protector of the borders, armed with a bow carved from the World Tree. He ventures into the civilised kingdom only to track down corrupted relics.',
    personality: 'Quiet, observant, and deeply connected to nature.',
    strengths: 'Incredible tracking skills, camouflage, unmatched agility.',
    weaknesses: 'Distrustful of machinery and castle-dwellers.',
    quote: '"The forest remembers what men forget."',
    goal: 'To cleanse the kingdom of the cursed magic left by the shattered crown.',
    passive: {
      name: 'Pathfinder',
      description: 'Once per match, ignores a Cursed Rune penalty.',
      icon: '🗺️',
    },
    colorAccent: 'text-emerald-400',
    borderClass: 'border-emerald-500/60',
    bgGradient: 'from-emerald-950/40 to-green-950/60',
    walkingAnim: 'anim-walk-stealth',
    idleAnim: 'anim-idle-look-around',
    victoryAnim: 'anim-victory-bow-flourish',
    defeatAnim: 'anim-defeat-kneel',
  },
  {
    avatarId: 'avatar_4',
    name: 'Mira Ashveil',
    fullName: 'Mira of the Obsidian Court',
    title: 'Phantom of the Shadows',
    heroClass: 'Shadow Rogue',
    kingdomOrigin: 'Underground City of Nox',
    rarity: 'Epic',
    rarityClass: 'rarity-epic',
    crest: '🌑',
    symbol: '🗡️',
    lore: 'No one knows Mira\'s true origin. Her impossible knowledge of secret routes and hidden relics is both revered and feared.',
    biography: 'An orphan trained by the elusive Obsidian Court, Mira is the kingdom\'s greatest spy. She steals not for wealth, but for secrets. She views the quest for the Crown of Wisdom as the ultimate heist.',
    personality: 'Cynical, witty, and fiercely independent.',
    strengths: 'Lockpicking, stealth, quick reflexes.',
    weaknesses: 'Refuses to trust anyone, easily tempted by shiny treasures.',
    quote: '"The shadows know the truth kings dare not speak."',
    goal: 'To steal the Crown of Wisdom before the pompous knights get their hands on it.',
    passive: {
      name: 'Veil Step',
      description: 'Small chance (+15%) to gain +1 movement on any correct answer.',
      icon: '👻',
    },
    colorAccent: 'text-slate-400',
    borderClass: 'border-slate-400/60',
    bgGradient: 'from-slate-900/60 to-zinc-950/70',
    walkingAnim: 'anim-walk-brisk',
    idleAnim: 'anim-idle-toss-coin',
    victoryAnim: 'anim-victory-vanish',
    defeatAnim: 'anim-defeat-smoke-bomb',
  },
  {
    avatarId: 'avatar_5',
    name: 'Caldwyn',
    fullName: 'Lord Caldwyn Lightbringer',
    title: 'Paladin of the Silver Dawn',
    heroClass: 'Noble Paladin',
    kingdomOrigin: 'Sacred Temple of Sol',
    rarity: 'Legendary',
    rarityClass: 'rarity-legendary',
    crest: '☀️',
    symbol: '🛡️',
    lore: 'As the last of the Silver Dawn Order, he carries the blessed sword Luminar and vows to restore the Crown of Wisdom.',
    biography: 'Caldwyn is a paragon of virtue who draws power from the sun itself. After his temple was destroyed by a cursed relic, he swore a blood oath to purge darkness from the realm. He believes the Crown is a divine artifact that must be protected at all costs.',
    personality: 'Self-righteous, deeply devout, and unwavering.',
    strengths: 'Divine protection, inspiring leadership, immense physical strength.',
    weaknesses: 'Overconfident, easily blinded by his own strict moral code.',
    quote: '"Light reveals what darkness conceals."',
    goal: 'To destroy all cursed runes and restore the kingdom\'s divine grace.',
    passive: {
      name: 'Holy Aegis',
      description: 'Shield Relic lasts one extra turn before expiring.',
      icon: '✨',
    },
    colorAccent: 'text-yellow-300',
    borderClass: 'border-yellow-400/60',
    bgGradient: 'from-yellow-950/40 to-amber-950/60',
    walkingAnim: 'anim-walk-proud',
    idleAnim: 'anim-idle-pray',
    victoryAnim: 'anim-victory-sun-beam',
    defeatAnim: 'anim-defeat-shield-break',
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
