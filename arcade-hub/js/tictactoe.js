// ============================================================================
// TIC TAC TOE GAME
// ============================================================================

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameOver = false;
let difficulty = 'easy';

let stats = {
  wins: parseInt(localStorage.getItem('tttWins')) || 0,
  draws: parseInt(localStorage.getItem('tttDraws')) || 0,
  losses: parseInt(localStorage.getItem('tttLosses')) || 0
};

const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const winsEl = document.getElementById('wins');
const drawsEl = document.getElementById('draws');
const lossesEl = document.getElementById('losses');

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function initGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameOver = false;
  messageEl.textContent = '';
  messageEl.className = 'message';

  renderBoard();
  updateStats();
}

function renderBoard() {
  boardEl.innerHTML = '';

  board.forEach((cell, index) => {
    const cellBtn = document.createElement('button');
    cellBtn.className = `cell ${cell.toLowerCase()}`;
    cellBtn.textContent = cell;
    cellBtn.disabled = cell !== '';
    cellBtn.onclick = () => playerMove(index);
    boardEl.appendChild(cellBtn);
  });
}

function playerMove(index) {
  if (board[index] !== '' || gameOver) return;

  board[index] = 'X';
  
  if (checkWin('X')) {
    endGame('You Win! 🎉', 'win');
    stats.wins++;
    localStorage.setItem('tttWins', stats.wins);
  } else if (isBoardFull()) {
    endGame("It's a Draw! 🤝", 'draw');
    stats.draws++;
    localStorage.setItem('tttDraws', stats.draws);
  } else {
    setTimeout(aiMove, 500);
  }

  renderBoard();
}

function aiMove() {
  let moveIndex;

  if (difficulty === 'easy') {
    moveIndex = getRandomMove();
  } else if (difficulty === 'medium') {
    moveIndex = Math.random() < 0.5 ? getBestMove() : getRandomMove();
  } else {
    moveIndex = getBestMove();
  }

  if (moveIndex !== -1) {
    board[moveIndex] = 'O';

    if (checkWin('O')) {
      endGame('AI Wins! 🤖', 'error');
      stats.losses++;
      localStorage.setItem('tttLosses', stats.losses);
    } else if (isBoardFull()) {
      endGame("It's a Draw! 🤝", 'draw');
      stats.draws++;
      localStorage.setItem('tttDraws', stats.draws);
    }
  }

  renderBoard();
}

function getRandomMove() {
  const availableMoves = board
    .map((cell, index) => (cell === '' ? index : null))
    .filter(index => index !== null);

  return availableMoves.length > 0
    ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
    : -1;
}

function getBestMove() {
  // Check if AI can win
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      if (checkWin('O')) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }

  // Check if player can win and block
  for (let i = 0; i < 9; i++) {
    if (board[i] === '') {
      board[i] = 'X';
      if (checkWin('X')) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }

  // Take center if available
  if (board[4] === '') return 4;

  // Take corners
  const corners = [0, 2, 6, 8].filter(i => board[i] === '');
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Take any available
  return getRandomMove();
}

function checkWin(player) {
  return WINNING_COMBINATIONS.some(combo =>
    combo.every(index => board[index] === player)
  );
}

function isBoardFull() {
  return board.every(cell => cell !== '');
}

function endGame(message, type) {
  gameOver = true;
  messageEl.textContent = message;
  messageEl.className = `message ${type}`;

  setTimeout(updateStats, 300);
}

function updateStats() {
  winsEl.textContent = stats.wins;
  drawsEl.textContent = stats.draws;
  lossesEl.textContent = stats.losses;
}

function setDifficulty(level) {
  difficulty = level;
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  newGame();
}

function newGame() {
  initGame();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initGame();
  updateStats();
});
