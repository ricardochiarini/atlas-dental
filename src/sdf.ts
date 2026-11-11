/* A mesma função do dente que está em molar.frag, reescrita em TypeScript.
   O shader a usa para desenhar; aqui ela serve para o atlas: achar o ponto exato da
   superfície onde cada rótulo se prende e saber se esse ponto está escondido atrás do dente.
   ATENÇÃO: os números precisam ser iguais aos do shader. Mudou lá, muda aqui. */

export type V = [number, number, number];

const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (x: number, y: number, z: number) => Math.hypot(x, y, z);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function smin(a: number, b: number, k: number) {
  const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

function sdCaixa(p: V, b: V, r: number) {
  const qx = Math.abs(p[0]) - b[0], qy = Math.abs(p[1]) - b[1], qz = Math.abs(p[2]) - b[2];
  return len(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}

function sdElipse(p: V, r: V) {
  const k0 = len(p[0] / r[0], p[1] / r[1], p[2] / r[2]);
  const k1 = len(p[0] / (r[0] * r[0]), p[1] / (r[1] * r[1]), p[2] / (r[2] * r[2]));
  return (k0 * (k0 - 1)) / k1;
}

function sdCapsula(p: V, a: V, b: V, r: number) {
  const pa = sub(p, a), ba = sub(b, a);
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
  return len(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - r;
}

function sdCone(p: V, a: V, b: V, r1: number, r2: number) {
  const ba = sub(b, a), l2 = dot(ba, ba), rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pa = sub(p, a), y = dot(pa, ba), z = y - l2;
  const xv: V = [pa[0] * l2 - ba[0] * y, pa[1] * l2 - ba[1] * y, pa[2] * l2 - ba[2] * y];
  const x2 = dot(xv, xv), y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

const esfera = (p: V, c: V, r: number) => len(p[0] - c[0], p[1] - c[1], p[2] - c[2]) - r;

function dobra(p: V): V {
  const t = clamp(-p[1] / 1.3, 0, 1);
  return [p[0] - 0.1 * t * t, p[1], p[2]];
}

function coroa(p: V) {
  const colo = 0.8 + 0.2 * smoothstep(-0.05, 0.42, p[1]);
  let d = sdCaixa([p[0] / colo, p[1] - 0.34, p[2] / colo], [0.3, 0.17, 0.25], 0.21) * colo;

  d = smin(d, esfera(p, [-0.3, 0.6, 0.22], 0.17), 0.12);
  d = smin(d, esfera(p, [0.04, 0.59, 0.24], 0.16), 0.12);
  d = smin(d, esfera(p, [0.35, 0.54, 0.15], 0.14), 0.12);
  d = smin(d, esfera(p, [-0.28, 0.63, -0.22], 0.17), 0.12);
  d = smin(d, esfera(p, [0.2, 0.61, -0.22], 0.17), 0.12);

  d = smax(d, -sdElipse([p[0] - 0.02, p[1] - 0.8, p[2]], [0.34, 0.15, 0.13]), 0.1);
  d = smax(d, -sdCapsula(p, [-0.36, 0.745, 0], [0.4, 0.705, 0], 0.04), 0.07);
  d = smax(d, -sdCapsula(p, [-0.12, 0.735, 0], [-0.13, 0.62, 0.44], 0.034), 0.07);
  d = smax(d, -sdCapsula(p, [0.22, 0.715, 0], [0.21, 0.58, 0.42], 0.032), 0.07);
  d = smax(d, -sdCapsula(p, [-0.04, 0.735, 0], [-0.04, 0.62, -0.44], 0.034), 0.07);
  return d;
}

function raizes(p: V) {
  const q = dobra(p);
  q[2] *= 0.86;
  const mesial = sdCone(q, [-0.25, 0.1, 0], [-0.34, -1.3, 0], 0.26, 0.055);
  const distal = sdCone(q, [0.25, 0.1, 0], [0.3, -1.2, 0], 0.24, 0.055);
  return smin(mesial, distal, 0.1);
}

export const dente = (p: V) => smin(coroa(p), raizes(p), 0.13);

/** Cavidade pulpar: câmara, cinco cornos e três canais (mésio-vestibular, mésio-lingual e distal). */
export function polpa(p: V) {
  let d = sdElipse([p[0], p[1] - 0.17, p[2]], [0.22, 0.1, 0.14]);
  d = smin(d, sdCone(p, [-0.16, 0.2, 0.1], [-0.26, 0.4, 0.19], 0.045, 0.014), 0.05);
  d = smin(d, sdCone(p, [0.09, 0.2, 0.1], [0.06, 0.39, 0.2], 0.042, 0.014), 0.05);
  d = smin(d, sdCone(p, [0.17, 0.19, 0.07], [0.3, 0.34, 0.13], 0.035, 0.012), 0.05);
  d = smin(d, sdCone(p, [-0.15, 0.2, -0.1], [-0.25, 0.42, -0.19], 0.045, 0.014), 0.05);
  d = smin(d, sdCone(p, [0.12, 0.2, -0.1], [0.19, 0.4, -0.19], 0.042, 0.014), 0.05);
  const q = dobra(p);
  d = smin(d, sdCone(q, [-0.19, 0.11, 0.085], [-0.34, -1.345, 0.025], 0.036, 0.01), 0.05);
  d = smin(d, sdCone(q, [-0.19, 0.11, -0.085], [-0.34, -1.345, -0.025], 0.036, 0.01), 0.05);
  d = smin(d, sdCone([q[0], q[1], q[2] * 0.62], [0.2, 0.11, 0], [0.3, -1.245, 0], 0.048, 0.011), 0.05);
  return d;
}

/** Altura da junção amelocementária em volta do dente. */
export const jac = (p: V) => 0.05 + 0.035 * Math.cos(2 * Math.atan2(p[2], p[0]));

/** Espessura do esmalte naquele ponto. */
export function espessura(p: V) {
  const c = jac(p);
  return (0.085 + 0.05 * smoothstep(0.35, 0.7, p[1])) * smoothstep(c, c + 0.22, p[1]);
}

export type Tecido = 'fora' | 'esmalte' | 'dentina' | 'polpa' | 'cemento';

/** Que tecido existe no ponto p. É a mesma regra que o shader usa para pintar o corte. */
export function tecido(p: V): Tecido {
  const dt = dente(p);
  if (dt > 0) return 'fora';
  if (polpa(p) < 0) return 'polpa';
  const esp = espessura(p);
  if (esp > 0.004 && dt > -esp) return 'esmalte';
  if (p[1] < jac(p) + 0.03 && dt > -0.022) return 'cemento';
  return 'dentina';
}

/** Desfaz a curvatura das raízes: leva um ponto do eixo reto para o lugar real no dente. */
export function desdobra(q: V): V {
  const t = clamp(-q[1] / 1.3, 0, 1);
  return [q[0] + 0.1 * t * t, q[1], q[2]];
}

/** O dente com o corte aplicado: sai tudo em que dot(p, plano) > corte. */
export const cena = (p: V, plano: V, corte: number) => Math.max(dente(p), dot(p, plano) - corte);

export function normal(p: V): V {
  const e = 0.0015;
  const n: V = [
    dente([p[0] + e, p[1], p[2]]) - dente([p[0] - e, p[1], p[2]]),
    dente([p[0], p[1] + e, p[2]]) - dente([p[0], p[1] - e, p[2]]),
    dente([p[0], p[1], p[2] + e]) - dente([p[0], p[1], p[2] - e]),
  ];
  const l = len(n[0], n[1], n[2]) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}

/* Leva um ponto aproximado até a superfície: parte de fora, na direção n, e anda para
   dentro até encostar. Devolve o ponto exato e a normal ali. */
export function assenta(p: V, n: V): { p: V; n: V } {
  const l = len(n[0], n[1], n[2]) || 1;
  const d: V = [n[0] / l, n[1] / l, n[2] / l];
  let t = 0.6;
  for (let i = 0; i < 80; i++) {
    const q: V = [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
    const dist = dente(q);
    if (dist < 0.0008) break;
    t -= dist * 0.85;
  }
  const s: V = [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
  return { p: s, n: normal(s) };
}

/* Há dente entre o ponto e a câmera? Anda do ponto em direção ao olho e vê se bate em algo. */
export function escondido(p: V, n: V, olho: V, plano: V, corte: number): boolean {
  const v = sub(olho, p);
  const l = len(v[0], v[1], v[2]);
  const d: V = [v[0] / l, v[1] / l, v[2] / l];
  let t = 0.035;
  const o: V = [p[0] + n[0] * 0.012, p[1] + n[1] * 0.012, p[2] + n[2] * 0.012];
  for (let i = 0; i < 26 && t < 1.7; i++) {
    const dist = cena([o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t], plano, corte);
    if (dist < 0.003) return true;
    t += Math.max(dist, 0.02);
  }
  return false;
}
