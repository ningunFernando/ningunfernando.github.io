import vertSrc from '../shaders/cube.vert?raw'
import fragSrc from '../shaders/cube.frag?raw'
import { createProgram, tokenColor } from './gl.js';
import gsap from 'gsap';

const HOLE = 0.532;
const GAP = 0.032;
const SPREAD = 0.85; // distancia desde la que llegan las caras
const ISO = Math.asin(1 / Math.sqrt(3)); // 35.26 grados de inclinación de la cámara isométrica

const loader = document.getElementById('loader');
const canvas = loader.querySelector('canvas');
const bg = loader.querySelector('.bg');
const skip = loader.querySelector('button');
const gl = canvas.getContext('webgl2', { premultipliedAlpha: true });
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let timeline = null;

function close() {
  timeline?.kill();
  loader.hidden = true;
  document.removeEventListener('keydown', onKey);
}

// Saltar también con el teclado: Escape cierra la carga.
function onKey(event) {
  if (event.key === 'Escape') close();
}

skip.addEventListener('click', close);
document.addEventListener('keydown', onKey);

// Las visitas siguientes ven la versión corta. Si localStorage falla (bloqueado), cuenta como primera visita.
function firstVisit() {
  let seen = null;
  try {
    seen = localStorage.getItem('visited');
    localStorage.setItem('visited', '1');
  } catch {}
  return !seen;
}

// Sin WebGL2 o con movimiento reducido: en vez de la secuencia, la capa se desvanece en 300 ms.
function fade() {
  timeline = gsap.to(loader, { autoAlpha: 0, duration: 0.3, ease: 'none', onComplete: close });
}

const FACES = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }, // derecha
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] }, // izquierda
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, // frente
  { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }, // atrás
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], hole: true }, // arriba
];

// Armado de los vértices del cubo
function buildCube() {
  const s = 0.5;
  const h = HOLE / 2;
  const data = [];

  const quad = (f, corners) => {
    for (const i of [0, 1, 2, 0, 2, 3]) {
      const [a, b] = corners[i];
      for (let k = 0; k < 3; k++) {
        data.push(f.n[k] * s + f.u[k] * a + f.v[k] * b);
      }
      data.push(...f.n);
    }
  };

  for (const f of FACES) {
    if (f.hole) {
      quad(f, [[-s, -s], [s, -s], [h, -h], [-h, -h]]);
      quad(f, [[s, -s], [s, s], [h, h], [h, -h]]);
      quad(f, [[s, s], [-s, s], [-h, h], [h, h]]);
      quad(f, [[-s, s], [-s, -s], [-h, -h], [-h, h]]);
    } else {
      quad(f, [[-s, -s], [s, -s], [s, s], [-s, s]]);
    }
  }

  // El hueco va al final, como un cuadro aparte: se dibuja después para recortarlo.
  quad(FACES[4], [[-h, -h], [h, -h], [h, h], [-h, h]]);
  return new Float32Array(data);
}

// Solo cambia el tamaño del canvas cuando cambia la ventana: cambiarlo borra y recrea su imagen.
function resize() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, w, h);
}

function start(first) {
  const program = createProgram(gl, vertSrc, fragSrc);
  const vertices = buildCube();
  const count = vertices.length / 6;
  const faceCount = count - 6; // todo menos los 6 vértices del hueco
  const [r, g, b] = tokenColor('--grafito');

  // El VAO recuerda cómo leer el buffer de vértices y qué atributo va a cada entrada del shader
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // 6 números de 4 bytes por vértice: 24 bytes; las normales empiezan en el byte 12
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uUnit = gl.getUniformLocation(program, 'u_unit');
  const uYaw = gl.getUniformLocation(program, 'u_yaw');
  const uPitch = gl.getUniformLocation(program, 'u_pitch');
  const uGap = gl.getUniformLocation(program, 'u_gap');
  const uCenter = gl.getUniformLocation(program, 'u_center');
  const uTone = gl.getUniformLocation(program, 'u_tone');
  const uAlpha = gl.getUniformLocation(program, 'u_alpha');

  gl.enable(gl.CULL_FACE);

  // Lo que anima la línea de tiempo: cada parte va de 0 a 1.
  const state = { assemble: 0, turn: 0, dive: 0 };

  function draw() {
    resize();
    // El fondo oscuro ahora lo pinta el canvas, opaco: tapa la página salvo donde se recorta el hueco.
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Llegada: las caras vienen de lejos y se juntan hasta la separación del isotipo.
    const gap = GAP + (1 - state.assemble) * SPREAD;
    // Cuarto de vuelta: de 45° a 135°. El cubo se repite cada 90°, así que aterriza igual.
    const yaw = Math.PI / 4 + (state.turn * Math.PI) / 2;
    // Los tonos suben a mitad del giro y vuelven a 0 al aterrizar: blanco plano otra vez.
    const tone = Math.sin(Math.PI * state.turn);
    const alpha = Math.min(1, state.assemble * 2);

    // Bajada: la cámara pasa de la vista del logo a mirar desde arriba (90°)...
    const pitch = ISO + (Math.PI / 2 - ISO) * state.dive;
    // ...el centro de la pantalla sube del centro del cubo al centro del hueco...
    const lift = state.dive * (0.5 + gap);
    // ...y el zoom crece hasta que el hueco, visto desde arriba un rombo, cubre toda la pantalla.
    const unit = 0.2 * Math.min(canvas.width, canvas.height);
    const cover = (1.05 * (canvas.width + canvas.height)) / (HOLE * Math.SQRT2 * unit);
    const zoom = Math.pow(cover, Math.pow(state.dive, 2.2));

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uUnit, unit * zoom);
    gl.uniform1f(uYaw, yaw);
    gl.uniform1f(uPitch, pitch);
    gl.uniform1f(uGap, gap);
    gl.uniform3f(uCenter, 0, lift, 0);
    gl.uniform1f(uTone, tone);
    gl.uniform1f(uAlpha, alpha);
    gl.drawArrays(gl.TRIANGLES, 0, faceCount);

    // El hueco, con opacidad 0. Sin mezcla, sus píxeles quedan transparentes y se ve lo que hay detrás.
    gl.uniform1f(uAlpha, 0);
    gl.drawArrays(gl.TRIANGLES, faceCount, 6);
  }

  timeline = gsap.timeline({ onUpdate: draw });

  if (first) {
    // Primera visita: llegada (0–0.8 s) y cuarto de vuelta (1.05–2.15 s).
    timeline
      .to(state, { assemble: 1, duration: 0.8, ease: 'power2.out' })
      .to(state, { turn: 1, duration: 1.1, ease: 'power2.inOut' }, 1.05);
  } else {
    // Visitas siguientes: una llegada rápida (0–0.3 s), sin giro.
    timeline.to(state, { assemble: 1, duration: 0.3, ease: 'power2.out' });
  }

  // Bajada de 1.3 s: a los 2.55 s en la primera visita (cierra a los 3.85 s) y a los 0.3 s en las siguientes (1.6 s).
  const dive = first ? 2.55 : 0.3;
  timeline
    .to(skip, { autoAlpha: 0, duration: 0.3 }, dive - 0.15)
    // Se desvanece el fondo de CSS: dentro del hueco aparece la página.
    .to(bg, { autoAlpha: 0, duration: 0.2, ease: 'none' }, dive)
    .to(state, { dive: 1, duration: 1.3, ease: 'power2.inOut' }, dive)
    .call(close, null, dive + 1.3);

  draw();
  window.addEventListener('resize', draw);
}

if (gl && !reduceMotion) {
  start(firstVisit());
} else {
  fade();
}
