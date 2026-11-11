/* O modelo de um dente em TypeScript: as mesmas funções que o shader usa para desenhar,
   aqui calculadas no processador. Servem ao atlas: achar o ponto exato da superfície onde
   cada nome se prende, saber que tecido existe num ponto do corte e saber se um ponto está
   escondido atrás do dente. */
import type { Dente, Tecido, V } from './atlas';
import { avalia, degrau, emite, limita } from './no';

export interface Modelo {
  def: Dente;
  dente(p: V): number;
  polpa(p: V): number;
  jac(p: V): number;
  espessura(p: V): number;
  tecido(p: V): Tecido;
  normal(p: V): V;
  /** leva um ponto aproximado até a superfície, andando de fora para dentro na direção n */
  assenta(p: V, n: V): { p: V; n: V };
  /** há dente entre o ponto e a câmera? */
  escondido(p: V, n: V, olho: V, plano: V, corte: number): boolean;
  /** desfaz a curvatura das raízes: leva um ponto do eixo reto para o lugar real */
  desdobra(q: V): V;
}

export function criaModelo(def: Dente): Modelo {
  const dente = (p: V) => avalia(def.forma, p);
  const polpa = (p: V) => avalia(def.polpa, p);
  const jac = (p: V) => def.jac.base + def.jac.onda * Math.cos(2 * Math.atan2(p[2], p[0]));
  const espessura = (p: V) => {
    const c = jac(p), e = def.esmalte;
    return (e.base + e.extra * degrau(e.y0, e.y1, p[1])) * degrau(c, c + e.faixa, p[1]);
  };
  const cena = (p: V, plano: V, corte: number) => Math.max(dente(p), p[0] * plano[0] + p[1] * plano[1] + p[2] * plano[2] - corte);

  const normal = (p: V): V => {
    const e = 0.0015;
    const n: V = [
      dente([p[0] + e, p[1], p[2]]) - dente([p[0] - e, p[1], p[2]]),
      dente([p[0], p[1] + e, p[2]]) - dente([p[0], p[1] - e, p[2]]),
      dente([p[0], p[1], p[2] + e]) - dente([p[0], p[1], p[2] - e]),
    ];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
  };

  return {
    def,
    dente,
    polpa,
    jac,
    espessura,
    normal,
    tecido(p) {
      const dt = dente(p);
      if (dt > 0) return 'fora';
      if (polpa(p) < 0) return 'polpa';
      const esp = espessura(p);
      if (esp > 0.004 && dt > -esp) return 'esmalte';
      if (p[1] < jac(p) + 0.03 && dt > -def.cemento) return 'cemento';
      return 'dentina';
    },
    assenta(p, n) {
      const l = Math.hypot(n[0], n[1], n[2]) || 1;
      const d: V = [n[0] / l, n[1] / l, n[2] / l];
      let t = 0.6;
      for (let i = 0; i < 80; i++) {
        const dist = dente([p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t]);
        if (dist < 0.0008) break;
        t -= dist * 0.85;
      }
      const s: V = [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
      return { p: s, n: normal(s) };
    },
    escondido(p, n, olho, plano, corte) {
      const v: V = [olho[0] - p[0], olho[1] - p[1], olho[2] - p[2]];
      const l = Math.hypot(v[0], v[1], v[2]);
      const d: V = [v[0] / l, v[1] / l, v[2] / l];
      const o: V = [p[0] + n[0] * 0.012, p[1] + n[1] * 0.012, p[2] + n[2] * 0.012];
      let t = 0.035;
      for (let i = 0; i < 26 && t < 1.7; i++) {
        const dist = cena([o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t], plano, corte);
        if (dist < 0.003) return true;
        t += Math.max(dist, 0.02);
      }
      return false;
    },
    desdobra(q) {
      const t = limita(-q[1] / def.curva.altura, 0, 1);
      return [q[0] + def.curva.forca * t * t, q[1], q[2]];
    },
  };
}

/* O trecho de GLSL específico de um dente: forma, polpa, junção amelocementária e esmalte.
   Entra no lugar do marcador do shader base. */
const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
export function glslDoDente(def: Dente): string {
  const e = def.esmalte;
  return [
    emite(def.forma, 'dente'),
    emite(def.polpa, 'polpa'),
    `float jac(vec3 p) { return ${f(def.jac.base)} + ${f(def.jac.onda)} * cos(2.0 * atan(p.z, p.x)); }`,
    `float espessura(vec3 p) { float c = jac(p); return (${f(e.base)} + ${f(e.extra)} * smoothstep(${f(e.y0)}, ${f(e.y1)}, p.y)) * smoothstep(c, c + ${f(e.faixa)}, p.y); }`,
    `const float CEMENTO = ${f(def.cemento)};`,
  ].join('\n');
}
