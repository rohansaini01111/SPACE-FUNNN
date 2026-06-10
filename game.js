// ===============================
// 🚀 GLOBAL STATE
// ===============================
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let orbits = [80, 120, 160, 200];
let currentOrbitIndex = 1;

let ship = {
  x: 0,
  y: 0,
  radius: 8,
  angle: 0,
  orbitRadius: orbits[currentOrbitIndex]
};

let asteroids = [];
let particles = [];
let trail = [];
let shake = 0;
let spawnTimer = 0;

// ===============================
// 📱 RESPONSIVE CANVAS
// ===============================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let base = Math.min(canvas.width, canvas.height) / 4;

  orbits = [
    base * 0.5,
    base * 0.8,
    base * 1.1,
    base * 1.4
  ];

  ship.orbitRadius = orbits[currentOrbitIndex];
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

  // 🔥 particle update
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.life <= 0) particles.splice(i, 1);
  });

  // 🔥 particle limit
  if (particles.length > 100) {
    particles.splice(0, 20);
  }

  // 🎯 SCORE UI
  document.getElementById("scoreUI").innerText =
    "Score: " + score + " | High: " + highScore;
}

// ===============================
// 🚀 SHIP UPDATE
// ===============================
function updateShip() {
  ship.angle += 0.03;

  let target = orbits[currentOrbitIndex];
  ship.orbitRadius += (target - ship.orbitRadius) * 0.1;

  ship.x = canvas.width / 2 + Math.cos(ship.angle) * ship.orbitRadius;
  ship.y = canvas.height / 2 + Math.sin(ship.angle) * ship.orbitRadius;

  trail.push({ x: ship.x, y: ship.y });
  if (trail.length > 20) trail.shift();
}

// ===============================
// 🎨 DRAW
// ===============================
function drawGame() {
  ctx.save();

  if (shake > 0) {
    ctx.translate(Math.random() * shake - shake / 2, Math.random() * shake - shake / 2);
    shake--;
  }

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPlanet();
  drawOrbit();
  drawTrail();
  drawShip();
  drawAsteroids();
  drawParticles();

  ctx.restore();
}

// ===============================
// 🪐 PLANET + ORBITS
// ===============================
function drawPlanet() {
  let cx = canvas.width / 2;
  let cy = canvas.height / 2;

  let g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 50);
  g.addColorStop(0, "#4facfe");
  g.addColorStop(1, "#000c40");

  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

function drawOrbit() {
  orbits.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);

    ctx.strokeStyle = i === currentOrbitIndex ? "#00f0ff" : "rgba(255,255,255,0.2)";
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = performance.now() / 50;
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

// ===============================
// 🚀 SHIP DRAW
// ===============================
function drawShip() {
  ctx.save();

  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI / 2);

  ctx.fillStyle = "#00f0ff";

  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(8, 10);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ===============================
// ✨ TRAIL
// ===============================
function drawTrail() {
  trail.forEach((t, i) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,240,255,${i / trail.length})`;
    ctx.fill();
  });
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

  let angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

  asteroids.push({
    x, y,
    radius: 10 + Math.random() * 10,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
    speed: 2
  });
}

function updateAsteroids() {
  spawnTimer++;

  if (spawnTimer > 60) {
    spawnAsteroid();
    spawnTimer = 0;
  }

  asteroids.forEach((ast, i) => {
    ast.x += ast.vx * ast.speed;
    ast.y += ast.vy * ast.speed;

    let dx = ast.x - canvas.width / 2;
    let dy = ast.y - canvas.height / 2;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      asteroids.splice(i, 1);
      score++;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
    }
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
// 💥 PARTICLES
// ===============================
function createExplosion(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 30
    });
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
  });
}

// ===============================
// 💀 COLLISION
// ===============================
function checkCollisions() {
  asteroids.forEach(ast => {
    let dx = ship.x - ast.x;
    let dy = ship.y - ast.y;

    if (Math.sqrt(dx * dx + dy * dy) < ship.radius + ast.radius) {
      handleCrash();
    }
  });
}

// ===============================
// 💀 CRASH
// ===============================
function handleCrash() {
  createExplosion(ship.x, ship.y);
  shake = 10;
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
  particles = [];
  trail = [];

  gameRunning = true;
  document.getElementById("crashPopup").classList.add("hidden");

  requestAnimationFrame(gameLoop);
}

// ===============================
// 🎮 INPUT
// ===============================
canvas.addEventListener("click", () => {
  currentOrbitIndex = (currentOrbitIndex + 1) % orbits.length;
});

canvas.addEventListener("touchstart", () => {
  currentOrbitIndex = (currentOrbitIndex + 1) % orbits.length;
});

// ===============================
gameLoop();
