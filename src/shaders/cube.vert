#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;

uniform vec2 u_resolution;
uniform float u_unit;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_gap;

mat3 rotateY(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotateX(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

void main() {
    mat3 view = rotateX(u_pitch) * rotateY(u_yaw);
    vec3 p = view * (a_position + a_normal * u_gap);

    vec2 clip = p.xy * u_unit * 2.0 / u_resolution;
    gl_Position = vec4(clip, -p.z * 0.1, 1.0);
}
