const board = document.querySelector(".board");
const scoreUp = document.getElementById("score");
const timeEl = document.getElementById("time");
const highScoreEl = document.getElementById("high-score");
const restartBtn = document.getElementById("restart");
const pauseBtn = document.getElementById("pause");
const msgEl = document.getElementById("message");
const eatSound = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3",
);
const overSound = new Audio(
  "https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3",
);
let highScore = localStorage.getItem("snake-high-score") || 0;
let blockSize = 30;
let cols, rows;
let blocks;
let snake;
let direction;
let foodIndex = null;
let speed;
let score;
let gameInterval = null;
let isGameOver = false;
let isPaused = false;
let seconds = 0;
let timerInterval = null;
function CreateBoard() {
  cols = Math.floor(board.clientWidth / blockSize);
  rows = Math.floor(board.clientHeight / blockSize);
  board.style.setProperty("--cols", cols);
  board.style.setProperty("--rows", rows);
  board.innerHTML = "";
  const totalBlocks = cols * rows;
  for (let i = 0; i < totalBlocks; i++) {
    const block = document.createElement("div");
    block.className = "block";
    board.appendChild(block);
  }
  blocks = document.querySelectorAll(".block");
}
highScoreEl.innerText = highScore;
CreateBoard();
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  timeEl.innerText = formatTime(seconds);

  timerInterval = setInterval(() => {
    if (!isPaused && !isGameOver) {
      seconds++;
      timeEl.innerText = formatTime(seconds);
    }
  }, 1000);
}
function startGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  snake = [5, 4, 3];
  direction = 1;
  foodIndex = null;
  speed = 300;
  score = 0;
  isGameOver = false;
  isPaused = false;
  scoreUp.innerText = score;
  msgEl.innerText = "";
  pauseBtn.innerText = "Pause";
  blocks.forEach((b) => b.classList.remove("snake", "food"));
  drawSnake();
  generateFood();
  startTimer();
  gameInterval = setInterval(moveSnake, speed);
}
function drawSnake() {
  snake.forEach((index) => {
    if (blocks[index]) blocks[index].classList.add("snake");
  });
    if (blocks[snake[0]]) {
    blocks[snake[0]].classList.add("head");
  }
}
function gameOver() {
  if (isGameOver) return;
  isGameOver = true;
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  try {
    overSound.currentTime = 0;
    overSound.play();
  } catch (e) {}
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snake-high-score", highScore);
    highScoreEl.innerText = highScore;
    msgEl.innerText = `New High Score! ${score}`;
  } else {
    msgEl.innerText = `Game Over! Score: ${score}`;
  }
}
function moveSnake() {
  if (isGameOver || isPaused) return;
  blocks[snake[0]].classList.remove("head");
  const head = snake[0];
  const tail = snake[snake.length - 1];
  const newHead = head + direction;
  if (direction === -cols && head < cols) return gameOver();
  if (direction === cols && head >= blocks.length - cols) return gameOver();
  if (direction === -1 && head % cols === 0) return gameOver();
  if (direction === 1 && head % cols === cols - 1) return gameOver();
  if (snake.includes(newHead) && newHead !== tail) return gameOver();
  snake.unshift(newHead);
  blocks[newHead].classList.add("snake");
  blocks[newHead].classList.add("head");
  if (newHead === foodIndex) {
    score++;
    scoreUp.innerText = score;
    eatSound.currentTime = 0;
    eatSound.play();
    generateFood();
    updateSpeed();
  } else {
    const removedTail = snake.pop();
    blocks[removedTail].classList.remove("snake");
  }
}
function updateSpeed() {
  clearInterval(gameInterval);
  speed = 300 - Math.floor(score / 5) * 20;
  if (speed < 60) speed = 60;

  gameInterval = setInterval(moveSnake, speed);
}
function generateFood() {
  if (foodIndex !== null) blocks[foodIndex].classList.remove("food");
  do {
    foodIndex = Math.floor(Math.random() * blocks.length);
  } while (snake.includes(foodIndex));
  blocks[foodIndex].classList.add("food");
}
function handleKeyPress(event) {
  if (isGameOver) return;
  const goingRight = direction === 1;
  const goingLeft = direction === -1;
  const goingDown = direction === cols;
  const goingUp = direction === -cols;
  switch (event.key) {
    case "ArrowUp":
      if (!goingDown) direction = -cols;
      break;
    case "ArrowDown":
      if (!goingUp) direction = cols;
      break;
    case "ArrowLeft":
      if (!goingRight) direction = -1;
      break;
    case "ArrowRight":
      if (!goingLeft) direction = 1;
      break;
    case " ":
      togglePause();
      break;
  }
}
document.addEventListener("keydown", handleKeyPress);
function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  if (isPaused) {
    msgEl.innerText = "Paused";
    pauseBtn.innerText = "Resume";
  } else {
    msgEl.innerText = "";
    pauseBtn.innerText = "Pause";
  }
}
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);
let touchStartX = 0;
let touchStartY = 0;
board.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

board.addEventListener("touchend", (e) => {
  if (isGameOver) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const minSwipe = 25;
  if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;
  const goingRight = direction === 1;
  const goingLeft = direction === -1;
  const goingDown = direction === cols;
  const goingUp = direction === -cols;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && !goingLeft) direction = 1;
    else if (dx < 0 && !goingRight) direction = -1;
  } else {
    if (dy > 0 && !goingUp) direction = cols;
    else if (dy < 0 && !goingDown) direction = -cols;
  }
});
window.addEventListener("resize", () => {
  CreateBoard();
  startGame();
});
startGame();
