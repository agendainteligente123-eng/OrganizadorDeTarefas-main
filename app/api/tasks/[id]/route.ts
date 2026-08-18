import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';

export async function DELETE(req: NextRequest, context: any) {
  const { id } = await context.params;
  return withAuth(req, async (req, ctx) => {
    try {
      const { error } = await ctx.supabase
        .from('tasks')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', ctx.uid);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
  });
}
