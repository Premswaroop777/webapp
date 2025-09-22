const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countSpan = document.getElementById('count');
const speedSlider = document.getElementById('speed');
const intensitySlider = document.getElementById('intensity');
const glowSlider = document.getElementById('glow');
const hueSlider = document.getElementById('hue');
const spawnBtn = document.getElementById('spawn');
const clearBtn = document.getElementById('clear');

let width = window.innerWidth * 0.7;
let height = window.innerHeight * 0.8;
canvas.width = width;
canvas.height = height;

let particles = [];
let mouse = { x: width / 2, y: height / 2, down: false };

function randomParticle(x, y, hue) {
  const angle = Math.random() * Math.PI * 2;
  const speed = parseFloat(speedSlider.value) * (0.5 + Math.random());
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 2 + Math.random() * 3,
    hue: hue + Math.random() * 40 - 20,
    alpha: 1
  };
}

function spawnBurst(x, y, count = 40) {
  const hue = parseInt(hueSlider.value);
  for (let i = 0; i < count; i++) {
    particles.push(randomParticle(x, y, hue));
  }
  countSpan.textContent = particles.length;
}

function clearParticles() {
  particles = [];
  countSpan.textContent = 0;
}

function updateParticles() {
  const intensity = parseFloat(intensitySlider.value);
  for (let p of particles) {
    // Flow towards mouse
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;
    p.vx += dx * 0.0002 * intensity;
    p.vy += dy * 0.0002 * intensity;

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.alpha *= 0.995;
  }
  // Remove faded particles
  particles = particles.filter(p => p.alpha > 0.05 && p.x > 0 && p.x < width && p.y > 0 && p.y < height);
  countSpan.textContent = particles.length;
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let p of particles) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${glowSlider.value})`;
    ctx.shadowBlur = 20 * glowSlider.value;
    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function animate() {
  updateParticles();
  drawParticles();
  requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  if (mouse.down) {
    spawnBurst(mouse.x, mouse.y, 4);
  }
});

canvas.addEventListener('mousedown', e => {
  mouse.down = true;
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  spawnBurst(mouse.x, mouse.y, 30);
});

canvas.addEventListener('mouseup', () => {
  mouse.down = false;
});

canvas.addEventListener('mouseleave', () => {
  mouse.down = false;
});

canvas.addEventListener('touchstart', e => {
  mouse.down = true;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
  spawnBurst(mouse.x, mouse.y, 30);
});

canvas.addEventListener('touchmove', e => {
  if (mouse.down) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
    spawnBurst(mouse.x, mouse.y, 4);
  }
});

canvas.addEventListener('touchend', () => {
  mouse.down = false;
});

spawnBtn.addEventListener('click', () => {
  spawnBurst(width / 2, height / 2, 60);
});

clearBtn.addEventListener('click', clearParticles);

window.addEventListener('resize', () => {
  width = window.innerWidth * 0.7;
  height = window.innerHeight * 0.8;
  canvas.width = width;
  canvas.height = height;
});

animate();