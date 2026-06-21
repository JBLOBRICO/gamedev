import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, username, avatarId, nameColor, title } = await request.json();

    if (!username || username.trim() === '') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanedUsername = username.trim().substring(0, 15);

    // If userId exists, update or find. Otherwise create.
    let user;
    if (userId) {
      user = await prisma.user.upsert({
        where: { id: userId },
        update: {
          username: cleanedUsername,
          avatarId: avatarId || 'avatar_1',
          nameColor: nameColor || '#38bdf8',
          title: title || 'Novice',
        },
        create: {
          id: userId,
          username: cleanedUsername,
          avatarId: avatarId || 'avatar_1',
          nameColor: nameColor || '#38bdf8',
          title: title || 'Novice',
        },
        include: {
          achievements: true,
          missions: true,
        },
      });
    } else {
      // Generate a new user with random unique username if collisions occur
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      user = await prisma.user.create({
        data: {
          username: `${cleanedUsername}#${uniqueSuffix}`,
          avatarId: avatarId || 'avatar_1',
          nameColor: nameColor || '#38bdf8',
          title: title || 'Novice',
        },
        include: {
          achievements: true,
          missions: true,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Profile API Error:", error);
    // Handle unique constraint violation on username
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: true,
        missions: true,
        history: {
          include: {
            match: true
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
