import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const roomCode = code.toUpperCase();

  try {
    // 1. Find the room
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: {
        players: {
          include: {
            user: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        teams: {
          include: {
            players: true,
          },
        },
        turns: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Get recent turns
        },
        actions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20, // Get recent chat/logs
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // 2. Perform connection status updates (Heartbeat check)
    // If a player hasn't been active in 10 seconds, mark them as disconnected.
    // If the host is disconnected, transfer host to the first active player.
    const now = new Date();
    let stateChanged = false;
    let hostActive = false;
    let newHostPlayerId = null;

    for (const player of room.players) {
      const secondsSinceActive = (now.getTime() - new Date(player.lastActive).getTime()) / 1000;
      
      // Update isConnected state if changed
      if (secondsSinceActive > 10 && player.isConnected) {
        await prisma.player.update({
          where: { id: player.id },
          data: { isConnected: false },
        });
        player.isConnected = false;
        stateChanged = true;

        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: player.user.username,
            actionType: 'LEAVE',
            details: JSON.stringify({ message: `${player.user.username} disconnected.` })
          }
        });
      }

      if (player.isHost && player.isConnected) {
        hostActive = true;
      }

      if (!newHostPlayerId && player.isConnected && !player.isHost) {
        newHostPlayerId = player.id;
      }
    }

    // Host transfer if current host is inactive
    if (!hostActive && room.players.length > 0) {
      const activePlayers = room.players.filter(p => p.isConnected);
      if (activePlayers.length > 0) {
        const nextHost = activePlayers[0];
        
        // Remove old host flag
        await prisma.player.updateMany({
          where: { roomId: room.id, isHost: true },
          data: { isHost: false },
        });

        // Set new host
        await prisma.player.update({
          where: { id: nextHost.id },
          data: { isHost: true },
        });

        nextHost.isHost = true;
        stateChanged = true;

        await prisma.roomAction.create({
          data: {
            roomId: room.id,
            playerUsername: 'System',
            actionType: 'EVENT',
            details: JSON.stringify({ message: `Host transferred to ${nextHost.user.username}.` })
          }
        });
      }
    }

    // Clean up empty rooms (older than 1 hour or no connected players for 10 minutes)
    const hoursSinceCreated = (now.getTime() - new Date(room.createdAt).getTime()) / (1000 * 60 * 60);
    const allDisconnected = room.players.every(p => !p.isConnected);
    if (room.players.length > 0 && allDisconnected && hoursSinceCreated > 0.2) {
      // Clean up room
      await prisma.room.delete({
        where: { id: room.id },
      });
      return NextResponse.json({ error: 'Room cleaned up due to inactivity' }, { status: 410 });
    }

    // If state changed, re-fetch room
    if (stateChanged) {
      const updatedRoom = await prisma.room.findUnique({
        where: { id: room.id },
        include: {
          players: {
            include: {
              user: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          teams: {
            include: {
              players: true,
            },
          },
          turns: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          actions: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
          },
        },
      });
      return NextResponse.json(updatedRoom);
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("Room State GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
