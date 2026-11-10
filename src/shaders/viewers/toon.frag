#version 300 es
precision highp float;

// Port a GLSL de la iluminación toon de ShaderTesting_TeamIgloo (ToonLighting.hlsl y SG_ToonShadingV2),
// con los valores de su material M_ToonBasic, sobre una esfera. Sin shadow map: la sombra propia la da la rampa.

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse; // posición de la luz, de 0 a 1
uniform float u_dpr;

// Parámetros del visor
uniform float u_bands;    // _Bands
uniform float u_softness; // _Softness
uniform float u_specular; // _SpecularSize
uniform float u_outline;  // _OutlineWidth, en píxeles, como el casco invertido

out vec4 outColor;

// M_ToonBasic. Unity guarda los colores del material en sRGB.
const vec3 BASE = vec3(0.8584906);
const vec3 SHADOW = vec3(0.22190587, 0.0, 0.6415094);
const vec3 RIM = vec3(0.1981132);
const vec3 OUTLINE = vec3(0.0); // M_OutlineHullPlayer
const vec3 AMBIENT_SKY = vec3(0.212, 0.227, 0.259); // lineal; con Flatness 1 la normal del ambiente mira arriba
const float OFFSET = 0.122;
const float SPEC_MASK = 0.387;
const float RIM_SIZE = 0.042;
const float EPS = 0.0001;

vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 toSrgb(vec3 c) { return pow(c, vec3(1.0 / 2.2)); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// ToonRamp en modo procedural: bandas con un borde de suavidad ajustable a mitad de cada una.
float toonRamp(float value) {
  float x = clamp(value + OFFSET, 0.0, 1.0);
  float count = max(u_bands, 1.0);
  float scaled = x * count;
  float band = floor(scaled);
  float edge = max(u_softness, EPS);
  float blend = smoothstep(0.5 - edge, 0.5 + edge, scaled - band);
  return clamp((band + blend) / count, 0.0, 1.0);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  vec3 L = normalize(vec3((u_mouse.x - 0.5) * 2.6, (u_mouse.y - 0.5) * 2.0 + 0.45, 0.85));
  vec3 V = vec3(0.0, 0.0, 1.0);

  float R = 0.31;
  float floorY = -0.2;
  vec2 C = vec2(0.0, floorY + R + 0.02);

  // Fondo y suelo en gris oscuro (más claros que el contorno negro, para que se vea),
  // con una sombra dura que se mueve con la luz.
  vec3 col = p.y < floorY ? vec3(0.2) : vec3(0.14);
  vec2 sp = p - vec2(-L.x * 0.28, floorY - 0.045);
  if (length(sp / vec2(0.30 + abs(L.x) * 0.12, 0.05)) < 1.0) col = vec3(0.09);

  vec2 d = p - C;
  float r = length(d);
  float w = u_outline * u_dpr / u_resolution.y;

  if (r < R) {
    vec3 n = vec3(d, sqrt(R * R - r * r)) / R;

    // Difuso: rampa sobre half-Lambert, de ShadowColor al color de la luz (blanco), más el ambiente.
    float halfLambert = dot(n, L) * 0.5 + 0.5;
    float shade = toonRamp(halfLambert);
    vec3 light = mix(toLinear(SHADOW), vec3(1.0), shade);
    vec3 lit = (light + AMBIENT_SKY) * toLinear(BASE);

    // Especular toon: smoothstep sobre N·H con umbral 1 − size², enmascarado por el shade.
    float ndh = clamp(dot(n, normalize(L + V)), 0.0, 1.0);
    float size2 = u_specular * u_specular;
    float threshold = 1.0 - size2;
    float edge = EPS * size2 + EPS;
    float spec = smoothstep(threshold - edge, threshold + edge, ndh) * shade * SPEC_MASK;

    // Rim: borde duro con 1 − N·V.
    float rim = smoothstep(1.0 - RIM_SIZE, 1.0 - RIM_SIZE + EPS, 1.0 - n.z);

    col = toSrgb(lit + vec3(spec) + toLinear(RIM) * rim);
  } else if (r < R + w) {
    col = OUTLINE;
  }

  float g = hash21(gl_FragCoord.xy + floor(u_time * 12.0) * 13.7);
  col += (g - 0.5) * 0.05;
  outColor = vec4(col, 1.0);
}
