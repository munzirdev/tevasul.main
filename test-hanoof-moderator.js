// Test to verify hanoof@tevasul.group is detected as moderator
console.log('🧪 Testing hanoof@tevasul.group moderator detection...');

// Test the moderator detection logic
function testModeratorDetection(email, userMetadata = {}, appMetadata = {}) {
  const isAdminUser = email === 'admin@tevasul.group';
  
  // List of specific moderator emails
  const moderatorEmails = [
    'hanoof@tevasul.group',
    'moderator@tevasul.group',
    'admin@tevasul.group' // admin is also a moderator
  ];
  
  const isModeratorUser = moderatorEmails.includes(email) ||
                         email?.includes('moderator') || 
                         email?.includes('moderator@') ||
                         email?.toLowerCase().includes('moderator') ||
                         userMetadata?.role === 'moderator' ||
                         appMetadata?.role === 'moderator';
  
  return {
    email,
    isAdmin: isAdminUser,
    isModerator: isModeratorUser,
    userMetadata,
    appMetadata
  };
}

// Test cases
const testCases = [
  { email: 'hanoof@tevasul.group', userMetadata: {}, appMetadata: {} },
  { email: 'moderator@tevasul.group', userMetadata: {}, appMetadata: {} },
  { email: 'admin@tevasul.group', userMetadata: {}, appMetadata: {} },
  { email: 'regular@example.com', userMetadata: {}, appMetadata: {} }
];

console.log('\n📋 Testing moderator detection logic:');
testCases.forEach((testCase, index) => {
  const result = testModeratorDetection(testCase.email, testCase.userMetadata, testCase.appMetadata);
  console.log(`Test ${index + 1}:`, {
    email: result.email,
    isModerator: result.isModerator ? '✅ YES' : '❌ NO',
    isAdmin: result.isAdmin ? '✅ YES' : '❌ NO'
  });
});

console.log('\n✅ Moderator detection logic test completed');
console.log('\n📝 Expected results:');
console.log('- hanoof@tevasul.group should be detected as moderator ✅');
console.log('- moderator@tevasul.group should be detected as moderator ✅');
console.log('- admin@tevasul.group should be detected as moderator ✅');
console.log('- regular@example.com should NOT be detected as moderator ❌');
