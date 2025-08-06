const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const gameOverDisplay = document.getElementById("gameOver");
const pausedMsg = document.getElementById("pausedMsg");
const restartBtn = document.getElementById("restartBtn");
const backToMenuBtn = document.getElementById("backToMenuBtn");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const startMenu = document.getElementById("startMenu");
const gameContainer = document.getElementById("gameContainer");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake, food, velocity, lastDirection, score, gameLoop, speed;
let isPaused = false;
let isGameOver = false;
let currentMode = "";
let highScore = localStorage.getItem('snakeHighScore') || 0;

// === Game Initialization ===
function initGame(mode) {
  currentMode = mode;
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  velocity = { x: 1, y: 0 };
  lastDirection = { x: 1, y: 0 };
  score = 0;
  speed = 150;
  scoreDisplay.innerText = "🎯 Score: 0";
  highScoreDisplay.innerText = "🏆 High Score: " + highScore;
  gameOverDisplay.style.display = "none";
  pausedMsg.style.display = "none";
  restartBtn.style.display = "none";
  backToMenuBtn.style.display = "none";
  isPaused = false;
  isGameOver = false;

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(drawGame, speed);

  startMenu.style.display = "none";
  gameContainer.style.display = "block";
}

function generateFood() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
  };
}

// === Game Drawing ===
function drawGame() {
  if (isPaused) return;

  let head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  // Wrap around logic for enhanced mode
  if (currentMode === "enhanced") {
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    food = generateFood();
    score++;
    scoreDisplay.innerText = "🎯 Score: " + score;

    if (score % 5 === 0 && speed > 50) {
      clearInterval(gameLoop);
      speed -= 10;
      gameLoop = setInterval(drawGame, speed);
    }

  } else {
    snake.pop();
  }

  if (checkCollision(head)) {
    clearInterval(gameLoop);
    isGameOver = true;
    gameOverSound.play();
    gameOverDisplay.style.display = "block";
    restartBtn.style.display = "inline-block";
    backToMenuBtn.style.display = "inline-block";

    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore);
      highScoreDisplay.innerText = "🏆 High Score: " + highScore;
    }
    return;
  }

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (currentMode === "classic") drawWalls();

  ctx.fillStyle = "#0f0";
  snake.forEach(part => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
  });

  ctx.fillStyle = food.color;
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  lastDirection = { ...velocity };
}

function checkCollision(head) {
  // Classic mode collision with walls and itself
  if (currentMode === "classic") {
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
    if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) return true;
  }
  // Enhanced mode only checks for collision with itself
  else if (currentMode === "enhanced") {
    if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) return true;
  }
  return false;
}

function drawWalls() {
  ctx.fillStyle = "#800";
  for (let i = 0; i < tileCount; i++) {
    ctx.fillRect(0 * gridSize, i * gridSize, gridSize, gridSize);
    ctx.fillRect((tileCount - 1) * gridSize, i * gridSize, gridSize, gridSize);
    ctx.fillRect(i * gridSize, 0 * gridSize, gridSize, gridSize);
    ctx.fillRect(i * gridSize, (tileCount - 1) * gridSize, gridSize, gridSize);
  }
}

// === Controls ===
function changeDirection(e) {
  const newDirection = { x: velocity.x, y: velocity.y };
  switch (e.key) {
    case "ArrowUp":
      if (lastDirection.y !== 1) newDirection.x = 0, newDirection.y = -1;
      break;
    case "ArrowDown":
      if (lastDirection.y !== -1) newDirection.x = 0, newDirection.y = 1;
      break;
    case "ArrowLeft":
      if (lastDirection.x !== 1) newDirection.x = -1, newDirection.y = 0;
      break;
    case "ArrowRight":
      if (lastDirection.x !== -1) newDirection.x = 1, newDirection.y = 0;
      break;
  }
  velocity = newDirection;
}

function restartGame() {
  initGame(currentMode);
}

function showMenu() {
  clearInterval(gameLoop);
  gameContainer.style.display = "none";
  startMenu.style.display = "block";
}

document.addEventListener("keydown", (e) => {
  if (e.key === " " && !isGameOver) {
    isPaused = !isPaused;
    pausedMsg.style.display = isPaused ? "block" : "none";
    return;
  }
  if (!isPaused && !isGameOver) {
    changeDirection(e);
  }
});

// === Theme Toggle ===
const themes = ["dark", "light", "neon", "retro", "matrix"];
let currentTheme = 0;
document.body.classList.add(themes[currentTheme] + "-mode");

function toggleTheme() {
  document.body.className = "";
  currentTheme = (currentTheme + 1) % themes.length;
  document.body.classList.add(themes[currentTheme] + "-mode");
}