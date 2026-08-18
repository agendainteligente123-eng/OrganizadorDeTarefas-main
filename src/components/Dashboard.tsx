'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Settings as SettingsIcon, Flame, CheckCircle2, Circle, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';

type Task = {
  id: number;
  dayOfWeek: number;
  label: string;
  timeRange: string | null;
  category: string;
};

type Completion = {
  taskId: number;
  date: string;
};

export default function Dashboard() {
  const { getIdToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = await getIdToken();
    if (!token) return;

    try {
      const [tasksRes, streakRes] = await Promise.all([
        fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const tasksData = await tasksRes.json();
      const streakData = await streakRes.json();

      setTasks(tasksData);
      setStreak(streakData.streak);
      await fetchCompletions(currentDate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async (date: Date) => {
    const token = await getIdToken();
    if (!token) return;
    
    const start = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const end = format(addDays(startOfWeek(date, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
    
    try {
      const res = await fetch(`/api/completions?startDate=${start}&endDate=${end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCompletions(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCompletions(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const toggleTask = async (taskId: number, date: string) => {
    const token = await getIdToken();
    if (!token) return;

    // Optimistic update
    const isCompleted = completions.some(c => c.taskId === taskId && c.date === date);
    if (isCompleted) {
      setCompletions(prev => prev.filter(c => !(c.taskId === taskId && c.date === date)));
    } else {
      setCompletions(prev => [...prev, { taskId, date }]);
    }

    try {
      await fetch('/api/completions/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, date })
      });
      // Re-fetch streak after toggle
      const streakRes = await fetch('/api/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      const streakData = await streakRes.json();
      setStreak(streakData.streak);
    } catch (error) {
      console.error(error);
      // Revert on error
      fetchCompletions(currentDate);
    }
  };

  const getDaysOfWeek = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };

  const days = getDaysOfWeek();

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse h-8 w-8 bg-secondary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
      <header className="bg-header p-8 pt-12 text-header-text shrink-0 transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rotina ADS</h1>
            <p className="text-secondary text-sm font-medium capitalize">{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-header-surface px-4 py-2 rounded-2xl flex items-center gap-2 border border-secondary/30 shadow-lg transition-colors duration-300">
               <span className="text-accent text-xl">🔥</span>
               <span className="font-bold text-lg">{streak}</span>
             </div>
             <button onClick={toggleTheme} className="bg-header-surface p-3 rounded-2xl border border-secondary/30 shadow-lg text-header-text hover:bg-white/10 transition-colors duration-300">
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <Link href="/settings" className="bg-header-surface p-3 rounded-2xl border border-secondary/30 shadow-lg text-header-text hover:bg-white/10 transition-colors duration-300">
               <SettingsIcon size={20} />
             </Link>
          </div>
        </div>
        <div className="mt-6 bg-header-surface rounded-xl p-3 flex items-center gap-4 transition-colors duration-300">
           {(() => {
             const dayOfWeek = currentDate.getDay();
             const dayTasks = tasks.filter(t => t.dayOfWeek === dayOfWeek);
             const dateStr = format(currentDate, 'yyyy-MM-dd');
             const completedCount = dayTasks.filter(t => completions.some(c => c.taskId === t.id && c.date === dateStr)).length;
             const progress = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;
             return (
               <>
                 <div className="flex-1 h-2 bg-black/30 dark:bg-white/10 rounded-full overflow-hidden transition-colors duration-300">
                   <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                 </div>
                 <span className="text-xs font-mono opacity-80">{progress}%</span>
               </>
             );
           })()}
        </div>
      </header>

      <div className="flex justify-between px-6 py-4 bg-surface border-b border-primary/5 shrink-0 transition-colors duration-300">
        <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="text-secondary opacity-50 p-1 hover:opacity-100"><ChevronLeft size={20} /></button>
        {days.map(day => {
          const isSelected = isSameDay(day, currentDate);
          return (
            <button key={day.toISOString()} onClick={() => setCurrentDate(day)} className={`flex flex-col items-center ${isSelected ? '' : 'opacity-40'}`}>
              <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-secondary' : ''}`}>
                {format(day, 'eee', { locale: ptBR }).substring(0, 3)}
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors duration-300 ${isSelected ? 'bg-primary text-surface font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
            </button>
          );
        })}
        <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="text-secondary opacity-50 p-1 hover:opacity-100"><ChevronRight size={20} /></button>
      </div>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {(() => {
          if (completions.length > 0) {
            const categoryCounts: Record<string, number> = {};
            let total = 0;
            completions.forEach(c => {
              const task = tasks.find(t => t.id === c.taskId);
              if (task) {
                categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
                total++;
              }
            });

            if (total > 0) {
              let topCategory = '';
              let topCount = 0;
              for (const [category, count] of Object.entries(categoryCounts)) {
                if (count > topCount) {
                  topCategory = category;
                  topCount = count;
                }
              }
              const percentage = Math.round((topCount / total) * 100);

              return (
                <div className="bg-surface p-5 rounded-2xl border border-primary/10 shadow-sm mb-6 transition-colors duration-300 flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Resumo da Semana</h3>
                    <p className="text-sm font-medium text-primary">
                      Você focou <span className="font-bold text-accent">{percentage}%</span> em <span className="font-bold">{topCategory}</span>!
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-accent font-bold text-sm">{percentage}%</span>
                  </div>
                </div>
              );
            }
          }
          return null;
        })()}

        {(() => {
          const dayOfWeek = currentDate.getDay();
          const dayTasks = tasks.filter(t => t.dayOfWeek === dayOfWeek);
          const dateStr = format(currentDate, 'yyyy-MM-dd');

          if (dayTasks.length === 0) {
            return <p className="text-sm text-secondary/70 italic text-center py-8">Nenhuma tarefa para este dia.</p>;
          }

          return dayTasks.map((task, index) => {
            const isCompleted = completions.some(c => c.taskId === task.id && c.date === dateStr);
            return (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: index * 0.05 }}
                key={task.id}
                onClick={() => toggleTask(task.id, dateStr)}
                className={`w-full bg-surface p-4 rounded-2xl border flex items-center gap-4 shadow-sm text-left transition-all ${
                  isCompleted 
                    ? 'border-primary/5 opacity-60' 
                    : 'border-primary/10 border-l-4 border-l-accent'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isCompleted ? 'border-secondary bg-secondary' : 'border-primary/20'}`}>
                  <motion.svg 
                    initial={false}
                    animate={{ scale: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className='w-4 h-4 text-surface' 
                    fill='none' 
                    stroke='currentColor' 
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7'></path>
                  </motion.svg>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className={`text-sm font-bold text-primary truncate ${isCompleted ? 'line-through opacity-70' : ''}`}>
                    {task.label}
                  </h3>
                  {task.timeRange && (
                    <p className="text-[10px] text-secondary font-semibold mt-0.5">{task.timeRange}</p>
                  )}
                </div>
                <div className="bg-background px-2 py-1 rounded text-[10px] font-bold uppercase text-secondary shrink-0">
                  {task.category}
                </div>
              </motion.button>
            );
          });
        })()}
      </main>
    </div>
  );
}
