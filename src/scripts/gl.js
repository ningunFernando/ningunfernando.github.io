//compila el shader y si falla manda el error a consola
function compile(gl, type, src){
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

//une el vertex y el fragment en el  shader en un programa y si falla manda el error a consola
export function createProgram(gl, vertSrc, fragSrc) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

// Como createProgram, pero sin congelar la página mientras se compila. Con la extensión
// KHR_parallel_shader_compile el navegador compila aparte y aquí solo se pregunta, cuadro a cuadro,
// si ya terminó (preguntar LINK_STATUS de inmediato obliga a esperar ahí mismo). Sin la extensión
// se comporta igual que createProgram. Devuelve null si el contexto se perdió mientras tanto
// (por ejemplo, porque se salió de la página).
export async function createProgramAsync(gl, vertSrc, fragSrc) {
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const shaders = [[gl.VERTEX_SHADER, vertSrc], [gl.FRAGMENT_SHADER, fragSrc]].map(([type, src]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  });
  const program = gl.createProgram();
  for (const shader of shaders) gl.attachShader(program, shader);
  gl.linkProgram(program);

  if (parallel) {
    while (!gl.isContextLost() && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
      await new Promise(requestAnimationFrame);
    }
  }
  if (gl.isContextLost()) return null;

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // El error de compilación del shader dice más que el del programa: se manda ese si lo hay.
    const failed = shaders.find((shader) => !gl.getShaderParameter(shader, gl.COMPILE_STATUS));
    throw new Error(failed ? gl.getShaderInfoLog(failed) : gl.getProgramInfoLog(program));
  }
  return program;
}

// Lee un color de tokens.css (#rrggbb) y lo devuelve de 0 a 1, como lo pide WebGL
export function tokenColor(name) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
