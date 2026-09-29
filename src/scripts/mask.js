import vertSrc from '../shaders/mask.vert?raw'
import fragSrc from '../shaders/mask.frag?raw'
import gsap from 'gsap';

const canvas = document.getElementById('mask');
const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true });
if (!gl) throw new Error('WebGL2 no disponible');

function compile(type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function link(vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
}

const program = link(
  compile(gl.VERTEX_SHADER, vertSrc),
  compile(gl.FRAGMENT_SHADER, fragSrc),
);

const uResolution = gl.getUniformLocation(program, 'u_resolution');
const uProgress = gl.getUniformLocation(program, 'u_progress');
const uColor = gl.getUniformLocation(program, 'u_color');

const state = {
  progress: 0,
  color: [0.545, 0.361, 0.965],
}

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

function draw() {
  resize();
  gl.useProgram(program);
  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform1f(uProgress, state.progress);
  gl.uniform3fv(uColor, state.color);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

}

draw();
window.addEventListener('resize', draw);

const COLORS = {
  '/': '#f5f5f5',
  '/arte': '#8B5CF6',
  '/software': '#3DF5A2',
  '/foto': '#FFB13B',
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function colorFor(url){
  const path = url.pathname.replace(/\/$/, '') || '/';
  return hexToRgb(COLORS[path] ?? COLORS['/'])
}

function tween(to, duration) {
  return new Promise((resolve) => {
    gsap.to(state, {
      progress: to,
      duration,
      ease: 'power2.inOut',
      onUpdate: draw,
      onComplete: resolve,
    });
  });
}

let covered = false;

document.addEventListener('astro:before-preparation', (e) => {
  const load = e.loader;
  e.loader = async () => {
    state.color = colorFor(e.to);
    await Promise.all([tween(1, 0.2), load()]);
    covered = true;
  };
});

document.addEventListener('astro:page-load', async () => {
  if (!covered) return; // ignora la carga inicial
  covered = false;
  await tween(2, 0.7);
  state.progress = 0;
  draw();
});
