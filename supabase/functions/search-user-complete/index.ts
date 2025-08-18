import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { email } = await req.json()

    console.log('🔍 البحث عن المستخدم:', email)

    // Validate input
    if (!email) {
      return new Response(
        JSON.stringify({ 
          error: 'البريد الإلكتروني مطلوب' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // First, search in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (profileData && !profileError) {
      console.log('✅ تم العثور على المستخدم في profiles:', profileData)
      return new Response(
        JSON.stringify({ 
          success: true,
          found: true,
          user: profileData,
          source: 'profiles'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If not found in profiles, search in auth.users
    console.log('🔍 البحث في auth.users...')
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ خطأ في البحث في auth.users:', authError)
      return new Response(
        JSON.stringify({ error: 'خطأ في البحث في قاعدة البيانات' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Find user in auth.users
    const authUser = authData.users.find(user => user.email === email)

    if (authUser) {
      console.log('✅ تم العثور على المستخدم في auth.users:', authUser)
      
      // Create profile record if it doesn't exist
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'مستخدم',
          role: 'user'
        })
        .select()
        .single()

      if (profileInsertError && profileInsertError.code !== '23505') { // Ignore duplicate key error
        console.error('❌ خطأ في إنشاء profile:', profileInsertError)
        return new Response(
          JSON.stringify({ error: 'خطأ في إنشاء الملف الشخصي' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Get the profile data
      const { data: newProfileData, error: newProfileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', authUser.id)
        .single()

      if (newProfileData && !newProfileError) {
        console.log('✅ تم إنشاء profile للمستخدم:', newProfileData)
        return new Response(
          JSON.stringify({ 
            success: true,
            found: true,
            user: newProfileData,
            source: 'auth_users_created_profile'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // User not found in either table
    console.log('❌ لم يتم العثور على المستخدم في أي مكان')
    return new Response(
      JSON.stringify({ 
        success: true,
        found: false,
        message: 'لم يتم العثور على المستخدم'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ خطأ عام:', error)
    return new Response(
      JSON.stringify({ error: 'خطأ داخلي في الخادم' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
