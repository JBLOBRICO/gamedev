import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTileByIndex } from '@/lib/boardConfig';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Award achievements based on current stats */
async function checkAndAwardAchievements(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: true }
    });
    if (!user) return;

    const allAchievements = await prisma.achievement.findMany();
    const toUnlock = [];

    for (const ach of allAchievements) {
      if (user.achievements.some(a => a.achievementId === ach.id)) continue;

      let meetsCondition = false;
      if (ach.title === 'First Steps') meetsCondition = true;
      if (ach.title === 'Ready Up') meetsCondition = true;
      if (ach.title === 'Trivia Rookie' && user.correctAnswers >= 10) meetsCondition = true;
      if (ach.title === 'Trivia Adept' && user.correctAnswers >= 55) meetsCondition = true;
      if (ach.title === 'Trivia Master' && user.correctAnswers >= 100) meetsCondition = true;
      if (ach.title === 'Coin Hoarder' && user.coins >= 500) meetsCondition = true;
      if (ach.title === 'Wealthy Traveler' && user.coins >= 1000) meetsCondition = true;
      if (ach.title === 'Level Up!' && user.level >= 5) meetsCondition = true;
      if (ach.title === 'Double Digits' && user.level >= 10) meetsCondition = true;
      if (ach.title === 'Veteran Quizzer' && user.level >= 20) meetsCondition = true;
      if (ach.title === 'Trivia Legend' && user.achievements.length >= 49) meetsCondition = true;

      if (meetsCondition) toUnlock.push(ach);
    }

    for (const ach of toUnlock) {
      await prisma.userAchievement.create({ data: { userId, achievementId: ach.id } });
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: ach.xpReward }, coins: { increment: ach.coinReward } }
      });
    }
  } catch (err) {
    console.error('Error awarding achievements:', err);
  }
}

/** Create the next turn for the following player */
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

  if (nextTurnIndex === 0) {
    nextRound += 1;
  }

  // Global board event check (every 4 rounds)
  let newActiveEvent = activeEvent;
  let newEventRoundsLeft = eventRoundsLeft;

  if (nextTurnIndex === 0 && nextRound % 4 === 0) {
    const events = ['Treasure Rush', 'Reverse Movement', 'Lucky Hour', 'Chaos Mode', 'Coin Frenzy', 'Sudden Death'];
    newActiveEvent = events[Math.floor(Math.random() * events.length)];
    newEventRoundsLeft = 2;

    await prisma.roomAction.create({
      data: {
        roomId,
        playerUsername: 'System',
        actionType: 'EVENT',
        details: JSON.stringify({ message: `GLOBAL EVENT TRIGGERED: ${newActiveEvent}! Lasts for 2 rounds.` })
      }
    });
  } else if (nextTurnIndex === 0 && newEventRoundsLeft > 0) {
    newEventRoundsLeft -= 1;
    if (newEventRoundsLeft === 0) newActiveEvent = null;
  }

  await prisma.room.update({
    where: { id: roomId },
    data: {
      currentTurn: nextTurnIndex,
      round: nextRound,
      activeEvent: newActiveEvent,
      eventRoundsLeft: newEventRoundsLeft,
    }
  });

  const nextPlayer = players[nextTurnIndex];
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

/** Handle game victory */
async function handleVictory(
  room: any,
  winner: any,
  currentTurnId: string
) {
  await prisma.room.update({
    where: { id: room.id },
    data: { status: 'FINISHED', winnerId: winner.userId }
  });

  const history = await prisma.matchHistory.create({
    data: {
      mode: room.mode,
      winnerUsername: winner.user.username,
      roundCount: room.round,
    }
  });

  for (const p of room.players) {
    await prisma.matchHistoryPlayer.create({
      data: {
        matchId: history.id,
        userId: p.userId,
        username: p.user.username,
        avatarId: p.user.avatarId,
        coinsEarned: p.coins,
        xpEarned: p.coins * 5 + 50,
        correctAnswers: p.user.correctAnswers,
        incorrectAnswers: p.user.incorrectAnswers,
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
      roomId: room.id,
      playerUsername: 'System',
      actionType: 'EVENT',
      details: JSON.stringify({ message: `${winner.user.username} REACHED THE FINISH LINE AND WON THE GAME! 🏆` })
    }
  });

  await prisma.turn.update({
    where: { id: currentTurnId },
    data: { status: 'COMPLETED' }
  });
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  try {
    // ── Parse request body ────────────────────────────────────────────────────
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { action, userId, details } = body;

    // ── Validate action & userId ──────────────────────────────────────────────
    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const VALID_ACTIONS = [
      'HEARTBEAT', 'LOBBY_READY', 'START_GAME', 'ROLL_DICE',
      'ANSWER_TRIVIA', 'INTERACT_TILE', 'BUY_ITEM', 'END_TURN',
      'FORCE_ADVANCE', 'CHAT'
    ];
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // ── Load room ─────────────────────────────────────────────────────────────
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: {
        players: {
          include: { user: true },
          orderBy: { order: 'asc' }
        },
        teams: true,
        turns: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // ── Find the requesting player ────────────────────────────────────────────
    const player = room.players.find(p => p.userId === userId);
    if (!player) {
      return NextResponse.json({ error: 'You are not in this room. Please rejoin.' }, { status: 403 });
    }

    // ── 1. HEARTBEAT ─────────────────────────────────────────────────────────
    if (action === 'HEARTBEAT') {
      await prisma.player.update({
        where: { id: player.id },
        data: { lastActive: new Date(), isConnected: true }
      });
      return NextResponse.json({ success: true });
    }

    // ── Update heartbeat for all non-heartbeat actions ────────────────────────
    await prisma.player.update({
      where: { id: player.id },
      data: { lastActive: new Date(), isConnected: true }
    });

    // ── 2. LOBBY_READY ───────────────────────────────────────────────────────
    if (action === 'LOBBY_READY') {
      if (room.status !== 'LOBBY') {
        return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
      }

      const updatedPlayer = await prisma.player.update({
        where: { id: player.id },
        data: { isReady: !player.isReady },
        include: { user: true }
      });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'CHAT',
          details: JSON.stringify({ message: `${player.user.username} is ${updatedPlayer.isReady ? 'READY ✅' : 'NOT READY ❌'}.` })
        }
      });

      await checkAndAwardAchievements(userId);
      return NextResponse.json({ success: true });
    }

    // ── 3. START_GAME ────────────────────────────────────────────────────────
    if (action === 'START_GAME') {
      if (!player.isHost) {
        return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
      }

      if (room.status === 'ACTIVE') {
        return NextResponse.json({ error: 'Game is already in progress' }, { status: 400 });
      }

      if (room.players.length < 1) {
        return NextResponse.json({ error: 'Need at least 1 player to start' }, { status: 400 });
      }

      const notReady = room.players.filter(p => !p.isReady && p.userId !== userId);
      if (notReady.length > 0 && room.players.length > 1) {
        return NextResponse.json({
          error: `Players not ready: ${notReady.map(p => p.user.username).join(', ')}`
        }, { status: 400 });
      }

      // Assign random turn order
      const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffledPlayers.length; i++) {
        await prisma.player.update({
          where: { id: shuffledPlayers[i].id },
          data: { order: i, position: 0, coins: 15 }
        });
      }

      await prisma.room.update({
        where: { id: room.id },
        data: { status: 'ACTIVE', currentTurn: 0, round: 1 }
      });

      // Cancel any leftover turns
      await prisma.turn.updateMany({
        where: { roomId: room.id, status: { not: 'COMPLETED' } },
        data: { status: 'COMPLETED' }
      });

      const firstPlayer = shuffledPlayers[0];
      await prisma.turn.create({
        data: {
          roomId: room.id,
          round: 1,
          turnNumber: 1,
          activePlayerId: firstPlayer.userId,
          status: 'ROLLING',
        }
      });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: 'System',
          actionType: 'EVENT',
          details: JSON.stringify({ message: `🎮 Game started! ${firstPlayer.user.username} goes first!` })
        }
      });

      return NextResponse.json({ success: true });
    }

    // ════════════════════════════════════════════════════════════════════════
    //  GAMEPLAY ACTIONS — require ACTIVE game
    // ════════════════════════════════════════════════════════════════════════

    if (room.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }

    // ── Get current turn ─────────────────────────────────────────────────────
    const currentTurnRecord = room.turns[0];

    // ── 4. FORCE_ADVANCE — host can unstick a broken/timed-out turn ──────────
    if (action === 'FORCE_ADVANCE') {
      if (!player.isHost) {
        return NextResponse.json({ error: 'Only the host can force-advance the turn' }, { status: 403 });
      }

      // Mark any stuck non-completed turn as completed
      if (currentTurnRecord && currentTurnRecord.status !== 'COMPLETED') {
        await prisma.turn.update({
          where: { id: currentTurnRecord.id },
          data: { status: 'COMPLETED' }
        });

        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: 'System',
            actionType: 'EVENT',
            details: JSON.stringify({ message: `Host force-advanced the turn.` })
          }
        });
      }

      await advanceToNextTurn(
        room.id,
        currentTurnRecord?.turnNumber || 0,
        room.players,
        room.currentTurn,
        room.round,
        room.activeEvent,
        room.eventRoundsLeft
      );

      return NextResponse.json({ success: true });
    }

    // ── END_TURN — can be called by the active player OR host when turn is COMPLETED
    if (action === 'END_TURN') {
      const isActivePlayer = currentTurnRecord?.activePlayerId === userId;
      const isHost = player.isHost;

      if (!isActivePlayer && !isHost) {
        return NextResponse.json({ error: 'Only the active player or host can end the turn' }, { status: 403 });
      }

      if (!currentTurnRecord) {
        // No turn record — create one now to recover
        const nextPlayer = room.players[room.currentTurn] || room.players[0];
        await prisma.turn.create({
          data: {
            roomId: room.id,
            round: room.round,
            turnNumber: 1,
            activePlayerId: nextPlayer.userId,
            status: 'ROLLING',
          }
        });
        return NextResponse.json({ success: true });
      }

      if (currentTurnRecord.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Turn is not yet completed' }, { status: 400 });
      }

      await advanceToNextTurn(
        room.id,
        currentTurnRecord.turnNumber,
        room.players,
        room.currentTurn,
        room.round,
        room.activeEvent,
        room.eventRoundsLeft
      );

      return NextResponse.json({ success: true });
    }

    // ── CHAT — always allowed ─────────────────────────────────────────────────
    if (action === 'CHAT') {
      const message = details?.message;
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
      }
      if (message.length > 200) {
        return NextResponse.json({ error: 'Message too long (max 200 chars)' }, { status: 400 });
      }

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'CHAT',
          details: JSON.stringify({ message: message.trim() })
        }
      });
      return NextResponse.json({ success: true });
    }

    // ── BUY_ITEM — can happen during ROLLING phase of your turn ──────────────
    if (action === 'BUY_ITEM') {
      const { itemId, cost } = details || {};

      if (!itemId || typeof itemId !== 'string') {
        return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
      }

      const validItems = ['shield', 'extra_time', 'lucky_dice', 'trap_immunity', 'multiplier'];
      if (!validItems.includes(itemId)) {
        return NextResponse.json({ error: 'Invalid item' }, { status: 400 });
      }

      const itemCost = typeof cost === 'number' ? cost : 0;
      if (itemCost <= 0) {
        return NextResponse.json({ error: 'Invalid item cost' }, { status: 400 });
      }

      if (player.coins < itemCost) {
        return NextResponse.json({ error: `Not enough coins. Need ${itemCost}, have ${player.coins}.` }, { status: 400 });
      }

      const updateData: any = { coins: { decrement: itemCost } };
      if (itemId === 'shield') updateData.shieldActive = true;
      if (itemId === 'extra_time') updateData.extraTimeActive = true;
      if (itemId === 'lucky_dice') updateData.luckyDiceActive = true;
      if (itemId === 'trap_immunity') updateData.trapImmunity = true;
      if (itemId === 'multiplier') updateData.doubleCoinsActive = true;

      await prisma.player.update({ where: { id: player.id }, data: updateData });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'SHOP',
          details: JSON.stringify({ message: `${player.user.username} purchased ${itemId.toUpperCase().replace('_', ' ')} for ${itemCost} coins.` })
        }
      });

      return NextResponse.json({ success: true });
    }

    // ════════════════════════════════════════════════════════════════════════
    //  TURN-GATED ACTIONS — require an active, non-completed turn
    // ════════════════════════════════════════════════════════════════════════

    if (!currentTurnRecord || currentTurnRecord.status === 'COMPLETED') {
      return NextResponse.json({
        error: 'No active turn. Waiting for the next turn to begin.',
        hint: 'The active player needs to end their turn first.'
      }, { status: 400 });
    }

    // ── Validate it's this player's turn ─────────────────────────────────────
    if (currentTurnRecord.activePlayerId !== userId) {
      const activeP = room.players.find(p => p.userId === currentTurnRecord.activePlayerId);
      return NextResponse.json({
        error: `It is not your turn. Waiting for ${activeP?.user.username || 'the active player'}.`
      }, { status: 400 });
    }

    // ── 5. ROLL_DICE ──────────────────────────────────────────────────────────
    if (action === 'ROLL_DICE') {
      if (currentTurnRecord.status !== 'ROLLING') {
        return NextResponse.json({
          error: `Cannot roll dice — current turn status is "${currentTurnRecord.status}".`
        }, { status: 400 });
      }

      // Calculate roll
      let roll = Math.floor(1 + Math.random() * 6);
      if (player.luckyDiceActive) {
        roll = Math.random() > 0.5 ? 6 : 5;
      }

      // Select trivia question
      const category = details?.category || 'General Knowledge';
      const difficulty = details?.difficulty || 'MEDIUM';

      if (typeof category !== 'string' || typeof difficulty !== 'string') {
        return NextResponse.json({ error: 'Invalid category or difficulty' }, { status: 400 });
      }

      const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
      if (!validDifficulties.includes(difficulty)) {
        return NextResponse.json({ error: 'Difficulty must be EASY, MEDIUM, or HARD' }, { status: 400 });
      }

      const questionCount = await prisma.triviaQuestion.count({ where: { category, difficulty } });

      let question = null;
      if (questionCount > 0) {
        const randIndex = Math.floor(Math.random() * questionCount);
        question = await prisma.triviaQuestion.findFirst({ where: { category, difficulty }, skip: randIndex });
      }

      // Fallback to any question if none in that category/difficulty
      if (!question) {
        question = await prisma.triviaQuestion.findFirst({ where: { difficulty } });
      }
      if (!question) {
        question = await prisma.triviaQuestion.findFirst();
      }
      if (!question) {
        return NextResponse.json({ error: 'No trivia questions available. Please seed the database.' }, { status: 500 });
      }

      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: {
          status: 'TRIVIA',
          rollValue: roll,
          questionId: question.id,
          questionCategory: question.category,
          questionDifficulty: question.difficulty,
          questionText: question.question,
          questionOptions: question.options,
          questionCorrectAnswer: question.correctAnswer,
          timeRemaining: player.extraTimeActive ? 30 : 15,
        }
      });

      // Disable lucky dice once used
      if (player.luckyDiceActive) {
        await prisma.player.update({ where: { id: player.id }, data: { luckyDiceActive: false } });
      }

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'ROLL',
          details: JSON.stringify({ message: `${player.user.username} rolled a ${roll}! (${difficulty} ${category})` })
        }
      });

      return NextResponse.json({ success: true, roll });
    }

    // ── 6. ANSWER_TRIVIA ──────────────────────────────────────────────────────
    if (action === 'ANSWER_TRIVIA') {
      if (currentTurnRecord.status !== 'TRIVIA') {
        return NextResponse.json({
          error: `Cannot answer trivia — current turn status is "${currentTurnRecord.status}".`
        }, { status: 400 });
      }

      const { answer } = details || {};
      if (answer === undefined || answer === null) {
        // Treat null/undefined as a timeout/skipped answer
      }

      const isCorrect = answer !== undefined && answer !== null && answer !== ''
        ? answer === currentTurnRecord.questionCorrectAnswer
        : false;

      const roll = currentTurnRecord.rollValue || 1;
      const difficulty = currentTurnRecord.questionDifficulty || 'MEDIUM';

      let moveDistance = 0;
      let coinsReward = 0;
      let xpReward = 0;

      if (isCorrect) {
        if (difficulty === 'EASY') { moveDistance = roll; coinsReward = 5; xpReward = 20; }
        else if (difficulty === 'MEDIUM') { moveDistance = roll + 1; coinsReward = 10; xpReward = 40; }
        else if (difficulty === 'HARD') { moveDistance = roll + 2; coinsReward = 20; xpReward = 80; }

        if (player.doubleCoinsActive) {
          coinsReward *= 2;
          await prisma.player.update({ where: { id: player.id }, data: { doubleCoinsActive: false } });
        }
      }

      // Update player statistics
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
        // Wrong answer → turn ends, auto-advance to next player
        await prisma.turn.update({
          where: { id: currentTurnRecord.id },
          data: { status: 'COMPLETED', selectedAnswer: answer || '', isAnswerCorrect: false }
        });

        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: player.user.username,
            actionType: 'ANSWER',
            details: JSON.stringify({
              message: answer
                ? `${player.user.username} answered incorrectly. The correct answer was: ${currentTurnRecord.questionCorrectAnswer}.`
                : `${player.user.username} ran out of time! Correct answer: ${currentTurnRecord.questionCorrectAnswer}.`
            })
          }
        });

        // Auto-advance turn
        await advanceToNextTurn(
          room.id,
          currentTurnRecord.turnNumber,
          room.players,
          room.currentTurn,
          room.round,
          room.activeEvent,
          room.eventRoundsLeft
        );

        return NextResponse.json({ success: true, isCorrect: false, nextStep: 'NEXT_PLAYER' });
      }

      // Correct answer — move player
      let newPosition = player.position + moveDistance;
      if (newPosition >= 31) newPosition = 31;

      if (room.mode === 'TEAM' && player.teamId) {
        await prisma.team.update({
          where: { id: player.teamId },
          data: { position: newPosition, coins: { increment: coinsReward } }
        });
        await prisma.player.updateMany({
          where: { teamId: player.teamId },
          data: { position: newPosition }
        });
      } else {
        await prisma.player.update({
          where: { id: player.id },
          data: { position: newPosition, coins: { increment: coinsReward } }
        });
      }

      const landedTile = getTileByIndex(newPosition);

      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: {
          status: 'TILE_EFFECT',
          selectedAnswer: answer,
          isAnswerCorrect: true,
          tileType: landedTile.type,
        }
      });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'ANSWER',
          details: JSON.stringify({
            message: `${player.user.username} answered correctly! ✓ Moved to tile ${newPosition} (${landedTile.name}).`
          })
        }
      });

      // Check victory
      if (newPosition >= 31) {
        await handleVictory(room, player, currentTurnRecord.id);
        return NextResponse.json({ success: true, isCorrect: true, finished: true });
      }

      return NextResponse.json({ success: true, isCorrect: true, newPosition, tileType: landedTile.type, nextStep: 'TILE_EFFECT' });
    }

    // ── 7. INTERACT_TILE ──────────────────────────────────────────────────────
    if (action === 'INTERACT_TILE') {
      if (currentTurnRecord.status !== 'TILE_EFFECT') {
        return NextResponse.json({
          error: `Cannot interact with tile — current turn status is "${currentTurnRecord.status}".`
        }, { status: 400 });
      }

      const tile = getTileByIndex(player.position);
      const { choice } = details || {};

      let coinsChange = 0;
      let posChange = 0;
      let logMessage = '';

      if (tile.type === 'BONUS') {
        coinsChange = 5;
        logMessage = `${player.user.username} collected 5 bonus coins! 🎁`;
      } else if (tile.type === 'SHORTCUT') {
        posChange = 2;
        logMessage = `${player.user.username} caught the shortcut wind! +2 tiles 💨`;
      } else if (tile.type === 'TRAP') {
        if (player.shieldActive || player.trapImmunity) {
          logMessage = `${player.user.username} blocked the trap with their protection! 🛡`;
          await prisma.player.update({ where: { id: player.id }, data: { shieldActive: false, trapImmunity: false } });
        } else {
          coinsChange = -10;
          posChange = -3;
          logMessage = `${player.user.username} hit a spike trap! -10 coins, -3 tiles 💥`;
        }
      } else if (tile.type === 'TREASURE') {
        if (choice === 'OPEN') {
          if (player.coins < 10) {
            return NextResponse.json({ error: 'Not enough coins to open the chest (needs 10)' }, { status: 400 });
          }
          coinsChange = -10;
          const roll = Math.random();
          if (roll < 0.4) {
            await prisma.player.update({ where: { id: player.id }, data: { shieldActive: true } });
            logMessage = `${player.user.username} opened a chest and found a SHIELD! 🛡`;
          } else if (roll < 0.8) {
            coinsChange += 25;
            logMessage = `${player.user.username} opened a chest and found 25 COINS! 💰`;
          } else {
            posChange = -3;
            logMessage = `${player.user.username} opened a chest — it was a MIMIC! Fell back 3 tiles 🪤`;
          }
        } else {
          logMessage = `${player.user.username} left the treasure chest unopened.`;
        }
      } else if (tile.type === 'MYSTERY') {
        const roll = Math.random();
        if (roll < 0.3 && room.players.length > 1) {
          const others = room.players.filter(p => p.id !== player.id);
          const target = others[Math.floor(Math.random() * others.length)];
          const tempPos = player.position;
          await prisma.player.update({ where: { id: player.id }, data: { position: target.position } });
          await prisma.player.update({ where: { id: target.id }, data: { position: tempPos } });
          logMessage = `Mystery! ${player.user.username} swapped positions with ${target.user.username}! 🔄`;
        } else if (roll < 0.6) {
          posChange = 4;
          logMessage = `Mystery warp! ${player.user.username} teleported +4 tiles ahead! ⚡`;
        } else {
          coinsChange = 15;
          logMessage = `Mystery blessing! ${player.user.username} received 15 coins! ✨`;
        }
      } else if (tile.type === 'RISK') {
        if (choice === 'GAMBLE') {
          const isWinner = Math.random() > 0.4;
          if (isWinner) {
            coinsChange = player.coins;
            logMessage = `${player.user.username} gambled and DOUBLED their coins! 🎲💸`;
          } else {
            coinsChange = -Math.floor(player.coins / 2);
            logMessage = `${player.user.username} gambled and lost HALF their coins! 😬`;
          }
        } else {
          logMessage = `${player.user.username} skipped the risk gamble.`;
        }
      } else {
        // NORMAL, WILD, EVENT, START, etc.
        logMessage = `${player.user.username} continues forward.`;
      }

      // Apply position change
      let finalPos = player.position + posChange;
      if (finalPos < 0) finalPos = 0;
      if (finalPos >= 31) finalPos = 31;

      // Update player/team
      if (room.mode === 'TEAM' && player.teamId) {
        await prisma.team.update({
          where: { id: player.teamId },
          data: { position: finalPos, coins: { increment: coinsChange } }
        });
        await prisma.player.updateMany({
          where: { teamId: player.teamId },
          data: { position: finalPos, coins: { increment: coinsChange } }
        });
      } else {
        await prisma.player.update({
          where: { id: player.id },
          data: { position: finalPos, coins: { increment: coinsChange } }
        });
      }

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: 'System',
          actionType: 'TILE',
          details: JSON.stringify({ message: logMessage })
        }
      });

      // Check if tile interaction caused a win
      if (finalPos >= 31) {
        // Re-fetch player with updated position
        const updatedPlayer = { ...player, position: finalPos };
        await handleVictory(room, updatedPlayer, currentTurnRecord.id);
        return NextResponse.json({ success: true, finished: true });
      }

      // Mark turn COMPLETED and AUTO-ADVANCE to next player
      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: { status: 'COMPLETED' }
      });

      await advanceToNextTurn(
        room.id,
        currentTurnRecord.turnNumber,
        room.players,
        room.currentTurn,
        room.round,
        room.activeEvent,
        room.eventRoundsLeft
      );

      return NextResponse.json({ success: true, finished: false });
    }

    return NextResponse.json({ error: `Action "${action}" is not valid in the current game state.` }, { status: 400 });

  } catch (error: any) {
    console.error('Action API Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
