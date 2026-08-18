import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const body = await req.json();
      const { taskId, date } = body;

      const { data: existing, error: selectError } = await ctx.supabase
        .from('completions')
        .select('id')
        .eq('user_id', ctx.uid)
        .eq('task_id', taskId)
        .eq('date', date);

      if (selectError) throw selectError;

      if (existing && existing.length > 0) {
        const { error: deleteError } = await ctx.supabase
          .from('completions')
          .delete()
          .eq('id', existing[0].id);

        if (deleteError) throw deleteError;
        return NextResponse.json({ completed: false });
      } else {
        const { error: insertError } = await ctx.supabase
          .from('completions')
          .insert({ user_id: ctx.uid, task_id: taskId, date });

        if (insertError) throw insertError;
        return NextResponse.json({ completed: true });
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to toggle completion' }, { status: 500 });
    }
  });
}
