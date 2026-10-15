#version 300 es
precision highp float;

in vec3 v_normal;

uniform float u_tone;  // 0: blanco plano; 1: tres tonos de cel shading
uniform float u_alpha; // opacidad, para la llegada

out vec4 outColor;

void main() {
  // Luz fija en el espacio de la cámara: llega desde arriba, a la izquierda y de frente.
  vec3 light = normalize(vec3(-0.42, 0.66, 0.62));
  float d = dot(normalize(v_normal), light);

  // Cel shading: en vez de un degradado, tres valores duros según la luz que recibe la cara.
  float shade = d > 0.62 ? 1.0 : (d > 0.3 ? 0.78 : 0.56);
  float v = mix(1.0, shade, u_tone);

  // Alfa premultiplicado: el color ya va multiplicado por su opacidad.
  outColor = vec4(vec3(v), 1.0) * u_alpha;
}
