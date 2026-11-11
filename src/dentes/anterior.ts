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
import { afila, caixa, capsula, cava, cisalha, cone, dobra, elipse, escala, esfera, une, type No } from '../no';

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
  /** fosseta lingual (forame cego), acima do cíngulo */
  forameCego?: boolean;
  raiz: { fim: V; r1: number; r2: number; achata: number };
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
    const corpo = une(0.1, afila(0, 0.6 * T, 0.78, elipse([0, 0.38 * T, 0], [W * 1.05, 0.56 * T, E])), cone([0, 0.5 * T, 0], [-0.03, T - 0.06, 0.02], W * 0.86, 0.06));
    /* duas fossas linguais, separadas pela crista lingual */
    coroa = cava(0.06, corpo, elipse([-W * 0.47, 0.6 * T, -E * 0.82], [W * 0.3, 0.2 * T, E * 0.3]), elipse([W * 0.47, 0.58 * T, -E * 0.82], [W * 0.3, 0.19 * T, E * 0.3]));
    coroa = une(0.09, coroa, esfera([0, 0.2 * T, -E * 0.5], E * 0.55)); // cíngulo
  } else {
    /* mais larga no terço incisal, onde ficam as áreas de contato, e estreitando para o colo */
    const corpo = afila(0, 0.85 * T, 0.62, elipse([0, 0.4 * T, 0], [W * 1.15, 0.8 * T, E]));
    /* borda incisal: corte reto no topo, com o ângulo distal mais arredondado que o mesial */
    const aparada = cava(0.035, corpo, caixa([0, T + 0.5, 0], [2, 0.5, 2], 0), esfera([W + 0.33 - p.distal, T + 0.3, 0], 0.42));
    /* fossa lingual, entre as cristas marginais; abaixo dela fica o cíngulo */
    const escavada = cava(0.06, aparada, elipse([0, 0.62 * T, -E], [W * 0.72, 0.3 * T, E * 0.62]));
    const comCingulo = une(0.09, escavada, esfera([0, 0.2 * T, -E * 0.55], E * 0.55));
    /* sulcos de desenvolvimento na face vestibular, separando os três lobos */
    const sulcos = [-1, 1].map((s) => capsula([s * W * 0.3, 0.93 * T, 0.6 * E + 0.025], [s * W * 0.3, 0.6 * T, 0.89 * E + 0.025], 0.03));
    coroa = cava(0.04, comCingulo, ...sulcos, ...(p.forameCego ? [esfera([0, 0.37 * T, -E * 0.9], 0.035)] : []));
  }

  const inicioRaiz: V = [0, 0.14, 0];
  const raiz = naRaiz(cone(inicioRaiz, p.raiz.fim, p.raiz.r1, p.raiz.r2));

  /* ---------- cavidade pulpar: câmara na coroa, cornos em direção à borda e um canal ---------- */
  const cam = { c: [0, 0.36 * T, E * 0.08] as V, r: [W * 0.52, 0.28 * T, E * 0.27] as V };
  const cornos: [V, V][] = p.canino ? [[[0, 0.48 * T, E * 0.1], [-0.03, 0.8 * T, E * 0.08]]] : [[[-W * 0.28, 0.5 * T, E * 0.16], [-W * 0.42, 0.76 * T, E * 0.18]], [[W * 0.28, 0.5 * T, E * 0.16], [W * 0.4, 0.74 * T, E * 0.18]]];
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
          { id: 'angulo-m', nome: 'Ângulo mésio-incisal', grupo: 'Faces e contornos', texto: 'Encontro da borda incisal com a face mesial. É quase reto, mais agudo que o distal.', externas: [[[-W * 0.75, T * 0.86, 0], [-0.7, 0.7, 0.2]], [[-W * 0.75, T * 0.86, 0], [-0.7, 0.7, -0.2]]] },
          { id: 'angulo-d', nome: 'Ângulo disto-incisal', grupo: 'Faces e contornos', texto: 'Encontro da borda incisal com a face distal. É arredondado.', externas: [[[W * 0.72, T * 0.82, 0], [0.7, 0.7, 0.2]], [[W * 0.72, T * 0.82, 0], [0.7, 0.7, -0.2]]] },
        ];

    const facesLinguais: Estrutura[] = p.canino
      ? [
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
    esmalte: { base: 0.06, extra: 0.035, y0: 0.5 * T, y1: 0.95 * T, faixa: 0.28 },
    cemento: 0.022,
    inclina: { x: incX, z: incZ, y0: Y0 },
    curva: { forca: p.curva, altura: ALTURA },
    centro: [0, meio, 0],
    raio: (T - base) / 2 + 0.16,
    chao: superior ? T + 0.14 : base - 0.12,
    planos: [
      /* o corte clássico dos anteriores é o vestíbulo-lingual, pelo meio do dente */
      { nome: superior ? 'Vestíbulo-palatino' : 'Vestíbulo-lingual', normal: [-1, 0, 0], fora: W + 0.12, fim: -(W + 0.05), padrao: 0, vista: [-Math.PI / 2 + 0.3, 0.1] },
      { nome: 'Mésio-distal', normal: [0, 0, 1], fora: E + 0.12, fim: -(E + 0.05), padrao: E * 0.1, vista: [0.26, 0.1] },
      { nome: 'Transversal', normal: [0, 1, 0], fora: T + 0.1, fim: base + 0.1, padrao: -0.15, vista: [0.25, 1.05] },
    ],
    estruturas,
  };
}
