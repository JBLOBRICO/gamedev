import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Readable chars (no O, 0, I, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const { action, userId, code, mode } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User profile not found. Please create one first.' }, { status: 404 });
    }

    if (action === 'CREATE') {
      if (!mode || !['DUEL', 'TEAM', 'FFA'].includes(mode)) {
        return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 });
      }

      // Generate a unique code
      let roomCode = generateRoomCode();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await prisma.room.findUnique({ where: { code: roomCode } });
        if (!existing) break;
        roomCode = generateRoomCode();
        attempts++;
      }

      const maxPlayers = mode === 'DUEL' ? 2 : 4;

      // Create Room, Player (Host), and Team if TEAM mode
      const room = await prisma.room.create({
        data: {
          code: roomCode,
          mode,
          maxPlayers,
          status: 'LOBBY',
          players: {
            create: {
              userId,
              isHost: true,
              isReady: true, // Host is ready by default
              position: 0,
              coins: 15,
            }
          }
        },
        include: {
          players: {
            include: {
              user: true
            }
          }
        }
      });

      // If it is TEAM mode, pre-create Team Red and Team Blue
      if (mode === 'TEAM') {
        await prisma.team.createMany({
          data: [
            { roomId: room.id, name: 'Red Team', color: '#ef4444', position: 0, coins: 15 },
            { roomId: room.id, name: 'Blue Team', color: '#3b82f6', position: 0, coins: 15 },
          ]
        });
      }

      // Log action
      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: user.username,
          actionType: 'JOIN',
          details: JSON.stringify({ message: `${user.username} created the room.` })
        }
      });

      return NextResponse.json(room);

    } else if (action === 'JOIN') {
      if (!code) {
        return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
      }

      const roomCode = code.trim().toUpperCase();
      const room = await prisma.room.findUnique({
        where: { code: roomCode },
        include: {
          players: {
            include: {
              user: true
            }
          },
          teams: true
        }
      });

      if (!room) {
        return NextResponse.json({ error: 'Room not found. Check code and try again.' }, { status: 404 });
      }

      if (room.status !== 'LOBBY') {
        return NextResponse.json({ error: 'Game has already started in this room.' }, { status: 400 });
      }

      // Check if already in the room
      const existingPlayer = room.players.find(p => p.userId === userId);
      if (existingPlayer) {
        return NextResponse.json(room); // Already in room, return success
      }

      if (room.players.length >= room.maxPlayers) {
        return NextResponse.json({ error: 'Room is full.' }, { status: 400 });
      }

      // Create new player
      let assignedTeamId = null;
      if (room.mode === 'TEAM' && room.teams.length > 0) {
        // Balance teams: count players on Red (index 0) and Blue (index 1)
        const teamRed = room.teams.find(t => t.name === 'Red Team');
        const teamBlue = room.teams.find(t => t.name === 'Blue Team');
        
        const redCount = room.players.filter(p => p.teamId === teamRed?.id).length;
        const blueCount = room.players.filter(p => p.teamId === teamBlue?.id).length;

        if (redCount <= blueCount) {
          assignedTeamId = teamRed?.id || null;
        } else {
          assignedTeamId = teamBlue?.id || null;
        }
      }

      await prisma.player.create({
        data: {
          roomId: room.id,
          userId,
          isHost: false,
          isReady: false,
          teamId: assignedTeamId,
          position: 0,
          coins: 15,
        },
        include: {
          user: true
        }
      });

      // Log action
      await prisma.roomAction.create({
        data: {
          roomId: room.id,
          playerUsername: user.username,
          actionType: 'JOIN',
          details: JSON.stringify({ message: `${user.username} joined the lobby.` })
        }
      });

      // Refetch full room state to return
      const updatedRoom = await prisma.room.findUnique({
        where: { id: room.id },
        include: {
          players: {
            include: {
              user: true
            }
          },
          teams: true
        }
      });

      return NextResponse.json(updatedRoom);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error("Room API POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
