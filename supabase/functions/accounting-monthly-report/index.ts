import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📊 Monthly accounting report triggered')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get month and year from query params or use defaults
    const url = new URL(req.url)
    const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : null
    const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : null

    // Call the database function to send monthly report
    const { data, error } = await supabase.rpc('send_accounting_monthly_report', {
      target_month: month,
      target_year: year
    })

    if (error) {
      console.error('❌ Error sending monthly report:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send monthly report', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Monthly report sent successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Monthly report sent', month, year }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Monthly report error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

