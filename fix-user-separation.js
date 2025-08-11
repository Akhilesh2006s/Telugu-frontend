// Script to fix user separation and clean up the database
const API_BASE_URL = 'https://backend-production-7e4df.up.railway.app/api';

async function fixUserSeparation() {
  console.log('🔧 Fixing user separation and cleaning up database...\n');

  // First, check if we have a valid token
  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No authentication token found. Please login first.');
    return;
  }

  try {
    // Get current user info
    console.log('👤 Getting current user info...');
    const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      console.log(`❌ Failed to get user info: ${userResponse.status}`);
      return;
    }

    const userResult = await userResponse.json();
    const currentUser = userResult.data;
    console.log(`👤 Current user: ${currentUser.name} (${currentUser._id})`);

    // Get all submissions (this will now be filtered by user after the backend fix)
    console.log('\n📋 Fetching user-specific submissions...');
    const response = await fetch(`${API_BASE_URL}/submissions/student`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`❌ Failed to fetch submissions: ${response.status}`);
      return;
    }

    const result = await response.json();
    const submissions = result.data;
    
    console.log(`📋 Found ${submissions.length} submissions for current user`);

    // Show breakdown by type
    const voiceRecordings = submissions.filter(sub => sub.submissionType === 'voice');
    const otherSubmissions = submissions.filter(sub => sub.submissionType !== 'voice');
    
    console.log(`🎤 Voice recordings: ${voiceRecordings.length}`);
    console.log(`📝 Other submissions: ${otherSubmissions.length}`);

    // Show voice recording details
    if (voiceRecordings.length > 0) {
      console.log('\n🎤 Voice Recording Details:');
      voiceRecordings.forEach((recording, index) => {
        const duration = recording.voiceRecording?.duration || 0;
        const status = recording.status || 'unknown';
        const submittedAt = new Date(recording.submittedAt).toLocaleString();
        console.log(`  ${index + 1}. ID: ${recording._id}`);
        console.log(`     Duration: ${duration}s`);
        console.log(`     Status: ${status}`);
        console.log(`     Submitted: ${submittedAt}`);
        console.log(`     Milestone: ${recording.milestone || 'N/A'}`);
        console.log('');
      });
    }

    // Check for invalid recordings
    const invalidRecordings = voiceRecordings.filter(sub => {
      const duration = sub.voiceRecording?.duration || 0;
      return duration < 1;
    });

    if (invalidRecordings.length > 0) {
      console.log(`🚨 Found ${invalidRecordings.length} invalid recordings (0 duration)`);
      console.log('💡 Run cleanupBackendRecordings() to remove invalid recordings');
    } else {
      console.log('✅ All recordings have valid duration');
    }

    // Show milestone breakdown
    const milestoneCounts = {};
    voiceRecordings.forEach(recording => {
      const milestone = recording.milestone || 'unknown';
      milestoneCounts[milestone] = (milestoneCounts[milestone] || 0) + 1;
    });

    console.log('\n📊 Milestone Breakdown:');
    Object.entries(milestoneCounts).forEach(([milestone, count]) => {
      console.log(`  Milestone ${milestone}: ${count} recordings`);
    });

  } catch (error) {
    console.error('❌ Error during user separation check:', error);
  }
}

// Export function for manual use
window.fixUserSeparation = fixUserSeparation;

console.log('🔧 User Separation Fix Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - fixUserSeparation()        : Check user-specific submissions');
console.log('  - cleanupBackendRecordings() : Clean up invalid recordings (from previous script)');
console.log('\n💡 Run fixUserSeparation() to check your user-specific data');
