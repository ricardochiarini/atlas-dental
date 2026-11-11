/* Molares superiores. Como nos inferiores, os três saem de um molde: muda a coroa, as
   cúspides, os sulcos e as três raízes (duas vestibulares e a palatina).
   O dente é descrito em coordenadas anatômicas (x: mesial − / distal +, y: apical − /
   oclusal +, z: palatina − / vestibular +) para o lado esquerdo; a página o mostra de coroa
   para baixo, e o lado direito é o espelho.
   Nomenclatura da escola brasileira de anatomia dental (Madeira e Rizzolo como referência),
   em revisão pelo autor. */
import type { Dente, Estrutura, V } from '../atlas';
import type { Modelo } from '../modelo';
import { caixa, capsula, cava, cisalha, colo, cone, dobra, elipse, esfera, une, type No } from '../no';

interface Cuspide { id: string; nome: string; texto: string; c: V; r: number; corno: [V, V, number, number]; cornoNome: string; cornoTexto: string }
interface Sulco { id: string; nome: string; texto: string; a: V; b: V; r: number; desce?: boolean }
interface Fosseta { id: string; nome: string; texto: string; c: V; r: V }
interface Raiz { id: string; nome: string; texto: string; a: V; b: V; r1: number; r2: number; fora: V; /** segundo cone, só para a forma: dá secção oval a uma raiz única */ gemea?: [V, V] }
interface Canal { id: string; nome: string; texto: string; a: V; b: V; r1: number; r2: number }

export interface MolarSuperior {
  fdi: number;
  /** o molde serve a todos os dentes posteriores; sem este campo o dente é superior */
  arco?: 'superior' | 'inferior';
  coroa: { b: V; r: number };
  cuspides: Cuspide[];
  /** ponte de esmalte (crista oblíqua), da cúspide mésio-palatina à disto-vestibular */
  ponte: { a: V; b: V; r: number; nome?: string; texto?: string } | null;
  /** tubérculo de Carabelli, na face palatina da cúspide mésio-palatina */
  tuberculo: { c: V; r: number } | null;
  fossetas: Fosseta[];
  sulcos: Sulco[];
  raizes: Raiz[];
  uniao: number;
  curva: number;
  /** inclinação da coroa em relação à raiz: [mesial (−) / distal (+), lingual (−) / vestibular (+)] por unidade de altura */
  inclina?: [number, number];
  /** sulcos longitudinais das raízes: cones escavados [início, fim, raio inicial, raio final], no espaço reto da raiz */
  sulcosRaiz?: [V, V, number, number][];
  /** depressões escavadas no dente pronto (por exemplo a concavidade mesial do primeiro pré-molar superior) */
  depressoes?: { c: V; r: V }[];
  /** entradas da furca: [ponto, direção]; vazio quando as raízes são fusionadas */
  furcas: [V, V][];
  camara: { c: V; r: V };
  canais: Canal[];
  /** posição clássica dos cortes mésio-distal (z) e vestíbulo-palatino (x) */
  cortes: { md: number; vp: number };
  textos: Record<'face-o' | 'face-m' | 'face-d' | 'contato-m' | 'contato-d' | 'tronco' | 'furca' | 'camara' | 'emboc', string>;
  /** troca a descrição de qualquer estrutura pelo id (os textos padrão foram escritos para molares) */
  outrosTextos?: Record<string, string>;
}

const ALTURA = 1.3;
const soma = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const entre = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const reta = (a: V, b: V, n: number): V[] => Array.from({ length: n }, (_, i) => entre(a, b, i / (n - 1)));
const sinal = (v: number) => (v < 0 ? -1 : 1);

export function molarSuperior(p: MolarSuperior): Dente {
  const naRaiz = (no: No) => dobra(p.curva, ALTURA, no);
  const Y0 = 0.05; // a coroa se inclina a partir do colo
  const [incX, incZ] = p.inclina ?? [0, 0];
  const inclinada = (no: No) => (incX || incZ ? cisalha(incX, incZ, Y0, no) : no);

  /* crista triangular de cada cúspide: desce do vértice em direção ao sulco principal */
  const fundo = p.sulcos[0].a[1] - 0.035;
  const cristaDe = (c: Cuspide): [V, V] => [[c.c[0], c.c[1] + c.r - 0.045, c.c[2]], [c.c[0] * 0.45, fundo, c.c[2] * 0.14]];

  /* ---------- forma externa ---------- */
  const macico = une(
    0.12,
    colo(-0.05, 0.42, 0.8, caixa([0, 0.34, 0], p.coroa.b, p.coroa.r)),
    ...p.cuspides.map((c) => esfera(c.c, c.r)),
    ...(p.ponte ? [capsula(p.ponte.a, p.ponte.b, p.ponte.r)] : []),
  );
  const escavado = cava(0.07, une(0.06, cava(0.09, macico, ...p.fossetas.map((f) => elipse(f.c, f.r))), ...p.cuspides.map((c) => capsula(...cristaDe(c), 0.04))), ...p.sulcos.map((s) => capsula(s.a, s.b, s.r)));
  const coroa = p.tuberculo ? une(0.05, escavado, esfera(p.tuberculo.c, p.tuberculo.r)) : escavado;
  const macicas = une(p.uniao, ...p.raizes.flatMap((r) => [cone(r.a, r.b, r.r1, r.r2), ...(r.gemea ? [cone(r.gemea[0], r.gemea[1], r.r1, r.r2)] : [])]));
  const raizes = naRaiz(p.sulcosRaiz?.length ? cava(0.05, macicas, ...p.sulcosRaiz.map((s) => cone(...s))) : macicas);
  const superior = (p.arco ?? 'superior') === 'superior';
  const lingual = superior ? 'palatina' : 'lingual';

  /* ---------- cavidade pulpar ---------- */
  const polpa = une(0.05, inclinada(une(0.05, elipse(p.camara.c, p.camara.r), ...p.cuspides.map((c) => cone(...c.corno)))), ...p.canais.map((c) => naRaiz(cone(c.a, c.b, c.r1, c.r2))));

  /* ---------- estruturas nomeadas ---------- */
  function estruturas(m: Modelo): Estrutura[] {
    const eixo = (a: V, b: V, n: number): V[] => reta(a, b, n).map(m.desdobra);
    const naAltura = (r: Raiz, t: number) => m.desdobra(entre(r.a, r.b, t));

    const anel = (c: V, n: number, funda: (s: V) => number): V[] => {
      const pts: V[] = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.25;
        const dir: V = [Math.cos(a), 0, Math.sin(a)];
        const s = m.assenta([c[0] + dir[0] * 0.05, c[1], c[2] + dir[2] * 0.05], dir);
        const fu = funda(s.p);
        if (fu > 0) pts.push([s.p[0] - s.n[0] * fu, s.p[1] - s.n[1] * fu, s.p[2] - s.n[2] * fu]);
      }
      return pts;
    };
    const COROA: V[] = [0.2, 0.32, 0.44, 0.56].map((y) => [0, y, 0]);
    const RAIZ: V[] = p.raizes.flatMap((r) => [0.3, 0.5, 0.7, 0.88].map((t) => naAltura(r, t)));
    const noEsmalte = COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s) * 0.5));
    const naJuncao = COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s)));
    const naDentina = [...COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s) + 0.07)), ...RAIZ.flatMap((c) => anel(c, 10, () => 0.055))];
    const noCemento = RAIZ.flatMap((c) => anel(c, 10, () => 0.011));

    const t = p.textos;
    const largura = p.coroa.b[0] + p.coroa.r;
    const cam = p.camara;
    const principal = p.sulcos[0];
    /* âncoras em volta de um ponto da raiz: pela face para a qual ela está voltada e pelas vizinhas */
    const emVolta = (c: V, fora: V): [V, V][] => [[c, fora], [c, [fora[2], 0, fora[0]]], [c, [-fora[2], 0, -fora[0]]]];
    const primeira = p.raizes[0], ultima = p.raizes[p.raizes.length - 1];

    const lista: Estrutura[] = [
      /* ---------- Faces e contornos ---------- */
      { id: 'face-v', nome: 'Face vestibular', grupo: 'Faces e contornos', texto: 'Voltada para a bochecha. É convexa, com a maior convexidade no terço cervical, e é marcada pelo sulco vestibular.', externas: [[[0.12, 0.36, 0], [0, 0, 1]]] },
      { id: 'face-l', nome: `Face ${lingual}`, grupo: 'Faces e contornos', texto: superior ? 'Voltada para o palato. É a mais convexa das faces livres e mais larga que a vestibular no primeiro molar.' : 'Voltada para a língua.', externas: [[[0.1, 0.38, 0], [0, 0, -1]]] },
      { id: 'face-m', nome: 'Face mesial', grupo: 'Faces e contornos', texto: t['face-m'], externas: [[[0, 0.3, 0], [-1, 0, 0]]] },
      { id: 'face-d', nome: 'Face distal', grupo: 'Faces e contornos', texto: t['face-d'], externas: [[[0, 0.3, 0], [1, 0, 0]]] },
      { id: 'face-o', nome: 'Face oclusal', grupo: 'Faces e contornos', texto: t['face-o'], externas: [[[-largura * 0.42, 0.3, 0.02], [0, 1, 0]]] },
      { id: 'bossa-v', nome: 'Bossa vestibular', grupo: 'Faces e contornos', texto: 'Maior convexidade da face vestibular, no terço cervical.', externas: [[[-0.05, 0.2, 0], [0, -0.15, 1]]] },
      { id: 'bossa-l', nome: `Bossa ${lingual}`, grupo: 'Faces e contornos', texto: `Maior convexidade da face ${lingual}, no terço médio da coroa.`, externas: [[[0.1, 0.4, 0], [0, 0.1, -1]]] },
      { id: 'contato-m', nome: 'Área de contato mesial', grupo: 'Faces e contornos', texto: t['contato-m'], externas: [[[0, 0.47, 0.08], [-1, 0.1, 0.1]]] },
      { id: 'contato-d', nome: 'Área de contato distal', grupo: 'Faces e contornos', texto: t['contato-d'], externas: [[[0, 0.42, 0.04], [1, 0.1, 0]]] },
      {
        id: 'cervical', nome: 'Linha cervical', grupo: 'Faces e contornos',
        texto: 'Limite entre a coroa e a raiz, o colo anatômico. É a junção amelocementária, onde o esmalte termina e o cemento começa.',
        externas: [[[0, 0.07, 0], [0, 0, 1]], [[0, 0.07, 0], [0, 0, -1]], [[0, 0.03, 0], [-1, 0, 0]], [[0, 0.03, 0], [1, 0, 0]]],
      },

      /* ---------- Cúspides ---------- */
      ...p.cuspides.map((c): Estrutura => {
        const sx = sinal(c.c[0]), sz = sinal(c.c[2]);
        return { id: c.id, nome: c.nome, grupo: 'Cúspides', texto: c.texto, externas: [[c.c, [sx * 0.2, 0.9, sz * 0.4]], [c.c, [sx * 0.15, 0.25, sz]], [c.c, [sx, 0.25, sz * 0.2]]] };
      }),
      ...(p.tuberculo ? [{ id: 'carabelli', nome: 'Tubérculo de Carabelli', grupo: 'Cúspides', texto: 'Pequena elevação na face palatina da cúspide mésio-palatina. É frequente no primeiro molar superior e varia de um sulco raso a uma cúspide acessória.', externas: [[p.tuberculo.c, [-0.2, 0.1, -1]], [p.tuberculo.c, [-0.8, 0.1, -0.6]]] } as Estrutura] : []),

      /* ---------- Sulcos e fossetas ---------- */
      ...p.sulcos.map((s): Estrutura => {
        const sz = sinal(s.b[2] - s.a[2]);
        const externas: [V, V][] = s.desce ? [[entre(s.a, s.b, 0.45), [0, 1, sz * 0.3]], [entre(s.a, s.b, 0.92), [0, 0.55, sz * 0.85]]] : [[entre(s.a, s.b, 0.35), [0, 1, 0]], [entre(s.a, s.b, 0.7), [0, 1, 0]]];
        return { id: s.id, nome: s.nome, grupo: 'Sulcos e fossetas', texto: s.texto, externas };
      }),
      ...p.fossetas.map((f): Estrutura => ({ id: f.id, nome: f.nome, grupo: 'Sulcos e fossetas', texto: f.texto, externas: [[[f.c[0], 0.3, f.c[2]], [0, 1, 0]]] })),

      /* ---------- Cristas e vertentes ---------- */
      ...(p.ponte ? [{ id: 'ponte', nome: p.ponte.nome ?? 'Ponte de esmalte', grupo: 'Cristas e vertentes', texto: p.ponte.texto ?? 'Crista oblíqua que une a cúspide mésio-palatina à disto-vestibular, separando a fosseta central da distal. É a marca do molar superior.', externas: [[entre(p.ponte.a, p.ponte.b, 0.5), [0, 1, 0]], [entre(p.ponte.a, p.ponte.b, 0.3), [0, 1, 0]]] } as Estrutura] : []),
      { id: 'crista-m', nome: 'Crista marginal mesial', grupo: 'Cristas e vertentes', texto: 'Elevação de esmalte que fecha a face oclusal por mesial, unindo a cúspide mésio-vestibular à mésio-palatina.', externas: [[[-(largura - 0.08), principal.a[1] - 0.04, 0.02], [-0.45, 1, 0]]] },
      { id: 'crista-d', nome: 'Crista marginal distal', grupo: 'Cristas e vertentes', texto: 'Fecha a face oclusal por distal. É mais curta que a mesial.', externas: [[[largura - 0.06, principal.a[1] - 0.09, 0], [0.45, 1, 0]]] },
      { id: 'vert-t', nome: 'Vertente triturante', grupo: 'Cristas e vertentes', texto: 'Vertente interna da cúspide, voltada para o centro da face oclusal.', externas: p.cuspides.slice(0, 1).concat(p.cuspides.filter((c) => c.c[2] < 0).slice(0, 1)).map((c): [V, V] => [soma(c.c, [0.04, -0.3, -sinal(c.c[2]) * 0.12]), [0.3, 0.9, -sinal(c.c[2]) * 0.4]]) },
      { id: 'vert-l', nome: 'Vertente lisa', grupo: 'Cristas e vertentes', texto: `Vertente externa da cúspide, voltada para a face livre (vestibular ou ${lingual}).`, externas: p.cuspides.slice(0, 1).concat(p.cuspides.filter((c) => c.c[2] < 0).slice(0, 1)).map((c): [V, V] => [soma(c.c, [0, 0.02, 0]), [-0.1, 0.55, sinal(c.c[2]) * 0.85]]) },

      /* ---------- Raiz ---------- */
      { id: 'tronco', nome: 'Tronco radicular', grupo: 'Raiz', texto: t.tronco, externas: [[[0.02, -0.03, 0], [0, 0, 1]], [[0.02, -0.03, 0], [0, 0, -1]], [[0, -0.03, 0], [-1, 0, 0]]] },
      ...(p.furcas.length ? [{ id: 'furca', nome: 'Furca', grupo: 'Raiz', texto: t.furca, externas: p.furcas.map(([a, d]): [V, V] => [m.desdobra(a), d]) } as Estrutura] : []),
      ...p.raizes.map((r): Estrutura => ({ id: r.id, nome: r.nome, grupo: 'Raiz', texto: r.texto, externas: emVolta(naAltura(r, 0.55), r.fora) })),
      { id: 'terco-c', nome: 'Terço cervical da raiz', grupo: 'Raiz', texto: 'O terço mais próximo da coroa. Inclui o tronco radicular e o começo de cada raiz.', externas: [...emVolta(naAltura(ultima, 0.25), ultima.fora), ...emVolta(naAltura(primeira, 0.25), primeira.fora)] },
      { id: 'terco-m', nome: 'Terço médio da raiz', grupo: 'Raiz', texto: 'A porção intermediária da raiz.', externas: [...emVolta(naAltura(primeira, 0.4), primeira.fora), ...emVolta(naAltura(ultima, 0.4), ultima.fora)] },
      { id: 'terco-a', nome: 'Terço apical da raiz', grupo: 'Raiz', texto: 'O terço final, onde a raiz se afila e o canal se estreita até o forame.', externas: [...emVolta(naAltura(ultima, 0.82), ultima.fora), ...emVolta(naAltura(primeira, 0.82), primeira.fora)] },
      { id: 'apice', nome: 'Ápice radicular', grupo: 'Raiz', texto: 'A extremidade de cada raiz.', externas: p.raizes.flatMap((r): [V, V][] => { const b = m.desdobra(r.b); return [[b, [r.fora[0] * 0.3, -0.7, r.fora[2] * 0.3 + 0.5]], [b, [r.fora[0] * 0.3, -0.7, r.fora[2] * 0.3 - 0.5]], [b, [r.fora[0] * 0.4, -1, r.fora[2] * 0.4]]]; }) },

      /* ---------- Tecidos ---------- */
      { id: 'esmalte', nome: 'Esmalte', grupo: 'Tecidos', tecido: 'esmalte', folga: 0.06, texto: 'O tecido mais mineralizado do corpo. Cobre só a coroa: é mais espesso nas cúspides e afina até terminar na linha cervical.', internas: [...noEsmalte, ...p.cuspides.map((c) => soma(c.c, [0, c.r - 0.05, 0]))] },
      { id: 'jad', nome: 'Junção amelodentinária', grupo: 'Tecidos', folga: 0.05, texto: 'A fronteira entre o esmalte e a dentina. Acompanha o contorno externo da coroa.', internas: naJuncao },
      { id: 'dentina', nome: 'Dentina', grupo: 'Tecidos', tecido: 'dentina', folga: 0.06, texto: 'Forma o corpo do dente, da coroa à raiz. É atravessada por túbulos que vão da polpa em direção ao esmalte e ao cemento.', internas: [...naDentina, [0, 0.45, 0], [0, 0.42, 0.14], [0, 0.42, -0.14], [0.1, -0.02, 0], [-0.05, -0.02, 0.1]] },
      { id: 'cemento', nome: 'Cemento', grupo: 'Tecidos', tecido: 'cemento', folga: 0.07, texto: 'Camada fina que reveste a raiz e ancora as fibras do ligamento periodontal. É mais espesso no terço apical.', internas: noCemento },

      /* ---------- Cavidade pulpar ---------- */
      { id: 'camara', nome: 'Câmara pulpar', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.09, texto: t.camara, internas: [cam.c, ...[-1, 1].flatMap((s): V[] => [soma(cam.c, [s * cam.r[0] * 0.45, 0, 0]), soma(cam.c, [0, 0, s * cam.r[2] * 0.5]), soma(cam.c, [s * cam.r[0] * 0.45, 0, s * cam.r[2] * 0.5])])] },
      { id: 'teto', nome: 'Teto da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede oclusal da câmara, de onde saem os cornos pulpares.', internas: [soma(cam.c, [0, cam.r[1] - 0.002, 0]), ...[-1, 1].flatMap((s): V[] => [soma(cam.c, [s * 0.06, cam.r[1] * 0.92, s * 0.05]), soma(cam.c, [0, cam.r[1] * 0.8, s * cam.r[2] * 0.7])])] },
      { id: 'assoalho', nome: 'Assoalho da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede voltada para a furca. É nele que ficam as embocaduras dos canais.', internas: [soma(cam.c, [0, -cam.r[1] + 0.002, 0]), ...[-1, 1].flatMap((s): V[] => [soma(cam.c, [s * 0.06, -cam.r[1] * 0.95, 0]), soma(cam.c, [0, -cam.r[1] * 0.85, s * cam.r[2] * 0.5])])] },
      ...p.cuspides.map((c): Estrutura => ({ id: `corno-${c.id}`, nome: c.cornoNome, grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: c.cornoTexto, internas: reta(entre(c.corno[0], c.corno[1], 0.3), entre(c.corno[0], c.corno[1], 0.95), 5) })),
      { id: 'emboc', nome: 'Embocadura dos canais', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.05, texto: t.emboc, internas: p.canais.map((c): V => [c.a[0], c.a[1] - 0.02, c.a[2]]) },
      ...p.canais.map((c): Estrutura => ({ id: c.id, nome: c.nome, grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.04, texto: c.texto, internas: eixo(entre(c.a, c.b, 0.09), c.b, 28) })),
      {
        id: 'forame', nome: 'Forame apical', grupo: 'Cavidade pulpar', folga: 0.05,
        texto: 'Abertura do canal radicular na superfície do ápice, por onde o feixe vásculo-nervoso entra no dente. Nem sempre coincide com o vértice anatômico da raiz.',
        externas: p.canais.flatMap((c): [V, V][] => { const b = m.desdobra(c.b); return [[b, [0, -1, 0]], [b, [0, -0.75, 0.65]], [b, [0, -0.75, -0.65]]]; }),
        internas: p.canais.map((c) => m.desdobra(entre(c.a, c.b, 0.995))),
      },
    ];
    const guia = [p.cuspides[0], ...p.cuspides.filter((c) => c.c[2] < 0).slice(0, 1)];
    lista.push({
      id: 'crista-tri', nome: 'Crista triangular', grupo: 'Cristas e vertentes',
      texto: 'Crista que desce do vértice de cada cúspide em direção ao sulco principal, separando as duas vertentes triturantes da cúspide.',
      externas: guia.map((c): [V, V] => { const [a, b] = cristaDe(c); return [entre(a, b, 0.5), [0, 1, -sinal(c.c[2]) * 0.25]]; }),
    });
    /* os pontos foram descritos no dente reto: aplica a inclinação da coroa a eles */
    return lista.map((e) => ({ ...e, texto: p.outrosTextos?.[e.id] ?? e.texto, externas: e.externas?.map(([a, n]): [V, V] => [m.inclina(a), n]), internas: e.grupo === 'Cavidade pulpar' ? e.internas?.map(m.inclina) : e.internas }));
  }

  return {
    fdi: p.fdi,
    arco: superior ? 'superior' : 'inferior',
    lado: 1,
    forma: p.depressoes?.length ? cava(0.06, une(0.13, inclinada(coroa), raizes), ...p.depressoes.map((d) => elipse(d.c, d.r))) : une(0.13, inclinada(coroa), raizes),
    polpa,
    jac: { base: 0.05, onda: 0.035 },
    esmalte: { base: 0.085, extra: 0.05, y0: 0.35, y1: 0.7, faixa: 0.22 },
    cemento: 0.022,
    inclina: { x: incX, z: incZ, y0: Y0 },
    curva: { forca: p.curva, altura: ALTURA },
    centro: [0, -0.26, superior ? -0.05 : 0],
    raio: 1.4,
    chao: superior ? 1.0 : -1.46, // nos superiores a sombra cai do lado da coroa, que aparece embaixo
    planos: [
      { nome: 'Mésio-distal', normal: [0, 0, 1], fora: 0.66, fim: -0.62, padrao: p.cortes.md, vista: [0.26, 0.12] },
      { nome: superior ? 'Vestíbulo-palatino' : 'Vestíbulo-lingual', normal: [-1, 0, 0], fora: 0.62, fim: -0.4, padrao: p.cortes.vp, vista: [-Math.PI / 2 + 0.3, 0.12] },
      { nome: 'Transversal', normal: [0, 1, 0], fora: 0.92, fim: -1.25, padrao: -0.05, vista: [0.25, 1.05] },
    ],
    estruturas,
  };
}
