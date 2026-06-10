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
let particles = [];
let shake = 0;


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

   document.getElementById("scoreUI").innerText = "Score: " + score;

  particles.forEach((p, i) => {
  p.x += p.vx;
  p.y += p.vy;
  p.life--;

  if (p.life <= 0) {
    particles.splice(i, 1);
  }
});
}

function updateShip() {
  ship.angle += 0.03;

  let target = orbits[currentOrbitIndex];

  // 🔥 smooth orbit switching
  ship.orbitRadius += (target - ship.orbitRadius) * 0.1;

  ship.x = canvas.width / 2 + Math.cos(ship.angle) * ship.orbitRadius;
  ship.y = canvas.height / 2 + Math.sin(ship.angle) * ship.orbitRadius;
}

// ===============================
// 🎨 DRAW
// ===============================
function drawGame() {
  ctx.save();

  if (shake > 0) {
    ctx.translate(
      Math.random() * shake - shake / 2,
      Math.random() * shake - shake / 2
    );
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
  let gradient = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, 10,
    canvas.width/2, canvas.height/2, 50
  );

  gradient.addColorStop(0, "#4facfe");
  gradient.addColorStop(1, "#000c40");

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);

  ctx.fillStyle = gradient;
  ctx.fill();

  // 🔥 glow aura
  ctx.shadowColor = "#4facfe";
  ctx.shadowBlur = 30;
}

function drawOrbit() {
  orbits.forEach((r, i) => {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);

    ctx.strokeStyle = i === currentOrbitIndex
      ? "#00f0ff"
      : "rgba(255,255,255,0.2)";

    ctx.lineWidth = i === currentOrbitIndex ? 2 : 1;

    ctx.setLineDash([5, 5]);
ctx.lineDashOffset = performance.now() / 50;
    
    ctx.stroke();

    ctx.setLineDash([]);
    
  });
}


// ===============================
// 🚀 SHIP
// ===============================
function drawShip() {
  ctx.save();

  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI / 2);

  // 🔥 glow
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 20;

  // 🚀 MAIN BODY (diamond shape)
  ctx.beginPath();
  ctx.moveTo(0, -14);   // nose
  ctx.lineTo(6, 0);     // right mid
  ctx.lineTo(0, 10);    // bottom
  ctx.lineTo(-6, 0);    // left mid
  ctx.closePath();

  ctx.fillStyle = "#00f0ff";
  ctx.fill();

  // 🪽 WINGS
  ctx.beginPath();
  ctx.moveTo(-10, 6);
  ctx.lineTo(-4, 2);
  ctx.lineTo(-4, 10);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(4, 2);
  ctx.lineTo(4, 10);
  ctx.closePath();
  ctx.fill();

  // 🔥 ENGINE FLAME (center)
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(3, 20);
  ctx.lineTo(-3, 20);
  ctx.closePath();

  ctx.fillStyle = Math.random() > 0.5 ? "orange" : "yellow";
  ctx.fill();

  ctx.restore();
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

let spawnTimer = 0;

function createExplosion(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 30
    });
  }
}

function updateAsteroids() {
  spawnTimer++;

  if (spawnTimer > 60) {
    spawnAsteroid();
    spawnTimer = 0;
  }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    let ast = asteroids[i];

    ast.x += ast.vx * ast.speed;
    ast.y += ast.vy * ast.speed;

    // 🎯 DISTANCE FROM CENTER
    let dx = ast.x - canvas.width / 2;
    let dy = ast.y - canvas.height / 2;
    let dist = Math.sqrt(dx * dx + dy * dy);

    // 🔥 अगर asteroid center cross कर गया (planet ke pass)
    if (dist < 30) {
      asteroids.splice(i, 1); // remove
      score++;
      animateScore();
    }
  }
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
  for (let i = asteroids.length - 1; i >= 0; i--) {
    let ast = asteroids[i];

    // 🎯 distance from center
    let dxC = ast.x - canvas.width / 2;
    let dyC = ast.y - canvas.height / 2;
    let distC = Math.sqrt(dxC * dxC + dyC * dyC);

    // 🔥 अगर asteroid planet तक पहुंच गया
    if (distC < 40) {
      asteroids.splice(i, 1);
      score++; // 💥 SCORE
      animateScore();
      continue;
    }

    // 🎯 collision with ship
    let dx = ship.x - ast.x;
    let dy = ship.y - ast.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ship.radius + ast.radius) {
      handleCrash();
    }
  }
}

// ===============================
// 💀 CRASH
// ===============================
function handleCrash() {
  createExplosion(ship.x, ship.y); // 💥 explosion

  gameRunning = false;

  document.getElementById("crashPopup").classList.remove("hidden");
  document.getElementById("finalScore").innerText = "Score: " + score;

  shake = 10;
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

function animateScore() {
  let el = document.getElementById("scoreUI");

  el.style.transform = "scale(1.3)";
  el.style.transition = "0.2s";

  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 200);
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

gameLoop();

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
}

function drawParticles() {
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "orange";
    ctx.fill();
  });
}
