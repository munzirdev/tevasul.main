const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://fctvityawavmuethxxix.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixModeratorProfiles() {
  console.log('🔧 Fixing moderator profiles...');
  
  try {
    // Step 1: Get all users from auth.users
    console.log('\n📋 Step 1: Getting all users from auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error getting auth users:', authError);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
    
    // Step 2: Identify moderator users
    console.log('\n📋 Step 2: Identifying moderator users...');
    
    // List of specific moderator emails
    const moderatorEmails = [
      'hanoof@tevasul.group',
      'moderator@tevasul.group',
      'admin@tevasul.group' // admin is also a moderator
    ];
    
    const moderatorUsers = authUsers.users.filter(user => {
      const email = user.email?.toLowerCase() || '';
      return moderatorEmails.includes(user.email) ||
             email.includes('moderator') || 
             user.user_metadata?.role === 'moderator' ||
             user.app_metadata?.role === 'moderator';
    });
    
    console.log(`✅ Found ${moderatorUsers.length} potential moderator users:`, 
      moderatorUsers.map(u => ({ id: u.id, email: u.email })));
    
    // Step 3: Check and fix profiles for each moderator user
    console.log('\n📋 Step 3: Checking and fixing profiles...');
    let fixedCount = 0;
    let createdCount = 0;
    
    for (const user of moderatorUsers) {
      console.log(`\n🔍 Processing user: ${user.email} (${user.id})`);
      
      // Check if profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log(`  ➕ Creating new profile for ${user.email}`);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'مشرف',
            role: 'moderator',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (createError) {
          console.error(`  ❌ Error creating profile for ${user.email}:`, createError);
        } else {
          console.log(`  ✅ Created profile for ${user.email}`);
          createdCount++;
        }
      } else if (profileError) {
        console.error(`  ❌ Error checking profile for ${user.email}:`, profileError);
      } else {
        // Profile exists, check if role is correct
        if (existingProfile.role !== 'moderator') {
          console.log(`  🔄 Updating role from '${existingProfile.role}' to 'moderator' for ${user.email}`);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'moderator',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
          
          if (updateError) {
            console.error(`  ❌ Error updating profile for ${user.email}:`, updateError);
          } else {
            console.log(`  ✅ Updated profile for ${user.email}`);
            fixedCount++;
          }
        } else {
          console.log(`  ✅ Profile already has correct role for ${user.email}`);
        }
      }
    }
    
    // Step 4: Check moderators table
    console.log('\n📋 Step 4: Checking moderators table...');
    const { data: moderators, error: moderatorsError } = await supabase
      .from('moderators')
      .select('*');
    
    if (moderatorsError) {
      console.error('❌ Error getting moderators:', moderatorsError);
    } else {
      console.log(`✅ Found ${moderators.length} records in moderators table`);
      
      // Ensure all moderator profiles have corresponding moderators table entries
      for (const user of moderatorUsers) {
        const existingModerator = moderators.find(m => m.user_id === user.id);
        
        if (!existingModerator) {
          console.log(`  ➕ Creating moderators table entry for ${user.email}`);
          
          const { error: insertError } = await supabase
            .from('moderators')
            .insert({
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'مشرف',
              created_by: user.id, // Self-created for existing users
              is_active: true
            });
          
          if (insertError) {
            console.error(`  ❌ Error creating moderators entry for ${user.email}:`, insertError);
          } else {
            console.log(`  ✅ Created moderators entry for ${user.email}`);
          }
        }
      }
    }
    
    // Step 5: Summary
    console.log('\n📋 Step 5: Summary');
    console.log(`✅ Fixed ${fixedCount} existing profiles`);
    console.log(`✅ Created ${createdCount} new profiles`);
    console.log(`✅ Total moderator users processed: ${moderatorUsers.length}`);
    
    // Step 6: Final verification
    console.log('\n📋 Step 6: Final verification...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'moderator');
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log(`✅ Final count: ${finalProfiles.length} profiles with moderator role`);
      console.log('📊 Moderator profiles:', finalProfiles.map(p => ({ id: p.id, email: p.email, role: p.role })));
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the fix
fixModeratorProfiles().then(() => {
  console.log('\n✅ Moderator profile fix completed');
}).catch(error => {
  console.error('❌ Script failed:', error);
});
