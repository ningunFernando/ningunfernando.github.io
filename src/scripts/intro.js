import vertSrc from '../shaders/mask.vert?raw'
import fragSrc from '../shaders/field.frag?raw'
import { createProgram, tokenColor } from './gl.js';
import { findSection } from '../i18n/routes.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const DPR_MAX = 1.5; // tope de resolución: el campo es suave y el grano disimula la diferencia
const IDLE = 2500; // milisegundos sin mover el cursor antes de que la luz siga sola

const clamp01 = (x) => Math.min(1, Math.max(0, x));

// El color de un enlace a una sección; cualquier otra cosa devuelve el color base.
function colorFor(target, base) {
  const link = target instanceof Element ? target.closest('a[href]') : null;
  const section = link && findSection(new URL(link.href).pathname);
  return section ? tokenColor(section.token) : base;
}

// Con ClientRouter este archivo se ejecuta una sola vez, pero la intro se vuelve a montar
// cada vez que se llega al inicio: por eso todo se arma en astro:page-load y se desarma antes de salir.
function setup() {
  const intro = document.querySelector('.intro');
  if (!intro) return;

  const canvas = intro.querySelector('canvas');
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return; // sin WebGL2 queda el fondo oscuro con el nombre

  // El vertex shader es el mismo triángulo que cubre la pantalla en la máscara.
  const program = createProgram(gl, vertSrc, fragSrc);
  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uColor = gl.getUniformLocation(program, 'u_color');

  const base = tokenColor('--shading');
  const color = [...base];
  let target = base;
  const light = [0.5, 0.5]; // donde está la luz
  const aim = [0.5, 0.5]; // hacia donde va
  let lastMove = -Infinity;
  let last = performance.now();
  let frame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, DPR_MAX);
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
    // Con movimiento reducido el tiempo no avanza: siempre el mismo cuadro.
    const time = still ? 6 : now / 1000;

    // Autopiloto: sin cursor, o con el cursor quieto, la luz recorre una curva sola.
    if (still || now - lastMove > IDLE) {
      aim[0] = 0.5 + 0.34 * Math.sin(time * 0.5);
      aim[1] = 0.5 + 0.22 * Math.sin(time * 0.8 + 1);
    }

    // La luz y el color se acercan a su meta una fracción por segundo, no por cuadro,
    // así se mueven igual a 60 que a 120 fps.
    const kLight = still ? 1 : 1 - Math.exp(-8 * dt);
    const kColor = still ? 1 : 1 - Math.exp(-5 * dt);
    for (let i = 0; i < 2; i++) light[i] += (aim[i] - light[i]) * kLight;
    for (let i = 0; i < 3; i++) color[i] += (target[i] - color[i]) * kColor;

    resize();
    gl.useProgram(program);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, light[0], light[1]);
    gl.uniform3fv(uColor, color);
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

  // Un cuadro siempre, aunque no haya animación (movimiento reducido o fuera de pantalla).
  draw(performance.now());

  // Fuera de pantalla no se dibuja.
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) play();
    else pause();
  });
  observer.observe(intro);

  // Todos los listeners se quitan juntos al salir de la página.
  const controller = new AbortController();
  const listen = { signal: controller.signal };

  window.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    aim[0] = clamp01((event.clientX - rect.left) / rect.width);
    aim[1] = clamp01(1 - (event.clientY - rect.top) / rect.height);
    lastMove = performance.now();
  }, listen);

  // Al pasar por (o enfocar) un enlace de shading, tools u otros, el campo toma su color.
  const onPoint = (event) => {
    target = colorFor(event.target, base);
    if (!frame) draw(performance.now());
  };
  document.addEventListener('pointerover', onPoint, listen);
  document.addEventListener('focusin', onPoint, listen);

  window.addEventListener('resize', () => {
    if (!frame) draw(performance.now());
  }, listen);

  // Antes de cambiar de página: parar, quitar listeners y liberar el contexto de WebGL.
  document.addEventListener('astro:before-swap', () => {
    pause();
    observer.disconnect();
    controller.abort();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }, { once: true });
}

document.addEventListener('astro:page-load', setup);
