import vertSrc from '../shaders/cube.vert?raw'
import fragSrc from '../shaders/cube.frag?raw'
import { createProgram } from './gl.js';
import gsap from 'gsap';

const HOLE = 0.532;
const GAP = 0.032;
const ISO = Math.asin(1 / Math.sqrt(3)); //35.26 grados de imclinacion de la camara isometrica

const loader = document.getElementById('loader');
const canvas = loader.querySelector('canvas');
const gl = canvas.getContext('webgl2', { premultipliedAlpha: true });

function close() {
  loader.hidden = true;
}

loader.querySelector('button').addEventListener('click', close);

const FACES = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }, // derecha
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] }, // izquierda
  { n: [0, 0, 1,], u: [1, 0, 0], v: [0, 1, 0] }, // frente
  { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }, // atras
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1], hole: true }, // arriba
];

//Armado de los vertices del cubo

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

  //VAO recuerda como leer el buffer de vertices y uqe atributo debe ir a cada shader
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  //6 numoeros de 4 bytes por vertice, 24 bytes al final las normalez inician en el 12
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uUnit = gl.getUniformLocation(program, 'u_unit');
  const uYaw = gl.getUniformLocation(program, 'u_yaw');
  const uPitch = gl.getUniformLocation(program, 'u_pitch');
  const uGap = gl.getUniformLocation(program, 'u_gap');

  gl.enable(gl.CULL_FACE);

  function draw() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uUnit, 0.2 * Math.min(canvas.width, canvas.height));
    gl.uniform1f(uYaw, Math.PI / 4);
    gl.uniform1f(uPitch, ISO);
    gl.uniform1f(uGap, GAP);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
  }

  draw();
  window.addEventListener('resize', draw);
}

if (gl) {
  start();
} else {
  close();
}
