import { SupabaseClient } from '@supabase/supabase-js';

export async function getOrCreateUser(supabase: SupabaseClient, uid: string, email: string) {
  const { data, error } = await supabase
    .from('users')
    .upsert({ uid, email }, { onConflict: 'uid' })
    .select()
    .single();

  if (error) {
    console.error('Failed to get or create user:', error);
    throw new Error('Failed to authenticate user in database', { cause: error });
  }
  return data;
}
