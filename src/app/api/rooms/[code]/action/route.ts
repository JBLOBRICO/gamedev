import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTileByIndex, BOARD_SIZE } from '@/lib/boardConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function checkAndAwardAchievements(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: true }
    });
    if (!user) return;
    const allAchievements = await prisma.achievement.findMany();
    for (const ach of allAchievements) {
      if (user.achievements.some(a => a.achievementId === ach.id)) continue;
      let ok = false;
      if (ach.title === 'First Steps') ok = true;
      if (ach.title === 'Ready Up') ok = true;
      if (ach.title === 'Trivia Rookie' && user.correctAnswers >= 10) ok = true;
      if (ach.title === 'Trivia Adept' && user.correctAnswers >= 55) ok = true;
      if (ach.title === 'Trivia Master' && user.correctAnswers >= 100) ok = true;
      if (ach.title === 'Coin Hoarder' && user.coins >= 500) ok = true;
      if (ach.title === 'Wealthy Traveler' && user.coins >= 1000) ok = true;
      if (ach.title === 'Level Up!' && user.level >= 5) ok = true;
      if (ach.title === 'Double Digits' && user.level >= 10) ok = true;
      if (ach.title === 'Veteran Quizzer' && user.level >= 20) ok = true;
      if (ach.title === 'Trivia Legend' && user.achievements.length >= 49) ok = true;
      if (ok) {
        await prisma.userAchievement.create({ data: { userId, achievementId: ach.id } });
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: ach.xpReward }, coins: { increment: ach.coinReward } }
        });
      }
    }
  } catch (err) { console.error('Achievement error:', err); }
}

const GLOBAL_EVENTS = [
  'Treasure Rush', 'Reverse Movement', 'Lucky Hour',
  'Chaos Mode', 'Coin Frenzy', 'Sudden Death'
];

async function advanceToNextTurn(
  roomId: string,
  currentTurnNumber: number,
  players: any[],
  currentTurnIndex: number,
  currentRound: number,
  activeEvent: string | null,
  eventRoundsLeft: number
) {
  const nextTurnIndex = (currentTurnIndex + 1) % players.length;
  let nextRound = currentRound;
  if (nextTurnIndex === 0) nextRound += 1;

  let newActiveEvent = activeEvent;
  let newEventRoundsLeft = eventRoundsLeft;

  if (nextTurnIndex === 0 && nextRound % 4 === 0) {
    newActiveEvent = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
    newEventRoundsLeft = 2;
    await prisma.roomAction.create({
      data: {
        roomId,
        playerUsername: 'System',
        actionType: 'EVENT',
        details: JSON.stringify({ message: `🌍 GLOBAL EVENT: ${newActiveEvent}! Lasts 2 rounds.` })
      }
    });
  } else if (nextTurnIndex === 0 && newEventRoundsLeft > 0) {
    newEventRoundsLeft -= 1;
    if (newEventRoundsLeft === 0) newActiveEvent = null;
  }

  await prisma.room.update({
    where: { id: roomId },
    data: { currentTurn: nextTurnIndex, round: nextRound, activeEvent: newActiveEvent, eventRoundsLeft: newEventRoundsLeft }
  });

  const nextPlayer = players[nextTurnIndex];

  // Check if the next player has skip turns applied — apply from their skipTurns field via extraData
  // We track skip via coins field is not possible; instead we store it in roomAction log as skip
  // and handle it when creating the next turn (skip their turn if needed)
  await prisma.turn.create({
    data: {
      roomId,
      round: nextRound,
      turnNumber: currentTurnNumber + 1,
      activePlayerId: nextPlayer.userId,
      status: 'ROLLING',
    }
  });
  return { nextTurnIndex, nextRound };
}

async function handleVictory(room: any, winner: any, currentTurnId: string) {
  await prisma.room.update({ where: { id: room.id }, data: { status: 'FINISHED', winnerId: winner.userId } });
  const history = await prisma.matchHistory.create({
    data: { mode: room.mode, winnerUsername: winner.user.username, roundCount: room.round }
  });
  for (const p of room.players) {
    await prisma.matchHistoryPlayer.create({
      data: {
        matchId: history.id, userId: p.userId, username: p.user.username,
        avatarId: p.user.avatarId, coinsEarned: p.coins, xpEarned: p.coins * 5 + 50,
        correctAnswers: p.user.correctAnswers, incorrectAnswers: p.user.incorrectAnswers,
        longestStreak: p.user.longestStreak,
        rank: p.userId === winner.userId ? 1 : 2,
      }
    });
    await prisma.user.update({
      where: { id: p.userId },
      data: {
        gamesPlayed: { increment: 1 },
        gamesWon: { increment: p.userId === winner.userId ? 1 : 0 },
        coins: { increment: p.coins }
      }
    });
  }
  await prisma.roomAction.create({
    data: {
      roomId: room.id, playerUsername: 'System', actionType: 'EVENT',
      details: JSON.stringify({ message: `🏆 ${winner.user.username} REACHED THE FINISH LINE AND WON!` })
    }
  });
  await prisma.turn.update({ where: { id: currentTurnId }, data: { status: 'COMPLETED' } });
}

/** Give a random free item to a player */
async function grantFreeItem(playerId: string, username: string, roomId: string) {
  const items = ['shield', 'extra_time', 'lucky_dice', 'trap_immunity', 'multiplier'] as const;
  const chosen = items[Math.floor(Math.random() * items.length)];

  const itemFieldMap = {
    shield:        { shieldActive: true },
    extra_time:    { extraTimeActive: true },
    lucky_dice:    { luckyDiceActive: true },
    trap_immunity: { trapImmunity: true },
    multiplier:    { doubleCoinsActive: true },
  } as const;

  await prisma.player.update({ where: { id: playerId }, data: itemFieldMap[chosen] });

  const label = chosen.replace('_', ' ').toUpperCase();
  await prisma.roomAction.create({
    data: {
      roomId, playerUsername: 'System', actionType: 'TILE',
      details: JSON.stringify({ message: `🎁 ${username} received a free ${label}!` })
    }
  });
  return label;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  try {
    let body: any;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { action, userId, details } = body;

    if (!action || typeof action !== 'string') return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    if (!userId || typeof userId !== 'string') return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const VALID_ACTIONS = [
      'HEARTBEAT', 'LOBBY_READY', 'START_GAME', 'ROLL_DICE',
      'ANSWER_TRIVIA', 'INTERACT_TILE', 'BUY_ITEM', 'END_TURN',
      'FORCE_ADVANCE', 'CHAT'
    ];
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: {
        players: { include: { user: true }, orderBy: { order: 'asc' } },
        teams: true,
        turns: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const player = room.players.find(p => p.userId === userId);
    if (!player) return NextResponse.json({ error: 'You are not in this room.' }, { status: 403 });

    // ── HEARTBEAT ────────────────────────────────────────────────────────────
    if (action === 'HEARTBEAT') {
      await prisma.player.update({ where: { id: player.id }, data: { lastActive: new Date(), isConnected: true } });
      return NextResponse.json({ success: true });
    }

    await prisma.player.update({ where: { id: player.id }, data: { lastActive: new Date(), isConnected: true } });

    // ── LOBBY_READY ──────────────────────────────────────────────────────────
    if (action === 'LOBBY_READY') {
      if (room.status !== 'LOBBY') return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
      const updated = await prisma.player.update({ where: { id: player.id }, data: { isReady: !player.isReady }, include: { user: true } });
      await prisma.roomAction.create({
        data: { roomId: room.id, playerUsername: player.user.username, actionType: 'CHAT',
          details: JSON.stringify({ message: `${player.user.username} is ${updated.isReady ? 'READY ✅' : 'NOT READY ❌'}.` }) }
      });
      await checkAndAwardAchievements(userId);
      return NextResponse.json({ success: true });
    }

    // ── START_GAME ────────────────────────────────────────────────────────────
    if (action === 'START_GAME') {
      if (!player.isHost) return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
      if (room.status === 'ACTIVE') return NextResponse.json({ error: 'Game is already in progress' }, { status: 400 });
      if (room.players.length < 1) return NextResponse.json({ error: 'Need at least 1 player' }, { status: 400 });
      const notReady = room.players.filter(p => !p.isReady && p.userId !== userId);
      if (notReady.length > 0 && room.players.length > 1) {
        return NextResponse.json({ error: `Players not ready: ${notReady.map(p => p.user.username).join(', ')}` }, { status: 400 });
      }
      const shuffled = [...room.players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i++) {
        await prisma.player.update({ where: { id: shuffled[i].id }, data: { order: i, position: 0, coins: 15 } });
      }
      await prisma.room.update({
        where: { id: room.id },
        data: { status: 'ACTIVE', currentTurn: 0, round: 1, askedQuestions: '[]' }
      });
      await prisma.turn.updateMany({ where: { roomId: room.id, status: { not: 'COMPLETED' } }, data: { status: 'COMPLETED' } });
      const first = shuffled[0];
      await prisma.turn.create({
        data: { roomId: room.id, round: 1, turnNumber: 1, activePlayerId: first.userId, status: 'ROLLING' }
      });
      await prisma.roomAction.create({
        data: { roomId: room.id, playerUsername: 'System', actionType: 'EVENT',
          details: JSON.stringify({ message: `🎮 Game started! ${first.user.username} goes first!` }) }
      });
      return NextResponse.json({ success: true });
    }

    if (room.status !== 'ACTIVE') return NextResponse.json({ error: 'Game is not active' }, { status: 400 });

    const currentTurnRecord = room.turns[0];

    // ── FORCE_ADVANCE ──────────────────────────────────────────────────────────
    if (action === 'FORCE_ADVANCE') {
      if (!player.isHost) return NextResponse.json({ error: 'Only the host can force-advance' }, { status: 403 });
      if (currentTurnRecord && currentTurnRecord.status !== 'COMPLETED') {
        await prisma.turn.update({ where: { id: currentTurnRecord.id }, data: { status: 'COMPLETED' } });
        await prisma.roomAction.create({
          data: { roomId: room.id, playerUsername: 'System', actionType: 'EVENT',
            details: JSON.stringify({ message: 'Host force-advanced the turn.' }) }
        });
      }
      await advanceToNextTurn(room.id, currentTurnRecord?.turnNumber || 0, room.players, room.currentTurn, room.round, room.activeEvent, room.eventRoundsLeft);
      return NextResponse.json({ success: true });
    }

    // ── END_TURN ───────────────────────────────────────────────────────────────
    if (action === 'END_TURN') {
      const isActivePlayer = currentTurnRecord?.activePlayerId === userId;
      if (!isActivePlayer && !player.isHost) return NextResponse.json({ error: 'Only the active player or host can end the turn' }, { status: 403 });
      if (!currentTurnRecord) {
        const np = room.players[room.currentTurn] || room.players[0];
        await prisma.turn.create({ data: { roomId: room.id, round: room.round, turnNumber: 1, activePlayerId: np.userId, status: 'ROLLING' } });
        return NextResponse.json({ success: true });
      }
      if (currentTurnRecord.status !== 'COMPLETED') return NextResponse.json({ error: 'Turn is not yet completed' }, { status: 400 });
      await advanceToNextTurn(room.id, currentTurnRecord.turnNumber, room.players, room.currentTurn, room.round, room.activeEvent, room.eventRoundsLeft);
      return NextResponse.json({ success: true });
    }

    // ── CHAT ───────────────────────────────────────────────────────────────────
    if (action === 'CHAT') {
      const msg = details?.message;
      if (!msg || typeof msg !== 'string' || !msg.trim()) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
      if (msg.length > 200) return NextResponse.json({ error: 'Message too long' }, { status: 400 });
      await prisma.roomAction.create({
        data: { roomId: room.id, playerUsername: player.user.username, actionType: 'CHAT', details: JSON.stringify({ message: msg.trim() }) }
      });
      return NextResponse.json({ success: true });
    }

    // ── BUY_ITEM — allowed at any time during an active game ──────────────────
    if (action === 'BUY_ITEM') {
      const { itemId, cost } = details || {};
      if (!itemId || typeof itemId !== 'string') return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
      const validItems = ['shield', 'extra_time', 'lucky_dice', 'trap_immunity', 'multiplier'] as const;
      type ValidItem = typeof validItems[number];
      if (!validItems.includes(itemId as ValidItem)) return NextResponse.json({ error: 'Invalid item' }, { status: 400 });
      const itemCost = typeof cost === 'number' ? cost : 0;
      if (itemCost <= 0) return NextResponse.json({ error: 'Invalid cost' }, { status: 400 });
      if (player.coins < itemCost) {
        return NextResponse.json({ error: `Not enough coins. Need ${itemCost}, have ${player.coins}.` }, { status: 400 });
      }

      // Build a strictly-typed Prisma update using a discriminated approach
      const itemDataMap: Record<ValidItem, Parameters<typeof prisma.player.update>[0]['data']> = {
        shield:        { coins: { decrement: itemCost }, shieldActive: true },
        extra_time:    { coins: { decrement: itemCost }, extraTimeActive: true },
        lucky_dice:    { coins: { decrement: itemCost }, luckyDiceActive: true },
        trap_immunity: { coins: { decrement: itemCost }, trapImmunity: true },
        multiplier:    { coins: { decrement: itemCost }, doubleCoinsActive: true },
      };

      await prisma.player.update({ where: { id: player.id }, data: itemDataMap[itemId as ValidItem] });
      await prisma.roomAction.create({
        data: { roomId: room.id, playerUsername: player.user.username, actionType: 'SHOP',
          details: JSON.stringify({ message: `${player.user.username} purchased ${itemId.replace('_', ' ').toUpperCase()} for ${itemCost}g.` }) }
      });
      return NextResponse.json({ success: true });
    }

    // ── Turn-gated actions ─────────────────────────────────────────────────────
    if (!currentTurnRecord || currentTurnRecord.status === 'COMPLETED') {
      return NextResponse.json({ error: 'No active turn. Waiting for the next turn to begin.' }, { status: 400 });
    }
    if (currentTurnRecord.activePlayerId !== userId) {
      const ap = room.players.find(p => p.userId === currentTurnRecord.activePlayerId);
      return NextResponse.json({ error: `It is not your turn. Waiting for ${ap?.user.username || 'the active player'}.` }, { status: 400 });
    }

    // ── ROLL_DICE ──────────────────────────────────────────────────────────────
    if (action === 'ROLL_DICE') {
      if (currentTurnRecord.status !== 'ROLLING') {
        return NextResponse.json({ error: `Cannot roll — turn status is "${currentTurnRecord.status}".` }, { status: 400 });
      }

      let roll = Math.floor(1 + Math.random() * 6);
      if (player.luckyDiceActive) {
        roll = Math.random() > 0.5 ? 6 : 5;
      }

      let category = details?.category;
      if (!category || category === 'Random') {
        const cats = ['General Knowledge', 'Science', 'History', 'Movies', 'Music', 'Sports', 'Geography'];
        category = cats[Math.floor(Math.random() * cats.length)];
      }
      const difficulty = details?.difficulty || 'MEDIUM';
      if (typeof category !== 'string' || typeof difficulty !== 'string') {
        return NextResponse.json({ error: 'Invalid category or difficulty' }, { status: 400 });
      }
      if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return NextResponse.json({ error: 'Difficulty must be EASY, MEDIUM, or HARD' }, { status: 400 });
      }

      // Parse already-asked questions for this session (avoids repeats)
      let askedQ: string[] = [];
      try { askedQ = JSON.parse(room.askedQuestions || '[]'); } catch (e) { askedQ = []; }

      let questionCount = await prisma.triviaQuestion.count({ where: { category, difficulty, id: { notIn: askedQ } } });
      if (questionCount === 0) {
        // Soft reset for this category/difficulty pair — don't wipe all
        const catDiffIds = (await prisma.triviaQuestion.findMany({ where: { category, difficulty }, select: { id: true } })).map(q => q.id);
        askedQ = askedQ.filter(id => !catDiffIds.includes(id));
        questionCount = catDiffIds.length;
      }

      let question = null;
      if (questionCount > 0) {
        const randIdx = Math.floor(Math.random() * questionCount);
        question = await prisma.triviaQuestion.findFirst({ where: { category, difficulty, id: { notIn: askedQ } }, skip: randIdx });
      }
      if (!question) question = await prisma.triviaQuestion.findFirst({ where: { difficulty, id: { notIn: askedQ } } });
      if (!question) question = await prisma.triviaQuestion.findFirst({ where: { id: { notIn: askedQ } } });
      if (!question) question = await prisma.triviaQuestion.findFirst();
      if (!question) return NextResponse.json({ error: 'No trivia questions available.' }, { status: 500 });

      askedQ.push(question.id);
      await prisma.room.update({ where: { id: room.id }, data: { askedQuestions: JSON.stringify(askedQ) } });

      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: {
          status: 'TRIVIA', rollValue: roll,
          questionId: question.id, questionCategory: question.category,
          questionDifficulty: question.difficulty, questionText: question.question,
          questionOptions: question.options, questionCorrectAnswer: question.correctAnswer,
          questionFunFact: question.funFact || null,
          timeRemaining: player.extraTimeActive ? 30 : 15,
        }
      });

      if (player.luckyDiceActive) await prisma.player.update({ where: { id: player.id }, data: { luckyDiceActive: false } });
      if (player.extraTimeActive) await prisma.player.update({ where: { id: player.id }, data: { extraTimeActive: false } });

      await prisma.roomAction.create({
        data: { roomId: room.id, playerUsername: player.user.username, actionType: 'ROLL',
          details: JSON.stringify({ message: `${player.user.username} rolled a ${roll}! (${difficulty} ${category})` }) }
      });
      return NextResponse.json({ success: true, roll });
    }

    // ── ANSWER_TRIVIA ──────────────────────────────────────────────────────────
    if (action === 'ANSWER_TRIVIA') {
      if (currentTurnRecord.status !== 'TRIVIA') {
        return NextResponse.json({ error: `Cannot answer — turn status is "${currentTurnRecord.status}".` }, { status: 400 });
      }

      const { answer } = details || {};
      const isCorrect = answer && answer !== ''
        ? answer === currentTurnRecord.questionCorrectAnswer
        : false;

      const roll = currentTurnRecord.rollValue || 1;
      const difficulty = currentTurnRecord.questionDifficulty || 'MEDIUM';

      let moveDistance = 0;
      let coinsReward = 0;
      let xpReward = 0;

      if (isCorrect) {
        if (difficulty === 'EASY')   { moveDistance = roll;     coinsReward = 5;  xpReward = 20; }
        if (difficulty === 'MEDIUM') { moveDistance = roll + 1; coinsReward = 10; xpReward = 40; }
        if (difficulty === 'HARD')   { moveDistance = roll + 2; coinsReward = 20; xpReward = 80; }
        if (player.doubleCoinsActive) {
          coinsReward *= 2;
          await prisma.player.update({ where: { id: player.id }, data: { doubleCoinsActive: false } });
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          correctAnswers: { increment: isCorrect ? 1 : 0 },
          incorrectAnswers: { increment: isCorrect ? 0 : 1 },
          xp: { increment: xpReward },
          coins: { increment: coinsReward },
          streak: isCorrect ? { increment: 1 } : 0,
        }
      });

      if (!isCorrect) {
        await prisma.turn.update({
          where: { id: currentTurnRecord.id },
          data: { status: 'COMPLETED', selectedAnswer: answer || '', isAnswerCorrect: false }
        });
        await prisma.roomAction.create({
          data: { roomId: room.id, playerUsername: player.user.username, actionType: 'ANSWER',
            details: JSON.stringify({ message: answer
              ? `${player.user.username} answered incorrectly. Correct: ${currentTurnRecord.questionCorrectAnswer}.`
              : `${player.user.username} ran out of time! Correct: ${currentTurnRecord.questionCorrectAnswer}.`
            }) }
        });
        await advanceToNextTurn(room.id, currentTurnRecord.turnNumber, room.players, room.currentTurn, room.round, room.activeEvent, room.eventRoundsLeft);
        return NextResponse.json({ success: true, isCorrect: false, nextStep: 'NEXT_PLAYER' });
      }

      let newPosition = player.position + moveDistance;
      const FINISH = BOARD_SIZE - 1; // tile index 45
      if (newPosition >= FINISH) newPosition = FINISH;

      if (room.mode === 'TEAM' && player.teamId) {
        await prisma.team.update({ where: { id: player.teamId }, data: { position: newPosition, coins: { increment: coinsReward } } });
        await prisma.player.updateMany({ where: { teamId: player.teamId }, data: { position: newPosition } });
      } else {
        await prisma.player.update({ where: { id: player.id }, data: { position: newPosition, coins: { increment: coinsReward } } });
      }

      const landedTile = getTileByIndex(newPosition);
      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: { status: 'TILE_EFFECT', selectedAnswer: answer, isAnswerCorrect: true, tileType: landedTile.type }
      });
      await prisma.roomAction.create({
        data: { roomId: room.id, playerUsername: player.user.username, actionType: 'ANSWER',
          details: JSON.stringify({ message: `${player.user.username} answered correctly! ✓ Moved to tile ${newPosition} (${landedTile.name}).` }) }
      });

      if (newPosition >= FINISH) {
        await handleVictory(room, player, currentTurnRecord.id);
        return NextResponse.json({ success: true, isCorrect: true, finished: true });
      }

      return NextResponse.json({ success: true, isCorrect: true, newPosition, tileType: landedTile.type, nextStep: 'TILE_EFFECT' });
    }

    // ── INTERACT_TILE ──────────────────────────────────────────────────────────
    if (action === 'INTERACT_TILE') {
      if (currentTurnRecord.status !== 'TILE_EFFECT') {
        return NextResponse.json({ error: `Cannot interact — turn status is "${currentTurnRecord.status}".` }, { status: 400 });
      }

      const tile = getTileByIndex(player.position);
      const { choice } = details || {};
      const FINISH = BOARD_SIZE - 1;

      let coinsChange = 0;
      let posChange = 0;
      let logMessage = '';
      let bonusRoll = false; // for DICE_AGAIN tile
      let skipTurns = 0;    // for SKIP_TURN tile
      let skipGenericUpdate = false; // for tiles that handle their own DB writes (SWAP, MYSTERY swap)

      switch (tile.type) {

        // ── BONUS (legacy Coin Fountain) ─────────────────────────────────────
        case 'BONUS':
          coinsChange = 10;
          logMessage = `${player.user.username} collected 10 coins from the Coin Fountain! 🎁`;
          break;

        // ── COIN_BONUS ────────────────────────────────────────────────────────
        case 'COIN_BONUS': {
          const amounts: Record<string, number> = {
            'Gold Pile': 8, 'Coin Fountain': 10, 'Treasure Cache': 15,
            'Star Chest': 20, 'Victory Cache': 25
          };
          coinsChange = amounts[tile.name] ?? 10;
          logMessage = `${player.user.username} collected ${coinsChange} coins! 💰`;
          break;
        }

        // ── COIN_DRAIN ────────────────────────────────────────────────────────
        case 'COIN_DRAIN':
          coinsChange = -Math.min(12, player.coins);
          logMessage = `${player.user.username} lost ${Math.abs(coinsChange)} coins to the Tax Collector! 💸`;
          break;

        // ── SHORTCUT / MOVE_FORWARD ───────────────────────────────────────────
        case 'SHORTCUT':
        case 'MOVE_FORWARD': {
          const fwdAmounts: Record<string, number> = {
            'Wind Tunnel': 3, 'Springpad': 2, 'Tailwind': 3, 'Launch Pad': 4
          };
          posChange = fwdAmounts[tile.name] ?? 2;
          logMessage = `${player.user.username} zoomed forward ${posChange} tiles! 💨`;
          break;
        }

        // ── MOVE_BACK ─────────────────────────────────────────────────────────
        case 'MOVE_BACK':
          posChange = -4;
          logMessage = `${player.user.username} fell into the sinkhole! −4 tiles 🕳️`;
          break;

        // ── TRAP ──────────────────────────────────────────────────────────────
        case 'TRAP':
          if (player.shieldActive || player.trapImmunity) {
            logMessage = `${player.user.username} blocked the trap with their protection! 🛡️`;
            await prisma.player.update({ where: { id: player.id }, data: { shieldActive: false, trapImmunity: false } });
          } else {
            coinsChange = -10;
            posChange = -2;
            logMessage = `${player.user.username} hit a trap! −10 coins, −2 tiles 💥`;
          }
          break;

        // ── TREASURE ──────────────────────────────────────────────────────────
        case 'TREASURE':
          if (choice === 'OPEN') {
            if (player.coins < 10) return NextResponse.json({ error: 'Not enough coins to open (needs 10)' }, { status: 400 });
            coinsChange = -10;
            const r = Math.random();
            if (r < 0.35) {
              await prisma.player.update({ where: { id: player.id }, data: { shieldActive: true } });
              logMessage = `${player.user.username} opened a chest and found a SHIELD! 🛡️`;
            } else if (r < 0.7) {
              coinsChange += 25;
              logMessage = `${player.user.username} opened a chest and found 25 COINS! 💰`;
            } else if (r < 0.9) {
              coinsChange += 15;
              await grantFreeItem(player.id, player.user.username, room.id);
              logMessage = `${player.user.username} opened a chest and found an item + 15 coins! 🎁`;
            } else {
              posChange = -3;
              logMessage = `${player.user.username} opened a chest — MIMIC! Fell back 3 tiles 🪤`;
            }
          } else {
            logMessage = `${player.user.username} left the chest unopened.`;
          }
          break;

        // ── MYSTERY ───────────────────────────────────────────────────────────
        case 'MYSTERY': {
          const r = Math.random();
          if (r < 0.2 && room.players.length > 1) {
            const others = room.players.filter(p => p.id !== player.id);
            const target = others[Math.floor(Math.random() * others.length)];
            const tempPos = player.position;
            await prisma.player.update({ where: { id: player.id }, data: { position: target.position } });
            await prisma.player.update({ where: { id: target.id }, data: { position: tempPos } });
            logMessage = `Mystery! ${player.user.username} swapped with ${target.user.username}! 🔄`;
            skipGenericUpdate = true; // positions already updated above
          } else if (r < 0.4) {
            posChange = 5;
            logMessage = `Mystery warp! ${player.user.username} teleported +5 tiles ahead! ⚡`;
          } else if (r < 0.6) {
            coinsChange = 15;
            logMessage = `Mystery blessing! ${player.user.username} received 15 coins! ✨`;
          } else if (r < 0.75) {
            coinsChange = -8;
            posChange = -2;
            logMessage = `Mystery curse! ${player.user.username} lost 8 coins and fell back 2 tiles! 💀`;
          } else if (r < 0.88) {
            await grantFreeItem(player.id, player.user.username, room.id);
            logMessage = `Mystery gift! ${player.user.username} received a free item! 🎁`;
          } else {
            bonusRoll = true;
            logMessage = `Mystery momentum! ${player.user.username} gets to roll again! 🎲`;
          }
          break;
        }

        // ── RISK ──────────────────────────────────────────────────────────────
        case 'RISK':
          if (choice === 'GAMBLE') {
            const win = Math.random() > 0.4;
            if (win) {
              coinsChange = player.coins;
              logMessage = `${player.user.username} gambled and DOUBLED their coins! 🎲💸`;
            } else {
              coinsChange = -Math.floor(player.coins / 2);
              logMessage = `${player.user.username} gambled and lost HALF their coins! 😬`;
            }
          } else {
            logMessage = `${player.user.username} skipped the gamble.`;
          }
          break;

        // ── TELEPORT ──────────────────────────────────────────────────────────
        case 'TELEPORT': {
          // Pick random tile excluding start (0) and finish (FINISH)
          const randTile = 1 + Math.floor(Math.random() * (FINISH - 2));
          posChange = randTile - player.position;
          logMessage = `${player.user.username} teleported to tile ${randTile}! ⚡`;
          break;
        }

        // ── ITEM_REWARD ────────────────────────────────────────────────────────
        case 'ITEM_REWARD':
          await grantFreeItem(player.id, player.user.username, room.id);
          logMessage = `${player.user.username} claimed a free item reward! 🎁`;
          break;

        // ── SKIP_TURN ─────────────────────────────────────────────────────────
        case 'SKIP_TURN': {
          skipTurns = tile.name === 'Time Warp' ? 2 : 1;
          // We implement skip by creating placeholder completed turns for this player
          logMessage = `${player.user.username} is frozen and will skip ${skipTurns} turn(s)! ❄️`;
          break;
        }

        // ── DICE_AGAIN ────────────────────────────────────────────────────────
        case 'DICE_AGAIN':
          bonusRoll = true;
          logMessage = `${player.user.username} gets a bonus roll! 🎲`;
          break;

        // ── SWAP ──────────────────────────────────────────────────────────────
        case 'SWAP':
          if (room.players.length > 1) {
            const others = room.players.filter(p => p.id !== player.id);
            const target = others.reduce((closest, p) =>
              Math.abs(p.position - player.position) < Math.abs(closest.position - player.position) ? p : closest
            );
            const tempPos = player.position;
            await prisma.player.update({ where: { id: player.id }, data: { position: target.position } });
            await prisma.player.update({ where: { id: target.id }, data: { position: tempPos } });
            logMessage = `${player.user.username} swapped positions with ${target.user.username}! 🔄`;
            skipGenericUpdate = true; // positions already updated above
          } else {
            logMessage = `${player.user.username} tried to swap but there's no one else!`;
          }
          break;

        // ── EVENT ─────────────────────────────────────────────────────────────
        case 'EVENT': {
          const evt = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
          await prisma.room.update({ where: { id: room.id }, data: { activeEvent: evt, eventRoundsLeft: 2 } });
          logMessage = `${player.user.username} triggered a global event: ${evt}! 🌍`;
          break;
        }

        // ── CHALLENGE / WILD ──────────────────────────────────────────────────
        case 'CHALLENGE':
        case 'WILD':
        default:
          logMessage = `${player.user.username} continues forward.`;
          break;
      }

      // Apply position + coin changes (skip for tiles that already wrote to DB directly)
      let finalPos = player.position + posChange;
      if (finalPos < 0) finalPos = 0;
      if (finalPos > FINISH) finalPos = FINISH;

      if (!skipGenericUpdate) {
        if (room.mode === 'TEAM' && player.teamId) {
          await prisma.team.update({ where: { id: player.teamId }, data: { position: finalPos, coins: { increment: coinsChange } } });
          await prisma.player.updateMany({ where: { teamId: player.teamId }, data: { position: finalPos, coins: { increment: coinsChange } } });
        } else {
          await prisma.player.update({ where: { id: player.id }, data: { position: finalPos, coins: { increment: coinsChange } } });
        }
      } else {
        // For swap tiles we still need to apply any coin change (usually 0) if needed
        if (coinsChange !== 0) {
          await prisma.player.update({ where: { id: player.id }, data: { coins: { increment: coinsChange } } });
        }
        // finalPos stays as player.position since swap already happened
        finalPos = player.position;
      }

      if (logMessage) {
        await prisma.roomAction.create({
          data: { roomId: room.id, playerUsername: 'System', actionType: 'TILE', details: JSON.stringify({ message: logMessage }) }
        });
      }

      if (finalPos >= FINISH) {
        const updatedPlayer = { ...player, position: finalPos };
        await handleVictory(room, updatedPlayer, currentTurnRecord.id);
        return NextResponse.json({ success: true, finished: true });
      }

      // If dice_again / mystery bonus: reset turn to ROLLING instead of advancing
      if (bonusRoll) {
        await prisma.turn.update({ where: { id: currentTurnRecord.id }, data: { status: 'ROLLING', tileEffectTriggered: true } });
        await prisma.roomAction.create({
          data: { roomId: room.id, playerUsername: 'System', actionType: 'TILE',
            details: JSON.stringify({ message: `🎲 ${player.user.username} rolls again!` }) }
        });
        return NextResponse.json({ success: true, bonusRoll: true });
      }

      // Skip turn: log a note and advance normally (the frozen player's turn will be auto-skipped by the host UI)
      // We store skipTurns in the game log; for simplicity we advance normally after logging
      await prisma.turn.update({ where: { id: currentTurnRecord.id }, data: { status: 'COMPLETED' } });

      // If skip turns: advance past this player the required number of extra times
      let advanceTurnNum = currentTurnRecord.turnNumber;
      let advanceTurnIdx = room.currentTurn;
      let advanceRound = room.round;

      if (skipTurns > 0) {
        // advance once for the tile interaction (normal), then skip more
        const base = await advanceToNextTurn(room.id, advanceTurnNum, room.players, advanceTurnIdx, advanceRound, room.activeEvent, room.eventRoundsLeft);
        advanceTurnNum++;
        advanceTurnIdx = base.nextTurnIndex;
        advanceRound = base.nextRound;
        for (let s = 1; s < skipTurns; s++) {
          // Mark the just-created turn as completed (it's for the same frozen player who gets skipped again)
          const latestTurn = await prisma.turn.findFirst({ where: { roomId: room.id, status: 'ROLLING' }, orderBy: { createdAt: 'desc' } });
          if (latestTurn) await prisma.turn.update({ where: { id: latestTurn.id }, data: { status: 'COMPLETED' } });
          const r2 = await advanceToNextTurn(room.id, advanceTurnNum, room.players, advanceTurnIdx, advanceRound, room.activeEvent, room.eventRoundsLeft);
          advanceTurnNum++;
          advanceTurnIdx = r2.nextTurnIndex;
          advanceRound = r2.nextRound;
        }
        return NextResponse.json({ success: true, finished: false });
      }

      await advanceToNextTurn(room.id, currentTurnRecord.turnNumber, room.players, room.currentTurn, room.round, room.activeEvent, room.eventRoundsLeft);
      return NextResponse.json({ success: true, finished: false });
    }

    return NextResponse.json({ error: `Action "${action}" is not valid in the current state.` }, { status: 400 });

  } catch (error: any) {
    console.error('Action API Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
