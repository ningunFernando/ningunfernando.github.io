import vertSrc from '../shaders/mask.vert?raw'
import { createProgramAsync } from './gl.js';

// Todos los fragment shaders de visores, por nombre de archivo: toon.frag → "toon".
const shaders = import.meta.glob('../shaders/viewers/*.frag', { query: '?raw', import: 'default', eager: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const DPR_MAX = 2;
const IDLE = 2500; // milisegundos sin mover el cursor antes de que la luz siga sola

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Arma un visor y devuelve (en una promesa, porque el shader se compila sin bloquear la página)
// la función que lo desarma.
async function mount(viewer) {
  const canvas = viewer.querySelector('canvas');
  const fragSrc = shaders[`../shaders/viewers/${viewer.dataset.shader}.frag`];
  const gl = canvas.getContext('webgl2', { antialias: false, powerPreference: 'low-power' });
  if (!gl || !fragSrc) {
    viewer.classList.add('no-gl');
    return null;
  }

  const program = await createProgramAsync(gl, vertSrc, fragSrc);
  if (!program) return null;
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uDpr = gl.getUniformLocation(program, 'u_dpr');

  // Cada control del visor manda su valor al uniform u_<id>.
  const params = [...viewer.querySelectorAll('input[data-param]')].map((input) => ({
    input,
    output: viewer.querySelector(`output[for="${input.id}"]`),
    location: gl.getUniformLocation(program, `u_${input.dataset.param}`),
  }));

  const light = [0.3, 0.7];
  const aim = [0.3, 0.7];
  let lastMove = -Infinity;
  let last = performance.now();
  let frame = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio, DPR_MAX);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  }

  function draw(now) {
    const still = reduceMotion.matches;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const time = still ? 6 : now / 1000;

    // Sin cursor encima, la luz da vueltas sola (con movimiento reducido, queda quieta).
    if (now - lastMove > IDLE) {
      aim[0] = 0.5 + 0.3 * Math.cos(time * 0.6);
      aim[1] = 0.6 + 0.25 * Math.sin(time * 0.6);
    }
    const k = still ? 1 : 1 - Math.exp(-8 * dt);
    for (let i = 0; i < 2; i++) light[i] += (aim[i] - light[i]) * k;

    resize();
    gl.useProgram(program);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, light[0], light[1]);
    gl.uniform1f(uDpr, dpr);
    for (const param of params) gl.uniform1f(param.location, Number(param.input.value));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function tick(now) {
    draw(now);
    frame = requestAnimationFrame(tick);
  }

  function play() {
    if (frame || reduceMotion.matches) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function pause() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  draw(performance.now());

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) play();
    else pause();
  });
  observer.observe(viewer);

  const controller = new AbortController();
  const listen = { signal: controller.signal };

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    aim[0] = clamp01((event.clientX - rect.left) / rect.width);
    aim[1] = clamp01(1 - (event.clientY - rect.top) / rect.height);
    lastMove = performance.now();
    if (!frame) draw(performance.now());
  };
  canvas.addEventListener('pointermove', point, listen);
  canvas.addEventListener('pointerdown', point, listen);

  for (const param of params) {
    param.input.addEventListener('input', () => {
      const { input } = param;
      param.output.value = input.value;
      // La parte recorrida del deslizador, en porcentaje: el CSS la pinta con el color de la sección.
      const fill = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min));
      input.style.setProperty('--fill', `${fill * 100}%`);
      if (!frame) draw(performance.now());
    }, listen);
  }

  window.addEventListener('resize', () => {
    if (!frame) draw(performance.now());
  }, listen);

  return () => {
    pause();
    observer.disconnect();
    controller.abort();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

// Igual que la intro: se arma en cada página que tenga visores y se desarma antes de salir.
// Cada visor se arma cuando está por entrar en pantalla (200 px antes), no al cargar la página:
// así no le quita tiempo a la carga ni gasta GPU en visores que nadie ha visto.
function setup() {
  const viewers = [...document.querySelectorAll('.viewer')];
  if (!viewers.length) return;

  const destroy = [];
  let left = false;

  const lazy = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      lazy.unobserve(entry.target);
      mount(entry.target).then((fn) => {
        if (!fn) return;
        // Si se salió de la página mientras compilaba, se desarma en cuanto termina.
        if (left) fn();
        else destroy.push(fn);
      });
    }
  }, { rootMargin: '200px 0px' });
  viewers.forEach((viewer) => lazy.observe(viewer));

  document.addEventListener('astro:before-swap', () => {
    left = true;
    lazy.disconnect();
    destroy.forEach((fn) => fn());
  }, { once: true });
}

document.addEventListener('astro:page-load', setup);
