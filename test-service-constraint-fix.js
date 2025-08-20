// Test script to verify service_requests constraint fix
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdHZpdHlhd2F2bXVldGh4eGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testServiceConstraintFix() {
  console.log('🧪 Testing service_requests constraint fix...');

  // All service types that should be allowed
  const serviceTypes = [
    'translation',
    'consultation', 
    'legal',
    'health-insurance',
    'travel',
    'government',
    'insurance',
    'other'
  ];

  for (const serviceType of serviceTypes) {
    console.log(`📋 Testing service type: ${serviceType}`);
    
    try {
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        service_type: serviceType,
        title: `Test ${serviceType} Request`,
        description: `This is a test request for ${serviceType}`,
        priority: 'medium',
        status: 'pending'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('service_requests')
        .insert(testData)
        .select();

      if (insertError) {
        console.error(`❌ Error inserting ${serviceType}:`, insertError);
      } else {
        console.log(`✅ Successfully inserted ${serviceType}:`, insertData[0].id);
        
        // Clean up - delete the test record
        const { error: deleteError } = await supabase
          .from('service_requests')
          .delete()
          .eq('id', insertData[0].id);
          
        if (deleteError) {
          console.error(`⚠️ Warning: Could not delete test record for ${serviceType}:`, deleteError);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error testing ${serviceType}:`, error);
    }
  }

  console.log('🎉 Service constraint test completed!');
}

// Run the test
testServiceConstraintFix().catch(console.error);
