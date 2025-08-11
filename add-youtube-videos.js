// Script to add sample YouTube videos to Railway backend
const API_BASE_URL = 'https://backend-production-7e4df.up.railway.app/api';

// Sample YouTube videos for Telugu learning
const sampleVideos = [
  {
    title: "Telugu Basics - Lesson 1: Vowels (అచ్చులు)",
    description: "Learn Telugu vowels from అ to అః with proper pronunciation",
    milestone: 1,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
    thumbnailUrl: ""
  },
  {
    title: "Telugu Basics - Lesson 2: Consonants (హల్లులు)",
    description: "Learn Telugu consonants from క to ఱ with proper pronunciation",
    milestone: 2,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
    thumbnailUrl: ""
  },
  {
    title: "Telugu Basics - Lesson 3: Special Characters",
    description: "Learn Telugu special characters and modifiers",
    milestone: 3,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
    thumbnailUrl: ""
  },
  {
    title: "Telugu Basics - Lesson 4: Guninthalu Method 1",
    description: "Learn the first method of guninthalu formation",
    milestone: 4,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
    thumbnailUrl: ""
  },
  {
    title: "Telugu Basics - Lesson 5: Guninthalu Method 2",
    description: "Learn the second method of guninthalu formation",
    milestone: 5,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual Telugu video
    thumbnailUrl: ""
  }
];

async function addYouTubeVideos() {
  console.log('🎬 Adding YouTube videos to Railway backend...\n');

  // First, check if we have a valid token
  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No authentication token found. Please login first.');
    console.log('💡 Run this script after logging in as a trainer.');
    return;
  }

  console.log('✅ Authentication token found');

  for (const video of sampleVideos) {
    try {
      console.log(`📤 Adding video: ${video.title}`);
      
      const response = await fetch(`${API_BASE_URL}/video-lectures`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(video)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`  ✅ Successfully added: ${video.title}`);
        console.log(`  🆔 Video ID: ${data.data._id}`);
      } else {
        console.log(`  ❌ Failed to add: ${video.title}`);
        console.log(`  Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`  ❌ Network error for ${video.title}: ${error.message}`);
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 YouTube video addition complete!');
  console.log('\n💡 Next steps:');
  console.log('  1. Replace the sample YouTube URLs with actual Telugu learning videos');
  console.log('  2. Add more videos for other milestones');
  console.log('  3. Publish the videos from the trainer dashboard');
}

// Function to get current video lectures
async function getCurrentVideos() {
  console.log('📋 Getting current video lectures...\n');

  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No authentication token found.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/video-lectures`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Found ${data.data.length} video lectures:`);
      data.data.forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.title} (Milestone ${video.milestone})`);
        console.log(`     URL: ${video.videoUrl}`);
        console.log(`     Status: ${video.status}`);
        console.log('');
      });
    } else {
      console.log(`❌ Failed to get videos: ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

// Function to publish all videos
async function publishAllVideos() {
  console.log('🚀 Publishing all video lectures...\n');

  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No authentication token found.');
    return;
  }

  try {
    // First get all videos
    const response = await fetch(`${API_BASE_URL}/video-lectures`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      const videos = data.data;
      console.log(`📋 Found ${videos.length} videos to publish`);

      for (const video of videos) {
        if (video.status === 'draft') {
          try {
            console.log(`📤 Publishing: ${video.title}`);
            
            const publishResponse = await fetch(`${API_BASE_URL}/video-lectures/${video._id}/publish`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (publishResponse.ok) {
              console.log(`  ✅ Published: ${video.title}`);
            } else {
              console.log(`  ❌ Failed to publish: ${video.title}`);
            }
          } catch (error) {
            console.log(`  ❌ Error publishing ${video.title}: ${error.message}`);
          }
          
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.log(`  ⏭️  Already published: ${video.title}`);
        }
      }
    } else {
      console.log(`❌ Failed to get videos: ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }

  console.log('\n🎉 Video publishing complete!');
}

// Export functions for manual use
window.addYouTubeVideos = addYouTubeVideos;
window.getCurrentVideos = getCurrentVideos;
window.publishAllVideos = publishAllVideos;

console.log('🚀 YouTube Video Management Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - addYouTubeVideos()  : Add sample YouTube videos');
console.log('  - getCurrentVideos()  : List current videos');
console.log('  - publishAllVideos()  : Publish all draft videos');
console.log('\n💡 Run addYouTubeVideos() to add sample videos to Railway backend');
