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
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Create the dynamic_forms table directly
    const createTableSQL = `
      -- Create dynamic_forms table
      CREATE TABLE IF NOT EXISTS dynamic_forms (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        variables JSONB DEFAULT '[]'::jsonb,
        template TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable Row Level Security
      ALTER TABLE dynamic_forms ENABLE ROW LEVEL SECURITY;

      -- Create policies for dynamic_forms
      DO $$
      BEGIN
        -- Read policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'dynamic_forms' 
          AND policyname = 'Enable read access for authenticated users'
        ) THEN
          CREATE POLICY "Enable read access for authenticated users" ON dynamic_forms
            FOR SELECT USING (auth.role() = 'authenticated');
        END IF;

        -- Insert policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'dynamic_forms' 
          AND policyname = 'Enable insert access for authenticated users'
        ) THEN
          CREATE POLICY "Enable insert access for authenticated users" ON dynamic_forms
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        END IF;

        -- Update policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'dynamic_forms' 
          AND policyname = 'Enable update access for authenticated users'
        ) THEN
          CREATE POLICY "Enable update access for authenticated users" ON dynamic_forms
            FOR UPDATE USING (auth.role() = 'authenticated');
        END IF;

        -- Delete policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'dynamic_forms' 
          AND policyname = 'Enable delete access for authenticated users'
        ) THEN
          CREATE POLICY "Enable delete access for authenticated users" ON dynamic_forms
            FOR DELETE USING (auth.role() = 'authenticated');
        END IF;
      END $$;

      -- Create indexes if they don't exist
      CREATE INDEX IF NOT EXISTS idx_dynamic_forms_created_at ON dynamic_forms(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_dynamic_forms_is_active ON dynamic_forms(is_active);

      -- Create function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger if it doesn't exist
      DROP TRIGGER IF EXISTS update_dynamic_forms_updated_at ON dynamic_forms;
      CREATE TRIGGER update_dynamic_forms_updated_at
        BEFORE UPDATE ON dynamic_forms
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the SQL
    const { error } = await supabaseClient.rpc('exec_sql', { sql: createTableSQL })

    if (error) {
      console.error('Error creating table:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Table created successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
