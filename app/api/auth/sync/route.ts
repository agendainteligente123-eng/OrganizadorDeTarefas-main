import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';
import { getOrCreateUser } from '@/src/db/users';

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const dbUser = await getOrCreateUser(ctx.uid, ctx.email);
      return NextResponse.json(dbUser);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
  });
}
