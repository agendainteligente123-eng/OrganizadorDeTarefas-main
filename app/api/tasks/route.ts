import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';
import { db } from '@/src/db';
import { tasks } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const userTasks = await db.select().from(tasks).where(eq(tasks.userId, ctx.uid));
      return NextResponse.json(userTasks);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const body = await req.json();
      const { dayOfWeek, label, timeRange, category } = body;

      const result = await db.insert(tasks).values({
        userId: ctx.uid,
        dayOfWeek,
        label,
        timeRange,
        category,
      }).returning();

      return NextResponse.json(result[0]);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
  });
}
