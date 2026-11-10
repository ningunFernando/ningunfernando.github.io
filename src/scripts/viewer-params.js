// Visores de shader disponibles para las piezas (campo `viewer` en la colección).
// Cada parámetro llega al shader como el uniform `u_<id>`; su texto está en ui.js como `viewer.<id>`.
export const viewers = {
  toon: {
    params: [
      { id: 'bands', min: 1, max: 8, step: 1, value: 4 },
      { id: 'softness', min: 0, max: 0.5, step: 0.01, value: 0.17 },
      { id: 'specular', min: 0, max: 0.5, step: 0.01, value: 0.13 },
      { id: 'outline', min: 0, max: 8, step: 1, value: 4 },
    ],
  },
};
