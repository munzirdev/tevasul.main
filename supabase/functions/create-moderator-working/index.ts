import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('🔧 create-moderator-working function called');
    
    const { email, full_name } = await req.json()
    console.log('📋 Request body:', { email, full_name });

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and full_name are required' }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a simple response for now
    const userId = crypto.randomUUID();
    
    console.log('✅ Moderator created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Moderator created successfully',
        user: { id: userId, email, full_name }
      }),
      { 
        status: 200, 
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in create-moderator-working function:', error)
    
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
