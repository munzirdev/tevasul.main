// Quick test to verify moderator authentication fix
console.log('🧪 Testing moderator authentication fix...');

// Test the moderator detection logic
function testModeratorDetection(email, userMetadata = {}, appMetadata = {}) {
  const isAdminUser = email === 'admin@tevasul.group';
  const isModeratorUser = email?.includes('moderator') || 
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
  { email: 'moderator@tevasul.group', userMetadata: {}, appMetadata: {} },
  { email: 'test.moderator@example.com', userMetadata: {}, appMetadata: {} },
  { email: 'user@example.com', userMetadata: { role: 'moderator' }, appMetadata: {} },
  { email: 'user@example.com', userMetadata: {}, appMetadata: { role: 'moderator' } },
  { email: 'admin@tevasul.group', userMetadata: {}, appMetadata: {} },
  { email: 'regular@example.com', userMetadata: {}, appMetadata: {} }
];

console.log('\n📋 Testing moderator detection logic:');
testCases.forEach((testCase, index) => {
  const result = testModeratorDetection(testCase.email, testCase.userMetadata, testCase.appMetadata);
  console.log(`Test ${index + 1}:`, {
    email: result.email,
    isModerator: result.isModerator ? '✅ YES' : '❌ NO',
    isAdmin: result.isAdmin ? '✅ YES' : '❌ NO',
    userMetadataRole: result.userMetadata?.role || 'none',
    appMetadataRole: result.appMetadata?.role || 'none'
  });
});

console.log('\n✅ Moderator detection logic test completed');
console.log('\n📝 To test in browser:');
console.log('1. Open test-moderator-access.html in browser');
console.log('2. Sign in with a moderator account');
console.log('3. Check if moderator status is detected correctly');
console.log('4. Verify dashboard access works');
