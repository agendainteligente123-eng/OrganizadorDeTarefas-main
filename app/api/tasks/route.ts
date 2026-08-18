import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';

const TASK_SELECT = 'id, dayOfWeek:day_of_week, label, timeRange:time_range, category';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const { data, error } = await ctx.supabase
        .from('tasks')
        .select(TASK_SELECT)
        .eq('user_id', ctx.uid);

      if (error) throw error;
      return NextResponse.json(data);
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

      const { data, error } = await ctx.supabase
        .from('tasks')
        .insert({
          user_id: ctx.uid,
          day_of_week: dayOfWeek,
          label,
          time_range: timeRange,
          category,
        })
        .select(TASK_SELECT)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
  });
}
