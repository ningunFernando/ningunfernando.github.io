#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_progress;
uniform vec3 u_color;
out vec4 outColor;

const float ANGLE = radians(15.0);
const float BARS = 8.0;
const float MAX_DELAY = 0.4;
const float GRAIN = 0.25;

uint pcg(uint v){
    uint state = v * 747796405u + 2891336037u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

float hash(uint v) {
  return float(pcg(v)) / 4294967295.0;
}

float behind(float along, float front, float n) {
  return step(n * GRAIN + 0.001, front - along);
}

void main(){
    vec2 p = gl_FragCoord.xy / u_resolution.y;

    vec2 dir = vec2(cos(ANGLE), sin(ANGLE));
    vec2 nrm = vec2(-dir.y, dir.x);
    float along = dot(p, dir);
    float across = dot(p, nrm);

    float span = (u_resolution.x / u_resolution.y) * dir.x + dir.y;
    float travel = span + GRAIN + 0.01;

    int id = int(floor(across * BARS));
    float delay = hash(uint(id + 1000)) * MAX_DELAY;
    float dur = 1.0 - MAX_DELAY;

    float tIn = clamp((min(u_progress, 1.0) - delay) / dur, 0.0, 1.0);
    float tOut = clamp((max(u_progress - 1.0, 0.0) -delay) / dur, 0.0, 1.0);

    uvec2 q = uvec2(gl_FragCoord.xy);
    float n = hash(q.x + pcg(q.y));

    float cover = behind(along, tIn * travel, n) * (1.0 - behind(along, tOut * travel, n));

    outColor = vec4(u_color * cover, cover);
}
