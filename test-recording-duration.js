// Test script for recording duration fix
console.log('🎤 Testing Recording Duration Fix...\n');

// Function to simulate recording duration calculation
function testDurationCalculation() {
  console.log('🧪 Testing duration calculation...');
  
  const startTime = Date.now();
  
  // Simulate a 5-second recording
  setTimeout(() => {
    const actualDuration = Math.floor((Date.now() - startTime) / 1000);
    console.log('✅ Simulated 5-second recording:');
    console.log('   Start time:', new Date(startTime).toLocaleTimeString());
    console.log('   End time:', new Date().toLocaleTimeString());
    console.log('   Calculated duration:', actualDuration, 'seconds');
    console.log('   Duration >= 1:', actualDuration >= 1);
  }, 5000);
}

// Function to check current recording state
function checkRecordingState() {
  console.log('🔍 Checking current recording state...');
  
  // Check if MediaRecorder is available
  if (typeof MediaRecorder !== 'undefined') {
    console.log('✅ MediaRecorder is available');
    
    // Check if getUserMedia is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('✅ getUserMedia is available');
    } else {
      console.log('❌ getUserMedia is not available');
    }
  } else {
    console.log('❌ MediaRecorder is not available');
  }
  
  // Check if we're on HTTPS or localhost (required for getUserMedia)
  if (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('✅ Protocol is secure (HTTPS or localhost)');
  } else {
    console.log('❌ Protocol is not secure - getUserMedia requires HTTPS or localhost');
  }
}

// Function to test actual recording (if user allows)
async function testActualRecording() {
  console.log('🎤 Testing actual recording...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone access granted');
    
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];
    const startTime = Date.now();
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const actualDuration = Math.floor((Date.now() - startTime) / 1000);
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      
      console.log('✅ Recording completed:');
      console.log('   Duration:', actualDuration, 'seconds');
      console.log('   Blob size:', audioBlob.size, 'bytes');
      console.log('   Audio chunks:', audioChunks.length);
      console.log('   Duration >= 1:', actualDuration >= 1);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
    };
    
    console.log('🎤 Starting 3-second test recording...');
    mediaRecorder.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Recording test failed:', error);
  }
}

// Function to check localStorage for recordings
function checkStoredRecordings() {
  console.log('💾 Checking stored recordings...');
  
  try {
    const backupRecordings = JSON.parse(localStorage.getItem('voice-recordings-backup') || '[]');
    console.log('📦 Backup recordings count:', backupRecordings.length);
    
    if (backupRecordings.length > 0) {
      console.log('📋 Recent recordings:');
      backupRecordings.slice(-3).forEach((recording, index) => {
        console.log(`   ${index + 1}. ID: ${recording.id}`);
        console.log(`      Duration: ${recording.duration}s`);
        console.log(`      Milestone: ${recording.milestone}`);
        console.log(`      Status: ${recording.status}`);
        console.log(`      Timestamp: ${new Date(recording.timestamp).toLocaleString()}`);
      });
    } else {
      console.log('📭 No recordings found in localStorage');
    }
  } catch (error) {
    console.error('❌ Error reading localStorage:', error);
  }
}

// Export functions for manual use
window.testDurationCalculation = testDurationCalculation;
window.checkRecordingState = checkRecordingState;
window.testActualRecording = testActualRecording;
window.checkStoredRecordings = checkStoredRecordings;

console.log('🎤 Recording Duration Test Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - testDurationCalculation() : Test duration calculation logic');
console.log('  - checkRecordingState()      : Check recording capabilities');
console.log('  - testActualRecording()      : Test actual microphone recording');
console.log('  - checkStoredRecordings()    : Check localStorage recordings');
console.log('\n💡 Run checkRecordingState() to start testing');
