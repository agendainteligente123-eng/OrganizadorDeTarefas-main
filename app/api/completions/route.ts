import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      let query = ctx.supabase
        .from('completions')
        .select('taskId:task_id, date')
        .eq('user_id', ctx.uid);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json(data);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 });
    }
  });
}
