// ============================================================================
// QUIZ MASTER GAME
// ============================================================================

const allQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Madrid"],
    correct: 1
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correct: 3
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
    correct: 1
  },
  {
    question: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct: 2
  },
  {
    question: "In what year did the Titanic sink?",
    options: ["1911", "1912", "1913", "1914"],
    correct: 1
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
    correct: 2
  },
  {
    question: "How many strings does a standard violin have?",
    options: ["3", "4", "5", "6"],
    correct: 1
  },
  {
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Greyhound", "Pronghorn"],
    correct: 1
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Beryllium"],
    correct: 1
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Tokyo", "Bangkok", "Beijing"],
    correct: 1
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    question: "Who wrote Romeo and Juliet?",
    options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"],
    correct: 2
  },
  {
    question: "What is the boiling point of water in Celsius?",
    options: ["90°C", "100°C", "110°C", "120°C"],
    correct: 1
  },
  {
    question: "Which country is home to the Great Wall?",
    options: ["Japan", "India", "China", "Korea"],
    correct: 2
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correct: 2
  },
  {
    question: "Who is the author of Harry Potter?",
    options: ["J.K. Rowling", "George R.R. Martin", "Stephen King", "J.R.R. Tolkien"],
    correct: 0
  },
  {
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correct: 2
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correct: 1
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correct: 1
  },
  {
    question: "In which year did the Titanic sink?",
    options: ["1910", "1912", "1914", "1916"],
    correct: 1
  },
  {
    question: "What is the capital of Brazil?",
    options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
    correct: 2
  },
  {
    question: "How many bones does an adult human have?",
    options: ["186", "206", "226", "246"],
    correct: 1
  },
  {
    question: "What is the smallest continent?",
    options: ["Europe", "Asia", "Australia", "Antarctica"],
    correct: 2
  },
  {
    question: "Who invented the telephone?",
    options: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Benjamin Franklin"],
    correct: 1
  },
  {
    question: "What is the capital of India?",
    options: ["Mumbai", "New Delhi", "Bangalore", "Hyderabad"],
    correct: 1
  },
  {
    question: "How many strings does a guitar have?",
    options: ["4", "5", "6", "7"],
    correct: 2
  },
  {
    question: "What is the tallest mountain in the world?",
    options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"],
    correct: 2
  },
  {
    question: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
    correct: 1
  },
  {
    question: "What is the speed of light?",
    options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
    correct: 0
  }
];

let questions = [];
let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let quizRunning = false;
let bestScore = localStorage.getItem('quizBestScore') || 0;

const quizContainer = document.getElementById('quizContainer');
const resultsContainer = document.getElementById('results');
const messageEl = document.getElementById('message');
const scoreEl = document.getElementById('score');
const correctEl = document.getElementById('correct');
const bestScoreEl = document.getElementById('bestScore');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const questionNumberEl = document.getElementById('questionNumber');
const finalScoreEl = document.getElementById('finalScore');
const resultsMessageEl = document.getElementById('resultsMessage');

bestScoreEl.textContent = bestScore;

function selectRandomQuestions() {
  // Shuffle the allQuestions array and select first 10
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}

function startQuiz() {
  questions = selectRandomQuestions();
  currentQuestion = 0;
  score = 0;
  correctCount = 0;
  quizRunning = true;
  messageEl.textContent = '';
  
  quizContainer.style.display = 'block';
  resultsContainer.classList.remove('show');
  
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestion >= questions.length) {
    endQuiz();
    return;
  }

  const q = questions[currentQuestion];
  questionEl.textContent = q.question;
  questionNumberEl.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  
  optionsEl.innerHTML = '';
  q.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => selectOption(index);
    optionsEl.appendChild(btn);
  });

  messageEl.textContent = '';
}

function selectOption(index) {
  if (!quizRunning) return;

  const q = questions[currentQuestion];
  const optionBtns = document.querySelectorAll('.option-btn');

  // Disable all buttons
  optionBtns.forEach(btn => btn.disabled = true);

  if (index === q.correct) {
    optionBtns[index].classList.add('correct');
    messageEl.textContent = '✓ Correct!';
    messageEl.className = 'message success';
    score += 10;
    correctCount++;
  } else {
    optionBtns[index].classList.add('incorrect');
    optionBtns[q.correct].classList.add('correct');
    messageEl.textContent = '✗ Wrong!';
    messageEl.className = 'message error';
    score += 0;
  }

  scoreEl.textContent = score;
  correctEl.textContent = correctCount;

  // Move to next question after delay
  setTimeout(() => {
    currentQuestion++;
    loadQuestion();
  }, 1500);
}

function endQuiz() {
  quizRunning = false;
  quizContainer.style.display = 'none';
  resultsContainer.classList.add('show');

  finalScoreEl.textContent = score;
  
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('quizBestScore', bestScore);
    bestScoreEl.textContent = bestScore;
    resultsMessageEl.innerHTML = `<strong>🎉 New Best Score!</strong><br>You got ${correctCount} out of ${questions.length} questions correct!`;
  } else {
    resultsMessageEl.textContent = `You got ${correctCount} out of ${questions.length} questions correct!`;
  }
}

// Initialize on page load
window.addEventListener('load', () => {
  const savedBestScore = localStorage.getItem('quizBestScore');
  if (savedBestScore) {
    bestScore = parseInt(savedBestScore);
    bestScoreEl.textContent = bestScore;
  }
});
