const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModeratorAuth() {
  console.log('🔍 Checking moderator authentication state...');
  
  try {
    // Test 1: Check profiles table structure
    console.log('\n📋 Test 1: Checking profiles table structure...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('📊 Sample profiles:', profiles?.map(p => ({ id: p.id, email: p.email, role: p.role })));
    }
    
    // Test 2: Check moderators table
    console.log('\n📋 Test 2: Checking moderators table...');
    const { data: moderators, error: moderatorsError } = await supabase
      .from('moderators')
      .select('*')
      .limit(5);
    
    if (moderatorsError) {
      console.error('❌ Moderators table error:', moderatorsError);
    } else {
      console.log('✅ Moderators table accessible');
      console.log('📊 Sample moderators:', moderators?.map(m => ({ id: m.id, email: m.email, user_id: m.user_id })));
    }
    
    // Test 3: Check for users with moderator role
    console.log('\n📋 Test 3: Checking users with moderator role...');
    const { data: moderatorProfiles, error: moderatorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'moderator');
    
    if (moderatorError) {
      console.error('❌ Moderator profiles query error:', moderatorError);
    } else {
      console.log('✅ Found moderator profiles:', moderatorProfiles?.length || 0);
      if (moderatorProfiles && moderatorProfiles.length > 0) {
        console.log('📊 Moderator profiles:', moderatorProfiles.map(p => ({ id: p.id, email: p.email, role: p.role })));
      }
    }
    
    // Test 4: Check auth.users table for moderator emails
    console.log('\n📋 Test 4: Checking auth.users for moderator emails...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users query error:', authError);
    } else {
      console.log('✅ Auth users accessible');
      const moderatorUsers = authUsers.users.filter(u => 
        u.email?.includes('moderator') || u.email?.includes('moderator@')
      );
      console.log('📊 Users with moderator in email:', moderatorUsers.length);
      if (moderatorUsers.length > 0) {
        console.log('📊 Moderator users:', moderatorUsers.map(u => ({ id: u.id, email: u.email, confirmed: u.email_confirmed_at })));
      }
    }
    
    // Test 5: Check RLS policies
    console.log('\n📋 Test 5: Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: 'Function not available' }));
    
    if (policiesError) {
      console.log('ℹ️ Could not check policies directly (function may not exist)');
    } else {
      console.log('✅ Policies check result:', policies);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
checkModeratorAuth().then(() => {
  console.log('\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
