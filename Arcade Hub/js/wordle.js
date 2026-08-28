// ============================================================================
// WORDLE GAME
// ============================================================================

// Word list for the game
const WORD_LIST = [
  'ABOUT', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER',
  'AGAIN', 'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIKE',
  'ALIVE', 'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'ANGEL', 'ANGER', 'ANGLE',
  'ANGRY', 'APART', 'APPLE', 'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY',
  'ARROW', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARD', 'AWARE', 'BADLY',
  'BAKER', 'BASES', 'BASIC', 'BASIS', 'BATTLE', 'BEACH', 'BEGAN', 'BEGIN',
  'BEING', 'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLADE', 'BLAME',
  'BLANK', 'BLAST', 'BLEED', 'BLESS', 'BLIND', 'BLOCK', 'BLOOD', 'BLOWN',
  'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRAVE', 'BREAD',
  'BREAK', 'BREED', 'BRICK', 'BRIDE', 'BRIEF', 'BRING', 'BROAD', 'BROKE',
  'BROWN', 'BRUSH', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CAMEL',
  'CANAL', 'CANDY', 'CANNY', 'CARGO', 'CARRY', 'CARVE', 'CATCH', 'CAUSE',
  'CHAIN', 'CHAIR', 'CHALK', 'CHAMP', 'CHANT', 'CHAOS', 'CHARD', 'CHARM',
  'CHART', 'CHASE', 'CHEAP', 'CHEAT', 'CHECK', 'CHEEK', 'CHEER', 'CHESS',
  'CHEST', 'CHIEF', 'CHILD', 'CHIME', 'CHINA', 'CHOSE', 'CHUNK', 'CIDER',
  'CIGAR', 'CIVIL', 'CLAIM', 'CLAMP', 'CLANG', 'CLASH', 'CLASP', 'CLASS',
  'CLEAN', 'CLEAR', 'CLEAT', 'CLEFT', 'CLICK', 'CLIFF', 'CLIMB', 'CLING',
  'CLOAK', 'CLOCK', 'CLONE', 'CLOSE', 'CLOTH', 'CLOUD', 'CLOWN', 'CLUBS',
  'CLUMP', 'COACH', 'COAST', 'COULD', 'COUNT', 'COUCH', 'COUGH', 'COURT',
  'COVER', 'CRACK', 'CRAFT', 'CRAMP', 'CRANE', 'CRASH', 'CRATE', 'CRAVE',
  'CRAWL', 'CRAZY', 'CREAM', 'CREEK', 'CREEP', 'CREPT', 'CRIME', 'CRISP',
  'CROAK', 'CROCK', 'CROOK', 'CROPS', 'CROSS', 'CROUP', 'CROWD', 'CROWN',
  'CRUDE', 'CRUEL', 'CRUSH', 'CRUST', 'CUBIC', 'CURVE', 'CYCLE', 'DAILY',
  'DAIRY', 'DANCE', 'DANDY', 'DATED', 'DEALT', 'DEATH', 'DEBIT', 'DEBUG',
  'DEBUT', 'DECAY', 'DECOR', 'DECOY', 'DEFER', 'DELAY', 'DELTA', 'DENSE',
  'DEPTH', 'DERBY', 'DETER', 'DEVIL', 'DIARY', 'DICED', 'DIGIT', 'DINER',
  'DIRTY', 'DISCO', 'DITCH', 'DIVER', 'DIZZY', 'DODGE', 'DOING', 'DONOR',
  'DOUBT', 'DOUGH', 'DOZEN', 'DRAFT', 'DRAIN', 'DRAKE', 'DRAMA', 'DRANK',
  'DRAPE', 'DRAWL', 'DRAWN', 'DREAD', 'DREAM', 'DRESS', 'DRIED', 'DRIER',
  'DRIFT', 'DRILL', 'DRINK', 'DRIVE', 'DROIT', 'DROLL', 'DRONE', 'DROOL',
  'DROOP', 'DROSS', 'DROVE', 'DROWN', 'DRUGS', 'DRUNK', 'DRYING', 'DUALS',
  'DUCAL', 'DUCKS', 'DUCTS', 'DUFFS', 'DUKE', 'DULLY', 'DUMBLY', 'DUMMY',
  'DUMPS', 'DUNCE', 'DUNES', 'DUNKS', 'DUSKY', 'DUSTY', 'DUTCH', 'DUVET',
  'DWELL', 'DYING', 'EAGER', 'EAGLE', 'EARLY', 'EARN', 'EARTH', 'EASEL',
  'EASED', 'EASES', 'EASIE', 'EASTS', 'EATEN', 'EATER', 'EAGER', 'EDGES',
  'EDITS', 'EDICT', 'EGGED', 'EGGER', 'EIGHT', 'EJECT', 'EKING', 'ELATE',
  'ELBOWS', 'ELDER', 'ELECT', 'ELEGY', 'ELFIN', 'ELITE', 'ELUDE', 'EMBER',
  'EMBERS', 'EMCEE', 'EMERALD', 'EMERY', 'EMACS', 'EMIT', 'EMITS', 'EMOTE',
  'EMPTY', 'ENACT', 'ENDED', 'ENEMY', 'ENEMA', 'ENERGY', 'ENFACE', 'ENGULF',
  'ENJOY', 'ENNUI', 'ENROL', 'ENSUE', 'ENTER', 'ENTITY', 'ENVOY', 'EQUAL',
  'EQUIP', 'ERASE', 'ERECT', 'ERROR', 'ERUPT', 'ESSAY', 'ETHER', 'ETHIC',
  'EVADE', 'EVALUATE', 'EVENT', 'EVERY', 'EVICT', 'EVOKE', 'EXACT', 'EXALT',
  'EXAM', 'EXCEL', 'EXCEPT', 'EXCESS', 'EXCLAIM', 'EXCUSE', 'EXECUTE', 'EXERT',
  'EXILE', 'EXIST', 'EXIT', 'EXPEL', 'EXPEND', 'EXPERT', 'EXPIRE', 'EXPLAIN',
  'EXPOSE', 'EXPRESS', 'EXTEND', 'EXTENT', 'EXTOL', 'EXTRA', 'EXUDE', 'EXULT',
  'EYING', 'FABLE', 'FACED', 'FACES', 'FACET', 'FACTS', 'FADED', 'FADES',
  'FAILS', 'FAINT', 'FAITH', 'FAKER', 'FALLS', 'FALSE', 'FAMED', 'FANCY',
  'FANGS', 'FARCE', 'FARES', 'FARMS', 'FARTS', 'FATAL', 'FATED', 'FATES',
  'FATTY', 'FAULT', 'FAUNA', 'FAVOR', 'FAUNS', 'FAULTY', 'FAXED', 'FEARS',
  'FEAST', 'FEATS', 'FEEDS', 'FEELS', 'FEIGN', 'FEINT', 'FELINE', 'FELONS',
  'FELTS', 'FEMALE', 'FEMUR', 'FENCE', 'FENDS', 'FENNY', 'FERAL', 'FERNS',
  'FERRY', 'FETAL', 'FETCH', 'FETED', 'FETES', 'FETID', 'FETUS', 'FEUDAL',
  'FIBER', 'FIBRE', 'FICKLE', 'FIELD', 'FIEND', 'FIERY', 'FIFES', 'FIFTH',
  'FIFTY', 'FIGHT', 'FIGGY', 'GABLE', 'GAILY', 'GAINS', 'GALES', 'GAMED',
  'GAMES', 'GANGS', 'GAPED', 'GAPES', 'GARBS', 'GARDE', 'GARGLES', 'GARTER',
  'GASES', 'GASPS', 'GASSY', 'GATES', 'GATOR', 'GAUDY', 'GAUGE', 'GAUNT',
  'GAUSS', 'GAUZE', 'GAVEL', 'GAWKS', 'GAWKY', 'GAZED', 'GAZES', 'GEARS',
  'GEESE', 'GELID', 'GENES', 'GENRE', 'GENTS', 'GENUS', 'GERMY', 'GESSO',
  'GESTS', 'GIANT', 'GIBED', 'GIBES', 'GIDDY', 'GIFTS', 'GIGGED', 'GIGANTIC',
  'GIGGLES', 'GILD', 'GILDS', 'GIMPY', 'GINGER', 'GINKS', 'GIPSY', 'GIRTH',
  'GIRTH', 'GIVEN', 'GIVER', 'GIVES', 'GIZMO', 'GLAND', 'GLARE', 'GLASS',
  'GLAZE', 'GLEAM', 'GLEAN', 'GLEBE', 'GLEES', 'GLEN', 'GLENS', 'GLIDE',
  'GLINT', 'GLITZ', 'GLOAT', 'GLOBE', 'GLOBS', 'GLOOM', 'GLORY', 'GLOSS',
  'GLOVE', 'GLUED', 'GLUES', 'GLUM', 'GLUME', 'GLUMS', 'GLUON', 'GLUT',
  'GLUTS', 'GLYPH', 'GNARL', 'GNASH', 'GNATS', 'GNAWED', 'GNOME', 'GNOMES',
  'GOALS', 'GOATS', 'GOATY', 'GOBLET', 'GOBO', 'GOBS', 'GODLY', 'GOERS',
  'GOFER', 'GOGGLE', 'GOING', 'GOLDS', 'GOLFS', 'GOLLY', 'GONAD', 'GONER',
  'GONGS', 'GONNA', 'GONZO', 'GOOCH', 'GOODS', 'GOODY', 'GOOEY', 'GOOFY',
  'GOONS', 'GOOSE', 'GOOSY', 'GORBELLY', 'GORGE', 'GORGON', 'GORILLA', 'GORSE',
  'GORSY', 'GORY', 'GOSLING', 'GOSPEL', 'GOSH', 'GOSSAMERS', 'GOSSIP', 'GOUGE',
  'GOULASH', 'GOURD', 'GOURMAND', 'GOURMET', 'GOUT', 'GOUTS', 'GOVS', 'GOWNS',
  'GRABS', 'GRACE', 'GRADE', 'GRAFT', 'GRAIL', 'GRAIN', 'GRAINS', 'GRAM',
  'GRAMS', 'GRAND', 'GRANGE', 'GRANT', 'GRAPE', 'GRAPH', 'GRASP', 'GRASS',
  'GRATE', 'GRAVE', 'GRAVY', 'GRAYS', 'GRAZE', 'GREAT', 'GREED', 'GREEK',
  'GREEN', 'GREET', 'GRENADE', 'GREYS', 'GRID', 'GRIDS', 'GRIEF', 'GRILL',
  'GRIME', 'GRIMLY', 'GRIN', 'GRIND', 'GRINDS', 'GRINS', 'GRIPE', 'GRIPPE',
  'GRIPY', 'GRISLY', 'GRIST', 'GRITS', 'GRIZZLE', 'GRIZZLY', 'GROAN', 'GROANS',
  'GROAT', 'GROATS', 'GROIN', 'GROOM', 'GROOMED', 'GROOMSMEN', 'GROOVES', 'GROOVE',
  'GROPE', 'GROSS', 'CROFT', 'GROTTO', 'GROUCH', 'GROUCHY', 'GROUND', 'GROUNDHOG',
  'GROUNDS', 'GROUP', 'GROUPS', 'GROUSE', 'GROVE', 'GROVEL', 'GROVER', 'GROWS',
  'GROWL', 'GROWN', 'GRUB', 'GRUBS', 'GRUDGE', 'GRUEL', 'GRUELING', 'GRUESOME',
  'GRUFF', 'GRUFFLY', 'GRUMBLE', 'GRUMPY', 'GRUNT', 'GRUNTS', 'GUANO', 'GUANS',
  'GUARD', 'GUARDS', 'GUAVA', 'GUAVAS', 'GUESS', 'GUESSED', 'GUESSES', 'GUEST',
  'GUESTS', 'GUFF', 'GUFFS', 'GUFFAW', 'GUIDE', 'GUIDED', 'GUIDES', 'GUILD',
  'GUILD', 'GUILDS', 'GUILE', 'GUILT', 'GUILTY', 'GULAG', 'GULCH', 'GULDEN',
  'GULF', 'GULFS', 'GULFED', 'GULFS', 'GULL', 'GULLED', 'GULLET', 'GULLEY',
  'GULLEYS', 'GULLEY', 'GULLIES', 'GULLING', 'GULLS', 'GULLIED', 'GULLIBLE', 'GULLY',
  'GULP', 'GULPED', 'GULPING', 'GULPS', 'GUMBO', 'GUMMED', 'GUMMY', 'GUMPTION',
  'GUMS', 'GUMSHOE', 'GUNBOAT', 'GUNFIRE', 'GUNFIGHT', 'GUNG', 'GUNKS', 'GUNKY',
  'GUNMAN', 'GUNNED', 'GUNNER', 'GUNNERY', 'GUNNING', 'GUNNY', 'GUNPLAY', 'GUNPOINT',
  'GUNSHIP', 'GUNSHOT', 'GUNSMITH', 'GUNSTOCK', 'GUNWALE', 'GURGLE', 'GURGLES', 'GURI',
  'GURUS', 'GUSH', 'GUSHED', 'GUSHES', 'GUSHING', 'GUSHY', 'GUSSET', 'GUSSY',
  'GUSTED', 'GUSTING', 'GUSTO', 'GUSTS', 'GUSTY', 'GUTLESS', 'GUTS', 'GUTSY',
  'GUTTED', 'GUTTER', 'GUTTERED', 'GUTTERS', 'GUTTURAL', 'GUYED', 'GUYS', 'GUZZLE',
  'GUZZLED', 'GUZZLER', 'GUZZLES', 'GUZZLING', 'GUZZLY', 'GYMS', 'GYMS', 'GYMSLIP',
  'GYNECOID', 'GYNECOLOG', 'GYNECOLOGY', 'GYPSUM', 'GYPSIES', 'GYPSY', 'GYRATE', 'GYRATED',
];

// Game state
let targetWord = '';
let currentGuess = '';
let guessCount = 0;
let gameOver = false;
let guessedLetters = new Set();
let correctLetters = new Set();
let wrongPositionLetters = new Set();
let bestScore = localStorage.getItem('wordleBestScore') || '-';
let wordleStats = {
  wins: parseInt(localStorage.getItem('wordleWins')) || 0,
  losses: parseInt(localStorage.getItem('wordleLosses')) || 0,
  streak: parseInt(localStorage.getItem('wordleStreak')) || 0
};

// DOM elements
const wordleGrid = document.getElementById('wordleGrid');
const keyboard = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const attemptsLeftEl = document.getElementById('attemptsLeft');
const bestScoreEl = document.getElementById('bestScore');
const winRateEl = document.getElementById('winRate');
const streakEl = document.getElementById('streak');

// Initialize
function initGame() {
  // Create grid
  wordleGrid.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.id = `tile-${i}`;
    wordleGrid.appendChild(tile);
  }

  // Create keyboard
  createKeyboard();

  // Start new game
  newGame();
}

function createKeyboard() {
  const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  keyboard.innerHTML = '';

  rows.forEach((row, rowIndex) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';

    if (rowIndex === 2) {
      const enter = document.createElement('button');
      enter.className = 'key key-wide';
      enter.textContent = 'ENTER';
      enter.onclick = submitGuess;
      rowEl.appendChild(enter);
    }

    row.split('').forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = letter;
      btn.id = `key-${letter}`;
      btn.onclick = () => guessLetter(letter);
      rowEl.appendChild(btn);
    });

    if (rowIndex === 2) {
      const del = document.createElement('button');
      del.className = 'key key-wide';
      del.textContent = 'DEL';
      del.onclick = deleteLetter;
      rowEl.appendChild(del);
    }

    keyboard.appendChild(rowEl);
  });
}

function newGame() {
  targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  currentGuess = '';
  guessCount = 0;
  gameOver = false;
  guessedLetters.clear();
  correctLetters.clear();
  wrongPositionLetters.clear();
  messageEl.textContent = '';
  messageEl.className = 'message';

  // Reset keyboard
  document.querySelectorAll('.key').forEach(btn => {
    btn.classList.remove('correct', 'present', 'absent');
    btn.disabled = false;
  });

  // Reset grid
  document.querySelectorAll('.tile').forEach(tile => {
    tile.textContent = '';
    tile.classList.remove('filled', 'correct', 'present', 'absent', 'reveal');
  });

  updateUI();
}

function guessLetter(letter) {
  if (gameOver || currentGuess.length >= 5) {
    return;
  }

  currentGuess += letter;

  const tileIndex = guessCount * 5 + currentGuess.length - 1;
  const tile = document.getElementById(`tile-${tileIndex}`);
  tile.textContent = letter;
  tile.classList.add('filled');

  updateUI();
}

function deleteLetter() {
  if (gameOver || currentGuess.length === 0) return;

  currentGuess = currentGuess.slice(0, -1);
  const tileIndex = guessCount * 5 + currentGuess.length;
  const tile = document.getElementById(`tile-${tileIndex}`);
  tile.textContent = '';
  tile.classList.remove('filled');

  updateUI();
}

function submitGuess() {
  if (currentGuess.length !== 5) {
    showMessage('Word must be 5 letters!', 'error');
    return;
  }

  if (!WORD_LIST.includes(currentGuess)) {
    showMessage('Not a valid word!', 'error');
    return;
  }

  // Reveal the guess
  revealGuess();
  guessCount++;
  currentGuess = '';

  if (guessCount >= 6 || checkWin()) {
    gameOver = true;
  }

  updateUI();
}

function revealGuess() {
  const tiles = [];
  for (let i = 0; i < 5; i++) {
    tiles.push(document.getElementById(`tile-${guessCount * 5 + i}`));
  }

  // Remember which letters have been played, for keyboard colouring
  currentGuess.split('').forEach(l => guessedLetters.add(l));

  // Check each letter
  const targetArray = targetWord.split('');
  const guessArray = currentGuess.split('');
  const results = ['absent', 'absent', 'absent', 'absent', 'absent'];

  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === targetArray[i]) {
      results[i] = 'correct';
      correctLetters.add(guessArray[i]);
      targetArray[i] = null;
      guessArray[i] = null;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] !== null && targetArray.includes(guessArray[i])) {
      results[i] = 'present';
      wrongPositionLetters.add(guessArray[i]);
      targetArray[targetArray.indexOf(guessArray[i])] = null;
    }
  }

  // Apply results with animation
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('reveal');
      tile.classList.add(results[index]);
      updateKeyboard();
    }, index * 100);
  });
}

function updateKeyboard() {
  guessedLetters.forEach(letter => {
    const btn = document.getElementById(`key-${letter}`);
    if (correctLetters.has(letter)) {
      btn.classList.remove('present', 'absent');
      btn.classList.add('correct');
    } else if (wrongPositionLetters.has(letter)) {
      btn.classList.remove('absent');
      btn.classList.add('present');
    } else {
      btn.classList.remove('correct', 'present');
      btn.classList.add('absent');
    }
  });
}

function checkWin() {
  return currentGuess === targetWord;
}

function updateUI() {
  attemptsLeftEl.textContent = Math.max(0, 6 - guessCount);
  bestScoreEl.textContent = bestScore;
  
  const totalGames = wordleStats.wins + wordleStats.losses;
  const winRate = totalGames > 0 ? Math.round((wordleStats.wins / totalGames) * 100) : 0;
  if (winRateEl) winRateEl.textContent = `${winRate}%`;
  if (streakEl) streakEl.textContent = wordleStats.streak;

  if (gameOver) {
    if (currentGuess === targetWord) {
      showMessage(`🎉 You won in ${guessCount} attempt${guessCount !== 1 ? 's' : ''}!`, 'success');
      wordleStats.wins++;
      wordleStats.streak++;
      localStorage.setItem('wordleWins', wordleStats.wins);
      localStorage.setItem('wordleStreak', wordleStats.streak);
      
      if (bestScore === '-' || guessCount < parseInt(bestScore)) {
        bestScore = guessCount;
        localStorage.setItem('wordleBestScore', bestScore);
        bestScoreEl.textContent = bestScore;
      }
    } else {
      showMessage(`Game Over! The word was: ${targetWord}`, 'error');
      wordleStats.losses++;
      wordleStats.streak = 0;
      localStorage.setItem('wordleLosses', wordleStats.losses);
      localStorage.setItem('wordleStreak', wordleStats.streak);
    }
    
    // Re-calculate and update win rate
    const totalGames = wordleStats.wins + wordleStats.losses;
    const winRate = totalGames > 0 ? Math.round((wordleStats.wins / totalGames) * 100) : 0;
    if (winRateEl) winRateEl.textContent = `${winRate}%`;
    if (streakEl) streakEl.textContent = wordleStats.streak;

    document.querySelectorAll('.key').forEach(btn => {
      btn.disabled = true;
    });
  }
}

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;

  if (type === 'error') {
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }, 2000);
  }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  const letter = e.key.toUpperCase();
  if (/^[A-Z]$/.test(letter)) {
    guessLetter(letter);
  } else if (e.key === 'Enter') {
    submitGuess();
  } else if (e.key === 'Backspace') {
    deleteLetter();
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGame);
