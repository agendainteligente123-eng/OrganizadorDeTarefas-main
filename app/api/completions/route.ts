import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';
import { db } from '@/src/db';
import { completions } from '@/src/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      let conditions = [eq(completions.userId, ctx.uid)];
      if (startDate) conditions.push(gte(completions.date, startDate));
      if (endDate) conditions.push(lte(completions.date, endDate));

      const data = await db.select().from(completions).where(and(...conditions));
      return NextResponse.json(data);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 });
    }
  });
}
