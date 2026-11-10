#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse; // posición de la luz, de 0 a 1 (origen abajo a la izquierda)
uniform vec3 u_color; // color de la sección

out vec4 outColor;

const vec2 DIR = vec2(0.96593, 0.25882);  // a lo largo de las barras: 15°
const vec2 NRM = vec2(-0.25882, 0.96593); // a través de las barras

float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// Ruido de valor: mezcla suave entre cuatro valores al azar de la cuadrícula.
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// Cuatro capas de ruido, cada una al doble de frecuencia y la mitad de fuerza.
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p = p * 2.02 + 7.3;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  // Coordenadas centradas, con la altura de la pantalla igual a 1.
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float t = u_time;

  // Barras a 15°: cada una se desliza a lo largo de su eje, y las cercanas al cursor, hacia él.
  float across = dot(p, NRM);
  float bar = floor(across * 9.0);
  float r = hash11(bar + 3.7);
  float dn = (across - dot(m, NRM)) * 3.0;
  float near = exp(-dn * dn);
  float drift = (r - 0.5) * 0.9 + 0.10 * sin(t * 0.35 + r * 6.283);
  float pull = near * (dot(m, DIR) - dot(p, DIR)) * 0.30;
  vec2 q = p + DIR * (drift + pull);

  // Tramos en paralelogramo: cada barra se corta en piezas con los extremos oblicuos.
  float seg = (dot(q, DIR) + across * 0.55) * 2.4 + r * 9.0;
  float piece = hash21(vec2(bar, floor(seg)));

  // Variación lenta a gran escala más la luz del cursor, posterizadas en cuatro tonos duros.
  float big = fbm(q * 0.9 + vec2(t * 0.02, 0.0));
  float lit = 1.0 - smoothstep(0.0, 0.9, length(p - m));
  float light = piece * 0.7 + big * 0.45 + lit * 0.7 - 0.05;
  float band = clamp(floor(light * 4.0) / 3.0, 0.0, 1.0);
  vec3 c = mix(vec3(0.03), u_color, 0.12 + 0.88 * band);
  c = mix(c, vec3(1.0), step(0.98, band) * 0.35);

  // Rendijas finas entre barras y entre tramos.
  float edge = abs(fract(across * 9.0) - 0.5);
  c *= 1.0 - max(step(0.485, edge), step(0.965, fract(seg))) * 0.7;

  // Grano, cambiando 12 veces por segundo.
  float g = hash21(gl_FragCoord.xy + floor(t * 12.0) * 17.31);
  c += (g - 0.5) * 0.09;

  outColor = vec4(c, 1.0);
}
