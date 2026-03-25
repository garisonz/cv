// ─── THREE.JS PARTICLE CONSTELLATION ───
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Particles
const particleCount = 300;
const positions = new Float32Array(particleCount * 3);
const velocities = [];
const spread = 80;

for (let i = 0; i < particleCount; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * spread;
  positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
  positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.5;
  velocities.push({
    x: (Math.random() - 0.5) * 0.015,
    y: (Math.random() - 0.5) * 0.015,
    z: (Math.random() - 0.5) * 0.005
  });
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMat = new THREE.PointsMaterial({
  color: 0xc8c8c8,
  size: 0.15,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Lines between nearby particles
const linesMat = new THREE.LineBasicMaterial({
  color: 0xaaaaaa,
  transparent: true,
  opacity: 0.07,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

let linesMesh;
const maxDist = 12;

function updateLines() {
  if (linesMesh) scene.remove(linesMesh);
  const linePositions = [];
  const pos = particleGeo.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < maxDist * maxDist) {
        linePositions.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
        linePositions.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
      }
    }
  }

  const linesGeo = new THREE.BufferGeometry();
  linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  linesMesh = new THREE.LineSegments(linesGeo, linesMat);
  scene.add(linesMesh);
}

// Mouse interaction
let mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// Scroll
let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; });

// Animation loop
let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  frame++;

  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3]     += velocities[i].x;
    pos[i * 3 + 1] += velocities[i].y;
    pos[i * 3 + 2] += velocities[i].z;

    // Wrap around
    if (pos[i * 3] > spread / 2) pos[i * 3] = -spread / 2;
    if (pos[i * 3] < -spread / 2) pos[i * 3] = spread / 2;
    if (pos[i * 3 + 1] > spread / 2) pos[i * 3 + 1] = -spread / 2;
    if (pos[i * 3 + 1] < -spread / 2) pos[i * 3 + 1] = spread / 2;
  }
  particleGeo.attributes.position.needsUpdate = true;

  // Update lines every 3 frames for performance
  if (frame % 3 === 0) updateLines();

  // Camera follows mouse + scroll
  camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02;
  camera.position.y += (mouse.y * 3 - scrollY * 0.01 - camera.position.y) * 0.02;
  camera.lookAt(0, -scrollY * 0.005, 0);

  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// ─── VORONOI MOSAIC FACE ───
(function renderVoronoiMosaic() {
  const faceCanvas = document.getElementById('hero-face-canvas');
  if (!faceCanvas) return;

  const SIZE      = 900;
  const NUM_SEEDS = 4000;
  faceCanvas.width  = SIZE;
  faceCanvas.height = SIZE;
  const ctx = faceCanvas.getContext('2d');

  const img = new Image();
  img.src = 'assets/face_shot.png';

  img.onload = () => {
    // ── Read source pixels ──────────────────────────────────────────────────
    const off = document.createElement('canvas');
    off.width = off.height = SIZE;
    const offCtx = off.getContext('2d');
    offCtx.drawImage(img, 0, 0, SIZE, SIZE);
    const { data } = offCtx.getImageData(0, 0, SIZE, SIZE);

    const gray = new Uint8Array(SIZE * SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
    }

    // ── Seed points ─────────────────────────────────────────────────────────
    const seedX = new Int16Array(NUM_SEEDS);
    const seedY = new Int16Array(NUM_SEEDS);
    const seedG = new Uint8Array(NUM_SEEDS);
    for (let k = 0; k < NUM_SEEDS; k++) {
      const sx = (Math.random() * SIZE) | 0;
      const sy = (Math.random() * SIZE) | 0;
      seedX[k] = sx; seedY[k] = sy;
      seedG[k] = gray[sy * SIZE + sx];
    }

    // ── Jump Flooding Algorithm — O(W² · log W) ─────────────────────────────
    // nearest[i] = seed index owning pixel i  (-1 = unresolved)
    // distSq[i]  = squared distance to that seed
    const nearest = new Int32Array(SIZE * SIZE).fill(-1);
    const distSq  = new Float32Array(SIZE * SIZE).fill(Infinity);

    // Initialise seed pixels
    for (let k = 0; k < NUM_SEEDS; k++) {
      const pi = seedY[k] * SIZE + seedX[k];
      nearest[pi] = k;
      distSq[pi]  = 0;
    }

    // JFA passes: step = SIZE/2, SIZE/4 … 1, then one extra step=1 (JFA+1)
    const steps = [];
    for (let s = SIZE >> 1; s >= 1; s >>= 1) steps.push(s);
    steps.push(1); // JFA+1 reduces residual artifacts

    for (const step of steps) {
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          const pi = y * SIZE + x;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx * step, ny = y + dy * step;
              if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue;
              const seed = nearest[ny * SIZE + nx];
              if (seed === -1) continue;
              const ddx = x - seedX[seed], ddy = y - seedY[seed];
              const d   = ddx * ddx + ddy * ddy;
              if (d < distSq[pi]) { distSq[pi] = d; nearest[pi] = seed; }
            }
          }
        }
      }
    }

    // ── Render cells + edges in one pass ────────────────────────────────────
    const out     = ctx.createImageData(SIZE, SIZE);
    const outData = out.data;

    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const pi  = y * SIZE + x;
        const idx = pi * 4;
        let gv    = seedG[nearest[pi]];

        // Darken pixels on a cell boundary
        if (x < SIZE - 1 && nearest[pi] !== nearest[pi + 1])           gv = (gv * 0.28) | 0;
        else if (y < SIZE - 1 && nearest[pi] !== nearest[pi + SIZE])   gv = (gv * 0.28) | 0;

        outData[idx]     = gv;
        outData[idx + 1] = gv;
        outData[idx + 2] = gv;
        outData[idx + 3] = data[pi * 4 + 3];
      }
    }

    ctx.putImageData(out, 0, 0);
  };
})();

// ─── SCROLL REVEAL ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));