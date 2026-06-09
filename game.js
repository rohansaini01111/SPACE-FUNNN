const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// canvas full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// center
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// planet
const planet = {
  x: centerX,
  y: centerY,
  radius: 60
};

// orbits
const orbit = {
  inner: 120,
  outer: 180
};

// ship
let angle = 0;
let currentOrbit = "outer";
let targetOrbit = orbit.outer;

const ship = {
  radius: 10,
  orbitRadius: orbit.outer
};

// asteroids
let asteroids = [];

// ⭐ stars
let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

// 🎮 controls
window.addEventListener("click", () => {
  if (currentOrbit === "outer") {
    currentOrbit = "inner";
    targetOrbit = orbit.inner;
  } else {
    currentOrbit = "outer";
    targetOrbit = orbit.outer;
  }
});

// 🌍 draw planet
function drawPlanet() {
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0af";
  ctx.fill();
}

// 🌀 draw orbits
function drawOrbit() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, orbit.inner, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, orbit.outer, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.stroke();
}

// 🚀 ship
function drawShip() {
  const x = centerX + ship.orbitRadius * Math.cos(angle);
  const y = centerY + ship.orbitRadius * Math.sin(angle);

  ctx.beginPath();
  ctx.arc(x, y, ship.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";

  ctx.shadowBlur = 20;
  ctx.shadowColor = "#0af";

  ctx.fill();
  ctx.shadowBlur = 0;
}

// ⭐ stars
function drawStars() {
  stars.forEach(s => {
    ctx.fillStyle = "white";
    ctx.fillRect(s.x, s.y, 2, 2);
  });
}

// ☄️ spawn asteroid
function spawnAsteroid() {
  const a = Math.random() * Math.PI * 2;

  const dist = canvas.width;

  const x = centerX + dist * Math.cos(a);
  const y = centerY + dist * Math.sin(a);

  asteroids.push({
    x,
    y,
    radius: 6 + Math.random() * 6,
    speed: 1 + Math.random() * 2,
    angle: a
  });
}

// ☄️ draw asteroid
function drawAsteroids() {
  asteroids.forEach((a, i) => {
    a.x -= Math.cos(a.angle) * a.speed;
    a.y -= Math.sin(a.angle) * a.speed;

    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#aaa";
    ctx.fill();

    const dx = a.x - centerX;
    const dy = a.y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20) {
      asteroids.splice(i, 1);
    }
  });
}

// 🎮 game loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawPlanet();
  drawOrbit();

  // smooth orbit
  ship.orbitRadius += (targetOrbit - ship.orbitRadius) * 0.1;

  angle += 0.02;
  drawShip();

  drawAsteroids();

  requestAnimationFrame(animate);
}

// spawn loop
setInterval(spawnAsteroid, 1000);

animate();
