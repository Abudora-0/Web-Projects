// ============================================================================
// SNAKE GAME
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let difficulty = 1;
let gameSpeed = 100;
let gameLoopInterval = null;
let foodPulse = 0;

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');
const startBtn = document.getElementById('startBtn');
const levelDisplay = document.getElementById('level');

// Initialize high score display
highScoreDisplay.textContent = highScore;

// ============================================================================
// GAME CONTROLS
// ============================================================================

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
  const key = e.key.toLowerCase();

  // Arrow keys
  if (e.key === 'ArrowUp' && dy === 0) {
    nextDx = 0;
    nextDy = -1;
    e.preventDefault();
  }
  if (e.key === 'ArrowDown' && dy === 0) {
    nextDx = 0;
    nextDy = 1;
    e.preventDefault();
  }
  if (e.key === 'ArrowLeft' && dx === 0) {
    nextDx = -1;
    nextDy = 0;
    e.preventDefault();
  }
  if (e.key === 'ArrowRight' && dx === 0) {
    nextDx = 1;
    nextDy = 0;
    e.preventDefault();
  }

  // WASD keys
  if (key === 'w' && dy === 0) {
    nextDx = 0;
    nextDy = -1;
  }
  if (key === 's' && dy === 0) {
    nextDx = 0;
    nextDy = 1;
  }
  if (key === 'a' && dx === 0) {
    nextDx = -1;
    nextDy = 0;
  }
  if (key === 'd' && dx === 0) {
    nextDx = 1;
    nextDy = 0;
  }

  // Space to pause
  if (key === ' ') {
    e.preventDefault();
    togglePause();
  }
}

// ============================================================================
// GAME FUNCTIONS
// ============================================================================

function setDifficulty(level) {
  if (gameRunning) return;

  difficulty = level;
  const difficultyMap = {
    1: { speed: 100, color: '#10b981' },
    2: { speed: 70, color: '#f59e0b' },
    3: { speed: 40, color: '#ef4444' },
    4: { speed: 20, color: '#8b5cf6' },
  };

  gameSpeed = difficultyMap[level].speed;
  levelDisplay.textContent = level;

  // Update button styles
  document.querySelectorAll('.difficulty-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

function toggleGame() {
  if (!gameRunning) {
    startGame();
  } else {
    endGame();
  }
}

function togglePause() {
  if (gameRunning) {
    gamePaused = !gamePaused;
    gameStatusDisplay.textContent = gamePaused ? 'Paused' : 'Playing';
  }
}

function startGame() {
  gameRunning = true;
  gamePaused = false;
  gameStatusDisplay.textContent = 'Playing';
  startBtn.textContent = 'Pause Game';

  gameLoopInterval = setInterval(update, gameSpeed);
}

function endGame() {
  gameRunning = false;
  gamePaused = false;
  gameStatusDisplay.textContent = 'Paused';
  startBtn.textContent = 'Resume';
  clearInterval(gameLoopInterval);
}

function resetSnake() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  scoreDisplay.textContent = '0';
  gameStatusDisplay.textContent = 'Ready';
  gameRunning = false;
  gamePaused = false;
  startBtn.textContent = 'Start Game';
  clearInterval(gameLoopInterval);
  draw();
}

function generateFood() {
  let newFood;
  let foodOnSnake;

  do {
    foodOnSnake = false;
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    for (let segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        foodOnSnake = true;
        break;
      }
    }
  } while (foodOnSnake);

  return newFood;
}

function update() {
  if (gamePaused) return;

  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Check wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Check self collision
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10 * difficulty;
    scoreDisplay.textContent = score;
    food = generateFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameLoopInterval);
  gameStatusDisplay.textContent = 'Game Over';
  startBtn.textContent = 'Start Game';

  // Check and update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreDisplay.textContent = highScore;
    gameUtils.showNotification(`🎉 New High Score: ${score}!`, 'success');
  } else {
    gameUtils.showNotification(`Game Over! Score: ${score}`, 'success');
  }
}

// Nokia 3310 LCD palette (must match --lcd-bg / --lcd-ink in css/style.css;
// canvas fillStyle can't read CSS custom properties directly)
const LCD_BG = '#1d1038';
const LCD_INK = '#00d4ff';
const LCD_GRID = 'rgba(0, 212, 255, 0.12)';

function draw() {
  ctx.fillStyle = LCD_BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dot-matrix grid
  ctx.strokeStyle = LCD_GRID;
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    const coord = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(coord, 0);
    ctx.lineTo(coord, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, coord);
    ctx.lineTo(canvas.width, coord);
    ctx.stroke();
  }

  // Draw snake as flat ink pixel blocks
  ctx.fillStyle = LCD_INK;
  snake.forEach((segment) => {
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });

  // Head gets a small light "eye" so direction reads at a glance
  const head = snake[0];
  ctx.fillStyle = LCD_BG;
  const eyeSize = 3;
  const eyeOffsets = {
    0: { x: 6, y: 4 },  // up
    1: { x: 13, y: 6 }, // right
    2: { x: 6, y: 13 }, // down
    3: { x: 4, y: 6 },  // left
  };
  let direction = 0;
  if (dx === 0 && dy === -1) direction = 0;
  else if (dx === 1 && dy === 0) direction = 1;
  else if (dx === 0 && dy === 1) direction = 2;
  else if (dx === -1 && dy === 0) direction = 3;
  const eye = eyeOffsets[direction];
  ctx.fillRect(head.x * gridSize + eye.x, head.y * gridSize + eye.y, eyeSize, eyeSize);

  // Draw food as a solid ink square (classic Nokia Snake "apple")
  foodPulse += 0.05;
  const foodSize = gridSize - 6 + Math.sin(foodPulse) * 2;
  const foodOffset = (gridSize - foodSize) / 2;
  ctx.fillStyle = LCD_INK;
  ctx.fillRect(
    food.x * gridSize + foodOffset,
    food.y * gridSize + foodOffset,
    foodSize,
    foodSize
  );
}

// ============================================================================
// TOUCH CONTROLS - swipe on the screen + on-screen D-pad
// ============================================================================

// Queue a direction change, honouring the no-180-turn rule (same guard the
// keyboard handler uses: dx/dy hold the last committed heading).
function queueDir(d) {
  if (d === 'up' && dy === 0)    { nextDx = 0;  nextDy = -1; }
  if (d === 'down' && dy === 0)  { nextDx = 0;  nextDy = 1; }
  if (d === 'left' && dx === 0)  { nextDx = -1; nextDy = 0; }
  if (d === 'right' && dx === 0) { nextDx = 1;  nextDy = 0; }
}

// Start (or restart after a game over) on the first steer, so a swipe/tap
// is all it takes to get going.
function ensureRunning() {
  if (gameRunning) return;
  if (gameStatusDisplay.textContent === 'Game Over') resetSnake();
  startGame();
}

document.querySelectorAll('.dpad-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    ensureRunning();
    queueDir(btn.dataset.dir);
  });
});

let swipeStartX = 0;
let swipeStartY = 0;
canvas.addEventListener('touchstart', (e) => {
  const t = e.changedTouches[0];
  swipeStartX = t.clientX;
  swipeStartY = t.clientY;
}, { passive: true });

canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

canvas.addEventListener('touchend', (e) => {
  const t = e.changedTouches[0];
  const dX = t.clientX - swipeStartX;
  const dY = t.clientY - swipeStartY;
  if (Math.max(Math.abs(dX), Math.abs(dY)) < 24) return;
  ensureRunning();
  if (Math.abs(dX) > Math.abs(dY)) queueDir(dX > 0 ? 'right' : 'left');
  else queueDir(dY > 0 ? 'down' : 'up');
}, { passive: true });

// Initial draw
draw();

