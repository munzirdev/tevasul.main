// Test script to verify the moderator creation fix
// This script tests the create-moderator-complete function to ensure it handles duplicate key constraints properly

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testModeratorCreation() {
  console.log('🧪 Testing moderator creation fix...');
  
  try {
    // Test data
    const testEmail = `test-moderator-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    const testName = 'Test Moderator Account';
    
    console.log('📝 Test data:', {
      email: testEmail,
      password: '***hidden***',
      full_name: testName
    });
    
    // Test 1: Create moderator using the fixed function
    console.log('📋 Test 1: Creating moderator using create-moderator-complete...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-moderator-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email: testEmail,
        full_name: testName,
        password: testPassword,
        createFullAccount: true
      })
    });

    const data = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);

    if (!response.ok) {
      console.error('❌ Error creating moderator:', data);
      return;
    }

    if (data?.success) {
      console.log('✅ Moderator created successfully:', data.moderator);
      
      // Test 2: Verify profile was created correctly
      console.log('📋 Test 2: Verifying profile...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', testEmail)
        .single();
      
      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
      } else {
        console.log('✅ Profile verified:', {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          role: profileData.role
        });
      }
      
      // Test 3: Verify moderator record was created
      console.log('📋 Test 3: Verifying moderator record...');
      
      const { data: moderatorData, error: moderatorError } = await supabase
        .from('moderators')
        .select('*')
        .eq('email', testEmail)
        .single();
      
      if (moderatorError) {
        console.error('❌ Error fetching moderator:', moderatorError);
      } else {
        console.log('✅ Moderator record verified:', {
          id: moderatorData.id,
          user_id: moderatorData.user_id,
          email: moderatorData.email,
          full_name: moderatorData.full_name,
          is_active: moderatorData.is_active
        });
      }
      
      // Test 4: Try to create the same moderator again (should handle duplicate gracefully)
      console.log('📋 Test 4: Testing duplicate creation...');
      
      const duplicateResponse = await fetch(`${supabaseUrl}/functions/v1/create-moderator-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: testEmail,
          full_name: testName,
          password: testPassword,
          createFullAccount: true
        })
      });

      const duplicateData = await duplicateResponse.json();
      console.log('📊 Duplicate response status:', duplicateResponse.status);
      console.log('📊 Duplicate response data:', duplicateData);

      if (duplicateData?.success === false && duplicateData?.message?.includes('موجود بالفعل')) {
        console.log('✅ Duplicate creation handled gracefully');
      } else {
        console.log('⚠️ Duplicate creation response:', duplicateData);
      }
      
    } else {
      console.error('❌ Failed to create moderator:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testModeratorCreation().then(() => {
  console.log('🏁 Test completed');
}).catch(error => {
  console.error('💥 Test failed:', error);
});
