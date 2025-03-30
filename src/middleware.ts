import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Skip auth check in dev mode if SKIP_AUTH is enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true') {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key not found. Authentication middleware will not work.');
    return NextResponse.next();
  }

  const auth = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await auth.auth.getSession();

  // Get pathname from the request
  const pathname = request.nextUrl.pathname;

  // We don't need to handle redirects in middleware anymore
  // The route group layouts will handle authentication checks and redirects
  // We can use middleware for other purposes like API protection
  
  // Check if this is an API route that needs protection
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    // API routes (except auth endpoints) require authentication
    if (!data.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match API routes that need protection
     * (excluding public API endpoints)
     */
    '/api/:path*',
  ],
}; 