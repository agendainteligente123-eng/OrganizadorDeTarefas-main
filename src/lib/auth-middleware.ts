import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export interface AuthContext {
  uid: string;
  email: string;
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
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Error verifying Supabase token:', error);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    return handler(req, {
      uid: user.id,
      email: user.email || '',
    });
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
}
