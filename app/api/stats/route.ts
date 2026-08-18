import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/src/lib/auth-middleware';
import { db } from '@/src/db';
import { tasks, completions } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { format, subDays, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, ctx) => {
    try {
      const allTasks = await db.select().from(tasks).where(eq(tasks.userId, ctx.uid));
      const allCompletions = await db.select().from(completions).where(eq(completions.userId, ctx.uid)).orderBy(desc(completions.date));

      // Calculate streak
      let currentStreak = 0;
      let checkDate = new Date(); // Start checking from today

      // Group tasks by dayOfWeek
      const tasksByDay = new Map<number, typeof allTasks>();
      for (let i = 0; i < 7; i++) {
        tasksByDay.set(i, allTasks.filter(t => t.dayOfWeek === i));
      }

      // Group completions by date (YYYY-MM-DD)
      const completionsByDate = new Map<string, Set<number>>();
      for (const comp of allCompletions) {
        if (!completionsByDate.has(comp.date)) {
          completionsByDate.set(comp.date, new Set());
        }
        completionsByDate.get(comp.date)!.add(comp.taskId);
      }

      while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const dayOfWeek = checkDate.getDay();
        const requiredTasks = tasksByDay.get(dayOfWeek) || [];

        // If there are no tasks for this day, does it break the streak? 
        // Usually rest days don't break the streak, or they count as a free pass.
        // Let's assume if there are no tasks, it counts as "100%" (completed 0/0).
        let dayCompleted = true;

        if (requiredTasks.length > 0) {
          const completedSet = completionsByDate.get(dateStr) || new Set();
          for (const t of requiredTasks) {
            if (!completedSet.has(t.id)) {
              dayCompleted = false;
              break;
            }
          }
        }

        if (dayCompleted) {
          // If it's today and not completed yet, we don't break the streak from yesterday, 
          // we just don't increment it if it's false, but wait, the loop breaks.
          // Let's refine:
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          // If today is not completed, check if yesterday was. Today not being done doesn't break yesterday's streak.
          if (format(checkDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
            // Ignore today for breaking, just move to yesterday
            checkDate = subDays(checkDate, 1);
          } else {
            break;
          }
        }
      }

      return NextResponse.json({ streak: currentStreak });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to calculate stats' }, { status: 500 });
    }
  });
}
