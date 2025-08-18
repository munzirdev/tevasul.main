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
    console.log('🔧 create-moderator-test function called');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, full_name, createFullAccount } = await req.json()
    console.log('📋 Request body:', { email, full_name, createFullAccount: !!createFullAccount });

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and full_name are required' }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email)

    let userId;

    if (existingUser.user) {
      console.log('👤 User already exists:', existingUser.user.id);
      userId = existingUser.user.id;
    } else {
      console.log('🆕 Creating new user account...');
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email,
        password: password || 'defaultpassword123',
        email_confirm: true,
        user_metadata: {
          full_name
        }
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        return new Response(
          JSON.stringify({ error: `Failed to create user account: ${authError.message}` }),
          { 
            status: 400, 
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
          }
        )
      }

      userId = authData.user.id;
      console.log('✅ New user created:', userId);
    }

    // Update user profile to moderator role
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ role: 'moderator' })
      .eq('id', userId)

    if (profileError) {
      console.error('❌ Profile update error:', profileError)
      return new Response(
        JSON.stringify({ error: `Failed to update user profile: ${profileError.message}` }),
        { 
          status: 400, 
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ User profile updated to moderator role');

    // Check if moderator record already exists
    const { data: existingModerator } = await supabaseClient
      .from('moderators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingModerator) {
      console.log('⚠️ Moderator record already exists, updating...');
      const { error: moderatorUpdateError } = await supabaseClient
        .from('moderators')
        .update({
          email: email,
          full_name: full_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (moderatorUpdateError) {
        console.error('❌ Moderator update error:', moderatorUpdateError)
        return new Response(
          JSON.stringify({ error: `Failed to update moderator record: ${moderatorUpdateError.message}` }),
          { 
            status: 400, 
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      console.log('🆕 Creating new moderator record...');
      const { error: moderatorError } = await supabaseClient
        .from('moderators')
        .insert({
          user_id: userId,
          email: email,
          full_name: full_name,
          created_by: userId // Use the same user as creator for testing
        })

      if (moderatorError) {
        console.error('❌ Moderator insert error:', moderatorError)
        return new Response(
          JSON.stringify({ error: `Failed to create moderator record: ${moderatorError.message}` }),
          { 
            status: 400, 
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    console.log('✅ Moderator created/updated successfully');

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
    console.error('❌ Error in create-moderator-test function:', error)
    
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
