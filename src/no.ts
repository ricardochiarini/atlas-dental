/* A forma de um dente é uma árvore de nós: peças simples (esfera, caixa, cone...) unidas,
   escavadas e deformadas. A mesma árvore serve a dois fins:
     - avalia(): calcula a distância em TypeScript, para o atlas prender e esconder os nomes;
     - emite(): escreve o código GLSL equivalente, que o shader usa para desenhar.
   Assim a fórmula de cada dente é escrita uma única vez. */

export type V = [number, number, number];

export type No =
  | { t: 'esfera'; c: V; r: number }
  | { t: 'caixa'; c: V; b: V; r: number }
  | { t: 'elipse'; c: V; r: V }
  | { t: 'capsula'; a: V; b: V; r: number }
  | { t: 'cone'; a: V; b: V; r1: number; r2: number }
  /** união suave: quanto maior k, mais as peças se fundem */
  | { t: 'une'; k: number; nos: No[] }
  /** escava as peças de `nos` na `base`, com borda suave */
  | { t: 'cava'; k: number; base: No; nos: No[] }
  /** estreita a peça em direção ao colo: abaixo de y0 a largura cai para `min` */
  | { t: 'colo'; y0: number; y1: number; min: number; no: No; /** estreita só no sentido mésio-distal */ soX?: boolean; /** estreita só no sentido vestíbulo-lingual */ soZ?: boolean }
  /** sulcos rasos na face vestibular: afundam a superfície sem escavar uma fenda */
  | { t: 'relevo'; no: No; sulcos: { x: number; larg: number; prof: number; y0: number; y1: number }[] }
  /** curva a peça no eixo x conforme desce (raízes) */
  | { t: 'dobra'; forca: number; altura: number; no: No }
  /** multiplica as coordenadas antes de medir: valores menores que 1 alargam a peça */
  | { t: 'escala'; s: V; no: No }
  /** inclina a peça acima de y0: a cada unidade de altura ela se desloca kx em x e kz em z (inclinação da coroa) */
  | { t: 'cisalha'; kx: number; kz: number; y0: number; no: No }
  /** espelha no eixo mésio-distal: transforma um dente esquerdo no direito */
  | { t: 'espelho'; no: No };

/* ---------- atalhos para escrever as fichas ---------- */
export const esfera = (c: V, r: number): No => ({ t: 'esfera', c, r });
export const caixa = (c: V, b: V, r: number): No => ({ t: 'caixa', c, b, r });
export const elipse = (c: V, r: V): No => ({ t: 'elipse', c, r });
export const capsula = (a: V, b: V, r: number): No => ({ t: 'capsula', a, b, r });
export const cone = (a: V, b: V, r1: number, r2: number): No => ({ t: 'cone', a, b, r1, r2 });
export const une = (k: number, ...nos: No[]): No => ({ t: 'une', k, nos });
export const cava = (k: number, base: No, ...nos: No[]): No => ({ t: 'cava', k, base, nos });
export const colo = (y0: number, y1: number, min: number, no: No): No => ({ t: 'colo', y0, y1, min, no });
/** como o colo, mas só na largura mésio-distal: a coroa dos anteriores é mais larga na borda incisal que no colo */
export const afila = (y0: number, y1: number, min: number, no: No): No => ({ t: 'colo', y0, y1, min, no, soX: true });
/** como o colo, mas só na espessura vestíbulo-lingual; com y0 acima de y1 a peça afina para cima, em cunha */
export const cunha = (y0: number, y1: number, min: number, no: No): No => ({ t: 'colo', y0, y1, min, no, soZ: true });
export const relevo = (no: No, ...sulcos: { x: number; larg: number; prof: number; y0: number; y1: number }[]): No => ({ t: 'relevo', no, sulcos });
export const dobra = (forca: number, altura: number, no: No): No => ({ t: 'dobra', forca, altura, no });
export const escala = (s: V, no: No): No => ({ t: 'escala', s, no });
export const cisalha = (kx: number, kz: number, y0: number, no: No): No => ({ t: 'cisalha', kx, kz, y0, no });
export const espelho = (no: No): No => ({ t: 'espelho', no });

/* ---------- matemática comum ---------- */
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (x: number, y: number, z: number) => Math.hypot(x, y, z);
export const limita = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const degrau = (a: number, b: number, x: number) => {
  const t = limita((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function smin(a: number, b: number, k: number) {
  const h = limita(0.5 + (0.5 * (b - a)) / k, 0, 1);
  return b + (a - b) * h - k * h * (1 - h);
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

/* ---------- avaliação em TypeScript ---------- */
export function avalia(no: No, p: V): number {
  switch (no.t) {
    case 'esfera':
      return len(p[0] - no.c[0], p[1] - no.c[1], p[2] - no.c[2]) - no.r;
    case 'caixa': {
      const qx = Math.abs(p[0] - no.c[0]) - no.b[0], qy = Math.abs(p[1] - no.c[1]) - no.b[1], qz = Math.abs(p[2] - no.c[2]) - no.b[2];
      return len(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - no.r;
    }
    case 'elipse': {
      const x = p[0] - no.c[0], y = p[1] - no.c[1], z = p[2] - no.c[2], r = no.r;
      const k0 = len(x / r[0], y / r[1], z / r[2]);
      const k1 = len(x / (r[0] * r[0]), y / (r[1] * r[1]), z / (r[2] * r[2]));
      return (k0 * (k0 - 1)) / k1;
    }
    case 'capsula': {
      const pa = sub(p, no.a), ba = sub(no.b, no.a);
      const h = limita(dot(pa, ba) / dot(ba, ba), 0, 1);
      return len(pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h) - no.r;
    }
    case 'cone':
      return sdCone(p, no.a, no.b, no.r1, no.r2);
    case 'une': {
      let d = avalia(no.nos[0], p);
      for (let i = 1; i < no.nos.length; i++) d = smin(d, avalia(no.nos[i], p), no.k);
      return d;
    }
    case 'cava': {
      let d = avalia(no.base, p);
      for (const n of no.nos) d = -smin(-d, avalia(n, p), no.k); // smax(d, -n, k)
      return d;
    }
    case 'colo': {
      const s = no.min + (1 - no.min) * degrau(no.y0, no.y1, p[1]);
      return avalia(no.no, [no.soZ ? p[0] : p[0] / s, p[1], no.soX ? p[2] : p[2] / s]) * s;
    }
    case 'relevo': {
      let d = avalia(no.no, p);
      const frente = degrau(0, 0.08, p[2]);
      for (const s of no.sulcos) d += s.prof * Math.exp(-(((p[0] - s.x) / s.larg) ** 2)) * degrau(s.y0, s.y1, p[1]) * frente;
      return d;
    }
    case 'dobra': {
      const t = limita(-p[1] / no.altura, 0, 1);
      return avalia(no.no, [p[0] - no.forca * t * t, p[1], p[2]]);
    }
    case 'escala':
      return avalia(no.no, [p[0] * no.s[0], p[1] * no.s[1], p[2] * no.s[2]]);
    case 'cisalha': {
      const h = Math.max(p[1] - no.y0, 0);
      return avalia(no.no, [p[0] - no.kx * h, p[1], p[2] - no.kz * h]);
    }
    case 'espelho':
      return avalia(no.no, [-p[0], p[1], p[2]]);
  }
}

/* ---------- geração de GLSL ---------- */
const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(Number(n.toFixed(6))));
const v3 = (v: V) => `vec3(${f(v[0])}, ${f(v[1])}, ${f(v[2])})`;

/** Escreve a função GLSL `float nome(vec3 p)` equivalente à árvore. As funções auxiliares
    ganham o mesmo prefixo, para duas árvores (dente e polpa) não colidirem. */
export function emite(no: No, nome: string): string {
  const funcoes: string[] = [];
  let conta = 0;
  const nova = (corpo: string) => {
    const id = `${nome}_${conta++}`;
    funcoes.push(`float ${id}(vec3 p) {\n${corpo}\n}`);
    return id;
  };

  /* devolve uma expressão GLSL que vale a distância do nó no ponto `pt` */
  const expr = (n: No, pt: string): string => {
    switch (n.t) {
      case 'esfera':
        return `(length(${pt} - ${v3(n.c)}) - ${f(n.r)})`;
      case 'caixa':
        return `sdCaixa(${pt} - ${v3(n.c)}, ${v3(n.b)}, ${f(n.r)})`;
      case 'elipse':
        return `sdElipse(${pt} - ${v3(n.c)}, ${v3(n.r)})`;
      case 'capsula':
        return `sdCapsula(${pt}, ${v3(n.a)}, ${v3(n.b)}, ${f(n.r)})`;
      case 'cone':
        return `sdCone(${pt}, ${v3(n.a)}, ${v3(n.b)}, ${f(n.r1)}, ${f(n.r2)})`;
      case 'une': {
        const linhas = n.nos.map((x, i) => (i ? `  d = smin(d, ${expr(x, 'p')}, ${f(n.k)});` : `  float d = ${expr(x, 'p')};`));
        return `${nova([...linhas, '  return d;'].join('\n'))}(${pt})`;
      }
      case 'cava': {
        const linhas = [`  float d = ${expr(n.base, 'p')};`, ...n.nos.map((x) => `  d = smax(d, -${expr(x, 'p')}, ${f(n.k)});`), '  return d;'];
        return `${nova(linhas.join('\n'))}(${pt})`;
      }
      case 'colo': {
        const dentro = expr(n.no, 'q');
        /* a rampa é escrita à mão porque smoothstep não aceita y0 maior que y1 (a cunha usa) */
        const linhas = [
          `  float t = clamp((p.y - ${f(n.y0)}) / ${f(n.y1 - n.y0)}, 0.0, 1.0);`,
          `  float s = mix(${f(n.min)}, 1.0, t * t * (3.0 - 2.0 * t));`,
          `  vec3 q = p; ${n.soX ? 'q.x' : n.soZ ? 'q.z' : 'q.xz'} /= s;`,
          `  return ${dentro} * s;`,
        ];
        return `${nova(linhas.join('\n'))}(${pt})`;
      }
      case 'relevo': {
        const linhas = [
          `  float d = ${expr(n.no, 'p')};`,
          '  float frente = smoothstep(0.0, 0.08, p.z);',
          ...n.sulcos.map((s) => `  { float u = (p.x - ${f(s.x)}) / ${f(s.larg)}; d += ${f(s.prof)} * exp(-u * u) * smoothstep(${f(s.y0)}, ${f(s.y1)}, p.y) * frente; }`),
          '  return d;',
        ];
        return `${nova(linhas.join('\n'))}(${pt})`;
      }
      case 'dobra': {
        const dentro = expr(n.no, 'q');
        return `${nova(`  float t = clamp(-p.y / ${f(n.altura)}, 0.0, 1.0);\n  vec3 q = p; q.x -= ${f(n.forca)} * t * t;\n  return ${dentro};`)}(${pt})`;
      }
      case 'escala':
        return expr(n.no, `(${pt} * ${v3(n.s)})`);
      case 'cisalha': {
        const dentro = expr(n.no, 'q');
        return `${nova(`  float h = max(p.y - ${f(n.y0)}, 0.0);\n  vec3 q = p; q.x -= ${f(n.kx)} * h; q.z -= ${f(n.kz)} * h;\n  return ${dentro};`)}(${pt})`;
      }
      case 'espelho':
        return expr(n.no, `(${pt} * vec3(-1.0, 1.0, 1.0))`);
    }
  };

  const raiz = expr(no, 'p');
  return `${funcoes.join('\n')}\nfloat ${nome}(vec3 p) { return ${raiz}; }`;
}
