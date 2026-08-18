'use client';

import { useAuth } from '@/src/components/AuthProvider';
import { createClient } from '@/src/lib/supabase/client';
import { LogIn } from 'lucide-react';

export default function AuthScreen() {
  const { loading } = useAuth();
  const supabase = createClient();

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-secondary rounded-full mb-4"></div>
          <p className="text-secondary font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background font-sans transition-colors duration-300">
      <div className="w-full max-w-sm bg-surface rounded-[24px] border border-primary/10 shadow-sm p-10 text-center space-y-8 transition-colors duration-300">
        <div className="mx-auto w-16 h-16 bg-primary text-surface rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold">R</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Rotina ADS</h1>
          <p className="text-secondary mt-3 text-sm font-medium">Acompanhe sua evolução diária.</p>
        </div>
        
        <button
          onClick={handleSignIn}
          className="w-full py-4 px-4 bg-primary text-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <LogIn size={20} />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
