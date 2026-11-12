/* Dentes anteriores: incisivos e caninos. A coroa é uma cunha: larga e espessa no terço
   cervical (cíngulo), fina na borda incisal, com a face lingual escavada pela fossa lingual
   entre as duas cristas marginais. O canino troca a borda incisal por uma cúspide, com duas
   arestas, e tem a fossa lingual dividida por uma crista. Raiz única.
   Coordenadas anatômicas (x: mesial − / distal +, y: apical − / incisal +, z: lingual − /
   vestibular +), lado esquerdo; os superiores são mostrados de coroa para baixo.
   Nomenclatura da escola brasileira de anatomia dental (Madeira e Rizzolo como referência),
   em revisão pelo autor. */
import type { Dente, Estrutura, V } from '../atlas';
import type { Modelo } from '../modelo';
import { afila, caixa, capsula, cava, cisalha, cone, cunha, dobra, elipse, escala, esfera, relevo, une, type No } from '../no';

export interface Anterior {
  fdi: number;
  arco: 'superior' | 'inferior';
  canino: boolean;
  /** altura da borda incisal (ou do vértice da cúspide), meia largura mésio-distal e meia espessura vestíbulo-lingual */
  T: number;
  W: number;
  E: number;
  /** desvio do ângulo distal: quanto mais alto, mais arredondado o ângulo disto-incisal */
  distal: number;
  /** o mesmo para o ângulo mesial; sem valor, o ângulo fica quase reto */
  mesial?: number;
  /** profundidade da fossa lingual em relação à espessura da coroa (padrão 0.62) */
  fossa?: number;
  /** fosseta lingual (forame cego), acima do cíngulo */
  forameCego?: boolean;
  /** largura no colo em relação à largura máxima da coroa (padrão 0.62) */
  colo?: number;
  /** caninos: altura em que cada aresta chega à área de contato [mesial, distal], em fração da coroa */
  arestas?: [number, number];
  /** caninos: quanto o cíngulo, a crista e as fossas linguais são marcados (1 = canino superior) */
  relevoLingual?: number;
  /** mamelões: os três lobos ainda visíveis na borda incisal do dente recém-irrompido */
  mamelos?: boolean;
  /** `triangular`: secção triangular arredondada, com a base para vestibular */
  raiz: { fim: V; r1: number; r2: number; achata: number; triangular?: boolean; /** sulcos longitudinais nas faces proximais */ sulcos?: boolean };
  curva: number;
  inclina?: [number, number];
  textos: Record<'face-v' | 'face-l' | 'incisal' | 'cingulo' | 'fossa' | 'raiz' | 'camara' | 'canal' | 'contato-m' | 'contato-d', string>;
}

const ALTURA = 1.3;
const entre = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const reta = (a: V, b: V, n: number): V[] => Array.from({ length: n }, (_, i) => entre(a, b, i / (n - 1)));

export function anterior(p: Anterior): Dente {
  const { T, W, E } = p;
  const superior = p.arco === 'superior';
  const lingual = superior ? 'palatina' : 'lingual';
  const Y0 = 0.05;
  const [incX, incZ] = p.inclina ?? [0, 0];
  const inclinada = (no: No) => (incX || incZ ? cisalha(incX, incZ, Y0, no) : no);
  const naRaiz = (no: No) => dobra(p.curva, ALTURA, p.raiz.achata !== 1 ? escala([p.raiz.achata, 1, 1], no) : no);

  /* ---------- coroa ---------- */
  let coroa: No;
  if (p.canino) {
    /* corpo bojudo mais um cone que sobe até o vértice da cúspide, um pouco para mesial */
    const RL = p.relevoLingual ?? 1;
    const bojo = afila(0, 0.6 * T, 0.78, elipse([0, 0.42 * T, 0], [W * 1.05, 0.62 * T, E]));
    /* crista vestibular: elevação que desce do vértice da cúspide até o terço cervical */
    const comCrista = une(0.12, bojo, capsula([-0.02, 0.86 * T, 0.68 * E - 0.06], [0, 0.34 * T, E - 0.065], 0.08));
    /* as duas arestas dão à face vestibular o contorno pentagonal: cada uma é um corte quase
       plano (uma esfera grande) do vértice até a área de contato; a mesial é mais curta */
    const aresta = (xc: number, yc: number): No => {
      const tx = xc + 0.03, ty = yc - T, tam = Math.hypot(tx, ty);
      const nx = (Math.sign(xc) * Math.abs(ty)) / tam, ny = Math.abs(tx) / tam;
      return esfera([(xc - 0.03) / 2 + nx * 1.52, (yc + T) / 2 + ny * 1.52, 0], 1.5);
    };
    const corpo = cava(0.05, comCrista, aresta(-W, (p.arestas?.[0] ?? 0.7) * T), aresta(W, (p.arestas?.[1] ?? 0.56) * T));
    /* duas fossas linguais, separadas pela crista lingual */
    coroa = cava(0.06, corpo, elipse([-W * 0.47, 0.6 * T, -E * 0.82], [W * 0.3, 0.2 * T, E * 0.3 * RL]), elipse([W * 0.47, 0.58 * T, -E * 0.82], [W * 0.3, 0.19 * T, E * 0.3 * RL]));
    coroa = une(0.09, coroa, esfera([0, 0.2 * T, -E * 0.5], E * (0.4 + 0.15 * RL))); // cíngulo
    /* espessa no terço cervical e mais fina na cúspide, menos que nos incisivos */
    coroa = cunha(T, 0.35 * T, 0.56, coroa);
  } else {
    /* mais larga no terço incisal, onde ficam as áreas de contato, e estreitando para o colo */
    const corpo = afila(0, 0.85 * T, p.colo ?? 0.62, elipse([0, 0.4 * T, 0], [W * 1.15, 0.8 * T, E]));
    /* borda incisal: corte reto no topo, com o ângulo distal mais arredondado que o mesial */
    const aparada = cava(0.035, corpo, caixa([0, T + 0.5, 0], [2, 0.5, 2], 0), esfera([W + 0.33 - p.distal, T + 0.3, 0], 0.42), ...(p.mesial ? [esfera([-(W + 0.33 - p.mesial), T + 0.3, 0], 0.42)] : []), ...(p.mamelos ? [-1, 1].map((s) => esfera([s * W * 0.3, T + 0.022, 0], 0.04)) : []));
    /* fossa lingual, entre as cristas marginais; abaixo dela fica o cíngulo */
    const escavada = cava(0.06, aparada, elipse([0, 0.62 * T, -E], [W * 0.72, 0.3 * T, E * (p.fossa ?? 0.62)]));
    const comCingulo = une(0.09, escavada, esfera([0, 0.2 * T, -E * 0.55], E * 0.55));
    const comFosseta = p.forameCego ? cava(0.04, comCingulo, esfera([0, 0.37 * T, -E * 0.9], 0.035)) : comCingulo;
    /* a coroa é uma cunha: espessa no terço cervical, fina na borda incisal */
    const emCunha = cunha(T, 0.3 * T, 0.36, comFosseta);
    /* sulcos de desenvolvimento: duas depressões rasas na face vestibular, entre os três lobos,
       que se apagam em direção ao terço médio */
    coroa = relevo(emCunha, ...[-1, 1].map((s) => ({ x: s * W * 0.3, larg: W * 0.13, prof: 0.011, y0: 0.42 * T, y1: 0.92 * T })));
  }

  const inicioRaiz: V = [0, 0.14, 0];
  /* a raiz afila devagar até o terço médio e mais depressa no apical */
  const corpoRaiz = (dz: number, k: number): No => {
    const a: V = [0, inicioRaiz[1], dz];
    const meioRaiz: V = [p.raiz.fim[0] * 0.6, inicioRaiz[1] + (p.raiz.fim[1] - inicioRaiz[1]) * 0.6, dz * 0.6];
    const rm = (p.raiz.r2 + (p.raiz.r1 - p.raiz.r2) * 0.56) * k;
    return une(0.04, cone(a, meioRaiz, p.raiz.r1 * k, rm), cone(meioRaiz, p.raiz.fim, rm, p.raiz.r2));
  };
  /* sulco longitudinal em cada face proximal, do terço cervical ao médio */
  const sulcoRaiz = (s: number): No => {
    const em = (t: number): V => {
      const rm = p.raiz.r2 + (p.raiz.r1 - p.raiz.r2) * 0.56;
      const r = t <= 0.6 ? p.raiz.r1 + (rm - p.raiz.r1) * (t / 0.6) : rm + (p.raiz.r2 - rm) * ((t - 0.6) / 0.4);
      return [s * (r + 0.05), inicioRaiz[1] + (p.raiz.fim[1] - inicioRaiz[1]) * t, 0];
    };
    return capsula(em(0.14), em(0.78), 0.06);
  };
  const comSulcos = (no: No): No => (p.raiz.sulcos ? cava(0.05, no, sulcoRaiz(-1), sulcoRaiz(1)) : no);
  const raiz = naRaiz(p.raiz.triangular ? une(0.1, escala([0.85, 1, 1.2], corpoRaiz(0.05, 0.9)), corpoRaiz(-0.07, 0.78)) : comSulcos(corpoRaiz(0, 1)));

  /* ---------- cavidade pulpar: câmara na coroa, cornos em direção à borda e um canal ---------- */
  const cam = p.canino ? { c: [0, 0.32 * T, E * 0.05] as V, r: [W * 0.4, 0.24 * T, E * 0.21] as V } : { c: [0, 0.3 * T, E * 0.04] as V, r: [W * 0.5, 0.2 * T, E * 0.17] as V };
  const cornos: [V, V][] = p.canino ? [[[0, 0.42 * T, E * 0.06], [-0.03, 0.76 * T, E * 0.05]]] : [[[-W * 0.3, 0.4 * T, E * 0.06], [-W * 0.5, 0.76 * T, E * 0.08]], [[W * 0.3, 0.4 * T, E * 0.06], [W * 0.47, 0.73 * T, E * 0.08]]];
  const fimCanal: V = [p.raiz.fim[0], p.raiz.fim[1] - p.raiz.r2 + 0.01, 0];
  const polpa = une(0.05, inclinada(une(0.05, elipse(cam.c, cam.r), ...cornos.map(([a, b]) => cone(a, b, 0.03, 0.012)))), naRaiz(cone([0, 0.13, 0], fimCanal, 0.05, 0.011)));

  /* ---------- estruturas nomeadas ---------- */
  function estruturas(m: Modelo): Estrutura[] {
    const naAltura = (t: number) => m.desdobra(entre(inicioRaiz, p.raiz.fim, t));
    const anel = (c: V, n: number, funda: (s: V) => number): V[] => {
      const pts: V[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.25;
        const dir: V = [Math.cos(a), 0, Math.sin(a)];
        const s = m.assenta([c[0] + dir[0] * 0.03, c[1], c[2] + dir[2] * 0.03], dir);
        const fu = funda(s.p);
        if (fu > 0) pts.push([s.p[0] - s.n[0] * fu, s.p[1] - s.n[1] * fu, s.p[2] - s.n[2] * fu]);
      }
      return pts;
    };
    const COROA: V[] = [0.22, 0.4, 0.58, 0.76].map((k) => m.inclina([0, k * T, 0]));
    const RAIZ: V[] = [0.25, 0.45, 0.65, 0.85].map(naAltura);
    const noEsmalte = COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s) * 0.5));
    const naJuncao = COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s)));
    const naDentina = [...COROA.flatMap((c) => anel(c, 12, (s) => m.espessura(s) + 0.045)), ...RAIZ.flatMap((c) => anel(c, 10, () => 0.055))];
    const noCemento = RAIZ.flatMap((c) => anel(c, 10, () => 0.011));
    const emVolta = (c: V): [V, V][] => [[c, [0, 0, 1]], [c, [0, 0, -1]], [c, [-1, 0, 0]], [c, [1, 0, 0]]];
    const apice = m.desdobra(p.raiz.fim);
    const t = p.textos;

    const borda: Estrutura[] = p.canino
      ? [
          { id: 'vertice', nome: 'Vértice da cúspide', grupo: 'Cúspides', texto: t.incisal, externas: [[[-0.03, T - 0.2, 0], [0, 1, 0]], [[-0.03, T - 0.15, 0], [0, 0.6, 0.8]], [[-0.03, T - 0.15, 0], [0, 0.6, -0.8]]] },
          { id: 'aresta-m', nome: 'Aresta mesial', grupo: 'Cúspides', texto: 'Borda que desce do vértice da cúspide em direção à face mesial. É mais curta que a distal.', externas: [[[-W * 0.4, 0.8 * T, 0], [-0.55, 0.8, 0.2]], [[-W * 0.4, 0.8 * T, 0], [-0.55, 0.8, -0.2]]] },
          { id: 'aresta-d', nome: 'Aresta distal', grupo: 'Cúspides', texto: 'Borda que desce do vértice em direção à face distal. É mais longa e mais inclinada que a mesial.', externas: [[[W * 0.42, 0.76 * T, 0], [0.6, 0.75, 0.2]], [[W * 0.42, 0.76 * T, 0], [0.6, 0.75, -0.2]]] },
        ]
      : [
          { id: 'borda', nome: 'Borda incisal', grupo: 'Faces e contornos', texto: t.incisal, externas: [[[0, T - 0.2, 0], [0, 1, 0]], [[0, T - 0.12, 0], [0, 0.6, 0.8]], [[0, T - 0.12, 0], [0, 0.6, -0.8]]] },
          ...(p.mamelos ? [{ id: 'mamelos', nome: 'Mamelões', grupo: 'Faces e contornos', texto: 'Três pequenas saliências arredondadas da borda incisal, uma para cada lobo de desenvolvimento vestibular. Existem no dente recém-irrompido e desaparecem com o desgaste.', externas: [[[-W * 0.6, T - 0.12, 0], [0, 0.6, 0.8]], [[W * 0.6, T - 0.12, 0], [0, 0.6, 0.8]]] } as Estrutura] : []),
          { id: 'angulo-m', nome: 'Ângulo mésio-incisal', grupo: 'Faces e contornos', texto: 'Encontro da borda incisal com a face mesial. É quase reto, mais agudo que o distal.', externas: [[[-W * 0.75, T * 0.86, 0], [-0.7, 0.7, 0.2]], [[-W * 0.75, T * 0.86, 0], [-0.7, 0.7, -0.2]]] },
          { id: 'angulo-d', nome: 'Ângulo disto-incisal', grupo: 'Faces e contornos', texto: 'Encontro da borda incisal com a face distal. É arredondado.', externas: [[[W * 0.72, T * 0.82, 0], [0.7, 0.7, 0.2]], [[W * 0.72, T * 0.82, 0], [0.7, 0.7, -0.2]]] },
        ];

    const facesLinguais: Estrutura[] = p.canino
      ? [
          { id: 'crista-v', nome: 'Crista vestibular', grupo: 'Cristas e vertentes', texto: 'Elevação longitudinal da face vestibular, do vértice da cúspide em direção ao colo. Divide a face em duas vertentes, mesial e distal.', externas: [[[-0.01, 0.62 * T, 0], [0, 0.1, 1]]] },
          { id: 'crista-l', nome: `Crista ${lingual}`, grupo: 'Cristas e vertentes', texto: `Elevação que desce do vértice da cúspide até o cíngulo, pelo centro da face ${lingual}, dividindo a fossa em duas.`, externas: [[[0, 0.6 * T, 0], [0, 0.1, -1]]] },
          { id: 'fossa-m', nome: `Fossa mésio-${lingual}`, grupo: 'Sulcos e fossetas', texto: t.fossa, externas: [[[-W * 0.47, 0.6 * T, 0], [-0.15, 0, -1]]] },
          { id: 'fossa-d', nome: `Fossa disto-${lingual}`, grupo: 'Sulcos e fossetas', texto: `Depressão entre a crista ${lingual} e a crista marginal distal.`, externas: [[[W * 0.47, 0.58 * T, 0], [0.15, 0, -1]]] },
        ]
      : [
          { id: 'fossa', nome: `Fossa ${lingual}`, grupo: 'Sulcos e fossetas', texto: t.fossa, externas: [[[0, 0.62 * T, 0], [0, 0.05, -1]]] },
          { id: 'sulcos-des', nome: 'Sulcos de desenvolvimento', grupo: 'Sulcos e fossetas', texto: 'Dois sulcos verticais rasos na face vestibular, que separam os três lobos de desenvolvimento. São mais nítidos no dente recém-irrompido.', externas: [[[-W * 0.3, 0.75 * T, 0], [0, 0, 1]], [[W * 0.3, 0.75 * T, 0], [0, 0, 1]]] },
          ...(p.forameCego ? [{ id: 'forame-cego', nome: 'Forame cego', grupo: 'Sulcos e fossetas', texto: 'Fosseta na face palatina, logo acima do cíngulo. É frequente no incisivo lateral superior e um ponto comum de cárie.', externas: [[[0, 0.37 * T, 0], [0, 0.1, -1]]] } as Estrutura] : []),
        ];

    const lista: Estrutura[] = [
      /* ---------- Faces e contornos ---------- */
      { id: 'face-v', nome: 'Face vestibular', grupo: 'Faces e contornos', texto: t['face-v'], externas: [[[0, 0.5 * T, 0], [0, 0, 1]]] },
      { id: 'face-l', nome: `Face ${lingual}`, grupo: 'Faces e contornos', texto: t['face-l'], externas: [[[W * 0.2, 0.78 * T, 0], [0, 0.1, -1]]] },
      { id: 'face-m', nome: 'Face mesial', grupo: 'Faces e contornos', texto: 'Face proximal voltada para a linha mediana. É triangular, com a base no colo e o vértice na borda incisal.', externas: [[[0, 0.42 * T, 0], [-1, 0, 0]]] },
      { id: 'face-d', nome: 'Face distal', grupo: 'Faces e contornos', texto: 'Face proximal voltada para o dente seguinte da arcada. É mais convexa e mais curta que a mesial.', externas: [[[0, 0.42 * T, 0], [1, 0, 0]]] },
      ...borda,
      { id: 'bossa-v', nome: 'Bossa vestibular', grupo: 'Faces e contornos', texto: 'Maior convexidade da face vestibular, no terço cervical.', externas: [[[0, 0.18 * T, 0], [0, -0.1, 1]]] },
      { id: 'contato-m', nome: 'Área de contato mesial', grupo: 'Faces e contornos', texto: t['contato-m'], externas: [[[0, (p.canino ? 0.68 : 0.84) * T, 0], [-1, 0.1, 0]]] },
      { id: 'contato-d', nome: 'Área de contato distal', grupo: 'Faces e contornos', texto: t['contato-d'], externas: [[[0, (p.canino ? 0.55 : 0.72) * T, 0], [1, 0.1, 0]]] },
      {
        id: 'cervical', nome: 'Linha cervical', grupo: 'Faces e contornos',
        texto: 'Limite entre a coroa e a raiz, a junção amelocementária. Nos dentes anteriores ela se curva bastante em direção incisal nas faces proximais.',
        externas: [[[0, 0.06, 0], [0, 0, 1]], [[0, 0.06, 0], [0, 0, -1]], [[0, 0.12, 0], [-1, 0, 0]], [[0, 0.12, 0], [1, 0, 0]]],
      },

      /* ---------- face lingual: cíngulo, fossa e cristas ---------- */
      { id: 'cingulo', nome: 'Cíngulo', grupo: 'Cristas e vertentes', texto: t.cingulo, externas: [[[0, 0.2 * T, 0], [0, 0.15, -1]], [[0, 0.2 * T, 0], [-0.7, 0.1, -0.7]], [[0, 0.2 * T, 0], [0.7, 0.1, -0.7]]] },
      { id: 'crista-m', nome: 'Crista marginal mesial', grupo: 'Cristas e vertentes', texto: `Elevação de esmalte que limita a face ${lingual} por mesial, do cíngulo ao ângulo incisal.`, externas: [[[-W * 0.84, 0.62 * T, 0], [-0.35, 0, -1]]] },
      { id: 'crista-d', nome: 'Crista marginal distal', grupo: 'Cristas e vertentes', texto: `Elevação de esmalte que limita a face ${lingual} por distal. É mais curta que a mesial.`, externas: [[[W * 0.82, 0.58 * T, 0], [0.35, 0, -1]]] },
      ...facesLinguais,

      /* ---------- Raiz ---------- */
      { id: 'raiz', nome: 'Raiz', grupo: 'Raiz', texto: t.raiz, externas: emVolta(naAltura(0.5)) },
      ...(p.raiz.sulcos ? [{ id: 'sulco-raiz', nome: 'Sulco longitudinal da raiz', grupo: 'Raiz', texto: 'Depressão ao longo de cada face proximal da raiz, que lhe dá uma secção em forma de ampulheta. É mais marcada na face distal.', externas: [[naAltura(0.4), [-1, 0, 0]], [naAltura(0.4), [1, 0, 0]]] } as Estrutura] : []),
      { id: 'terco-c', nome: 'Terço cervical da raiz', grupo: 'Raiz', texto: 'O terço da raiz mais próximo da coroa.', externas: emVolta(naAltura(0.16)) },
      { id: 'terco-m', nome: 'Terço médio da raiz', grupo: 'Raiz', texto: 'A porção intermediária da raiz.', externas: emVolta(naAltura(0.36)) },
      { id: 'terco-a', nome: 'Terço apical da raiz', grupo: 'Raiz', texto: 'O terço final, onde a raiz se afila e o canal se estreita até o forame.', externas: emVolta(naAltura(0.82)) },
      { id: 'apice', nome: 'Ápice radicular', grupo: 'Raiz', texto: 'A extremidade da raiz. Costuma desviar-se levemente para distal.', externas: [[apice, [0, -0.7, 0.6]], [apice, [0, -0.7, -0.6]], [apice, [-0.6, -0.7, 0]], [apice, [0.6, -0.7, 0]]] },

      /* ---------- Tecidos ---------- */
      { id: 'esmalte', nome: 'Esmalte', grupo: 'Tecidos', tecido: 'esmalte', folga: 0.06, texto: 'O tecido mais mineralizado do corpo. Nos anteriores é mais espesso na borda incisal e afina até terminar na linha cervical.', internas: [...noEsmalte, m.inclina([0, T - 0.05, 0]), m.inclina([-W * 0.4, T - 0.07, 0]), m.inclina([W * 0.4, T - 0.09, 0])] },
      { id: 'jad', nome: 'Junção amelodentinária', grupo: 'Tecidos', folga: 0.05, texto: 'A fronteira entre o esmalte e a dentina. Acompanha o contorno externo da coroa.', internas: naJuncao },
      { id: 'dentina', nome: 'Dentina', grupo: 'Tecidos', tecido: 'dentina', folga: 0.06, texto: 'Forma o corpo do dente, da coroa à raiz. É atravessada por túbulos que vão da polpa em direção ao esmalte e ao cemento.', internas: [...naDentina, m.inclina([0, 0.82 * T, E * 0.2]), m.inclina([0, 0.2 * T, -E * 0.5]), [0, 0.02, 0.1]] },
      { id: 'cemento', nome: 'Cemento', grupo: 'Tecidos', tecido: 'cemento', folga: 0.07, texto: 'Camada fina que reveste a raiz e ancora as fibras do ligamento periodontal.', internas: noCemento },

      /* ---------- Cavidade pulpar ---------- */
      { id: 'camara', nome: 'Câmara pulpar', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.09, texto: t.camara, internas: [cam.c, ...[-1, 1].flatMap((s): V[] => [[cam.c[0] + s * cam.r[0] * 0.5, cam.c[1], cam.c[2]], [cam.c[0], cam.c[1] + s * cam.r[1] * 0.5, cam.c[2]]])].map(m.inclina) },
      ...cornos.map(([a, b], i): Estrutura => ({
        id: `corno-${i}`, nome: p.canino ? 'Corno pulpar' : i === 0 ? 'Corno pulpar mesial' : 'Corno pulpar distal', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035,
        texto: p.canino ? 'Prolongamento único da câmara em direção ao vértice da cúspide.' : `Prolongamento da câmara em direção ao ângulo ${i === 0 ? 'mésio' : 'disto'}-incisal. No dente jovem os cornos são altos e próximos da borda.`,
        internas: reta(entre(a, b, 0.3), entre(a, b, 0.95), 5).map(m.inclina),
      })),
      { id: 'canal', nome: 'Canal radicular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.04, texto: t.canal, internas: reta([0, 0.02, 0], fimCanal, 28).map(m.desdobra) },
      {
        id: 'forame', nome: 'Forame apical', grupo: 'Cavidade pulpar', folga: 0.05,
        texto: 'Abertura do canal radicular na superfície do ápice, por onde o feixe vásculo-nervoso entra no dente. Nem sempre coincide com o vértice anatômico da raiz.',
        externas: [[apice, [0, -1, 0]], [apice, [0, -0.75, 0.65]], [apice, [0, -0.75, -0.65]]],
        internas: [m.desdobra(entre([0, 0.13, 0], fimCanal, 0.995))],
      },
    ];
    /* os pontos da coroa foram descritos no dente reto: aplica a inclinação a eles */
    return lista.map((e) => ({ ...e, externas: e.externas?.map(([a, n]): [V, V] => [m.inclina(a), n]) }));
  }

  /* enquadramento: centro e raio da esfera que envolve o dente, do ápice à borda incisal */
  const base = p.raiz.fim[1] - p.raiz.r2;
  const meio = (T + base) / 2;
  return {
    fdi: p.fdi,
    arco: p.arco,
    lado: 1,
    incisal: true,
    forma: une(0.1, inclinada(coroa), raiz),
    polpa,
    jac: { base: 0.07, onda: 0.07 },
    esmalte: { base: 0.06, extra: p.canino ? 0.016 : 0.008, y0: 0.5 * T, y1: 0.95 * T, faixa: 0.28 },
    cemento: 0.022,
    inclina: { x: incX, z: incZ, y0: Y0 },
    curva: { forca: p.curva, altura: ALTURA },
    regioes: { hx: W, hz: E, arestas: p.canino ? [p.arestas?.[0] ?? 0.7, p.arestas?.[1] ?? 0.56] : undefined, topo: T, apice: base, cuspides: p.canino ? [{ nome: 'Vértice da cúspide', r: 0.08, c: ((v: V): V => { const h = Math.max(v[1] - Y0, 0); return [v[0] + incX * h, v[1], v[2] + incZ * h]; })([-0.03, T - 0.08, 0]) }] : [] },
    centro: [0, meio, 0],
    raio: (T - base) / 2 + 0.16,
    chao: superior ? T + 0.14 : base - 0.12,
    planos: [
      /* o corte clássico dos anteriores é o vestíbulo-lingual, pelo meio do dente */
      { nome: superior ? 'Vestíbulo-palatino' : 'Vestíbulo-lingual', normal: [-1, 0, 0], fora: W + 0.12, fim: -(W + 0.05), padrao: -p.curva * 0.2, vista: [-Math.PI / 2 + 0.3, 0.1] }, // o plano acompanha o desvio distal da raiz, para passar pelo canal
      { nome: 'Mésio-distal', normal: [0, 0, 1], fora: E + 0.12, fim: -(E + 0.05), padrao: E * 0.1, vista: [0.26, 0.1] },
      { nome: 'Transversal', normal: [0, 1, 0], fora: T + 0.1, fim: base + 0.1, padrao: -0.15, vista: [0.25, 1.05] },
    ],
    estruturas,
  };
}
