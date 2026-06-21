import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTileByIndex } from '@/lib/boardConfig';

// Helper to award achievements
async function checkAndAwardAchievements(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { achievements: true }
    });
    if (!user) return;

    // user unlock data available for future badge checks

    const allAchievements = await prisma.achievement.findMany();
    
    // Check various stats and unlock achievements
    const toUnlock = [];

    for (const ach of allAchievements) {
      // Skip if already unlocked
      if (user.achievements.some(a => a.achievementId === ach.id)) continue;

      let meetsCondition = false;

      if (ach.title === "First Steps") meetsCondition = true;
      if (ach.title === "Ready Up") meetsCondition = true;
      if (ach.title === "Trivia Rookie" && user.correctAnswers >= 10) meetsCondition = true;
      if (ach.title === "Trivia Adept" && user.correctAnswers >= 55) meetsCondition = true;
      if (ach.title === "Trivia Master" && user.correctAnswers >= 100) meetsCondition = true;
      if (ach.title === "Coin Hoarder" && user.coins >= 500) meetsCondition = true;
      if (ach.title === "Wealthy Traveler" && user.coins >= 1000) meetsCondition = true;
      if (ach.title === "Level Up!" && user.level >= 5) meetsCondition = true;
      if (ach.title === "Double Digits" && user.level >= 10) meetsCondition = true;
      if (ach.title === "Veteran Quizzer" && user.level >= 20) meetsCondition = true;
      if (ach.title === "Trivia Legend" && user.achievements.length >= 49) meetsCondition = true;

      if (meetsCondition) {
        toUnlock.push(ach);
      }
    }

    for (const ach of toUnlock) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
        }
      });
      // Reward user
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: ach.xpReward },
          coins: { increment: ach.coinReward }
        }
      });
    }
  } catch (err) {
    console.error("Error awarding achievements:", err);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  try {
    const { action, userId, details } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find room and current players
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: {
        players: {
          include: { user: true },
          orderBy: { order: 'asc' }
        },
        teams: true,
        turns: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const player = room.players.find(p => p.userId === userId);
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 400 });
    }

    // 1. HEARTBEAT ACTION
    if (action === 'HEARTBEAT') {
      await prisma.player.update({
        where: { id: player.id },
        data: { lastActive: new Date(), isConnected: true }
      });
      return NextResponse.json({ success: true });
    }

    // Update heartbeat for any active action
    await prisma.player.update({
      where: { id: player.id },
      data: { lastActive: new Date(), isConnected: true }
    });

    // 2. LOBBY_READY ACTION
    if (action === 'LOBBY_READY') {
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
          details: JSON.stringify({ message: `${player.user.username} is ${updatedPlayer.isReady ? 'READY' : 'NOT READY'}.` })
        }
      });

      await checkAndAwardAchievements(userId);

      return NextResponse.json({ success: true });
    }

    // 3. START_GAME ACTION
    if (action === 'START_GAME') {
      if (!player.isHost) {
        return NextResponse.json({ error: 'Only host can start the game' }, { status: 403 });
      }

      const notReady = room.players.filter(p => !p.isReady);
      if (notReady.length > 0 && room.players.length > 1) {
        return NextResponse.json({ error: 'All players must be ready to start.' }, { status: 400 });
      }

      // Assign random turn order
      const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffledPlayers.length; i++) {
        await prisma.player.update({
          where: { id: shuffledPlayers[i].id },
          data: { order: i, position: 0, coins: 15 }
        });
      }

      // Start the match
      await prisma.room.update({
        where: { id: room.id },
        data: { status: 'ACTIVE', currentTurn: 0, round: 1 }
      });

      // Create initial Turn record
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
          details: JSON.stringify({ message: 'The game has started! Take your rolls!' })
        }
      });

      return NextResponse.json({ success: true });
    }

    // GAMEPLAY ACTIONS VALIDATION
    if (room.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 });
    }

    const currentTurnRecord = room.turns[0];
    if (!currentTurnRecord || currentTurnRecord.status === 'COMPLETED') {
      return NextResponse.json({ error: 'No active turn' }, { status: 400 });
    }

    if (currentTurnRecord.activePlayerId !== userId) {
      return NextResponse.json({ error: 'It is not your turn' }, { status: 400 });
    }

    // 4. ROLL_DICE ACTION
    if (action === 'ROLL_DICE') {
      if (currentTurnRecord.status !== 'ROLLING') {
        return NextResponse.json({ error: 'Invalid turn state for rolling' }, { status: 400 });
      }

      // Calculate roll
      let roll = Math.floor(1 + Math.random() * 6);
      if (player.luckyDiceActive) {
        roll = Math.random() > 0.5 ? 6 : 5;
      }
      
      // Select trivia question
      const category = details?.category || 'General Knowledge';
      const difficulty = details?.difficulty || 'MEDIUM';

      const questionCount = await prisma.triviaQuestion.count({
        where: { category, difficulty }
      });

      let question = null;
      if (questionCount > 0) {
        const randIndex = Math.floor(Math.random() * questionCount);
        question = await prisma.triviaQuestion.findFirst({
          where: { category, difficulty },
          skip: randIndex
        });
      } else {
        question = await prisma.triviaQuestion.findFirst();
      }

      if (!question) {
        return NextResponse.json({ error: 'No questions available' }, { status: 500 });
      }

      // Update current Turn
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
        await prisma.player.update({
          where: { id: player.id },
          data: { luckyDiceActive: false }
        });
      }

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'ROLL',
          details: JSON.stringify({ message: `${player.user.username} rolled a ${roll}!` })
        }
      });

      return NextResponse.json({ success: true, roll });
    }

    // 5. ANSWER_TRIVIA ACTION
    if (action === 'ANSWER_TRIVIA') {
      if (currentTurnRecord.status !== 'TRIVIA') {
        return NextResponse.json({ error: 'Invalid turn state for answering' }, { status: 400 });
      }

      const { answer } = details;
      const isCorrect = answer === currentTurnRecord.questionCorrectAnswer;
      const roll = currentTurnRecord.rollValue || 1;
      const difficulty = currentTurnRecord.questionDifficulty || 'MEDIUM';

      let moveDistance = 0;
      let coinsReward = 0;
      let xpReward = 0;

      if (isCorrect) {
        // Multiplier movement based on difficulty
        if (difficulty === 'EASY') {
          moveDistance = roll;
          coinsReward = 5;
          xpReward = 20;
        } else if (difficulty === 'MEDIUM') {
          moveDistance = roll + 1;
          coinsReward = 10;
          xpReward = 40;
        } else if (difficulty === 'HARD') {
          moveDistance = roll + 2;
          coinsReward = 20;
          xpReward = 80;
        }

        // Apply coin multiplier power-up
        if (player.doubleCoinsActive) {
          coinsReward *= 2;
          await prisma.player.update({
            where: { id: player.id },
            data: { doubleCoinsActive: false }
          });
        }

        // Add movement boost power-up
        // Let's check if they bought a boost
        // We'll manage boost inside turn
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

      // Update Turn record
      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: {
          status: isCorrect ? 'TILE_EFFECT' : 'COMPLETED',
          selectedAnswer: answer,
          isAnswerCorrect: isCorrect,
        }
      });

      if (!isCorrect) {
        // Incorrect answer ends turn immediately
        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: player.user.username,
            actionType: 'ANSWER',
            details: JSON.stringify({ message: `${player.user.username} answered INCORRECTLY. Turn ended.` })
          }
        });
        return NextResponse.json({ success: true, isCorrect, nextStep: 'END_TURN' });
      }

      // Correct answer: Move Player
      let newPosition = player.position + moveDistance;
      if (newPosition >= 31) {
        newPosition = 31; // Finish Line
      }

      // In 2v2 TEAM Battle, update shared Team position
      if (room.mode === 'TEAM' && player.teamId) {
        await prisma.team.update({
          where: { id: player.teamId },
          data: {
            position: newPosition,
            coins: { increment: coinsReward }
          }
        });
        // Sync other team members positions
        await prisma.player.updateMany({
          where: { teamId: player.teamId },
          data: { position: newPosition }
        });
      } else {
        await prisma.player.update({
          where: { id: player.id },
          data: {
            position: newPosition,
            coins: { increment: coinsReward }
          }
        });
      }

      // Check tile type
      const landedTile = getTileByIndex(newPosition);
      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: {
          tileType: landedTile.type
        }
      });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'ANSWER',
          details: JSON.stringify({
            message: `${player.user.username} answered CORRECTLY! Moved to tile ${newPosition} (${landedTile.name}).`
          })
        }
      });

      return NextResponse.json({ success: true, isCorrect, newPosition, tileType: landedTile.type, nextStep: 'TILE_EFFECT' });
    }

    // 6. TILE INTERACT ACTION
    if (action === 'INTERACT_TILE') {
      if (currentTurnRecord.status !== 'TILE_EFFECT') {
        return NextResponse.json({ error: 'Invalid turn state for tile interaction' }, { status: 400 });
      }

      const tile = getTileByIndex(player.position);
      const { choice } = details; // Choice from UI (e.g. open chest, gamble coins)
      
      let coinsChange = 0;
      let posChange = 0;
      let logMessage = '';

      if (tile.type === 'BONUS') {
        coinsChange = 5;
        logMessage = `${player.user.username} collected 5 bonus coins!`;
      } else if (tile.type === 'SHORTCUT') {
        posChange = 2;
        logMessage = `${player.user.username} rode the shortcut wind +2 tiles!`;
      } else if (tile.type === 'TRAP') {
        if (player.shieldActive || player.trapImmunity) {
          logMessage = `${player.user.username} blocked the trap using active protection!`;
          await prisma.player.update({
            where: { id: player.id },
            data: { shieldActive: false, trapImmunity: false }
          });
        } else {
          coinsChange = -10;
          posChange = -3;
          logMessage = `${player.user.username} hit a spike trap! Lost 10 coins and fell back 3 tiles.`;
        }
      } else if (tile.type === 'TREASURE') {
        if (choice === 'OPEN') {
          if (player.coins < 10) {
            return NextResponse.json({ error: 'Not enough coins to open' }, { status: 400 });
          }
          coinsChange = -10;
          const roll = Math.random();
          if (roll < 0.4) {
            // Get shield
            await prisma.player.update({ where: { id: player.id }, data: { shieldActive: true } });
            logMessage = `${player.user.username} opened a chest for 10 coins and found a SHIELD!`;
          } else if (roll < 0.8) {
            coinsChange += 25; // Net +15
            logMessage = `${player.user.username} opened a chest for 10 coins and found 25 COINS!`;
          } else {
            posChange = -3;
            logMessage = `${player.user.username} opened a chest, but it was a MIMIC trap! Slipped back 3 tiles.`;
          }
        } else {
          logMessage = `${player.user.username} decided not to risk opening the chest.`;
        }
      } else if (tile.type === 'MYSTERY') {
        const roll = Math.random();
        if (roll < 0.3 && room.players.length > 1) {
          // Swap positions with the leading/trailing player
          const otherPlayers = room.players.filter(p => p.id !== player.id);
          const target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
          const tempPos = player.position;
          
          await prisma.player.update({ where: { id: player.id }, data: { position: target.position } });
          await prisma.player.update({ where: { id: target.id }, data: { position: tempPos } });

          logMessage = `Mystery swap! ${player.user.username} swapped positions with ${target.user.username}!`;
        } else if (roll < 0.6) {
          // Teleport scroll
          posChange = 4;
          logMessage = `Mystery space warp! ${player.user.username} teleported +4 tiles ahead!`;
        } else {
          coinsChange = 15;
          logMessage = `Mystery blessing! ${player.user.username} received 15 coins from the stars!`;
        }
      } else if (tile.type === 'RISK') {
        if (choice === 'GAMBLE') {
          const isWinner = Math.random() > 0.4;
          if (isWinner) {
            coinsChange = player.coins; // Double coins
            logMessage = `${player.user.username} gambled their coins and WON! Doubled current stash!`;
          } else {
            coinsChange = -Math.floor(player.coins / 2);
            logMessage = `${player.user.username} gambled their coins and LOST half of their stash!`;
          }
        } else {
          logMessage = `${player.user.username} skipped the high risk gamble.`;
        }
      }

      // Apply changes
      let finalPos = player.position + posChange;
      if (finalPos < 0) finalPos = 0;
      if (finalPos >= 31) finalPos = 31;

      // Update Player/Team
      if (room.mode === 'TEAM' && player.teamId) {
        await prisma.team.update({
          where: { id: player.teamId },
          data: {
            position: finalPos,
            coins: { increment: coinsChange }
          }
        });
        await prisma.player.updateMany({
          where: { teamId: player.teamId },
          data: { position: finalPos, coins: { increment: coinsChange } }
        });
      } else {
        await prisma.player.update({
          where: { id: player.id },
          data: {
            position: finalPos,
            coins: { increment: coinsChange }
          }
        });
      }

      // Check if game won
      if (finalPos === 31) {
        // Victory!
        await prisma.room.update({
          where: { id: room.id },
          data: { status: 'FINISHED', winnerId: userId }
        });

        // Add to history
        const history = await prisma.matchHistory.create({
          data: {
            mode: room.mode,
            winnerUsername: player.user.username,
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
              rank: p.userId === userId ? 1 : 2,
            }
          });

          // Update users lifetime metrics
          await prisma.user.update({
            where: { id: p.userId },
            data: {
              gamesPlayed: { increment: 1 },
              gamesWon: { increment: p.userId === userId ? 1 : 0 },
              coins: { increment: p.coins }
            }
          });
        }

        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: 'System',
            actionType: 'EVENT',
            details: JSON.stringify({ message: `${player.user.username} REACHED THE FINISH LINE AND WON THE GAME!` })
          }
        });

        await prisma.turn.update({
          where: { id: currentTurnRecord.id },
          data: { status: 'COMPLETED' }
        });

        return NextResponse.json({ success: true, finished: true });
      }

      // Mark turn as completed
      await prisma.turn.update({
        where: { id: currentTurnRecord.id },
        data: { status: 'COMPLETED' }
      });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: 'System',
          actionType: 'TILE',
          details: JSON.stringify({ message: logMessage })
        }
      });

      return NextResponse.json({ success: true, finished: false });
    }

    // 7. BUY_ITEM ACTION
    if (action === 'BUY_ITEM') {
      const { itemId, cost } = details;
      if (player.coins < cost) {
        return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
      }

      // Deduct coins and activate shop items
      const updateData: any = {
        coins: { decrement: cost }
      };

      if (itemId === 'shield') updateData.shieldActive = true;
      if (itemId === 'extra_time') updateData.extraTimeActive = true;
      if (itemId === 'lucky_dice') updateData.luckyDiceActive = true;
      if (itemId === 'trap_immunity') updateData.trapImmunity = true;
      if (itemId === 'multiplier') updateData.doubleCoinsActive = true;

      await prisma.player.update({
        where: { id: player.id },
        data: updateData
      });

      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'SHOP',
          details: JSON.stringify({ message: `${player.user.username} purchased ${itemId.toUpperCase()} from the shop.` })
        }
      });

      return NextResponse.json({ success: true });
    }

    // 8. END_TURN ACTION (Host or player advances)
    if (action === 'END_TURN') {
      if (currentTurnRecord.status !== 'COMPLETED') {
        return NextResponse.json({ error: 'Cannot end turn yet' }, { status: 400 });
      }

      // Calculate next turn index
      const nextTurnIndex = (room.currentTurn + 1) % room.players.length;
      let nextRound = room.round;
      if (nextTurnIndex === 0) {
        nextRound += 1;
      }

      // Global board event check (every 4 rounds)
      let activeEvent = room.activeEvent;
      let eventRoundsLeft = room.eventRoundsLeft;
      
      if (nextTurnIndex === 0 && nextRound % 4 === 0) {
        const events = ['Treasure Rush', 'Reverse Movement', 'Lucky Hour', 'Chaos Mode', 'Coin Frenzy', 'Sudden Death'];
        activeEvent = events[Math.floor(Math.random() * events.length)];
        eventRoundsLeft = 2; // Lasts 2 rounds

        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: 'System',
            actionType: 'EVENT',
            details: JSON.stringify({ message: `GLOBAL EVENT TRIGGERED: ${activeEvent}! Lasts for 2 rounds.` })
          }
        });
      } else if (nextTurnIndex === 0 && eventRoundsLeft > 0) {
        eventRoundsLeft -= 1;
        if (eventRoundsLeft === 0) {
          activeEvent = null;
        }
      }

      await prisma.room.update({
        where: { id: room.id },
        data: {
          currentTurn: nextTurnIndex,
          round: nextRound,
          activeEvent,
          eventRoundsLeft
        }
      });

      // Create new turn record
      const nextPlayer = room.players[nextTurnIndex];
      await prisma.turn.create({
        data: {
          roomId: room.id,
          round: nextRound,
          turnNumber: currentTurnRecord.turnNumber + 1,
          activePlayerId: nextPlayer.userId,
          status: 'ROLLING',
        }
      });

      return NextResponse.json({ success: true });
    }

    // 9. CHAT ACTION
    if (action === 'CHAT') {
      const { message } = details;
      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: player.user.username,
          actionType: 'CHAT',
          details: JSON.stringify({ message })
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error("Action API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
