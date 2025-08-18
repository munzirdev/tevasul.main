import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const allowedOrigins = new Set([
  'https://tevasul.group',
  'https://www.tevasul.group',
  'http://tevasul.group',
  'http://www.tevasul.group',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5176',
  'http://127.0.0.1:5176',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  console.log('🔍 Origin received:', origin);
  console.log('🔍 Allowed origins:', Array.from(allowedOrigins));
  
  const allowOrigin = allowedOrigins.has(origin) ? origin : 'https://tevasul.group';
  console.log('🔍 Allowing origin:', allowOrigin);
  
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
  console.log('🔧 test-cors function called');
  console.log('📋 Request method:', req.method);
  console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔧 Handling OPTIONS request');
    return new Response('ok', { 
      status: 200,
      headers: getCorsHeaders(req)
    })
  }

  try {
    const corsHeaders = getCorsHeaders(req);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CORS test successful!',
        timestamp: new Date().toISOString(),
        origin: req.headers.get('origin'),
        corsHeaders
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in test-cors function:', error)
    
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
