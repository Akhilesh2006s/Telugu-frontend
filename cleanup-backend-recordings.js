// Script to clean up invalid recordings from Railway backend
const API_BASE_URL = 'https://backend-production-7e4df.up.railway.app/api';

async function cleanupBackendRecordings() {
  console.log('🧹 Cleaning up invalid recordings from Railway backend...\n');

  // First, check if we have a valid token
  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No authentication token found. Please login first.');
    return;
  }

  try {
    // Get all submissions
    console.log('📋 Fetching all submissions from backend...');
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
    
    console.log(`📋 Found ${submissions.length} total submissions`);

    // Filter out invalid voice recordings (0 duration)
    const invalidRecordings = submissions.filter(sub => {
      if (sub.submissionType === 'voice' && sub.voiceRecording) {
        const duration = sub.voiceRecording.duration || 0;
        return duration < 1;
      }
      return false;
    });

    console.log(`🚨 Found ${invalidRecordings.length} invalid recordings (0 duration)`);

    if (invalidRecordings.length === 0) {
      console.log('✅ No invalid recordings found!');
      return;
    }

    // Delete invalid recordings
    console.log('\n🗑️ Deleting invalid recordings...');
    let deletedCount = 0;

    for (const recording of invalidRecordings) {
      try {
        console.log(`🗑️ Deleting recording ${recording._id} (duration: ${recording.voiceRecording?.duration || 0}s)`);
        
        const deleteResponse = await fetch(`${API_BASE_URL}/submissions/${recording._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          console.log(`  ✅ Deleted: ${recording._id}`);
          deletedCount++;
        } else {
          console.log(`  ❌ Failed to delete: ${recording._id} (${deleteResponse.status})`);
        }
      } catch (error) {
        console.log(`  ❌ Error deleting ${recording._id}: ${error.message}`);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Cleanup complete! Deleted ${deletedCount} invalid recordings.`);
    
    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const verifyResponse = await fetch(`${API_BASE_URL}/submissions/student`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json();
      const remainingRecordings = verifyResult.data.filter(sub => 
        sub.submissionType === 'voice' && sub.voiceRecording
      );
      
      const validRecordings = remainingRecordings.filter(sub => 
        (sub.voiceRecording.duration || 0) >= 1
      );
      
      console.log(`✅ Verification: ${validRecordings.length} valid recordings remaining`);
      console.log(`✅ Verification: ${remainingRecordings.length - validRecordings.length} invalid recordings remaining`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Export function for manual use
window.cleanupBackendRecordings = cleanupBackendRecordings;

console.log('🧹 Backend Cleanup Script Loaded!');
console.log('\nAvailable function:');
console.log('  - cleanupBackendRecordings()  : Clean up invalid recordings from Railway backend');
console.log('\n💡 Run cleanupBackendRecordings() to clean up the backend database');
