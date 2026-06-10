let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let orbits = [];
let currentOrbitIndex = 1;

let ship = { x: 0, y: 0, angle: 0, orbitRadius: 0 };

let particles = [];
let asteroids = [];
let shake = 0;
let switchBoost = 0;

// ================== RESPONSIVE ==================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let base = Math.min(canvas.width, canvas.height) / 4;

  orbits = [base*0.5, base*0.8, base*1.1, base*1.4];

  ship.orbitRadius = orbits[currentOrbitIndex];
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ================== LOOP ==================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ================== UPDATE ==================
function update() {
  ship.angle += 0.025;

  let target = orbits[currentOrbitIndex];
  ship.orbitRadius += (target - ship.orbitRadius) * (0.1 + switchBoost);

  ship.x = canvas.width/2 + Math.cos(ship.angle)*ship.orbitRadius;
  ship.y = canvas.height/2 + Math.sin(ship.angle)*ship.orbitRadius;

  switchBoost *= 0.9;

  particles.forEach((p,i)=>{
    p.x+=p.vx;
    p.y+=p.vy;
    p.life--;
    if(p.life<=0) particles.splice(i,1);
  });

  document.getElementById("scoreUI").innerText =
    `Score: ${score} | High: ${highScore}`;
}

// ================== DRAW ==================
function draw() {
  ctx.save();

  if(shake>0){
    ctx.translate(Math.random()*shake - shake/2, Math.random()*shake - shake/2);
    shake--;
  }

  ctx.fillStyle="black";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  drawPlanet();
  drawOrbits();
  drawShip();
  drawParticles();

  ctx.restore();
}

// ================== PLANET ==================
function drawPlanet(){
  let cx = canvas.width/2;
  let cy = canvas.height/2;

  let g = ctx.createRadialGradient(cx,cy,10,cx,cy,60);
  g.addColorStop(0,"#4facfe");
  g.addColorStop(1,"#000c40");

  ctx.beginPath();
  ctx.arc(cx,cy,40,0,Math.PI*2);
  ctx.fillStyle=g;
  ctx.fill();
}

// ================== ORBITS ==================
function drawOrbits(){
  orbits.forEach((r,i)=>{
    ctx.beginPath();
    ctx.arc(canvas.width/2,canvas.height/2,r,0,Math.PI*2);

    ctx.strokeStyle = i===currentOrbitIndex ? "#00f0ff" : "rgba(255,255,255,0.2)";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = i===currentOrbitIndex ? 20 : 0;

    ctx.stroke();
  });
}

// ================== SHIP ==================
function drawShip(){
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI/2);

  ctx.shadowColor="#00f0ff";
  ctx.shadowBlur=25;

  ctx.beginPath();
  ctx.moveTo(0,-16);
  ctx.lineTo(10,12);
  ctx.lineTo(-10,12);
  ctx.closePath();
  ctx.fillStyle="#00f0ff";
  ctx.fill();

  ctx.restore();
}

// ================== PARTICLES ==================
function createExplosion(x,y){
  for(let i=0;i<30;i++){
    particles.push({
      x,y,
      vx:(Math.random()-0.5)*6,
      vy:(Math.random()-0.5)*6,
      life:40
    });
  }
}

function drawParticles(){
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,2,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,150,0,${p.life/40})`;
    ctx.fill();
  });
}

// ================== INPUT ==================
let lastTap=0;

canvas.addEventListener("pointerdown",()=>{
  let now=Date.now();
  if(now-lastTap<120) return;

  lastTap=now;

  currentOrbitIndex=(currentOrbitIndex+1)%orbits.length;
  switchBoost+=0.1;

});

// keyboard
document.addEventListener("keydown",(e)=>{
  let num=parseInt(e.key);
  if(num>=1 && num<=orbits.length){
    currentOrbitIndex=num-1;
  }

  if(e.code==="Space"){
    currentOrbitIndex=(currentOrbitIndex+1)%orbits.length;
    switchBoost+=0.15;
  }
});

// ================== START ==================
gameLoop();
