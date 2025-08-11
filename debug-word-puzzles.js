// Debug script for word puzzles (milestones 9-19)
console.log('🧩 Debugging Word Puzzles for Milestones 9-19...\n');

// Function to check word puzzle configuration for a specific milestone
function checkWordPuzzleConfig(milestone) {
  console.log(`🔍 Checking Word Puzzle for Milestone ${milestone}...`);
  
  // Check if milestone is valid for word puzzles
  if (milestone < 9 || milestone > 19) {
    console.log(`❌ Milestone ${milestone} is not valid for word puzzles (should be 9-19)`);
    return false;
  }
  
  // Check localStorage for puzzle configuration
  const puzzleKey = `puzzle-${milestone}`;
  const savedPuzzle = localStorage.getItem(puzzleKey);
  
  if (savedPuzzle) {
    try {
      const puzzle = JSON.parse(savedPuzzle);
      console.log(`✅ Found puzzle configuration for milestone ${milestone}:`);
      console.log(`   ID: ${puzzle.id}`);
      console.log(`   Title: ${puzzle.title}`);
      console.log(`   Green boxes: ${puzzle.greenBoxes ? puzzle.greenBoxes.length : 0}`);
      console.log(`   Grid size: ${puzzle.grid ? puzzle.grid.length : 0}x${puzzle.grid && puzzle.grid[0] ? puzzle.grid[0].length : 0}`);
      console.log(`   Updated: ${puzzle.updatedAt}`);
      return true;
    } catch (error) {
      console.log(`❌ Error parsing puzzle configuration: ${error.message}`);
      return false;
    }
  } else {
    console.log(`❌ No puzzle configuration found for milestone ${milestone}`);
    console.log(`💡 This means the puzzle needs to be configured by a trainer`);
    return false;
  }
}

// Function to create a default word puzzle configuration
function createDefaultWordPuzzle(milestone) {
  console.log(`🔧 Creating default word puzzle for milestone ${milestone}...`);
  
  const defaultTeluguLetters = [
    "అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ౠ", "ఎ", "ఏ",
    "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః", "క", "ఖ", "గ", "ఘ",
    "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ", "డ", "ఢ",
    "ణ", "త", "థ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ",
    "మ", "య", "ర", "ల", "వ", "శ", "ష", "స", "హ", "ళ"
  ];
  
  const defaultConfig = {
    id: `puzzle-${milestone}`,
    milestone: milestone,
    title: `Milestone ${milestone} Word Puzzle`,
    greenBoxes: [
      {
        id: "green-1",
        row: 1,
        col: 2,
        explanation: "అ - First vowel in Telugu alphabet"
      },
      {
        id: "green-2",
        row: 2,
        col: 4,
        explanation: "క - First consonant in Telugu alphabet"
      },
      {
        id: "green-3",
        row: 3,
        col: 1,
        explanation: "మ - Important consonant sound"
      },
      {
        id: "green-4",
        row: 4,
        col: 3,
        explanation: "ర - Rolling R sound"
      }
    ],
    updatedAt: new Date().toISOString()
  };
  
  // Create 6x6 grid
  const grid = [];
  let letterIndex = 0;
  
  for (let row = 0; row < 6; row++) {
    grid[row] = [];
    for (let col = 0; col < 6; col++) {
      const isGreenBox = defaultConfig.greenBoxes.some(gb => gb.row === row && gb.col === col);
      const greenBox = defaultConfig.greenBoxes.find(gb => gb.row === row && gb.col === col);
      
      grid[row][col] = {
        letter: defaultTeluguLetters[letterIndex % defaultTeluguLetters.length],
        isGreenBox: isGreenBox,
        explanation: greenBox ? greenBox.explanation : ""
      };
      letterIndex++;
    }
  }
  
  defaultConfig.grid = grid;
  
  // Save to localStorage
  localStorage.setItem(`puzzle-${milestone}`, JSON.stringify(defaultConfig));
  
  console.log(`✅ Default word puzzle created for milestone ${milestone}`);
  console.log(`   Green boxes: ${defaultConfig.greenBoxes.length}`);
  console.log(`   Grid size: ${grid.length}x${grid[0].length}`);
  
  return defaultConfig;
}

// Function to check all milestones 9-19
function checkAllWordPuzzles() {
  console.log('🔍 Checking all word puzzles (milestones 9-19)...\n');
  
  const results = [];
  
  for (let milestone = 9; milestone <= 19; milestone++) {
    const hasConfig = checkWordPuzzleConfig(milestone);
    results.push({ milestone, hasConfig });
  }
  
  console.log('\n📊 Summary:');
  const configured = results.filter(r => r.hasConfig).length;
  const missing = results.filter(r => !r.hasConfig).length;
  
  console.log(`✅ Configured: ${configured} milestones`);
  console.log(`❌ Missing: ${missing} milestones`);
  
  if (missing > 0) {
    console.log('\n❌ Missing configurations for milestones:');
    results.filter(r => !r.hasConfig).forEach(r => {
      console.log(`   - Milestone ${r.milestone}`);
    });
    
    console.log('\n💡 To create default configurations, run:');
    console.log('   createAllDefaultPuzzles()');
  }
  
  return results;
}

// Function to create default puzzles for all missing milestones
function createAllDefaultPuzzles() {
  console.log('🔧 Creating default word puzzles for all missing milestones...\n');
  
  const created = [];
  
  for (let milestone = 9; milestone <= 19; milestone++) {
    const hasConfig = checkWordPuzzleConfig(milestone);
    
    if (!hasConfig) {
      console.log(`\n🔧 Creating default puzzle for milestone ${milestone}...`);
      const config = createDefaultWordPuzzle(milestone);
      created.push({ milestone, config });
    }
  }
  
  console.log(`\n✅ Created ${created.length} default word puzzles`);
  
  if (created.length > 0) {
    console.log('\n📋 Created puzzles for milestones:');
    created.forEach(item => {
      console.log(`   - Milestone ${item.milestone}: ${item.config.title}`);
    });
    
    console.log('\n🎯 Now learners should be able to see word puzzles for these milestones!');
  }
  
  return created;
}

// Function to test word puzzle component rendering
function testWordPuzzleRendering(milestone) {
  console.log(`🧪 Testing word puzzle rendering for milestone ${milestone}...`);
  
  // Check if milestone is valid
  if (milestone < 9 || milestone > 19) {
    console.log(`❌ Milestone ${milestone} is not valid for word puzzles`);
    return false;
  }
  
  // Check if configuration exists
  const hasConfig = checkWordPuzzleConfig(milestone);
  
  if (!hasConfig) {
    console.log(`❌ No configuration found for milestone ${milestone}`);
    console.log(`💡 Run createDefaultWordPuzzle(${milestone}) to create one`);
    return false;
  }
  
  console.log(`✅ Word puzzle should render correctly for milestone ${milestone}`);
  console.log(`💡 Navigate to milestone ${milestone} in the learner dashboard to test`);
  
  return true;
}

// Export functions for manual use
window.checkWordPuzzleConfig = checkWordPuzzleConfig;
window.createDefaultWordPuzzle = createDefaultWordPuzzle;
window.checkAllWordPuzzles = checkAllWordPuzzles;
window.createAllDefaultPuzzles = createAllDefaultPuzzles;
window.testWordPuzzleRendering = testWordPuzzleRendering;

console.log('🧩 Word Puzzle Debug Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - checkWordPuzzleConfig(milestone)  : Check specific milestone puzzle');
console.log('  - createDefaultWordPuzzle(milestone): Create default puzzle for milestone');
console.log('  - checkAllWordPuzzles()             : Check all milestones 9-19');
console.log('  - createAllDefaultPuzzles()         : Create defaults for all missing');
console.log('  - testWordPuzzleRendering(milestone): Test puzzle rendering');
console.log('\n💡 Run checkAllWordPuzzles() to see what\'s missing');
