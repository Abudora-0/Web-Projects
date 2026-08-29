// ============================================================================
// SIMON SAYS GAME
// ============================================================================

const Colors = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow'
};

let sequence = [];
let playerSequence = [];
let level = 1;
let score = 0;
let bestLevel = parseInt(localStorage.getItem('simonBestLevel')) || 1;
let gameActive = false;
let isPlayerTurn = false;

const messageEl = document.getElementById('message');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const bestLevelEl = document.getElementById('bestLevel');
const startBtn = document.getElementById('startBtn');
const simonBoard = document.getElementById('simonBoard');

const colors = {
  red: { sound: 'do', frequency: 262 },
  blue: { sound: 're', frequency: 330 },
  green: { sound: 'mi', frequency: 392 },
  yellow: { sound: 'fa', frequency: 440 }
};

let audioContext;

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(color) {
  initAudioContext();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = colors[color].frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

function flashButton(color) {
  return new Promise(resolve => {
    const button = document.querySelector(`[data-color="${color}"]`);
    
    playSound(color);
    button.classList.add('active');
    
    setTimeout(() => {
      button.classList.remove('active');
      setTimeout(resolve, 200);
    }, 500);
  });
}

async function playSequence() {
  isPlayerTurn = false;
  disableButtons();
  
  for (let color of sequence) {
    await flashButton(color);
  }
  
  isPlayerTurn = true;
  enableButtons();
}

function addToSequence() {
  const colors = Object.values(Colors);
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  sequence.push(randomColor);
}

function playerPress(button) {
  if (!gameActive || !isPlayerTurn) return;
  
  const color = button.getAttribute('data-color');
  playerSequence.push(color);
  
  flashButton(color);
  
  if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
    gameOver();
    return;
  }
  
  if (playerSequence.length === sequence.length) {
    playerSequence = [];
    score += 10;
    level++;
    scoreEl.textContent = score;
    levelEl.textContent = level;
    
    if (level > bestLevel) {
      bestLevel = level;
      localStorage.setItem('simonBestLevel', bestLevel);
      bestLevelEl.textContent = bestLevel;
    }
    
    isPlayerTurn = false;
    disableButtons();
    
    setTimeout(() => {
      addToSequence();
      playSequence();
    }, 1000);
  }
}

function startGame() {
  sequence = [];
  playerSequence = [];
  level = 1;
  score = 0;
  gameActive = true;
  isPlayerTurn = false;
  
  levelEl.textContent = level;
  scoreEl.textContent = score;
  bestLevelEl.textContent = bestLevel;
  messageEl.textContent = '';
  messageEl.className = 'message';
  
  startBtn.disabled = true;
  startBtn.textContent = 'Game Running...';
  
  addToSequence();
  playSequence();
}

function gameOver() {
  gameActive = false;
  isPlayerTurn = false;
  enableButtons();
  
  showMessage(`Game Over! You reached level ${level}!`, 'error');
  startBtn.disabled = false;
  startBtn.textContent = 'Start Game';
}

function showMessage(text, type = 'message') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

function enableButtons() {
  document.querySelectorAll('.simon-pad').forEach(btn => {
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
  });
}

function disableButtons() {
  document.querySelectorAll('.simon-pad').forEach(btn => {
    btn.style.cursor = 'not-allowed';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  bestLevelEl.textContent = bestLevel;
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!gameActive || !isPlayerTurn) return;
  
  const keyMap = {
    '1': 'red',
    '2': 'blue',
    '3': 'green',
    '4': 'yellow',
    'q': 'red',
    'w': 'blue',
    'a': 'green',
    's': 'yellow'
  };
  
  const color = keyMap[e.key.toLowerCase()];
  if (color) {
    const button = document.querySelector(`[data-color="${color}"]`);
    playerPress(button);
  }
});
