import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const passcode = searchParams.get('passcode');

  if (passcode !== 'admin123') {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const questions = await prisma.triviaQuestion.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const achievements = await prisma.achievement.findMany();
    const missions = await prisma.dailyMission.findMany();
    const matches = await prisma.matchHistory.findMany({
      include: { players: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      questions,
      achievements,
      missions,
      matches
    });
  } catch (error) {
    console.error("Admin GET Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode, action, target, data } = body;

    if (passcode !== 'admin123') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    if (target === 'question') {
      if (action === 'CREATE') {
        const { category, difficulty, question, options, correctAnswer } = data;
        const newQuestion = await prisma.triviaQuestion.create({
          data: {
            category,
            difficulty,
            question,
            options: JSON.stringify(options),
            correctAnswer
          }
        });
        return NextResponse.json(newQuestion);
      } else if (action === 'DELETE') {
        const { id } = data;
        await prisma.triviaQuestion.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Invalid action or target' }, { status: 400 });
  } catch (error) {
    console.error("Admin POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
