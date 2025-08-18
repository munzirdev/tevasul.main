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
    const { email, full_name, password, createFullAccount } = await req.json()

    console.log('🚀 إنشاء مشرف جديد:', { email, full_name, createFullAccount })

    // Validate input
    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ 
          error: 'الحقول المطلوبة: email, full_name' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let userId: string

    // Check if user already exists in auth.users
    const { data: existingAuthUser, error: authCheckError } = await supabase.auth.admin.getUserByEmail(email)

    if (existingAuthUser.user) {
      // User exists in auth.users
      userId = existingAuthUser.user.id
      console.log('✅ المستخدم موجود في auth.users:', userId)
    } else {
      // User doesn't exist, create new user
      if (!password) {
        return new Response(
          JSON.stringify({ 
            error: 'كلمة المرور مطلوبة لإنشاء مستخدم جديد' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create new user in auth
      const { data: newAuthData, error: newAuthError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name }
      })

      if (newAuthError) {
        console.error('❌ خطأ في إنشاء المستخدم في auth:', newAuthError)
        return new Response(
          JSON.stringify({ error: 'خطأ في إنشاء المستخدم: ' + newAuthError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      userId = newAuthData.user.id
      console.log('✅ تم إنشاء المستخدم في auth:', userId)

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Use UPSERT to update or create profile safely
    const { error: profileUpsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: full_name,
        role: 'moderator'
      }, {
        onConflict: 'id'
      })

    if (profileUpsertError) {
      console.error('❌ خطأ في تحديث/إنشاء profile:', profileUpsertError)
      return new Response(
        JSON.stringify({ error: 'خطأ في تحديث الملف الشخصي: ' + profileUpsertError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ تم تحديث profile إلى دور مشرف')

    // Check if moderator already exists
    const { data: existingModerator, error: moderatorCheckError } = await supabase
      .from('moderators')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (moderatorCheckError && moderatorCheckError.code !== 'PGRST116') {
      console.error('❌ خطأ في التحقق من وجود المشرف:', moderatorCheckError)
      return new Response(
        JSON.stringify({ error: 'خطأ في التحقق من وجود المشرف' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingModerator) {
      console.log('⚠️ المشرف موجود بالفعل')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'المشرف موجود بالفعل',
          moderator_id: existingModerator.id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create moderator record
    const { data: moderatorData, error: moderatorError } = await supabase
      .from('moderators')
      .insert({
        user_id: userId,
        email: email,
        full_name: full_name,
        is_active: true,
        created_by: userId
      })
      .select()
      .single()

    if (moderatorError) {
      console.error('❌ خطأ في إنشاء المشرف:', moderatorError)
      return new Response(
        JSON.stringify({ error: 'خطأ في إنشاء المشرف: ' + moderatorError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ تم إنشاء المشرف بنجاح:', moderatorData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إنشاء المشرف بنجاح',
        moderator: moderatorData
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
