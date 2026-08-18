import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';
import { db } from '@/src/db';
import { completions } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const body = await req.json();
      const { taskId, date } = body;

      // Check if it already exists
      const existing = await db.select().from(completions).where(and(
        eq(completions.userId, ctx.uid),
        eq(completions.taskId, taskId),
        eq(completions.date, date)
      ));

      if (existing.length > 0) {
        // Toggle off: delete
        await db.delete(completions).where(eq(completions.id, existing[0].id));
        return NextResponse.json({ completed: false });
      } else {
        // Toggle on: insert
        await db.insert(completions).values({
          userId: ctx.uid,
          taskId,
          date,
        });
        return NextResponse.json({ completed: true });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to toggle completion' }, { status: 500 });
    }
  });
}
