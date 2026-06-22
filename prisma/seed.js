const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { title: "First Steps", description: "Join a lobby for the first time.", icon: "Footprints", badgeId: "badge_1", xpReward: 50, coinReward: 20 },
  { title: "Ready Up", description: "Mark yourself as ready in a lobby.", icon: "CheckCircle", badgeId: "badge_2", xpReward: 50, coinReward: 20 },
  { title: "First Victory", description: "Win a multiplayer match.", icon: "Trophy", badgeId: "badge_3", xpReward: 200, coinReward: 100 },
  { title: "Perfect Match", description: "Win a match without getting any trivia question wrong.", icon: "ShieldAlert", badgeId: "badge_4", xpReward: 500, coinReward: 250 },
  { title: "Trivia Rookie", description: "Answer 10 trivia questions correctly.", icon: "Award", badgeId: "badge_5", xpReward: 100, coinReward: 50 },
  { title: "Trivia Adept", description: "Answer 50 trivia questions correctly.", icon: "Award", badgeId: "badge_6", xpReward: 250, coinReward: 120 },
  { title: "Trivia Master", description: "Answer 100 trivia questions correctly.", icon: "Crown", badgeId: "badge_7", xpReward: 600, coinReward: 300 },
  { title: "Lucky Roller", description: "Roll a 6 on the dice.", icon: "Dices", badgeId: "badge_8", xpReward: 50, coinReward: 20 },
  { title: "Double Sixes", description: "Roll a 6 twice in a row.", icon: "Dices", badgeId: "badge_9", xpReward: 120, coinReward: 60 },
  { title: "Coin Collector", description: "Collect 100 coins in a single match.", icon: "Coins", badgeId: "badge_10", xpReward: 150, coinReward: 75 },
  { title: "Coin Hoarder", description: "Accumulate 500 lifetime coins.", icon: "Coins", badgeId: "badge_11", xpReward: 300, coinReward: 150 },
  { title: "Wealthy Traveler", description: "Accumulate 1000 lifetime coins.", icon: "Coins", badgeId: "badge_12", xpReward: 500, coinReward: 250 },
  { title: "Board Explorer", description: "Land on 5 different tile types.", icon: "Map", badgeId: "badge_13", xpReward: 100, coinReward: 50 },
  { title: "Risk Taker", description: "Land on a Risk Tile and succeed.", icon: "Flame", badgeId: "badge_14", xpReward: 150, coinReward: 70 },
  { title: "Double Edged Sword", description: "Land on a Risk Tile and fail.", icon: "Frown", badgeId: "badge_15", xpReward: 80, coinReward: 40 },
  { title: "Treasure Hunter", description: "Open 3 Treasure Chests.", icon: "Gem", badgeId: "badge_16", xpReward: 120, coinReward: 60 },
  { title: "Lucky Chest", description: "Get a positive reward from a Treasure Chest.", icon: "Smile", badgeId: "badge_17", xpReward: 80, coinReward: 40 },
  { title: "Mimic Bait", description: "Get a trap from a Treasure Chest.", icon: "Skull", badgeId: "badge_18", xpReward: 80, coinReward: 40 },
  { title: "Trap Survivor", description: "Trigger 5 Trap Tiles in lifetime play.", icon: "Heart", badgeId: "badge_19", xpReward: 150, coinReward: 80 },
  { title: "Shielded", description: "Block a trap using a Shield power-up.", icon: "Shield", badgeId: "badge_20", xpReward: 100, coinReward: 50 },
  { title: "Immune to Pain", description: "Avoid a trap tile using Trap Immunity.", icon: "ShieldCheck", badgeId: "badge_21", xpReward: 120, coinReward: 60 },
  { title: "Category King", description: "Answer correctly in 5 different trivia categories.", icon: "Star", badgeId: "badge_22", xpReward: 200, coinReward: 100 },
  { title: "Knowledge God", description: "Answer correctly in all 10 categories.", icon: "Sparkles", badgeId: "badge_23", xpReward: 500, coinReward: 250 },
  { title: "Time Bender", description: "Use the Extra Time power-up.", icon: "Hourglass", badgeId: "badge_24", xpReward: 60, coinReward: 30 },
  { title: "Smart Shopper", description: "Buy 5 items from the Item Shop.", icon: "ShoppingCart", badgeId: "badge_25", xpReward: 100, coinReward: 50 },
  { title: "Shopaholic", description: "Spend 200 total coins in the Shop.", icon: "ShoppingBag", badgeId: "badge_26", xpReward: 200, coinReward: 100 },
  { title: "Teleporter", description: "Use a Teleport Scroll.", icon: "Zap", badgeId: "badge_27", xpReward: 80, coinReward: 40 },
  { title: "Fated Roll", description: "Use a Lucky Dice power-up.", icon: "Compass", badgeId: "badge_28", xpReward: 80, coinReward: 40 },
  { title: "Half and Half", description: "Use a 50/50 Hint power-up.", icon: "Scissors", badgeId: "badge_29", xpReward: 60, coinReward: 30 },
  { title: "First Duel", description: "Complete a 1v1 Duel match.", icon: "Swords", badgeId: "badge_30", xpReward: 100, coinReward: 50 },
  { title: "Team Player", description: "Complete a 2v2 Team Battle match.", icon: "Users2", badgeId: "badge_31", xpReward: 100, coinReward: 50 },
  { title: "Free for All Fighter", description: "Complete a Free-for-All match.", icon: "Globe", badgeId: "badge_32", xpReward: 100, coinReward: 50 },
  { title: "Hot Streak", description: "Answer 5 trivia questions correctly in a row.", icon: "Flame", badgeId: "badge_33", xpReward: 150, coinReward: 75 },
  { title: "Unstoppable", description: "Answer 10 trivia questions correctly in a row.", icon: "Zap", badgeId: "badge_34", xpReward: 300, coinReward: 150 },
  { title: "Generous Host", description: "Create a private room.", icon: "Home", badgeId: "badge_35", xpReward: 80, coinReward: 40 },
  { title: "Socialite", description: "Join a room using a 6-character room code.", icon: "Link2", badgeId: "badge_36", xpReward: 80, coinReward: 40 },
  { title: "Fast Thinker", description: "Answer a trivia question correctly in under 3 seconds.", icon: "Timer", badgeId: "badge_37", xpReward: 100, coinReward: 50 },
  { title: "Hard Mode Champ", description: "Answer 5 Hard difficulty questions correctly.", icon: "Brain", badgeId: "badge_38", xpReward: 250, coinReward: 120 },
  { title: "Easy Peasy", description: "Answer 10 Easy difficulty questions correctly.", icon: "Smile", badgeId: "badge_39", xpReward: 100, coinReward: 50 },
  { title: "Level Up!", description: "Reach profile level 5.", icon: "TrendingUp", badgeId: "badge_40", xpReward: 150, coinReward: 80 },
  { title: "Double Digits", description: "Reach profile level 10.", icon: "TrendingUp", badgeId: "badge_41", xpReward: 300, coinReward: 150 },
  { title: "Veteran Quizzer", description: "Reach profile level 20.", icon: "Milestone", badgeId: "badge_42", xpReward: 600, coinReward: 300 },
  { title: "Shortcut Seeker", description: "Land on a Shortcut tile.", icon: "ArrowUpRight", badgeId: "badge_43", xpReward: 80, coinReward: 40 },
  { title: "Mystery Solver", description: "Land on a Mystery tile.", icon: "HelpCircle", badgeId: "badge_44", xpReward: 80, coinReward: 40 },
  { title: "Tile Revealer", description: "Use Tile Reveal to preview the board path.", icon: "Eye", badgeId: "badge_45", xpReward: 80, coinReward: 40 },
  { title: "Double Agent", description: "Use a Coin Multiplier to double your round gains.", icon: "TrendingUp", badgeId: "badge_46", xpReward: 100, coinReward: 50 },
  { title: "Event Handler", description: "Experience 3 global board events.", icon: "AlertCircle", badgeId: "badge_47", xpReward: 150, coinReward: 80 },
  { title: "MVP Champion", description: "Earn MVP status in a match.", icon: "Sparkles", badgeId: "badge_48", xpReward: 250, coinReward: 125 },
  { title: "Reunion", description: "Play 5 matches with friends in the same room.", icon: "PartyPopper", badgeId: "badge_49", xpReward: 200, coinReward: 100 },
  { title: "Trivia Legend", description: "Complete all other 49 achievements.", icon: "Crown", badgeId: "badge_50", xpReward: 1000, coinReward: 500 }
];

const DAILY_MISSIONS = [
  { title: "Daily Log", description: "Log in today to claim your reward.", type: "LOGIN", target: 1, xpReward: 50, coinReward: 20 },
  { title: "First Win", description: "Win 1 match in any mode.", type: "WIN_MATCH", target: 1, xpReward: 150, coinReward: 80 },
  { title: "Trivia Lover", description: "Answer 5 trivia questions correctly.", type: "CORRECT_ANSWERS", target: 5, xpReward: 100, coinReward: 50 },
  { title: "Rich Quizzer", description: "Earn 50 coins in a single match.", type: "EARN_COINS", target: 50, xpReward: 100, coinReward: 50 },
  { title: "Risk Explorer", description: "Land on a Risk or Mystery tile.", type: "LAND_ON_TILE", target: 1, xpReward: 80, coinReward: 40 }
];

const rawQuestions = {
  "General Knowledge": {
    EASY: [
      { q: "What color is a banana?", o: ["Blue","Yellow","Red","Green"], a: "Yellow", f: "Bananas are yellow because of a pigment called carotenoid. Unripe bananas are green because chlorophyll masks the yellow — it fades as the fruit ripens." },
      { q: "How many days are in a leap year?", o: ["365","366","364","360"], a: "366", f: "A leap year has 366 days to account for the extra ~6 hours the Earth takes to orbit the Sun each year. Without leap years, our calendar would drift about 24 days every century!" },
      { q: "Which animal is known as the King of the Jungle?", o: ["Tiger","Lion","Elephant","Leopard"], a: "Lion", f: "Lions actually live in grasslands and savannas, not jungles! The 'King of the Jungle' title is a historic nickname. Tigers are the largest wild cats." },
      { q: "What is the primary language spoken in Brazil?", o: ["Spanish","English","Portuguese","French"], a: "Portuguese", f: "Brazil is the only country in South America that speaks Portuguese. It was colonized by Portugal in 1500, unlike most of its neighbors colonized by Spain." },
      { q: "How many letters are in the English alphabet?", o: ["24","25","26","27"], a: "26", f: "The English alphabet has 26 letters, but the letter 'W' was originally written as two 'V's placed together — hence its name 'double-u'!" },
      { q: "Which is the largest ocean on Earth?", o: ["Atlantic Ocean","Indian Ocean","Southern Ocean","Pacific Ocean"], a: "Pacific Ocean", f: "The Pacific Ocean is so massive it covers more area than all of Earth's land combined — about 165 million square kilometers!" },
      { q: "Which fruit is traditionally given to teachers?", o: ["Orange","Banana","Apple","Grape"], a: "Apple", f: "In the 1800s, American frontier families gave teachers apples as payment or thanks. The tradition stuck and became a cultural symbol of appreciation for educators." }
    ],
    MEDIUM: [
      { q: "What is the name of the classic Italian bread made with olive oil?", o: ["Ciabatta","Focaccia","Brioche","Baguette"], a: "Focaccia", f: "Focaccia is one of the oldest breads in the world, dating back to ancient Romans and Etruscans. It's the ancestor of modern pizza!" },
      { q: "What does the Roman numeral 'C' represent?", o: ["50","100","500","1000"], a: "100", f: "'C' stands for 'Centum', the Latin word for 100. The word 'century', meaning 100 years, comes from the same root." },
      { q: "What is the capital of Australia?", o: ["Sydney","Melbourne","Brisbane","Canberra"], a: "Canberra", f: "Canberra was purpose-built to be Australia's capital because Sydney and Melbourne couldn't agree on which city should hold the honor. It was designed by American architects Walter and Marion Griffin." },
      { q: "Which is the smallest country in the world?", o: ["Monaco","Vatican City","San Marino","Liechtenstein"], a: "Vatican City", f: "Vatican City is only 0.44 km² — smaller than many city parks! It has its own postal service, radio station, and even its own football team." },
      { q: "Which French queen is famously associated with 'Let them eat cake'?", o: ["Marie Antoinette","Catherine de' Medici","Eleanor of Aquitaine","Mary Queen of Scots"], a: "Marie Antoinette", f: "Historians believe Marie Antoinette never actually said this — the quote appeared in Jean-Jacques Rousseau's writing before she was old enough to be queen, likely referring to a different princess." },
      { q: "What is the chemical symbol for Gold?", o: ["Go","Gd","Au","Ag"], a: "Au", f: "'Au' comes from 'Aurum', the Latin word for gold. Ancient Romans treasured gold so much they used it as currency, jewelry, and even in medicine." },
      { q: "How many pockets does a standard pool table have?", o: ["4","6","8","10"], a: "6", f: "A standard pool table has 6 pockets — one at each corner and one at the midpoint of each long side. Snooker tables also have 6 pockets but are much larger." }
    ],
    HARD: [
      { q: "Which state of matter has the lowest density?", o: ["Solid","Liquid","Gas","Bose-Einstein Condensate"], a: "Gas", f: "Gas molecules are so spread out that air — mostly nitrogen and oxygen — has a density of only about 1.2 kg/m³, compared to water at 1000 kg/m³. Bose-Einstein condensates exist at near absolute zero." },
      { q: "Who was the prime minister of the UK during most of WWII?", o: ["Neville Chamberlain","Winston Churchill","Clement Attlee","Anthony Eden"], a: "Winston Churchill", f: "Churchill's iconic 'V for Victory' sign is still used worldwide today. He was also a Nobel Prize winner — for Literature in 1953, for his historical writings." },
      { q: "Which island country is home to the dodo bird's native habitat?", o: ["Madagascar","Mauritius","Seychelles","Maldives"], a: "Mauritius", f: "The dodo went extinct in the late 1600s, less than 100 years after humans arrived on Mauritius. It's now a symbol of human-caused extinction and is featured in Alice in Wonderland." },
      { q: "What is the standard unit of electrical resistance?", o: ["Volt","Ampere","Ohm","Watt"], a: "Ohm", f: "The ohm is named after German physicist Georg Simon Ohm, who discovered the relationship between voltage, current, and resistance — now known as Ohm's Law: V = IR." },
      { q: "What is the small decorative stroke at the end of a letter's main stem called?", o: ["Sans","Serif","Ligature","Kerning"], a: "Serif", f: "Serifs originated in Roman stone inscriptions — chisels naturally created small strokes at letter ends. 'Sans-serif' fonts (without serifs) became popular in the 20th century for clean, modern designs." },
      { q: "What is the name of the world's highest uninterrupted waterfall?", o: ["Niagara Falls","Angel Falls","Victoria Falls","Yosemite Falls"], a: "Angel Falls", f: "Angel Falls in Venezuela is 979 meters tall — nearly 20 times the height of Niagara Falls! The water actually turns to mist before it reaches the ground at the base." }
    ]
  },
  "Science": {
    EASY: [
      { q: "What is the chemical symbol for Water?", o: ["H2O","CO2","O2","NaCl"], a: "H2O", f: "Water is the only substance on Earth that naturally exists in all three states — solid (ice), liquid (water), and gas (steam) — within the normal temperature range of our planet." },
      { q: "Which planet is closest to the Sun?", o: ["Venus","Earth","Mars","Mercury"], a: "Mercury", f: "Mercury is the closest to the Sun but NOT the hottest planet — Venus is! Mercury has no atmosphere to trap heat, so its dark side reaches -180°C at night." },
      { q: "What force pulls objects toward the Earth?", o: ["Magnetism","Friction","Gravity","Electricity"], a: "Gravity", f: "Newton discovered gravity when an apple fell near him — though the story of it hitting his head is likely a myth. Gravity is the weakest of the four fundamental forces but has infinite range." },
      { q: "How many bones are in the adult human body?", o: ["206","300","150","250"], a: "206", f: "Babies are born with about 300 bones! Many fuse together as we grow. The smallest bone is the stirrup (stapes) in the ear — just 3mm long." },
      { q: "What do bees collect to make honey?", o: ["Pollen","Sap","Water","Nectar"], a: "Nectar", f: "A single bee produces only 1/12 teaspoon of honey in its lifetime. To make one jar of honey, bees collectively travel about 55,000 miles and visit 2 million flowers!" },
      { q: "Which planet is known as the Red Planet?", o: ["Jupiter","Saturn","Mars","Neptune"], a: "Mars", f: "Mars appears red because its surface is covered in iron oxide — rust! It has the largest volcano in the solar system, Olympus Mons, which is three times taller than Mount Everest." },
      { q: "What part of the plant conducts photosynthesis?", o: ["Roots","Stem","Leaf","Flower"], a: "Leaf", f: "Leaves are green because of chlorophyll, which absorbs red and blue light but reflects green. In autumn, chlorophyll breaks down, revealing the yellow and orange pigments that were always there!" }
    ],
    MEDIUM: [
      { q: "What is the hardest natural substance on Earth?", o: ["Gold","Iron","Diamond","Quartz"], a: "Diamond", f: "Diamond is pure carbon arranged in a crystal lattice. It's so hard it can only be scratched by another diamond — yet it can be shattered with a hammer because hardness and toughness are different properties!" },
      { q: "Which gas do plants absorb for photosynthesis?", o: ["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"], a: "Carbon Dioxide", f: "Plants absorb CO₂ and release oxygen — exactly the opposite of what humans do. A single mature tree can absorb up to 22 kg of CO₂ per year and release enough oxygen for 2 people." },
      { q: "What temperature does water freeze at in Celsius?", o: ["0°C","32°C","100°C","-10°C"], a: "0°C", f: "Water freezes at 0°C, but hot water can sometimes freeze faster than cold water — this is called the Mpemba effect, first recorded by Aristotle and still not fully explained by science!" },
      { q: "What is the main component of natural gas?", o: ["Ethane","Propane","Butane","Methane"], a: "Methane", f: "Methane (CH₄) makes up 70–90% of natural gas. It's also produced by cow digestion — livestock account for about 14.5% of global greenhouse gas emissions!" },
      { q: "Which organ consumes the most energy?", o: ["Heart","Liver","Brain","Lungs"], a: "Brain", f: "Your brain uses about 20% of your body's energy despite being only 2% of your body weight. It consumes the same amount of power as a 20-watt light bulb — even while you sleep!" },
      { q: "What type of energy is stored in a battery?", o: ["Kinetic","Thermal","Chemical","Electrical"], a: "Chemical", f: "Batteries store chemical potential energy and convert it to electrical energy through chemical reactions. The first battery was invented by Alessandro Volta in 1800 — the unit 'volt' is named after him." },
      { q: "Which subatomic particle has a negative charge?", o: ["Proton","Neutron","Electron","Positron"], a: "Electron", f: "Electrons are incredibly tiny — a proton is about 1836 times heavier than an electron. Electrons moving through a conductor create electricity, which powers nearly every device you use." }
    ],
    HARD: [
      { q: "What is the speed of light in vacuum?", o: ["299,792 km/s","150,000 km/s","340 m/s","1,000,000 km/s"], a: "299,792 km/s", f: "Light travels so fast that it takes only 1.3 seconds to travel from the Moon to Earth, but over 8 minutes from the Sun. The light you see from distant stars may have traveled millions of years!" },
      { q: "What is the element with atomic number 1?", o: ["Helium","Oxygen","Hydrogen","Carbon"], a: "Hydrogen", f: "Hydrogen is the most abundant element in the universe — making up about 75% of all normal matter. Stars like our Sun are essentially giant balls of hydrogen undergoing nuclear fusion." },
      { q: "Which theory did Einstein propose in 1915?", o: ["Quantum Mechanics","Theory of General Relativity","Theory of Special Relativity","Big Bang Theory"], a: "Theory of General Relativity", f: "Einstein's General Relativity predicts that massive objects bend spacetime — GPS satellites must account for this effect! Without relativistic corrections, GPS would be off by about 10 km per day." },
      { q: "What is the powerhouse of the cell?", o: ["Nucleus","Ribosome","Mitochondria","Golgi Apparatus"], a: "Mitochondria", f: "Mitochondria have their own DNA separate from the cell nucleus, suggesting they were once independent bacteria that merged with larger cells about 1.5 billion years ago — called the endosymbiotic theory." },
      { q: "What is absolute zero temperature in Kelvin?", o: ["0 K","-273 K","273 K","100 K"], a: "0 K", f: "At 0 Kelvin (-273.15°C), all molecular motion theoretically stops. Scientists have gotten within billionths of a degree of absolute zero, but can never fully reach it due to quantum uncertainty." },
      { q: "What is the most abundant element in Earth's crust?", o: ["Silicon","Iron","Oxygen","Aluminum"], a: "Oxygen", f: "Oxygen makes up about 46% of Earth's crust by mass — mostly bound in silicate minerals like quartz. The oxygen we breathe only exists freely because of photosynthesis by ancient cyanobacteria!" }
    ]
  },
  "History": {
    EASY: [
      { q: "Who was the first president of the United States?", o: ["Thomas Jefferson","Abraham Lincoln","George Washington","John Adams"], a: "George Washington", f: "Washington was unanimously elected — the only president to win the Electoral College with 100% of votes, and he did it twice. He also refused a third term, setting a precedent that lasted 150 years." },
      { q: "Which country gifted the Statue of Liberty to the USA?", o: ["United Kingdom","France","Germany","Italy"], a: "France", f: "The Statue of Liberty was a joint project — France built the statue and America built the pedestal. Sculptor Frédéric Auguste Bartholdi modeled Lady Liberty's face after his own mother!" },
      { q: "In which year did World War II end?", o: ["1918","1939","1945","1950"], a: "1945", f: "WWII ended in two phases: V-E Day (Victory in Europe) on May 8, 1945, and V-J Day (Victory over Japan) on September 2, 1945. It remains the deadliest conflict in human history, with over 70 million casualties." },
      { q: "Which famous ship sank on its maiden voyage in 1912?", o: ["Britannic","Olympic","Titanic","Lusitania"], a: "Titanic", f: "The Titanic was only about 400 miles from Newfoundland when it sank. It carried enough lifeboats for only about half the passengers — the 'unsinkable' design gave organizers false confidence." },
      { q: "Who was the first man to step on the Moon?", o: ["Buzz Aldrin","Neil Armstrong","Yuri Gagarin","Michael Collins"], a: "Neil Armstrong", f: "Armstrong's famous words were 'That's one small step for [a] man, one giant leap for mankind.' The 'a' was lost in transmission. He and Buzz Aldrin spent 2.5 hours on the lunar surface." },
      { q: "Which ancient civilization built the Pyramids?", o: ["Greeks","Romans","Egyptians","Aztecs"], a: "Egyptians", f: "The Great Pyramid of Giza was the tallest man-made structure in the world for over 3,800 years! Recent discoveries suggest the builders were not slaves but paid workers who received food and medical care." }
    ],
    MEDIUM: [
      { q: "Who was the first emperor of the Roman Empire?", o: ["Julius Caesar","Augustus","Nero","Marcus Aurelius"], a: "Augustus", f: "Julius Caesar was never officially emperor — he was dictator. His adopted son Augustus became the first true Roman Emperor in 27 BC. The month of August is named after him!" },
      { q: "What was the German code machine broken during WWII?", o: ["Enigma","Lorenz","Bletchley","Cipher"], a: "Enigma", f: "Alan Turing's work cracking the Enigma machine at Bletchley Park is estimated to have shortened WWII by 2–4 years, potentially saving 14 million lives. Turing was later criminally prosecuted for being gay." },
      { q: "In which country did the Industrial Revolution begin?", o: ["Germany","France","United States","Great Britain"], a: "Great Britain", f: "Britain's Industrial Revolution began around 1760, fueled by coal, the steam engine, and textile mills. Within 100 years, it transformed Britain from a rural farming society into the world's leading industrial nation." },
      { q: "Who wrote the 'I Have a Dream' speech?", o: ["Malcolm X","Martin Luther King Jr.","John F. Kennedy","Rosa Parks"], a: "Martin Luther King Jr.", f: "King delivered this speech on August 28, 1963, to over 250,000 people at the Lincoln Memorial. The famous 'I have a dream' section was actually improvised — it wasn't in his written speech!" },
      { q: "Which treaty officially ended World War I?", o: ["Treaty of Versailles","Treaty of Paris","Treaty of Ghent","Treaty of Utrecht"], a: "Treaty of Versailles", f: "The Treaty of Versailles imposed such harsh penalties on Germany that many historians believe it directly caused the rise of Hitler and WWII. Germany finally paid off its WWI reparations debt in 2010." },
      { q: "Who was the first female Prime Minister of the United Kingdom?", o: ["Theresa May","Margaret Thatcher","Angela Merkel","Queen Elizabeth II"], a: "Margaret Thatcher", f: "Margaret Thatcher served as PM from 1979–1990, earning the nickname 'The Iron Lady.' She was known for her uncompromising leadership style and radical economic policies known as Thatcherism." }
    ],
    HARD: [
      { q: "In which century did the Black Death peak in Europe?", o: ["12th Century","13th Century","14th Century","15th Century"], a: "14th Century", f: "The Black Death (1347–1351) killed an estimated 30–60% of Europe's population. So many people died that labor became scarce, inadvertently helping end the feudal system and empowering surviving peasants." },
      { q: "Who was the last active ruler of the Ptolemaic Kingdom of Egypt?", o: ["Cleopatra VII","Nefertiti","Hatshepsut","Arsinoe IV"], a: "Cleopatra VII", f: "Cleopatra VII was actually Greek, not Egyptian — the Ptolemaic dynasty was founded by one of Alexander the Great's generals. She was the first ruler of her dynasty to actually learn the Egyptian language!" },
      { q: "Which Roman Emperor made his horse a senator?", o: ["Caligula","Nero","Commodus","Domitian"], a: "Caligula", f: "Caligula reportedly threatened to make his horse Incitatus a consul, not just senator. Many historians believe this was a political insult — mocking the senate by suggesting a horse could do their job." },
      { q: "What year did the Berlin Wall fall?", o: ["1985","1989","1991","1993"], a: "1989", f: "The Berlin Wall fell on November 9, 1989, after a miscommunicated announcement said East Germans could cross freely 'immediately.' Crowds gathered and guards, overwhelmed, eventually let people through." },
      { q: "Which dynasty ruled China during its Golden Age of poetry?", o: ["Ming Dynasty","Han Dynasty","Tang Dynasty","Song Dynasty"], a: "Tang Dynasty", f: "The Tang Dynasty (618–907 AD) is considered China's golden age. The poet Du Fu and Li Bai both lived during this era. China's population reached 80 million — making it the world's most populous nation." },
      { q: "Who was the legendary founder of Rome?", o: ["Romulus","Aeneas","Augustus","Pompey"], a: "Romulus", f: "According to legend, Romulus and Remus were raised by a she-wolf. After founding Rome, Romulus killed Remus in a dispute. The city of Rome (Roma) is literally named after Romulus." }
    ]
  },
  "Geography": {
    EASY: [
      { q: "What is the capital of France?", o: ["London","Berlin","Rome","Paris"], a: "Paris", f: "Paris is nicknamed 'The City of Light' (La Ville Lumière) for being a center of education and ideas during the Enlightenment — and because it was one of the first cities in Europe to use gas street lighting." },
      { q: "Which country is home to the Kangaroo?", o: ["South Africa","New Zealand","Australia","Kenya"], a: "Australia", f: "Kangaroos can't walk backwards, which is why Australia chose them for its coat of arms — symbolizing a nation that only moves forward. A baby kangaroo (joey) is only the size of a jellybean at birth!" },
      { q: "What is the largest country by land area?", o: ["Canada","China","United States","Russia"], a: "Russia", f: "Russia is so large it spans 11 time zones! It's roughly twice the size of the next largest country, Canada. Russia has both Europe's highest mountain (Elbrus) and Asia's deepest lake (Baikal)." },
      { q: "Which river is the longest in the world?", o: ["Amazon River","Nile River","Yangtze River","Mississippi River"], a: "Nile River", f: "The Nile flows northward through 11 countries for about 6,650 km. Ancient Egyptian civilization depended entirely on its annual floods for agriculture — the Nile literally built one of history's greatest empires." },
      { q: "What is the tallest mountain on Earth?", o: ["K2","Mount Kilimanjaro","Mount Everest","Mount Fuji"], a: "Mount Everest", f: "Everest grows about 4mm taller every year due to tectonic movement! If measured from the Earth's core, Chimborazo in Ecuador is actually farther from the center than Everest due to the Earth's bulge at the equator." },
      { q: "Which desert is the largest hot desert?", o: ["Gobi","Kalahari","Sahara","Arabian"], a: "Sahara", f: "The Sahara is almost as large as the United States, but it wasn't always a desert — about 6,000 years ago it was a green, fertile land with rivers and lakes. Climate shifts transformed it into desert." }
    ],
    MEDIUM: [
      { q: "What is the capital of Japan?", o: ["Kyoto","Osaka","Hiroshima","Tokyo"], a: "Tokyo", f: "Tokyo is the world's most populated metropolitan area with over 37 million people. It was formerly called Edo and only became the capital when Emperor Meiji moved there in 1869." },
      { q: "Which country has the most natural lakes?", o: ["USA","Russia","Canada","Sweden"], a: "Canada", f: "Canada has more lakes than all other countries combined — about 879,800 lakes! The Great Lakes alone contain about 21% of the world's surface fresh water." },
      { q: "Which sea lies between Europe and Africa?", o: ["Caribbean Sea","Mediterranean Sea","Red Sea","Baltic Sea"], a: "Mediterranean Sea", f: "The Mediterranean Sea is almost completely landlocked and gets saltier every year because more water evaporates than flows in. Ancient Romans called it 'Mare Nostrum' — meaning 'Our Sea'." },
      { q: "Which US state is the largest by area?", o: ["Texas","California","Alaska","Montana"], a: "Alaska", f: "Alaska is so large that if you overlaid it on the contiguous US, it would stretch from Florida to California. It has more coastline than all other US states combined — about 54,720 km!" },
      { q: "What is the capital of Canada?", o: ["Toronto","Vancouver","Montreal","Ottawa"], a: "Ottawa", f: "Ottawa was chosen as Canada's capital by Queen Victoria in 1857 — partly because it was considered safe from potential US invasion, being farther inland than Toronto or Montreal." },
      { q: "Which South American country is landlocked?", o: ["Bolivia","Ecuador","Peru","Venezuela"], a: "Bolivia", f: "Bolivia lost its coastline to Chile in the War of the Pacific (1879–1884). Despite being landlocked, it still has a navy — it patrols Lake Titicaca and navigable rivers, keeping hope alive for a return to the sea!" }
    ],
    HARD: [
      { q: "Which country has the longest coastline?", o: ["Russia","Canada","Australia","Indonesia"], a: "Canada", f: "Canada's coastline stretches about 202,080 km — long enough to circle the Earth five times! It includes the jagged coastlines of thousands of islands in its Arctic archipelago." },
      { q: "What is the deepest point in the world's oceans?", o: ["Puerto Rico Trench","Mariana Trench","Java Trench","Sunda Trench"], a: "Mariana Trench", f: "The Mariana Trench's Challenger Deep reaches about 11,034 meters — deep enough to submerge Mount Everest with over 2 km to spare! Only three people have ever visited the deepest point." },
      { q: "Which African country has three capital cities?", o: ["Nigeria","Kenya","South Africa","Egypt"], a: "South Africa", f: "South Africa has three capitals: Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial). This unusual arrangement was a compromise between different groups after the Second Boer War." },
      { q: "Which city is located on two continents?", o: ["Moscow","Istanbul","Cairo","Athens"], a: "Istanbul", f: "Istanbul is split by the Bosphorus Strait — the European side holds most historic landmarks including the Hagia Sophia, while the Asian side (Anatolia) covers a larger area. It's been a capital of three empires!" },
      { q: "What is the capital of Switzerland?", o: ["Zurich","Geneva","Bern","Basel"], a: "Bern", f: "Bern is Switzerland's federal city (not officially 'capital'), chosen to avoid rivalry between larger cities. It's nicknamed 'the city of bears' — the name Bern likely derives from the German word for bear." },
      { q: "Which European country is divided into Cantons?", o: ["Austria","Switzerland","Belgium","Netherlands"], a: "Switzerland", f: "Switzerland has 26 cantons — each with its own constitution, government, and laws. The country has 4 official languages (German, French, Italian, Romansh) and is considered a model of direct democracy." }
    ]
  },
  "Technology": {
    EASY: [
      { q: "What does 'WWW' stand for?", o: ["World Wide Web","World Wide Wrestling","Word Wide Web","World Wide Wonders"], a: "World Wide Web", f: "Tim Berners-Lee invented the World Wide Web in 1989 at CERN. He made it freely available to everyone and never patented it — a decision that changed the world. He was knighted by Queen Elizabeth II in 2004." },
      { q: "Who co-founded Microsoft alongside Paul Allen?", o: ["Steve Jobs","Bill Gates","Mark Zuckerberg","Jeff Bezos"], a: "Bill Gates", f: "Gates and Allen founded Microsoft in 1975 — Gates was only 19! Their first big break was writing the BASIC interpreter for the Altair 8800 microcomputer. Gates dropped out of Harvard to pursue it." },
      { q: "What is the brain of a computer called?", o: ["RAM","GPU","CPU","Hard Drive"], a: "CPU", f: "The first CPU, the Intel 4004, was released in 1971 and had only 2,300 transistors. Modern CPUs have over 100 billion transistors — that's more than 40 million times more complex in just 50 years!" },
      { q: "Which company makes the iPhone?", o: ["Samsung","Google","Apple","Microsoft"], a: "Apple", f: "Steve Jobs introduced the first iPhone on January 9, 2007, calling it 'an iPod, a phone, and an internet communicator' all in one. The original iPhone didn't even have an App Store — that came a year later!" },
      { q: "What does USB stand for?", o: ["Universal Serial Bus","Unique Serial Board","Universal System Boot","Union Serial Board"], a: "Universal Serial Bus", f: "USB was created in 1996 to replace the mess of incompatible connectors on PCs. The original design team included engineers from Intel, IBM, and Microsoft. Over 10 billion USB devices are in use worldwide." },
      { q: "What is the most popular search engine?", o: ["Yahoo","Bing","Google","DuckDuckGo"], a: "Google", f: "Google processes over 8.5 billion searches per day. The name comes from 'googol' (the number 10¹⁰⁰) — Larry Page and Sergey Brin chose it to reflect their mission to organize the world's vast information." }
    ],
    MEDIUM: [
      { q: "What does PDF stand for?", o: ["Portable Document Format","Personal Document File","Printable Data File","Portable Directory File"], a: "Portable Document Format", f: "Adobe invented PDF in 1991 to solve the problem of documents looking different on different computers. It was made an open standard in 2008 — before that, you needed Adobe's own software to create PDFs." },
      { q: "How many bits are in one byte?", o: ["4","8","16","32"], a: "8", f: "The term 'byte' was coined by Werner Buchholz in 1956. The choice of 8 bits became dominant because 8 is a power of 2 and efficient for hardware design. A single character in ASCII requires exactly one byte." },
      { q: "Which programming language is mainly used for web interactivity?", o: ["Python","C++","Java","JavaScript"], a: "JavaScript", f: "JavaScript was created in just 10 days by Brendan Eich in 1995! Despite the name, JavaScript has almost nothing to do with Java — it was renamed from 'Mocha' and 'LiveScript' for marketing reasons." },
      { q: "What was the first commercial programming language?", o: ["COBOL","FORTRAN","LISP","BASIC"], a: "FORTRAN", f: "FORTRAN (FORmula TRANslation), created by IBM in 1957, was the first high-level programming language for scientific calculations. Some FORTRAN code written in the 1960s is still running in weather forecasting systems today!" },
      { q: "Who created the World Wide Web in 1989?", o: ["Tim Berners-Lee","Alan Turing","Ada Lovelace","Vint Cerf"], a: "Tim Berners-Lee", f: "Berners-Lee's boss at CERN initially returned his World Wide Web proposal with the note 'Vague but exciting.' That vague idea became the foundation of modern internet and changed civilization forever." },
      { q: "Which company developed the Android operating system?", o: ["Apple","Microsoft","Android Inc.","Nokia"], a: "Android Inc.", f: "Android was created by Android Inc. in 2003, then acquired by Google in 2005. The name 'Android' refers to a robot designed to look human. Each Android version was named after a dessert (KitKat, Lollipop, Oreo) until Android 10." }
    ],
    HARD: [
      { q: "What does 'SQL' stand for?", o: ["Structured Query Language","Sequential Query Link","Simple Query Language","System Query Log"], a: "Structured Query Language", f: "SQL was developed at IBM in the early 1970s by Donald Chamberlin and Raymond Boyce. It's been the standard language for relational databases for over 50 years and remains one of the most in-demand tech skills today." },
      { q: "Who is known as the father of modern computer science?", o: ["Charles Babbage","Alan Turing","John von Neumann","Steve Wozniak"], a: "Alan Turing", f: "Alan Turing invented the concept of the 'Turing machine' — a theoretical model that defines what computation means. He also created the Turing Test for artificial intelligence. He was tragically persecuted for his sexuality." },
      { q: "Which encryption standard secures HTTP connections?", o: ["AES","SSL/TLS","RSA","DES"], a: "SSL/TLS", f: "SSL/TLS encrypts data between your browser and websites — that's why URLs start with 'https' (the 's' stands for secure). Without it, everyone on your network could read your passwords and credit card numbers in plain text." },
      { q: "In what year was Python first released?", o: ["1989","1991","1995","2000"], a: "1991", f: "Python was created by Guido van Rossum and named after Monty Python's Flying Circus — not the snake! It was designed to be readable and simple, which is why it's now the world's most popular programming language." },
      { q: "Which protocol resolves domain names to IP addresses?", o: ["HTTP","DNS","FTP","SMTP"], a: "DNS", f: "DNS (Domain Name System) is often called 'the phone book of the internet.' When you type google.com, DNS translates it to an IP address like 142.250.80.46. Without DNS, you'd need to memorize numbers for every website." },
      { q: "What was the name of the first general-purpose electronic computer?", o: ["ENIAC","UNIVAC","EDVAC","Colossus"], a: "ENIAC", f: "ENIAC (Electronic Numerical Integrator and Computer), completed in 1945, weighed 27 tons and filled an entire room. It could perform 5,000 additions per second — a modern smartphone is billions of times faster!" }
    ]
  },
  "Gaming": {
    EASY: [
      { q: "What is the name of the main character in Legend of Zelda?", o: ["Zelda","Link","Mario","Luigi"], a: "Link", f: "Link is named 'Link' because he was designed to be a 'link' between the player and the game world. Many players think the main character IS Zelda — but Zelda is the princess. Link is the hero you control!" },
      { q: "Which blocky game is the best-selling video game of all time?", o: ["Minecraft","Tetris","GTA V","Wii Sports"], a: "Minecraft", f: "Minecraft has sold over 238 million copies across all platforms. Creator Markus 'Notch' Persson made the first version in just 6 days. Microsoft bought the game for $2.5 billion in 2014." },
      { q: "What color is Mario's cap?", o: ["Green","Blue","Red","Yellow"], a: "Red", f: "Mario wears red because in the original Donkey Kong arcade game, the artists couldn't animate hair moving, so they gave him a hat instead. He also has a mustache so they didn't need to animate a mouth!" },
      { q: "Which game features a yellow circle eating dots in a maze?", o: ["Pac-Man","Donkey Kong","Space Invaders","Frogger"], a: "Pac-Man", f: "Pac-Man's original Japanese name was 'Puck-Man' but it was changed for American release to prevent vandals from changing the 'P' to an 'F.' Pac-Man's design was inspired by a pizza with a slice missing." },
      { q: "What is the primary objective in Tetris?", o: ["Clear lines","Defeat enemies","Reach the finish line","Collect coins"], a: "Clear lines", f: "Tetris was created in 1984 by Soviet software engineer Alexey Pajitnov on a Soviet Academy of Sciences computer. The Soviet government owned the rights for years — Pajitnov didn't receive royalties until 1996!" },
      { q: "Which console introduced motion control gaming in 2006?", o: ["Xbox 360","PlayStation 3","Nintendo Wii","Nintendo DS"], a: "Nintendo Wii", f: "The Nintendo Wii sold over 101 million units and became famous for people accidentally throwing the controller through their TVs. Nintendo sold so many wrist straps as replacements that it became a meme!" }
    ],
    MEDIUM: [
      { q: "Which block is required to build a nether portal in Minecraft?", o: ["Cobblestone","Obsidian","Bedrock","Iron Block"], a: "Obsidian", f: "Obsidian in Minecraft takes 250 seconds to mine by hand. In real life, obsidian is volcanic glass formed when lava cools rapidly. Ancient civilizations used it to make incredibly sharp cutting tools — sharper than modern surgical steel!" },
      { q: "What city is GTA V set in?", o: ["Liberty City","Vice City","Los Santos","San Fierro"], a: "Los Santos", f: "Los Santos is based on Los Angeles. GTA V's map was so detailed that it took Rockstar 5 years and $265 million to create. It remains the second best-selling game of all time and still earns hundreds of millions per year." },
      { q: "Which battle royale game was released by Epic Games in 2017?", o: ["PUBG","Apex Legends","Fortnite","Call of Duty: Warzone"], a: "Fortnite", f: "Fortnite was originally a co-op survival game before Epic added the Battle Royale mode in 2017 — for free — in just 2 months. The free mode was so popular it basically replaced the original paid game." },
      { q: "What is the highest tier item rarity in World of Warcraft?", o: ["Epic","Legendary","Rare","Artifact"], a: "Legendary", f: "WoW's color-coded rarity system (gray/white/green/blue/purple/orange) became so influential that most modern games copied it. The term 'purple loot' is now used in gaming culture to mean extremely rare items." },
      { q: "Who is the main protagonist of the Halo series?", o: ["Master Chief","Arbiter","Cortana","Marcus Fenix"], a: "Master Chief", f: "Master Chief's real name is John-117. He's a Spartan super-soldier who had his body augmented at age 14. His face is never fully shown in the games — a design choice to help players project themselves onto the character." },
      { q: "Which franchise features pocket monsters in Pokéballs?", o: ["Digimon","Yu-Gi-Oh","Pokémon","Monster Hunter"], a: "Pokémon", f: "Pokémon was created by Satoshi Tajiri, inspired by his childhood hobby of collecting insects. There are now over 1,000 Pokémon species. The franchise generates more revenue than any other media franchise in history — over $150 billion!" }
    ],
    HARD: [
      { q: "What was the codename of the Nintendo GameCube during development?", o: ["Project Reality","Dolphin","Katana","Ultra 64"], a: "Dolphin", f: "The GameCube's development codename was Dolphin, which is why the most popular GameCube emulator is called 'Dolphin Emulator.' The console used mini-DVDs instead of standard discs to reduce piracy — though it didn't fully work." },
      { q: "In Dark Souls, what restores health?", o: ["Lifegem","Estus Flask","Blood Vial","Elixir"], a: "Estus Flask", f: "The Estus Flask in Dark Souls refills automatically at bonfires and becomes a central mechanic of the game's loop. Director Hidetaka Miyazaki was inspired by a scene in a manga where a character shares warm liquid with a stranger." },
      { q: "Which company developed Unreal Engine?", o: ["Unity","Epic Games","Valve","Crytek"], a: "Epic Games", f: "Unreal Engine 1 debuted in 1998 and powered the game Unreal. Today, Unreal Engine 5 is used not just for games but for Hollywood films, car commercials, and architectural visualization. It's free for most developers." },
      { q: "In Portal, what flavor is the promised cake?", o: ["Strawberry","Chocolate","Vanilla","Lie"], a: "Lie", f: "'The cake is a lie' became one of gaming's most iconic memes. The phrase comes from messages scrawled on walls in Portal, hinting that the reward promised by GLaDOS doesn't actually exist — a metaphor for broken promises." },
      { q: "Which game first introduced the 'Nemesis System'?", o: ["Middle-earth: Shadow of Mordor","Assassin's Creed","Witcher 3","Skyrim"], a: "Middle-earth: Shadow of Mordor", f: "The Nemesis System creates unique orc enemies who remember encounters, grow stronger when they defeat you, and develop rivalries with the player. Warner Bros. patented the system in 2021, preventing other games from copying it." }
    ]
  },
  "Movies": {
    EASY: [
      { q: "Which movie features the song 'Let It Go'?", o: ["Moana","Tangled","Frozen","Brave"], a: "Frozen", f: "Let It Go won the Oscar for Best Original Song in 2014. Idina Menzel recorded it in one take — the raw emotion you hear was genuine. The song has been translated into 42 languages for international versions." },
      { q: "Who plays Jack Dawson in Titanic?", o: ["Brad Pitt","Johnny Depp","Leonardo DiCaprio","Matt Damon"], a: "Leonardo DiCaprio", f: "DiCaprio reportedly cried when he first read the Titanic script — he was so moved he agreed immediately. Despite the film winning 11 Oscars, DiCaprio himself wasn't nominated. He finally won his first Oscar in 2016 for The Revenant." },
      { q: "What is the name of the green ogre in the DreamWorks film?", o: ["Shrek","Fiona","Donkey","Lord Farquaad"], a: "Shrek", f: "Shrek was originally going to be played by Chris Farley, who recorded most of his lines before he passed away in 1997. Mike Myers took over the role and added the Scottish accent — which wasn't in the original script." },
      { q: "In Toy Story, who is the toy astronaut?", o: ["Woody","Rex","Slinky","Buzz Lightyear"], a: "Buzz Lightyear", f: "Buzz Lightyear is named after astronaut Buzz Aldrin, the second person to walk on the Moon. Aldrin loved the character so much he reportedly asked Pixar for a Buzz Lightyear action figure for his grandchildren." },
      { q: "Which superhero is Bruce Wayne?", o: ["Superman","Spider-Man","Batman","Iron Man"], a: "Batman", f: "Batman first appeared in Detective Comics #27 in 1939. Unlike most superheroes, he has no superpowers — just wealth, intelligence, and training. He was created by Bob Kane and Bill Finger, who went uncredited for decades." },
      { q: "How many Star Wars movies are in the original trilogy?", o: ["3","6","9","4"], a: "3", f: "The original Star Wars trilogy (1977-1983) changed cinema forever. George Lucas invented Industrial Light & Magic to create the effects, and the company went on to revolutionize visual effects in Hollywood for decades." }
    ],
    MEDIUM: [
      { q: "Which film won Best Picture in 2020?", o: ["1917","Joker","Parasite","Once Upon a Time in Hollywood"], a: "Parasite", f: "Parasite made history as the first non-English language film to win Best Picture at the Oscars. Director Bong Joon-ho quipped 'Once you overcome the one-inch tall barrier of subtitles, you will be introduced to so many more amazing films.'" },
      { q: "What is the highest-grossing film of all time (unadjusted)?", o: ["Avatar","Avengers: Endgame","Titanic","Star Wars: The Force Awakens"], a: "Avatar", f: "Avatar (2009) grossed $2.9 billion, but when re-released in 2022 it earned even more. Adjusted for inflation, Gone with the Wind (1939) is still the highest-grossing film ever — its adjusted gross exceeds $3.8 billion!" },
      { q: "Who directed Inception?", o: ["Steven Spielberg","Christopher Nolan","Martin Scorsese","Quentin Tarantino"], a: "Christopher Nolan", f: "Christopher Nolan wrote the script for Inception over 10 years before filming it. The famous 'hallway fight scene' took six weeks to film on a rotating set. Hans Zimmer's iconic 'BRAAM' sound has been copied in hundreds of movie trailers." },
      { q: "What is the name of Voldemort's pet snake?", o: ["Nagini","Aragog","Crookshanks","Fluffy"], a: "Nagini", f: "Nagini is actually a Maledictus — a woman cursed to transform permanently into a snake. This backstory was revealed in the Fantastic Beasts films. 'Nagini' comes from the Sanskrit word for a female snake deity." },
      { q: "Who played Wolverine in the X-Men films?", o: ["Hugh Jackman","Christian Bale","Robert Downey Jr.","Chris Evans"], a: "Hugh Jackman", f: "Hugh Jackman played Wolverine for 17 years across 9 films (2000–2017) — a record for a superhero role. He gained 40 pounds of muscle for the role but had to avoid drinking water 36 hours before filming shirtless scenes." },
      { q: "What is the fictional African nation in Black Panther?", o: ["Zamunda","Wakanda","Genovia","Elbonia"], a: "Wakanda", f: "Wakanda first appeared in a Marvel comic in 1966, created by Stan Lee and Jack Kirby during the civil rights movement. The Wakandan language in the film is based on isiXhosa, a real South African language." }
    ],
    HARD: [
      { q: "Which movie has the quote 'Here's looking at you, kid'?", o: ["Gone with the Wind","Casablanca","Citizen Kane","The Godfather"], a: "Casablanca", f: "Casablanca (1942) was made in just 6 weeks during WWII and was considered a mediocre film at release. It's now ranked as one of the greatest films ever made, and 'Here's looking at you, kid' was largely improvised by Humphrey Bogart." },
      { q: "Who directed Pulp Fiction?", o: ["David Fincher","Quentin Tarantino","Stanley Kubrick","Martin Scorsese"], a: "Quentin Tarantino", f: "Pulp Fiction's non-linear structure was revolutionary for 1994. The briefcase whose mysterious glowing contents are never revealed has sparked decades of fan theories — the most popular being that it contains Marsellus Wallace's soul." },
      { q: "What is the first feature-length animated movie?", o: ["Pinocchio","Snow White and the Seven Dwarfs","Fantasia","Dumbo"], a: "Snow White and the Seven Dwarfs", f: "When Disney announced Snow White in 1934, Hollywood insiders called it 'Disney's Folly' — certain it would bankrupt the studio. Instead it became a massive hit and saved Disney. It cost $1.5 million, 10x the original budget." },
      { q: "Who played the Joker in The Dark Knight?", o: ["Jack Nicholson","Jared Leto","Joaquin Phoenix","Heath Ledger"], a: "Heath Ledger", f: "Heath Ledger prepared for the role by locking himself in a hotel room for 6 weeks, keeping a diary from the Joker's perspective. He won the Oscar posthumously — he passed away in January 2008 before the film's July release." },
      { q: "What is the spaceship's name in Alien (1979)?", o: ["Nostromo","Sulaco","Prometheus","Covenant"], a: "Nostromo", f: "The Nostromo is named after Joseph Conrad's 1904 novel. Director Ridley Scott insisted on making the ship look lived-in and grimy — no clean sci-fi aesthetic. H.R. Giger designed the alien, winning an Oscar for Visual Effects." }
    ]
  },
  "Music": {
    EASY: [
      { q: "Who is known as the King of Pop?", o: ["Elvis Presley","Michael Jackson","Prince","Freddie Mercury"], a: "Michael Jackson", f: "Michael Jackson is the best-selling music artist of all time with over 400 million records sold. His moonwalk, performed on Motown 25 in 1983, was so shocking that the audience went silent before erupting in applause." },
      { q: "Which band sang 'Yellow Submarine'?", o: ["The Rolling Stones","The Beatles","Queen","Led Zeppelin"], a: "The Beatles", f: "The Beatles hold the record for the most number-one albums on the UK charts (15) and have sold over 800 million records worldwide. Their 1964 arrival in the US sparked 'Beatlemania' and changed popular music forever." },
      { q: "How many strings does a standard acoustic guitar have?", o: ["4","5","6","12"], a: "6", f: "A standard guitar has 6 strings tuned E-A-D-G-B-E from lowest to highest. The guitar evolved from ancient stringed instruments and has existed in some form for over 4,000 years. It's now the world's most popular instrument." },
      { q: "Which pop star has fans called 'Swifties'?", o: ["Ariana Grande","Katy Perry","Billie Eilish","Taylor Swift"], a: "Taylor Swift", f: "Taylor Swift is the first artist to simultaneously occupy the top 10 spots on the Billboard Hot 100. She writes her own songs — which is unusual for pop stars — and has re-recorded her early albums to own her masters." },
      { q: "What instrument has black and white keys?", o: ["Guitar","Flute","Drums","Piano"], a: "Piano", f: "The piano was invented around 1700 by Bartolomeo Cristofori in Italy. It was revolutionary because unlike harpsichords, players could control the volume with touch — hence the full name 'pianoforte' meaning 'soft-loud' in Italian." }
    ],
    MEDIUM: [
      { q: "Which singer is known for the album '21'?", o: ["Adele","Beyonce","Rihanna","Lady Gaga"], a: "Adele", f: "'21' is the best-selling album of the 21st century with over 31 million copies sold. Adele named it after her age when she wrote it. It spent 24 weeks at #1 in the US — the longest ever by a British female artist." },
      { q: "Who is the lead singer of Queen?", o: ["Freddie Mercury","Brian May","John Deacon","Roger Taylor"], a: "Freddie Mercury", f: "Freddie Mercury was born Farrokh Bulsara in Zanzibar (now Tanzania). Queen's Bohemian Rhapsody (1975) broke conventions by being a 6-minute song with no chorus — record executives tried to cut it. It's still the most-streamed classic rock song." },
      { q: "What musical symbol indicates the pitch of notes?", o: ["Clef","Flat","Sharp","Tempo"], a: "Clef", f: "The treble clef symbol evolved from the letter 'G' — it curls around the G line of the staff. The bass clef looks like an old-fashioned letter 'F'. Musical notation has been standardized for about 1,000 years." },
      { q: "Which classical composer wrote the famous Fifth Symphony?", o: ["Mozart","Bach","Beethoven","Chopin"], a: "Beethoven", f: "Beethoven wrote his Fifth Symphony while going deaf — making it one of history's most remarkable creative achievements. The famous four-note opening was used as a victory signal (V in Morse code: dot-dot-dot-dash) by Allied forces in WWII." },
      { q: "Which musical features 'Defying Gravity'?", o: ["Hamilton","Wicked","Les Miserables","Cats"], a: "Wicked", f: "Wicked is based on Gregory Maguire's 1995 novel retelling The Wizard of Oz from the Wicked Witch's perspective. It's the highest-grossing Broadway musical of all time, earning over $1.6 billion on Broadway alone." },
      { q: "What is Eminem's real name?", o: ["Dr. Dre","Snoop Dogg","Eminem","Jay-Z"], a: "Eminem", f: "Marshall Mathers chose 'Eminem' from his initials M&M. He grew up in Detroit and memorized a new page of the dictionary every day to improve his vocabulary and rhyming skills. He holds the record for most words in a hit song." }
    ],
    HARD: [
      { q: "Who was the 'High Priestess of Soul'?", o: ["Aretha Franklin","Nina Simone","Ella Fitzgerald","Etta James"], a: "Nina Simone", f: "Nina Simone was a classically trained pianist who was rejected from Curtis Institute of Music — many believe due to racial discrimination. She channeled her activism into music, with songs like 'Mississippi Goddam' becoming civil rights anthems." },
      { q: "In what year was MTV launched?", o: ["1979","1981","1985","1990"], a: "1981", f: "MTV launched on August 1, 1981, with the first video ever played being 'Video Killed the Radio Star' by The Buggles — fittingly prophetic. MTV revolutionized the music industry by making visual image as important as musical talent." },
      { q: "Which rock band released 'The Wall'?", o: ["The Who","Led Zeppelin","Pink Floyd","Genesis"], a: "Pink Floyd", f: "The Wall (1979) tells the story of a rock star who builds a psychological wall around himself. Roger Waters wrote it partly inspired by spitting on a fan during a concert. The live production featured a literal wall being built on stage." },
      { q: "What is singing without instrumental accompaniment called?", o: ["Soprano","A Cappella","Solfege","Vibrato"], a: "A Cappella", f: "'A Cappella' is Italian for 'in the chapel style.' Medieval church choirs sang without instruments because the organ was considered worldly and inappropriate. The Pentatonix and Straight No Chaser helped revive a cappella's popularity." },
      { q: "Who composed 'The Marriage of Figaro'?", o: ["Johann Sebastian Bach","Ludwig van Beethoven","Wolfgang Amadeus Mozart","Richard Wagner"], a: "Wolfgang Amadeus Mozart", f: "Mozart composed The Marriage of Figaro in 1786 when he was just 30 years old. He wrote over 800 works in his short 35-year life. The opera was considered politically dangerous because it mocked the aristocracy — it was briefly banned in Vienna." }
    ]
  },
  "Sports": {
    EASY: [
      { q: "How many players are on a standard soccer team?", o: ["9","10","11","12"], a: "11", f: "Soccer (football) is the world's most popular sport with over 4 billion fans. The rules were standardized in England in 1863. A regulation soccer ball is made of 32 panels — 20 hexagons and 12 pentagons." },
      { q: "In which sport do players hit a shuttlecock?", o: ["Tennis","Badminton","Squash","Table Tennis"], a: "Badminton", f: "A shuttlecock can travel over 300 km/h — making badminton the fastest racket sport in the world! The sport originated in British India, where soldiers played it with improvised equipment." },
      { q: "How many rings are on the Olympic flag?", o: ["4","5","6","7"], a: "5", f: "The five Olympic rings represent the five continents of the world that participate in the Games (Europe, Asia, Africa, Americas, Oceania). The rings were designed by Pierre de Coubertin in 1912 and first used in the 1920 Antwerp Games." },
      { q: "What is the term for a score of zero in tennis?", o: ["Nil","Zero","Love","Blank"], a: "Love", f: "The word 'love' for zero in tennis likely comes from the French 'l'oeuf' (the egg) — an egg looks like a zero. Some also think it comes from the phrase 'to play for love of the game' (without stakes)." },
      { q: "Which sport is played on ice with stones and brooms?", o: ["Hockey","Curling","Luge","Skeleton"], a: "Curling", f: "Curling was invented in Scotland in the 16th century and is one of the oldest team sports still played. The sweepers actually melt tiny amounts of the ice, creating a thin layer of water that reduces friction and helps steer the stone." }
    ],
    MEDIUM: [
      { q: "Which country has won the most FIFA World Cups?", o: ["Germany","Italy","Argentina","Brazil"], a: "Brazil", f: "Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, 2002) and is the only nation to have played in every World Cup tournament. Pelé is the only player ever to win three World Cup medals." },
      { q: "How many points is a touchdown in American Football?", o: ["3","6","7","8"], a: "6", f: "A touchdown scores 6 points, plus teams can kick for 1 extra point or run/pass for 2. The term 'touchdown' dates to early rugby-style football when players literally had to touch the ball to the ground in the end zone to score." },
      { q: "What is the maximum score in a single bowling frame?", o: ["10","20","30","100"], a: "30", f: "A perfect game of bowling (12 consecutive strikes) scores 300 points. Only about 1 in 20,000 amateur games results in a perfect game. The probability of a professional bowler achieving it is about 1 in 460." },
      { q: "Who is widely regarded as the fastest man in history?", o: ["Carl Lewis","Usain Bolt","Tyson Gay","Yohan Blake"], a: "Usain Bolt", f: "Usain Bolt set the 100m world record of 9.58 seconds at the 2009 Berlin World Championships. Scientists calculated he reached a top speed of 44.72 km/h during that race — and he was actually slowing down in the final meters!" },
      { q: "In golf, what is scoring one under par called?", o: ["Bogey","Eagle","Birdie","Albatross"], a: "Birdie", f: "The term 'birdie' comes from an 1899 round where Ab Smith's ball hit a bird in flight and landed inches from the hole — he then sank the putt for one under par and called it 'a bird of a shot.' The term spread from there." },
      { q: "Which city hosted the 2012 Summer Olympics?", o: ["Beijing","London","Rio de Janeiro","Athens"], a: "London", f: "London is the only city to have hosted the Summer Olympics three times (1908, 1948, 2012). The 2012 opening ceremony directed by Danny Boyle featured a live segment with Queen Elizabeth II and James Bond jumping from a helicopter." }
    ],
    HARD: [
      { q: "Which tennis player has won the most Grand Slam singles titles all-time?", o: ["Roger Federer","Rafael Nadal","Novak Djokovic","Pete Sampras"], a: "Novak Djokovic", f: "Djokovic holds 24 Grand Slam titles as of 2024, surpassing Federer (20) and Nadal (22). He is also one of the few players to win all four Grand Slams on all three surfaces — grass, clay, and hard court." },
      { q: "What is the distance between bases in baseball?", o: ["60 feet","75 feet","90 feet","100 feet"], a: "90 feet", f: "The 90-foot base path was set in the 1840s and has never been changed. Engineers have calculated it's almost perfectly balanced — a step shorter and infielders couldn't throw out fast runners; a step longer and almost nobody would be out!" },
      { q: "Which F1 driver has won the most World Championships?", o: ["Michael Schumacher","Lewis Hamilton","Sebastian Vettel","Both Michael Schumacher and Lewis Hamilton"], a: "Both Michael Schumacher and Lewis Hamilton", f: "Both Schumacher and Hamilton won 7 Formula 1 World Championships. Hamilton tied Schumacher in 2020 and has driven a record 100+ race wins. The two drivers are often compared as the greatest in the sport's history." },
      { q: "What is the duration of a standard professional boxing round?", o: ["2 minutes","3 minutes","4 minutes","5 minutes"], a: "3 minutes", f: "Professional boxing uses 3-minute rounds with 1-minute rest periods. Women's professional boxing uses 2-minute rounds. A bout can have up to 12 rounds for championship fights — totaling 36 minutes of actual fighting." },
      { q: "Which country won the first FIFA World Cup in 1930?", o: ["Argentina","Uruguay","Brazil","Italy"], a: "Uruguay", f: "Uruguay hosted and won the first World Cup in 1930. Only 13 teams participated because most European teams refused to make the long boat journey. Argentina lost the final 4-2 — a rivalry between the two nations that burns to this day." }
    ]
  },
  "Pop Culture": {
    EASY: [
      { q: "Which app features short-form vertical videos?", o: ["Facebook","LinkedIn","TikTok","Twitter"], a: "TikTok", f: "TikTok's algorithm is considered one of the most powerful recommendation engines ever built. It can figure out your interests within minutes. The app reached 1 billion users in under 5 years — faster than any other platform in history." },
      { q: "What is Kim Kardashian's shapewear brand?", o: ["Skims","Fenty","Yeezy","Good American"], a: "Skims", f: "Skims reached a $4 billion valuation within 4 years of launching in 2019. Kim Kardashian originally wanted to call it 'Kimono' but faced backlash for cultural appropriation, then rebranded to Skims before launch." },
      { q: "Which TV series features Rachel, Monica, and Joey?", o: ["Seinfeld","Friends","The Office","How I Met Your Mother"], a: "Friends", f: "Friends ran for 10 seasons (1994-2004) and remains one of the most-watched shows in history. The cast negotiated together for $1 million per episode in the final seasons — a record-breaking deal at the time." },
      { q: "Who hosts RuPaul's Drag Race?", o: ["RuPaul","Michelle Visage","Tyra Banks","Heidi Klum"], a: "RuPaul", f: "RuPaul has been performing since the 1980s but became a global icon through Drag Race, which premiered in 2009. The show has expanded to 10 international versions. The phrase 'Sashay away' has entered mainstream culture." },
      { q: "What is the fictional town in Stranger Things?", o: ["Springfield","Hawkins","Riverdale","Mystic Falls"], a: "Hawkins", f: "Hawkins, Indiana doesn't exist but was filmed mostly in Atlanta, Georgia. The Duffer Brothers drew inspiration from Stephen King novels and 1980s Spielberg films. Season 4's 'Running Up That Hill' by Kate Bush topped charts 37 years after its release!" }
    ],
    MEDIUM: [
      { q: "What is the school in Wednesday called?", o: ["Hogwarts","Nevermore Academy","Riverdale High","Salvatore Boarding School"], a: "Nevermore Academy", f: "Wednesday is a spin-off of The Addams Family, created in the 1930s by Charles Addams. Jenna Ortega's viral dance to 'Goo Goo Muck' in the series sparked a massive TikTok trend with millions of recreations worldwide." },
      { q: "Which pop star wore a meat dress to the 2010 VMAs?", o: ["Katy Perry","Rihanna","Lady Gaga","Nicki Minaj"], a: "Lady Gaga", f: "Lady Gaga's meat dress was made from real Argentinian beef. She said it was a political statement about DADT (Don't Ask Don't Tell) policy. It's now preserved and displayed at the Rock and Roll Hall of Fame — frozen and dried." },
      { q: "Who is the lead singer of Maroon 5?", o: ["Adam Levine","Chris Martin","Justin Timberlake","Bruno Mars"], a: "Adam Levine", f: "Maroon 5 started as a high school band called Kara's Flowers in 1994. They were originally a pop-punk band before reinventing themselves. Adam Levine is also a coach on The Voice and has been described as having perfect pitch." },
      { q: "What is the paper company in The Office?", o: ["Dunder Mifflin","Initech","Paper Co.","Wernham Hogg"], a: "Dunder Mifflin", f: "Dunder Mifflin doesn't exist, but the name sounds so real that fans have called paper companies asking for it. The US version of The Office was nearly cancelled after Season 1 before becoming a massive hit. Steve Carell improvised many of Michael Scott's lines." },
      { q: "Which actor played Walter White in Breaking Bad?", o: ["Aaron Paul","Bryan Cranston","Bob Odenkirk","Giancarlo Esposito"], a: "Bryan Cranston", f: "Bryan Cranston was known for playing the goofy dad in Malcolm in the Middle — which actually helped him get Breaking Bad. Creator Vince Gilligan saw his range in a dark Malcolm episode and took a chance on him for Walter White." }
    ],
    HARD: [
      { q: "Who is the primary antagonist in Marvel's Infinity Saga?", o: ["Loki","Ultron","Thanos","Red Skull"], a: "Thanos", f: "Thanos was inspired by DC Comics' Darkseid. In the original comics, Thanos was motivated by his love for Lady Death — literally courting the personification of death. The film changed this to a resource-scarcity argument, which many philosophers actually debated seriously." },
      { q: "Which TV show holds the record for most Emmy wins by a drama?", o: ["Game of Thrones","Breaking Bad","The Sopranos","Mad Men"], a: "Game of Thrones", f: "Game of Thrones won 59 Emmy Awards total, including Outstanding Drama Series for Season 8 — a controversial finale that many fans considered disappointing. The show's final season became a cultural flashpoint about rushed storytelling." },
      { q: "Who created Squid Game?", o: ["Bong Joon-ho","Hwang Dong-hyuk","Park Chan-wook","Kim Jee-woon"], a: "Hwang Dong-hyuk", f: "Hwang Dong-hyuk spent 10 years trying to get Squid Game made — every studio rejected it as too violent and unrealistic. When Netflix finally greenlit it in 2019, it became their most-watched series ever with 111 million viewers in 4 weeks." },
      { q: "What is the recurring number sequence in 'Lost'?", o: ["4, 8, 15, 16, 23, 42","1, 2, 3, 4, 5, 6","10, 20, 30, 40, 50","7, 14, 21, 28, 35, 42"], a: "4, 8, 15, 16, 23, 42", f: "The numbers 4, 8, 15, 16, 23, 42 from Lost sum to 108 — which is the number of minutes between button presses in the hatch. These numbers became so famous that when used in the real lottery, they produced genuine winners!" }
    ]
  }
};

// Build flat question array from rawQuestions
const expandedQuestions = [];
Object.entries(rawQuestions).forEach(([category, difficulties]) => {
  Object.entries(difficulties).forEach(([difficulty, list]) => {
    list.forEach((item) => {
      expandedQuestions.push({
        category,
        difficulty,
        question: item.q,
        options: JSON.stringify(item.o),
        correctAnswer: item.a,
        funFact: item.f
      });
    });
  });
});

async function main() {
  console.log("Seeding database...");

  console.log("Seeding achievements...");
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { title: ach.title },
      update: {},
      create: ach
    });
  }

  console.log("Seeding daily missions...");
  for (const mission of DAILY_MISSIONS) {
    await prisma.dailyMission.upsert({
      where: { title: mission.title },
      update: {},
      create: mission
    });
  }

  console.log(`Seeding ${expandedQuestions.length} questions with fun facts...`);
  await prisma.triviaQuestion.deleteMany({});
  for (const q of expandedQuestions) {
    await prisma.triviaQuestion.create({ data: q });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
