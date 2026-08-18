import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthContext {
  uid: string;
  email: string;
  supabase: SupabaseClient;
}

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  // Client scoped to this request's user token, so Row Level Security
  // policies (auth.uid() = user_id) apply to every query made with it.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Error verifying Supabase token:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    return handler(req, {
      uid: user.id,
      email: user.email || '',
      supabase,
    });
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}
