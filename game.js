const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const planet = {
  x: centerX,
  y: centerY,
  radius: 60
};

const orbit = {
  inner: 120,
  outer: 180
};

let angle = 0;
let currentOrbit = "outer";
let targetOrbit = orbit.outer;

const ship = {
  radius: 10,
  orbitRadius: orbit.outer
};

let asteroids = [];
let score = 0;

let asteroidCount = 1;
let lastLevel = 0;
let pulse = 0;

let animationId;

// stars
let stars = [];
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

// control
window.addEventListener("click", () => {
  if (currentOrbit === "outer") {
    currentOrbit = "inner";
    targetOrbit = orbit.inner;
  } else {
    currentOrbit = "outer";
    targetOrbit = orbit.outer;
  }
});

// draw planet
function drawPlanet() {
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0af";
  ctx.fill();
}

// draw orbits
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

// draw ship
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

// stars
function drawStars() {
  stars.forEach(s => {
    ctx.fillStyle = "white";
    ctx.fillRect(s.x, s.y, 2, 2);
  });
}

// spawn asteroid
function spawnAsteroid() {

  for (let i = 0; i < Math.floor(asteroidCount); i++) {

    const a = Math.random() * Math.PI * 2;
    const dist = canvas.width;

    const x = centerX + dist * Math.cos(a);
    const y = centerY + dist * Math.sin(a);

    asteroids.push({
      x,
      y,
      radius: 6 + Math.random() * 6,
      speed: 1 + Math.random() * 1.5,
      angle: a
    });
  }

}

// draw asteroid
function drawAsteroids() {
  asteroids.forEach((a, i) => {
    a.x -= Math.cos(a.angle) * a.speed;
    a.y -= Math.sin(a.angle) * a.speed;

    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#aaa";
    ctx.fill();

    // collision
    const shipX = centerX + ship.orbitRadius * Math.cos(angle);
    const shipY = centerY + ship.orbitRadius * Math.sin(angle);

    const dx = a.x - shipX;
    const dy = a.y - shipY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < a.radius + ship.radius) {
     document.getElementById("gameOverUI").style.display = "flex";
document.getElementById("finalScore").innerText = "Score: " + Math.floor(score);
cancelAnimationFrame(animationId);
    }
  });
}

// game loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStars();
  drawPlanet();
  drawOrbit();

 let switchSpeed = Math.min(0.25 + (score / 1000), 0.5);
ship.orbitRadius += (targetOrbit - ship.orbitRadius) * switchSpeed;
  
  let speed = 0.02 + (Math.floor(score / 200) * 0.002);
angle += speed;
  
  drawShip();

  drawAsteroids();

  score += 0.1;
  let level = Math.floor(score / 100);

if (level > lastLevel) {
  lastLevel = level;
  asteroidCount += 0.3;
}
  
  document.getElementById("scoreUI").innerText =
  "Score: " + Math.floor(score);

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";

  animationId = requestAnimationFrame(animate);
}

// spawn loop
setInterval(spawnAsteroid, 1000);

animate();
