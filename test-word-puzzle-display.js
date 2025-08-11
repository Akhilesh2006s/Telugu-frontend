// Test script to verify word puzzle display for milestones 9-19
console.log('🧩 Testing Word Puzzle Display for Milestones 9-19...\n');

// Function to test milestone selection
function testMilestoneSelection(milestone) {
  console.log(`🔍 Testing Milestone ${milestone}...`);
  
  // Check if milestone is valid for word puzzles
  if (milestone >= 9 && milestone <= 19) {
    console.log(`✅ Milestone ${milestone} should show Word Puzzle Practice`);
    console.log(`💡 Navigate to the Learner Dashboard and select Milestone ${milestone}`);
    console.log(`📋 Expected to see:`);
    console.log(`   - "Word Puzzle Practice" title`);
    console.log(`   - BookOpen icon instead of Mic icon`);
    console.log(`   - WordPuzzle component rendered`);
    console.log(`   - No voice recording controls`);
  } else {
    console.log(`✅ Milestone ${milestone} should show Voice Recording Practice`);
    console.log(`💡 Navigate to the Learner Dashboard and select Milestone ${milestone}`);
    console.log(`📋 Expected to see:`);
    console.log(`   - "Practice Recording" title`);
    console.log(`   - Mic icon`);
    console.log(`   - Voice recording controls`);
    console.log(`   - Recording buttons and progress`);
  }
}

// Function to test all milestones
function testAllMilestones() {
  console.log('🔍 Testing all milestones...\n');
  
  for (let milestone = 1; milestone <= 19; milestone++) {
    testMilestoneSelection(milestone);
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Summary:');
  console.log('✅ Milestones 1-8: Voice Recording Practice');
  console.log('🧩 Milestones 9-19: Word Puzzle Practice');
  console.log('\n💡 To test:');
  console.log('   1. Go to Learner Dashboard');
  console.log('   2. Select different milestones');
  console.log('   3. Verify the correct practice type is shown');
}

// Function to check current milestone
function checkCurrentMilestone() {
  // Try to get current milestone from the page
  const milestoneElements = document.querySelectorAll('[data-milestone], .milestone-selector, select');
  
  if (milestoneElements.length > 0) {
    console.log('🔍 Found milestone elements on page:');
    milestoneElements.forEach((el, index) => {
      console.log(`   ${index + 1}. ${el.tagName}: ${el.textContent || el.value || 'No text'}`);
    });
  } else {
    console.log('❌ No milestone elements found on current page');
    console.log('💡 Make sure you are on the Learner Dashboard');
  }
}

// Export functions
window.testMilestoneSelection = testMilestoneSelection;
window.testAllMilestones = testAllMilestones;
window.checkCurrentMilestone = checkCurrentMilestone;

console.log('🧩 Word Puzzle Display Test Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - testMilestoneSelection(milestone) : Test specific milestone');
console.log('  - testAllMilestones()              : Test all milestones 1-19');
console.log('  - checkCurrentMilestone()          : Check current page milestone');
console.log('\n💡 Run testAllMilestones() to see what each milestone should show');
