// Debug script for audio submission
console.log('🎤 Debugging Audio Submission...\n');

// Function to test blob creation and base64 conversion
async function testBlobConversion() {
  console.log('🧪 Testing blob creation and base64 conversion...');
  
  try {
    // Create a simple test blob (this would normally be an audio recording)
    const testData = new Uint8Array([1, 2, 3, 4, 5]); // Simple test data
    const testBlob = new Blob([testData], { type: 'audio/wav' });
    
    console.log('📦 Test blob created:');
    console.log('   Size:', testBlob.size, 'bytes');
    console.log('   Type:', testBlob.type);
    
    // Convert to base64
    const arrayBuffer = await testBlob.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('🔤 Base64 conversion:');
    console.log('   Length:', base64Data.length);
    console.log('   Preview:', base64Data.substring(0, 20) + '...');
    console.log('   Is empty:', base64Data.length === 0);
    
    return base64Data;
  } catch (error) {
    console.error('❌ Error in blob conversion:', error);
    return null;
  }
}

// Function to test submission data structure
function testSubmissionData(base64Audio) {
  console.log('\n📤 Testing submission data structure...');
  
  const submissionData = {
    milestone: 1,
    audioBlob: base64Audio,
    duration: 5,
    fileName: `milestone-1-recording-${Date.now()}.wav`
  };
  
  console.log('📋 Submission data:');
  console.log('   Milestone:', submissionData.milestone);
  console.log('   Duration:', submissionData.duration);
  console.log('   FileName:', submissionData.fileName);
  console.log('   AudioBlob present:', !!submissionData.audioBlob);
  console.log('   AudioBlob length:', submissionData.audioBlob ? submissionData.audioBlob.length : 0);
  console.log('   AudioBlob empty:', submissionData.audioBlob ? submissionData.audioBlob.length === 0 : true);
  
  return submissionData;
}

// Function to test backend validation logic
function testBackendValidation(submissionData) {
  console.log('\n🔍 Testing backend validation logic...');
  
  const { milestone, audioBlob, duration } = submissionData;
  
  // Simulate backend validation
  const isWordPuzzle = false; // No word puzzle data
  const isVoiceRecording = audioBlob && audioBlob.length > 0;
  
  console.log('✅ Validation results:');
  console.log('   Milestone present:', !!milestone);
  console.log('   AudioBlob present:', !!audioBlob);
  console.log('   AudioBlob length:', audioBlob ? audioBlob.length : 0);
  console.log('   Is voice recording:', isVoiceRecording);
  console.log('   Duration valid:', duration && duration >= 1);
  
  if (!milestone) {
    console.log('❌ Missing milestone');
    return false;
  }
  
  if (!isWordPuzzle && !isVoiceRecording) {
    console.log('❌ Missing required fields: Either audio recording or word puzzle data is required');
    return false;
  }
  
  if (isVoiceRecording && (!duration || duration < 1)) {
    console.log('❌ Invalid recording duration:', duration);
    return false;
  }
  
  console.log('✅ All validations passed!');
  return true;
}

// Function to test actual submission
async function testActualSubmission(submissionData) {
  console.log('\n📡 Testing actual submission...');
  
  const token = localStorage.getItem('telugu-basics-token');
  
  if (!token) {
    console.log('❌ No authentication token found');
    return;
  }
  
  try {
    console.log('📤 Sending submission to backend...');
    
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/submissions/milestone-voice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📊 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Submission successful!');
    } else {
      console.log('❌ Submission failed');
    }
  } catch (error) {
    console.error('❌ Submission error:', error);
  }
}

// Main debug function
async function debugAudioSubmission() {
  console.log('🚀 Starting audio submission debug...\n');
  
  // Test blob conversion
  const base64Audio = await testBlobConversion();
  
  if (!base64Audio) {
    console.log('❌ Failed to create test audio data');
    return;
  }
  
  // Test submission data
  const submissionData = testSubmissionData(base64Audio);
  
  // Test backend validation
  const isValid = testBackendValidation(submissionData);
  
  if (isValid) {
    console.log('\n🎯 All tests passed! Ready for actual submission.');
    
    // Ask user if they want to test actual submission
    console.log('\n💡 To test actual submission, run:');
    console.log('   testActualSubmission(submissionData)');
  } else {
    console.log('\n❌ Validation failed. Check the issues above.');
  }
}

// Export functions for manual use
window.testBlobConversion = testBlobConversion;
window.testSubmissionData = testSubmissionData;
window.testBackendValidation = testBackendValidation;
window.testActualSubmission = testActualSubmission;
window.debugAudioSubmission = debugAudioSubmission;

console.log('🎤 Audio Submission Debug Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - debugAudioSubmission()     : Run all debug tests');
console.log('  - testBlobConversion()       : Test blob to base64 conversion');
console.log('  - testSubmissionData()       : Test submission data structure');
console.log('  - testBackendValidation()    : Test backend validation logic');
console.log('  - testActualSubmission()     : Test actual submission to backend');
console.log('\n💡 Run debugAudioSubmission() to start debugging');
