// ============================================================================
// HANGMAN GAME
// ============================================================================

const WORD_LIST = [
  'JAVASCRIPT', 'PYTHON', 'PROGRAMMMING', 'DEVELOPER', 'ALGORITHM',
  'FUNCTION', 'VARIABLE', 'BROWSER', 'CONSOLE', 'DATABASE',
  'NETWORK', 'FIREWALL', 'ENCRYPTION', 'PASSWORD', 'USERNAME',
  'KEYBOARD', 'MONITOR', 'PROCESSOR', 'MEMORY', 'STORAGE',
  'INTERNET', 'SERVER', 'CLIENT', 'REQUEST', 'RESPONSE',
  'HEADER', 'BODY', 'FOOTER', 'SIDEBAR', 'CONTENT',
  'STYLESHEET', 'MARKUP', 'FRAMEWORK', 'LIBRARY', 'MODULE',
  'PACKAGE', 'DEPENDENCY', 'VERSION', 'RELEASE', 'COMMIT',
  'BRANCH', 'MERGE', 'CONFLICT', 'RESOLUTION', 'DEBUGGING',
  'TESTING', 'DEPLOYMENT', 'PRODUCTION', 'STAGING', 'DEVELOPMENT',
  'BANANA', 'ORANGE', 'STRAWBERRY', 'WATERMELON', 'PINEAPPLE',
  'ELEPHANT', 'GIRAFFE', 'ZEBRA', 'PENGUIN', 'BUTTERFLY',
  'MOUNTAIN', 'RIVER', 'OCEAN', 'DESERT', 'FOREST',
  'MUSIC', 'DANCING', 'PAINTING', 'THEATER', 'CINEMA',
  'SPORT', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'SWIMMING',
  'COMPUTER', 'TELEPHONE', 'TELEVISION', 'RADIO', 'CAMERA',
  'ADVENTURE', 'BIRTHDAY', 'CHICKEN', 'DIAMOND', 'ECLIPSE',
  'FREEDOM', 'GUITAR', 'HOLIDAY', 'ISLAND', 'JOURNEY',
  'KINGDOM', 'LANGUAGE', 'MYSTERY', 'NATURE', 'ORDINARY'
];

const HANGMAN_STAGES = [
  '🎯', // 0 - start (target)
  '🤔', // 1 - thinking
  '😕', // 2 - worried
  '😟', // 3 - concerned
  '😰', // 4 - scared
  '😭', // 5 - crying
  '💀'  // 6 - game over (death)
];

let targetWord = '';
let guessedLetters = new Set();
let correctLetters = new Set();
let wrongLetters = new Set();
let gameOver = false;
let wins = parseInt(localStorage.getItem('hangmanWins')) || 0;
let losses = parseInt(localStorage.getItem('hangmanLosses')) || 0;

const wordDisplay = document.getElementById('wordDisplay');
const messageEl = document.getElementById('message');
const hangmanDisplay = document.getElementById('hangmanDisplay');
const wrongCountEl = document.getElementById('wrongCount');
const correctCountEl = document.getElementById('correctCount');
const guessedLettersEl = document.getElementById('guessedLetters');

function initGame() {
  targetWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  guessedLetters.clear();
  correctLetters.clear();
  wrongLetters.clear();
  gameOver = false;
  messageEl.textContent = '';
  messageEl.className = 'message';

  updateDisplay();
  createLetterButtons();
}

function createLetterButtons() {
  guessedLettersEl.innerHTML = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  alphabet.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'letter-btn';
    btn.textContent = letter;
    btn.onclick = () => guessLetter(letter, btn);
    guessedLettersEl.appendChild(btn);
  });
}

function guessLetter(letter, btn) {
  if (gameOver || guessedLetters.has(letter)) return;

  guessedLetters.add(letter);
  btn.disabled = true;

  if (targetWord.includes(letter)) {
    correctLetters.add(letter);
    btn.classList.add('correct');
  } else {
    wrongLetters.add(letter);
    btn.classList.add('wrong');
  }

  updateDisplay();
  checkGameStatus();
}

function updateDisplay() {
  // Update word display
  let display = '';
  for (let letter of targetWord) {
    display += correctLetters.has(letter) ? letter : '_';
    display += ' ';
  }
  wordDisplay.textContent = display.trim();

  // Update hangman display and counts
  hangmanDisplay.textContent = HANGMAN_STAGES[wrongLetters.size];
  wrongCountEl.textContent = wrongLetters.size;
  correctCountEl.textContent = correctLetters.size;
}

function checkGameStatus() {
  // Check for win
  let won = true;
  for (let letter of targetWord) {
    if (!correctLetters.has(letter)) {
      won = false;
      break;
    }
  }

  if (won) {
    gameOver = true;
    wins++;
    localStorage.setItem('hangmanWins', wins);
    showMessage(`🎉 You Won! The word was: ${targetWord}`, 'success');
    disableAllButtons();
  }

  // Check for loss
  if (wrongLetters.size >= 6) {
    gameOver = true;
    losses++;
    localStorage.setItem('hangmanLosses', losses);
    showMessage(`💀 Game Over! The word was: ${targetWord}`, 'error');
    disableAllButtons();
  }
}

function disableAllButtons() {
  const buttons = document.querySelectorAll('.letter-btn');
  buttons.forEach(btn => btn.disabled = true);
}

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

function newGame() {
  initGame();
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (gameOver) return;

  const letter = e.key.toUpperCase();
  if (/^[A-Z]$/.test(letter) && !guessedLetters.has(letter)) {
    const btn = Array.from(document.querySelectorAll('.letter-btn')).find(
      b => b.textContent === letter
    );
    if (btn) {
      guessLetter(letter, btn);
    }
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGame);
