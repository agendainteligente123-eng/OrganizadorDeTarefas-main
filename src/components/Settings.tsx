'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';

type Task = {
  id: number;
  dayOfWeek: number;
  label: string;
  timeRange: string | null;
  category: string;
};

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const CATEGORIES = ['Estudo', 'Treino', 'Idioma', 'Extensão', 'Outro'];

export default function Settings() {
  const { getIdToken, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newTask, setNewTask] = useState({
    dayOfWeek: 1,
    label: '',
    timeRange: '',
    category: 'Estudo'
  });

  const fetchTasks = async () => {
    setLoading(true);
    const token = await getIdToken();
    if (!token) return;
    try {
      const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    const token = await getIdToken();
    if (!token) return;
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getIdToken();
    if (!token) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
      const created = await res.json();
      setTasks(prev => [...prev, created]);
      setIsAdding(false);
      setNewTask({ ...newTask, label: '', timeRange: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const seedDefaultRoutine = async () => {
    if (isSeeding) return;
    setIsSeeding(true);

    const defaultTasks = [
      { dayOfWeek: 1, label: 'Sistemas Operacionais', timeRange: '07:00 - 08:00', category: 'Estudo' },
      { dayOfWeek: 1, label: 'Musculação', timeRange: '08:00 - 09:00', category: 'Treino' },
      { dayOfWeek: 2, label: 'Arquitetura de Computadores', timeRange: '07:00 - 08:00', category: 'Estudo' },
      { dayOfWeek: 3, label: 'Sistemas Operacionais', timeRange: '07:00 - 08:00', category: 'Estudo' },
      { dayOfWeek: 3, label: 'Musculação', timeRange: '08:00 - 09:00', category: 'Treino' },
      { dayOfWeek: 4, label: 'Arquitetura de Computadores', timeRange: '07:00 - 08:00', category: 'Estudo' },
      { dayOfWeek: 5, label: 'Cenários Econômicos e Políticos', timeRange: '07:00 - 08:00', category: 'Estudo' },
      { dayOfWeek: 5, label: 'Musculação', timeRange: '08:00 - 09:00', category: 'Treino' },
      { dayOfWeek: 5, label: 'Inglês', timeRange: '10:20 - 10:40', category: 'Idioma' },
      { dayOfWeek: 6, label: 'Atividade Extensionista + Ambientação EAD', timeRange: 'Manhã', category: 'Extensão' },
      { dayOfWeek: 0, label: 'Revisão da semana + Planejamento', timeRange: '', category: 'Outro' },
      { dayOfWeek: 0, label: 'História Afro-Indígena / Gestão Financeira', timeRange: '', category: 'Estudo' }
    ];

    try {
      const token = await getIdToken();
      if (!token) return;

      for (const t of defaultTasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(t)
        });
      }
      await fetchTasks();
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse h-8 w-8 bg-secondary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
      <header className="bg-header p-8 pt-12 text-header-text shrink-0 flex items-center gap-4 transition-colors duration-300">
        <Link href="/" className="p-3 -ml-2 bg-header-surface rounded-2xl border border-secondary/30 shadow-lg hover:bg-white/10 transition-colors duration-300">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Configurar Rotina</h1>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-primary/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-primary">Minhas Tarefas</h2>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-accent/20 text-accent p-2.5 rounded-full hover:bg-accent/30 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAdd} className="bg-background rounded-2xl p-5 mb-8 border border-primary/10 shadow-sm space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1.5">Dia da Semana</label>
                <select 
                  className="w-full bg-surface border border-primary/10 rounded-xl p-3 text-primary focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                  value={newTask.dayOfWeek}
                  onChange={(e) => setNewTask({...newTask, dayOfWeek: parseInt(e.target.value)})}
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1.5">Nome da Tarefa</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-surface border border-primary/10 rounded-xl p-3 text-primary focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                  placeholder="Ex: Musculação"
                  value={newTask.label}
                  onChange={(e) => setNewTask({...newTask, label: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-secondary uppercase mb-1.5">Horário (Opcional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface border border-primary/10 rounded-xl p-3 text-primary focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                    placeholder="Ex: 07:00 - 08:00"
                    value={newTask.timeRange}
                    onChange={(e) => setNewTask({...newTask, timeRange: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-secondary uppercase mb-1.5">Categoria</label>
                  <select 
                    className="w-full bg-surface border border-primary/10 rounded-xl p-3 text-primary focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 text-primary text-sm font-bold hover:bg-black/5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-primary text-surface text-sm font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          {tasks.length === 0 && !isAdding ? (
            <div className="text-center py-10 bg-background rounded-2xl border border-primary/5">
              <p className="text-secondary mb-5 font-medium">Sua rotina está vazia.</p>
              <button
                onClick={seedDefaultRoutine}
                disabled={isSeeding}
                className="bg-primary text-surface px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSeeding ? 'Carregando...' : 'Carregar Rotina ADS'}
              </button>
            </div>
          ) : (
            <div className="space-y-8 mt-6">
              {DAYS.map((dayName, idx) => {
                const dayTasks = tasks.filter(t => t.dayOfWeek === idx);
                if (dayTasks.length === 0) return null;
                
                return (
                  <div key={idx}>
                    <h3 className="text-[10px] font-bold text-secondary uppercase mb-3 pb-1 border-b border-primary/10">{dayName}</h3>
                    <div className="space-y-3">
                      {dayTasks.map(task => (
                        <div key={task.id} className="flex justify-between items-center bg-background p-4 rounded-2xl border border-primary/5 shadow-sm">
                          <div>
                            <p className="font-bold text-primary text-sm">{task.label}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {task.timeRange && (
                                <span className="text-[10px] text-secondary font-semibold bg-secondary/10 px-2 py-0.5 rounded uppercase">
                                  {task.timeRange}
                                </span>
                              )}
                              <span className="text-[10px] text-primary/60 font-bold uppercase">{task.category}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(task.id)}
                            className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="text-center mt-8 pb-4">
          <p className="text-xs font-semibold text-secondary/60">Logado como: {user?.email}</p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-red-500 font-bold mt-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-colors uppercase tracking-wider"
          >
            Sair da conta
          </button>
        </div>
      </main>
    </div>
  );
}
