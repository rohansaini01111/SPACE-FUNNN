// ===============================
// 🚀 GLOBAL STATE
// ===============================
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = true;
let score = 0;

let orbits = [80, 120, 160, 200];
let currentOrbitIndex = 1;

let ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  angle: 0,
  orbitRadius: orbits[currentOrbitIndex]
};

let asteroids = [];


// ===============================
// 🚀 GAME LOOP
// ===============================
function gameLoop() {
  if (!gameRunning) return;

  updateGame();
  drawGame();

  requestAnimationFrame(gameLoop);
}


// ===============================
// 🔧 UPDATE
// ===============================
function updateGame() {
  updateShip();
  updateAsteroids();
  checkCollisions();
}


// ===============================
// 🎨 DRAW
// ===============================
function drawGame() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPlanet();
  drawOrbit();
  drawShip();
  drawAsteroids();
}


// ===============================
// 🪐 PLANET + ORBITS
// ===============================
function drawPlanet() {
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
  ctx.fillStyle = "#1e90ff";
  ctx.fill();
}

function drawOrbit() {
  orbits.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);

    ctx.strokeStyle = i === currentOrbitIndex
      ? "#00f0ff"
      : "rgba(255,255,255,0.2)";

    ctx.lineWidth = i === currentOrbitIndex ? 2 : 1;
    ctx.stroke();
  });
}


// ===============================
// 🚀 SHIP
// ===============================
function updateShip() {
  ship.angle += 0.03;

  let target = orbits[currentOrbitIndex];

  // 🔥 SMOOTH SWITCH
  ship.orbitRadius += (target - ship.orbitRadius) * 0.1;

  ship.x = canvas.width / 2 + Math.cos(ship.angle) * ship.orbitRadius;
  ship.y = canvas.height / 2 + Math.sin(ship.angle) * ship.orbitRadius;
}

function drawShip() {
  ctx.beginPath();
  ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#00f0ff";
  ctx.fill();
}


// ===============================
// ☄️ ASTEROIDS
// ===============================
function spawnAsteroid() {
  let side = Math.floor(Math.random() * 4);

  let x, y;

  if (side === 0) { x = 0; y = Math.random() * canvas.height; }
  if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
  if (side === 2) { x = Math.random() * canvas.width; y = 0; }
  if (side === 3) { x = Math.random() * canvas.width; y = canvas.height; }

  let angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);

  asteroids.push({
    x,
    y,
    radius: 10 + Math.random() * 10,
    speed: 2,
    vx: Math.cos(angle),
    vy: Math.sin(angle)
  });
}

function updateAsteroids() {
  if (Math.random() < 0.02) spawnAsteroid();

  asteroids.forEach(ast => {
    ast.x += ast.vx * ast.speed;
    ast.y += ast.vy * ast.speed;
  });
}

function drawAsteroids() {
  ctx.fillStyle = "#aaa";

  asteroids.forEach(ast => {
    ctx.beginPath();
    ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}


// ===============================
// 💥 COLLISION
// ===============================
function checkCollisions() {
  asteroids.forEach(ast => {
    let dx = ship.x - ast.x;
    let dy = ship.y - ast.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ship.radius + ast.radius) {
      handleCrash();
    }
  });
}


// ===============================
// 💀 CRASH
// ===============================
function handleCrash() {
  gameRunning = false;

  document.getElementById("crashPopup").classList.remove("hidden");
  document.getElementById("finalScore").innerText = "Score: " + score;
}


// ===============================
// 🔁 RESTART
// ===============================
function restartGame() {
  score = 0;
  asteroids = [];

  currentOrbitIndex = 1;

  ship.angle = 0;
  ship.orbitRadius = orbits[currentOrbitIndex];

  gameRunning = true;

  document.getElementById("crashPopup").classList.add("hidden");

  requestAnimationFrame(gameLoop);
}


// ===============================
// 🎮 INPUT (SINGLE CLEAN SYSTEM)
// ===============================
document.addEventListener("keydown", (e) => {

  let num = parseInt(e.key);

  if (num >= 1 && num <= orbits.length) {
    currentOrbitIndex = num - 1;
  }

  if (e.code === "Space") {
    currentOrbitIndex = (currentOrbitIndex + 1) % orbits.length;
  }

});


// ===============================
// 🚀 START
// ===============================
gameLoop();
