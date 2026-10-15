import vertSrc from '../shaders/cube.vert?raw'
import fragSrc from '../shaders/cube.frag?raw'
import { createProgram } from './gl.js';
import gsap from 'gsap';

const HOLE = 0.532;
const GAP = 0.032;
const SPREAD = 0.85; // distancia desde la que llegan las caras
const ISO = Math.asin(1 / Math.sqrt(3)); // 35.26 grados de inclinación de la cámara isométrica

const loader = document.getElementById('loader');
const canvas = loader.querySelector('canvas');
const gl = canvas.getContext('webgl2', { premultipliedAlpha: true });

let timeline = null;

function close() {
  timeline?.kill();
  loader.hidden = true;
}

loader.querySelector('button').addEventListener('click', close);

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
  return new Float32Array(data);
}

function start() {
  const program = createProgram(gl, vertSrc, fragSrc);
  const vertices = buildCube();

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
  const uTone = gl.getUniformLocation(program, 'u_tone');
  const uAlpha = gl.getUniformLocation(program, 'u_alpha');

  gl.enable(gl.CULL_FACE);

  // Lo que anima la línea de tiempo: cada parte va de 0 a 1.
  const state = { assemble: 0, turn: 0 };

  function draw() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Llegada: las caras vienen de lejos y se juntan hasta la separación del isotipo.
    const gap = GAP + (1 - state.assemble) * SPREAD;
    // Cuarto de vuelta: de 45° a 135°. El cubo se repite cada 90°, así que aterriza igual.
    const yaw = Math.PI / 4 + (state.turn * Math.PI) / 2;
    // Los tonos suben a mitad del giro y vuelven a 0 al aterrizar: blanco plano otra vez.
    const tone = Math.sin(Math.PI * state.turn);
    const alpha = Math.min(1, state.assemble * 2);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uUnit, 0.2 * Math.min(canvas.width, canvas.height));
    gl.uniform1f(uYaw, yaw);
    gl.uniform1f(uPitch, ISO);
    gl.uniform1f(uGap, gap);
    gl.uniform1f(uTone, tone);
    gl.uniform1f(uAlpha, alpha);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
  }

  // Línea de tiempo: llegada (0–0.8 s), cuarto de vuelta (1.05–2.15 s) y cierre.
  timeline = gsap
    .timeline({ onUpdate: draw })
    .to(state, { assemble: 1, duration: 0.8, ease: 'power2.out' })
    .to(state, { turn: 1, duration: 1.1, ease: 'power2.inOut' }, 1.05)
    // Por ahora la carga se cierra aquí; en F3.1c aquí empieza la bajada al hueco.
    .call(close, null, 2.55);

  draw();
  window.addEventListener('resize', draw);
}

if (gl) {
  start();
} else {
  close();
}
