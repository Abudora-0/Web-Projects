// ============================================================================
// MEMORY GAME
// ============================================================================

const symbols = ['🍎', '🍌', '🍇', '🍒', '🍉', '🥝', '🍓', '🍑'];
let cards = [...symbols, ...symbols].sort(() => 0.5 - Math.random());
let firstCard = null;
let secondCard = null;
let lock = false;
let moves = 0;
let matchedPairs = 0;
let gameStarted = false;
let startTime = null;
let timerInterval = null;

const board = document.getElementById('memory-board');
const movesDisplay = document.getElementById('moves');
const matchesDisplay = document.getElementById('matches');
const timerDisplay = document.getElementById('timer');

// Initialize board
function initializeBoard() {
  board.innerHTML = '';
  cards.forEach((symbol, index) => {
    const card = document.createElement('button');
    card.className = 'memory-card';
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.textContent = '?';

    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });
}

function flipCard(e) {
  // Start timer on first flip
  if (!gameStarted) {
    gameStarted = true;
    startTime = Date.now();
    startTimer();
  }

  const card = e.target;

  // Prevent clicking already matched cards or same card twice
  if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) {
    return;
  }

  card.textContent = card.dataset.symbol;
  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
  } else if (!secondCard && card !== firstCard) {
    secondCard = card;
    moves++;
    movesDisplay.textContent = moves;

    // Check if cards match
    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
      lock = true;
      setTimeout(matchCards, 300);
    } else {
      lock = true;
      setTimeout(unflipCards, 800);
    }
  }
}

function matchCards() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  firstCard.classList.remove('flipped');
  secondCard.classList.remove('flipped');

  matchedPairs++;
  matchesDisplay.textContent = `${matchedPairs}/8`;

  resetCards();

  // Check if game is won
  if (matchedPairs === symbols.length) {
    gameWon();
  }
}

function unflipCards() {
  firstCard.textContent = '?';
  secondCard.textContent = '?';
  firstCard.classList.remove('flipped');
  secondCard.classList.remove('flipped');

  resetCards();
}

function resetCards() {
  firstCard = null;
  secondCard = null;
  lock = false;
}

function startTimer() {
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function gameWon() {
  stopTimer();
  lock = true;

  const elapsedTime = timerDisplay.textContent;
  const bestTime = localStorage.getItem('memoryBestTime');

  // Update best time if it's the first game or better than previous
  if (!bestTime || parseFloat(timerDisplay.textContent) < parseFloat(bestTime)) {
    localStorage.setItem('memoryBestTime', timerDisplay.textContent);
    document.getElementById('bestTime').textContent = timerDisplay.textContent;
  } else if (bestTime) {
    document.getElementById('bestTime').textContent = bestTime;
  }

  setTimeout(() => {
    gameUtils.showNotification(`🎉 You won in ${moves} moves and ${elapsedTime}! Amazing!`, 'success');
  }, 500);
}

function resetGame() {
  cards = [...symbols, ...symbols].sort(() => 0.5 - Math.random());
  firstCard = null;
  secondCard = null;
  lock = false;
  moves = 0;
  matchedPairs = 0;
  gameStarted = false;
  startTime = null;

  movesDisplay.textContent = '0';
  matchesDisplay.textContent = '0/8';
  timerDisplay.textContent = '00:00';

  stopTimer();
  initializeBoard();

  // Load best time from localStorage
  const bestTime = localStorage.getItem('memoryBestTime');
  if (bestTime) {
    document.getElementById('bestTime').textContent = bestTime;
  }
}

// Load best time on page load
window.addEventListener('load', () => {
  const bestTime = localStorage.getItem('memoryBestTime');
  if (bestTime) {
    document.getElementById('bestTime').textContent = bestTime;
  }
  initializeBoard();
});

