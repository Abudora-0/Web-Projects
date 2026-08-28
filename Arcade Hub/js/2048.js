// ============================================================================
// 2048 GAME
// ============================================================================

const GRID_SIZE = 4;
const WIN_TILE = 2048;

let board = [];
let score = 0;
let bestScore = localStorage.getItem('2048BestScore') || 0;
let gameOver = false;
let won = false;
let mergedThisMove = new Set();
let newTilePos = null;

const gameGrid = document.getElementById('gameGrid');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const messageEl = document.getElementById('message');

// Initialize
function initGame() {
  board = Array(GRID_SIZE)
    .fill()
    .map(() => Array(GRID_SIZE).fill(0));

  score = 0;
  gameOver = false;
  won = false;
  mergedThisMove = new Set();
  newTilePos = null;

  addNewTile();
  addNewTile();

  updateDisplay();
  bestScoreEl.textContent = bestScore;
}

function newGame() {
  initGame();
  messageEl.textContent = '';
  messageEl.className = 'message';
}

function addNewTile() {
  const emptyTiles = [];

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] === 0) {
        emptyTiles.push({ row: i, col: j });
      }
    }
  }

  if (emptyTiles.length === 0) return;

  const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  board[randomTile.row][randomTile.col] = Math.random() < 0.9 ? 2 : 4;
  newTilePos = randomTile;
}

function updateDisplay() {
  // Clear grid
  gameGrid.innerHTML = '';

  // Create tiles
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const value = board[i][j];
      const tile = document.createElement('div');
      let className = value === 0 ? 'tile empty' : 'tile';
      if (mergedThisMove.has(`${i},${j}`)) {
        className += ' merge';
      } else if (newTilePos && newTilePos.row === i && newTilePos.col === j) {
        className += ' move';
      }
      tile.className = className;
      tile.textContent = value > 0 ? value : '';
      tile.setAttribute('data-value', value);
      gameGrid.appendChild(tile);
    }
  }

  scoreEl.textContent = score;
}

function move(direction) {
  if (gameOver || won) return;

  let moved = false;
  mergedThisMove = new Set();
  newTilePos = null;

  if (direction === 'left') {
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = board[i];
      const { line: newRow, mergedIndices } = slideAndMerge(row);
      if (!arraysEqual(row, newRow)) {
        moved = true;
      }
      mergedIndices.forEach(idx => mergedThisMove.add(`${i},${idx}`));
      board[i] = newRow;
    }
  } else if (direction === 'right') {
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = board[i].reverse();
      const { line: newRow, mergedIndices } = slideAndMerge(row);
      if (!arraysEqual(row, newRow)) {
        moved = true;
      }
      mergedIndices.forEach(idx => mergedThisMove.add(`${i},${GRID_SIZE - 1 - idx}`));
      board[i] = newRow.reverse();
    }
  } else if (direction === 'up') {
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = board.map(row => row[j]);
      const { line: newCol, mergedIndices } = slideAndMerge(col);
      if (!arraysEqual(col, newCol)) {
        moved = true;
      }
      mergedIndices.forEach(idx => mergedThisMove.add(`${idx},${j}`));
      for (let i = 0; i < GRID_SIZE; i++) {
        board[i][j] = newCol[i];
      }
    }
  } else if (direction === 'down') {
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = board.map(row => row[j]).reverse();
      const { line: newCol, mergedIndices } = slideAndMerge(col);
      if (!arraysEqual(col, newCol)) {
        moved = true;
      }
      mergedIndices.forEach(idx => mergedThisMove.add(`${GRID_SIZE - 1 - idx},${j}`));
      const newColReversed = newCol.reverse();
      for (let i = 0; i < GRID_SIZE; i++) {
        board[i][j] = newColReversed[i];
      }
    }
  }

  if (moved) {
    addNewTile();
    updateDisplay();
    checkGameStatus();
  }
}

function slideAndMerge(line) {
  // Remove zeros
  let newLine = line.filter(val => val !== 0);
  const mergedIndices = [];

  // Merge adjacent tiles
  for (let i = 0; i < newLine.length - 1; i++) {
    if (newLine[i] === newLine[i + 1] && newLine[i] !== 0) {
      newLine[i] *= 2;
      score += newLine[i];
      newLine.splice(i + 1, 1);
      mergedIndices.push(i);
    }
  }

  // Add zeros back
  while (newLine.length < GRID_SIZE) {
    newLine.push(0);
  }

  return { line: newLine, mergedIndices };
}

function arraysEqual(arr1, arr2) {
  return arr1.every((val, i) => val === arr2[i]);
}

function checkGameStatus() {
  // Check for win
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] === WIN_TILE && !won) {
        won = true;
        showMessage('🎉 You reached 2048!', 'success');
        if (score > bestScore) {
          bestScore = score;
          localStorage.setItem('2048BestScore', bestScore);
          bestScoreEl.textContent = bestScore;
        }
        return;
      }
    }
  }

  // Check for game over
  if (isGameOver()) {
    gameOver = true;
    showMessage(`Game Over! Final Score: ${score}`, 'error');
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('2048BestScore', bestScore);
      bestScoreEl.textContent = bestScore;
    }
  }
}

function isGameOver() {
  // Check if there are any empty tiles
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (board[i][j] === 0) {
        return false;
      }
    }
  }

  // Check if any moves are possible
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const tile = board[i][j];

      // Check horizontal
      if (j < GRID_SIZE - 1 && board[i][j + 1] === tile) {
        return false;
      }

      // Check vertical
      if (i < GRID_SIZE - 1 && board[i + 1][j] === tile) {
        return false;
      }
    }
  }

  return true;
}

function showMessage(text, type = 'error') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    move('up');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    move('down');
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    move('left');
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    move('right');
  }
});

// Touch/Swipe controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

gameGrid.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

gameGrid.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

gameGrid.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].clientX;
  touchEndY = e.changedTouches[0].clientY;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  // Positive diffX = finger moved right; positive diffY = finger moved down.
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  const threshold = 30;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > threshold) {
      move('right');
    } else if (diffX < -threshold) {
      move('left');
    }
  } else {
    // Vertical swipe
    if (diffY > threshold) {
      move('down');
    } else if (diffY < -threshold) {
      move('up');
    }
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);
