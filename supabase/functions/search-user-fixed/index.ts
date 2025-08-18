import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = new Set([
  'https://tevasul.group',
  'https://www.tevasul.group',
  'http://tevasul.group',
  'http://www.tevasul.group',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5176',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const allowOrigin = allowedOrigins.has(origin) ? origin : 'https://tevasul.group';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  } as Record<string, string>;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: getCorsHeaders(req)
    })
  }

  try {
    console.log('🔧 search-user-fixed function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { email } = await req.json()
    console.log('📋 Email to search:', email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Search for user in profiles table first
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (profile && !profileError) {
      console.log('✅ Found user in profiles:', profile);
      return new Response(
        JSON.stringify({
          found: true,
          user: {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name
          }
        }),
        { 
          status: 200, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    // If not found in profiles, search in auth.users table
    const { data: user, error } = await supabaseClient.auth.admin.getUserByEmail(email)

    if (error) {
      console.error('❌ Error searching for user:', error)
      return new Response(
        JSON.stringify({ found: false }),
        { 
          status: 200, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!user.user) {
      console.log('❌ User not found');
      return new Response(
        JSON.stringify({ found: false }),
        { 
          status: 200, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Found user in auth:', user.user);
    return new Response(
      JSON.stringify({
        found: true,
        user: {
          id: user.user.id,
          email: user.user.email,
          full_name: user.user.user_metadata?.full_name || user.user.email?.split('@')[0]
        }
      }),
      { 
        status: 200, 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in search-user-fixed function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
      }
    )
  }
})
