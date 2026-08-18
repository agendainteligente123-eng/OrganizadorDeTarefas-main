import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';
import { db } from '@/src/db';
import { tasks } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(req: NextRequest, context: any) {
  const { id } = await context.params;
  return withAuth(req, async (req, ctx) => {
    try {
      await db.delete(tasks).where(and(
        eq(tasks.id, parseInt(id)),
        eq(tasks.userId, ctx.uid)
      ));
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
  });
}
