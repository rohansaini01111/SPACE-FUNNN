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
function drawShip() {
  ctx.save();

  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI / 2);

  // 🔥 glow
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 25;

  // 🚀 BODY
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(10, 10);
  ctx.lineTo(0, 6);
  ctx.lineTo(-10, 10);
  ctx.closePath();

  ctx.fillStyle = "#00f0ff";
  ctx.fill();

  // 🧠 cockpit
  ctx.beginPath();
  ctx.arc(0, -4, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // 🔥 ENGINE FLAME
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(4, 22);
  ctx.lineTo(-4, 22);
  ctx.closePath();

  ctx.fillStyle = Math.random() > 0.5 ? "orange" : "yellow";
  ctx.fill();

  ctx.restore();
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
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 10;

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
    ctx.shadowColor = "#aaa";
     ctx.shadowBlur = 10;
    ctx.fill();
  });
}

// ===============================
// 💥 PARTICLES
// ===============================
function createExplosion(x, y) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      life: 40,
      size: Math.random() * 3 + 2
    });
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(255,150,0,${p.life / 40})`;

    ctx.shadowColor = "orange";
    ctx.shadowBlur = 15;

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
let lastTap = 0;

// 📱 MOBILE TAP (fixed)
canvas.addEventListener("touchstart", () => {
  let now = Date.now();

  if (now - lastTap < 200) return; // 🔥 double trigger block

  lastTap = now;

  currentOrbitIndex = (currentOrbitIndex + 1) % orbits.length;
});

// 💻 DESKTOP CLICK
canvas.addEventListener("mousedown", () => {
  currentOrbitIndex = (currentOrbitIndex + 1) % orbits.length;
});
// ===============================
gameLoop();

document.addEventListener("keydown", (e) => {

  // 🔢 number key
  let num = parseInt(e.key);
  if (num >= 1 && num <= orbits.length) {
    currentOrbitIndex = num - 1;
  }

  // ⌨️ space key
  if (e.code === "Space") {
    currentOrbitIndex = (currentOrbitIndex + 1) % orbits.length;
  }

});
