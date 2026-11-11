/* Molares inferiores. Os três (primeiro, segundo e terceiro) saem do mesmo molde: muda a
   medida da coroa, o número e a posição das cúspides, o desenho dos sulcos, as raízes e os
   canais. Tudo é descrito para o lado esquerdo (mesial em x negativo); o lado direito é o
   espelho (ver catalogo.ts). As âncoras dos nomes não são digitadas ponto a ponto: saem da
   própria geometria (o topo de cada cúspide, o meio de cada sulco, o eixo de cada raiz).
   Nomenclatura da escola brasileira de anatomia dental (Madeira e Rizzolo como referência),
   em revisão pelo autor. */
import type { Dente, Estrutura, V } from '../atlas';
import type { Modelo } from '../modelo';
import { ajustaCuspide, aprofunda, blocoMolar } from './molar-superior';
import { capsula, cava, cisalha, colo, cone, dobra, elipse, escala, esfera, une, type No } from '../no';

interface Cuspide { id: string; nome: string; texto: string; c: V; r: number; corno: [V, V, number, number]; cornoNome: string; cornoTexto: string }
interface Sulco { id: string; nome: string; texto: string; a: V; b: V; r: number; desce?: boolean; face?: V }
interface Raiz { a: V; b: V; r1: number; r2: number }
interface Canal { id: string; nome: string; texto: string; a: V; b: V; r1: number; r2: number; achata?: number }

export interface MolarInferior {
  fdi: number;
  coroa: { b: V; r: number };
  cuspides: Cuspide[];
  fosseta: { c: V; r: V };
  /** fosseta vestibular: depressão em que termina o sulco mésio-vestibular, na face vestibular */
  fossetaVestibular?: { c: V; r: number };
  sulcos: Sulco[]; // o primeiro é sempre o principal mésio-distal
  raizes: { mesial: Raiz; distal: Raiz; uniao: number };
  curva: number;
  /** inclinação da coroa em relação à raiz: [mesial (−) / distal (+), lingual (−) / vestibular (+)] por unidade de altura */
  inclina?: [number, number];
  /** sulcos longitudinais das raízes: cones escavados [início, fim, raio inicial, raio final], no espaço reto da raiz */
  sulcosRaiz?: [V, V, number, number][];
  /** altura do teto da furca; null quando as raízes são fusionadas e não há bifurcação */
  furca: number | null;
  camara: { c: V; r: V };
  canais: Canal[];
  /** descrições que mudam de um molar para o outro */
  textos: Record<'face-o' | 'raiz-m' | 'raiz-d' | 'tronco' | 'camara' | 'emboc' | 'face-m' | 'face-d' | 'contato-m' | 'contato-d', string>;
}

const ALTURA = 1.3; // até onde vai a curvatura das raízes
const soma = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const entre = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const reta = (a: V, b: V, n: number): V[] => Array.from({ length: n }, (_, i) => entre(a, b, i / (n - 1)));
const sinal = (v: number) => (v < 0 ? -1 : 1);

/* o sulco que separa duas cúspides e desce para a face é aberto por cima: três cápsulas
   empilhadas formam uma fenda, em vez de um túnel sob a união das cúspides */
const sobe = (p: V, h: number): V => [p[0], p[1] + h, p[2]];
const fenda = (s: { a: V; b: V; r: number }): No[] => ([[0, 1 * s.r], [0.07, Math.max(s.r, 0.045)], [0.15, Math.max(s.r, 0.06)]] as const).map(([h, r]) => capsula(sobe(s.a, h), sobe(s.b, h), r)); // cada nível encosta no de baixo: com vão entre eles o sulco vira túnel
/* um sulco que chega à face livre continua por ela, cada vez mais raso, até sumir no terço médio */
const desceFace = (s: { b: V; r: number; face?: V }): No => { const p0 = s.face ?? s.b; return cone(p0, [p0[0], p0[1] - 0.3, p0[2] + Math.sign(p0[2]) * 0.035], s.r * 0.8, 0.004); };

export function molarInferior(p: MolarInferior): Dente {
  {
    const hx = p.coroa.b[0] + p.coroa.r, hz = p.coroa.b[2] + p.coroa.r;
    p = { ...p, cuspides: p.cuspides.map((c) => ajustaCuspide(c, hx, hz)), sulcos: p.sulcos.map((s) => aprofunda(s, hx, hz)), fossetaVestibular: p.fossetaVestibular && { ...p.fossetaVestibular, c: [p.fossetaVestibular.c[0], p.fossetaVestibular.c[1], hz + 0.018] }, fosseta: { ...p.fosseta, c: [p.fosseta.c[0], p.fosseta.c[1] - 0.05, p.fosseta.c[2]] } };
  }
  const naRaiz = (no: No) => dobra(p.curva, ALTURA, no);
  const Y0 = 0.05; // a coroa se inclina a partir do colo
  const [incX, incZ] = p.inclina ?? [0, 0];
  const inclinada = (no: No) => (incX || incZ ? cisalha(incX, incZ, Y0, no) : no);

  /* crista triangular de cada cúspide: desce do vértice em direção ao sulco principal */
  const fundo = p.sulcos[0].a[1] - 0.035;
  const cristaDe = (c: Cuspide): [V, V] => [[c.c[0], c.c[1] + c.r - 0.045, c.c[2]], [c.c[0] * 0.45, fundo, c.c[2] * 0.14]];

  /* ---------- forma externa ---------- */
  const coroa = cava(
    0.07,
    une(
      0.06,
      cava(0.1, une(0.12, colo(-0.05, 0.42, 0.8, blocoMolar(p.coroa)), ...p.cuspides.map((c) => esfera(c.c, c.r))), elipse(p.fosseta.c, p.fosseta.r)),
      ...p.cuspides.map((c) => capsula(...cristaDe(c), 0.042)),
    ),
    ...(p.fossetaVestibular ? [esfera(p.fossetaVestibular.c, p.fossetaVestibular.r)] : []),
    ...p.sulcos.flatMap((s) => (s.desce ? [...fenda(s), desceFace(s)] : [capsula(s.a, s.b, s.r)])),
  );
  const { mesial, distal } = p.raizes;
  const macicas = une(p.raizes.uniao, cone(mesial.a, mesial.b, mesial.r1, mesial.r2), cone(distal.a, distal.b, distal.r1, distal.r2));
  const raizes = naRaiz(escala([1, 1, 0.7], p.sulcosRaiz?.length ? cava(0.05, macicas, ...p.sulcosRaiz.map((s) => cone(...s))) : macicas));

  /* ---------- cavidade pulpar: câmara, um corno por cúspide e os canais ---------- */
  const polpa = une(
    0.05,
    inclinada(une(0.05, elipse(p.camara.c, p.camara.r), ...p.cuspides.map((c) => cone(...c.corno)))),
    /* os canais vão até a superfície do ápice: é ali que se abre o forame apical */
    ...p.canais.map((c) => naRaiz(c.achata ? escala([1, 1, c.achata], cone(c.a, c.b, c.r1, c.r2)) : cone(c.a, c.b, c.r1, c.r2))),
  );

  /* ---------- estruturas nomeadas ---------- */
  function estruturas(m: Modelo): Estrutura[] {
    const eixo = (a: V, b: V, n: number): V[] => reta(a, b, n).map(m.desdobra);
    /* ponto do eixo de uma raiz a uma fração do comprimento, já no lugar real */
    const naAltura = (r: Raiz, t: number) => m.desdobra(entre(r.a, r.b, t));

    /* Amostras dos tecidos, tiradas da própria superfície: um anel de pontos em volta de um
       centro, cada um descido da superfície para dentro pela profundidade pedida. */
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
    const RAIZ: V[] = [mesial, distal].flatMap((r) => [0.25, 0.45, 0.65, 0.85].map((t) => naAltura(r, t)));
    const noEsmalte = COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s) * 0.5));
    const naJuncao = COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s)));
    const naDentina = [...COROA.flatMap((c) => anel(c, 14, (s) => m.espessura(s) + 0.07)), ...RAIZ.flatMap((c) => anel(c, 10, () => 0.06))];
    const noCemento = RAIZ.flatMap((c) => anel(c, 10, () => 0.011));

    const jac = p.textos; // só para encurtar abaixo
    const principal = p.sulcos[0];
    const largura = p.coroa.b[0] + p.coroa.r; // meia largura mésio-distal da coroa
    const cam = p.camara;

    /* âncoras em torno de uma raiz: pelas duas faces livres e pela face proximal dela */
    const emVolta = (c: V, lado: -1 | 1): [V, V][] => [[c, [0, 0, 1]], [c, [0, 0, -1]], [c, [lado, 0, 0]]];
    const ponta = (r: Raiz, lado: -1 | 1): [V, V][] => {
      const b = m.desdobra(r.b);
      return [[b, [lado * 0.15, -0.6, 0.8]], [b, [lado * 0.15, -0.6, -0.8]], [b, [lado * 0.3, -1, 0]]];
    };

    const lista: Estrutura[] = [
      /* ---------- Faces e contornos ---------- */
      { id: 'face-v', nome: 'Face vestibular', grupo: 'Faces e contornos', texto: 'Voltada para a bochecha. É convexa, com a maior convexidade no terço cervical.', externas: [[[0.12, 0.36, 0], [0, 0, 1]]] },
      { id: 'face-l', nome: 'Face lingual', grupo: 'Faces e contornos', texto: 'Voltada para a língua. É mais lisa e mais convexa que a vestibular, com a maior convexidade no terço médio.', externas: [[[0.1, 0.38, 0], [0, 0, -1]]] },
      { id: 'face-m', nome: 'Face mesial', grupo: 'Faces e contornos', texto: jac['face-m'], externas: [[[0, 0.3, 0], [-1, 0, 0]]] },
      { id: 'face-d', nome: 'Face distal', grupo: 'Faces e contornos', texto: jac['face-d'], externas: [[[0, 0.3, 0], [1, 0, 0]]] },
      { id: 'face-o', nome: 'Face oclusal', grupo: 'Faces e contornos', texto: jac['face-o'], externas: [[[largura * 0.35, 0.3, -0.09], [0, 1, 0]]] },
      { id: 'bossa-v', nome: 'Bossa vestibular', grupo: 'Faces e contornos', texto: 'Maior convexidade da face vestibular, no terço cervical. Desvia o alimento da margem gengival.', externas: [[[-0.05, 0.2, 0], [0, -0.15, 1]]] },
      { id: 'bossa-l', nome: 'Bossa lingual', grupo: 'Faces e contornos', texto: 'Maior convexidade da face lingual, no terço médio da coroa.', externas: [[[-0.08, 0.42, 0], [0, 0.1, -1]]] },
      { id: 'contato-m', nome: 'Área de contato mesial', grupo: 'Faces e contornos', texto: jac['contato-m'], externas: [[[0, 0.47, 0.06], [-1, 0.1, 0.1]]] },
      { id: 'contato-d', nome: 'Área de contato distal', grupo: 'Faces e contornos', texto: jac['contato-d'], externas: [[[0, 0.42, 0.03], [1, 0.1, 0]]] },
      {
        id: 'cervical', nome: 'Linha cervical', grupo: 'Faces e contornos',
        texto: 'Limite entre a coroa e a raiz, o colo anatômico. É a junção amelocementária, onde o esmalte termina e o cemento começa.',
        externas: [[[0, 0.07, 0], [0, 0, 1]], [[0, 0.07, 0], [0, 0, -1]], [[0, 0.03, 0], [-1, 0, 0]], [[0, 0.03, 0], [1, 0, 0]]],
      },

      /* ---------- Cúspides: o topo, a vertente livre e a face proximal de cada uma ---------- */
      ...p.cuspides.map((c): Estrutura => {
        const sx = sinal(c.c[0]), sz = sinal(c.c[2]);
        return { id: c.id, nome: c.nome, grupo: 'Cúspides', texto: c.texto, externas: [[c.c, [sx * 0.2, 0.9, sz * 0.4]], [c.c, [sx * 0.15, 0.25, sz]], [c.c, [sx, 0.25, sz * 0.2]]] };
      }),

      /* ---------- Sulcos e fossetas ---------- */
      ...p.sulcos.map((s): Estrutura => {
        const meio = entre(s.a, s.b, s.desce ? 0.45 : 0.3);
        const sz = sinal(s.b[2] - s.a[2]);
        const externas: [V, V][] = s.desce ? [[meio, [0, 1, sz * 0.3]], [entre(s.a, s.b, 0.92), [0, 0.55, sz * 0.85]]] : [[meio, [0, 1, 0]], [entre(s.a, s.b, 0.72), [0, 1, 0]]];
        return { id: s.id, nome: s.nome, grupo: 'Sulcos e fossetas', texto: s.texto, externas };
      }),
      ...(p.fossetaVestibular ? [{ id: 'fosseta-v', nome: 'Fosseta vestibular', grupo: 'Sulcos e fossetas', texto: 'Pequena depressão na face vestibular, onde termina o sulco mésio-vestibular. É um ponto frequente de cárie.', externas: [[[p.fossetaVestibular.c[0], p.fossetaVestibular.c[1], 0], [0, 0, 1]]] } as Estrutura] : []),
      { id: 'fosseta-c', nome: 'Fosseta central', grupo: 'Sulcos e fossetas', texto: 'Depressão no centro da face oclusal, no encontro do sulco mésio-distal com os sulcos que vêm das faces livres.', externas: [[[p.fosseta.c[0], 0.3, 0], [0, 1, 0]]] },
      { id: 'fosseta-m', nome: 'Fosseta mesial', grupo: 'Sulcos e fossetas', texto: 'Depressão triangular na extremidade mesial do sulco principal, junto à crista marginal mesial.', externas: [[[principal.a[0] + 0.03, 0.3, 0], [0.2, 1, 0]]] },
      { id: 'fosseta-d', nome: 'Fosseta distal', grupo: 'Sulcos e fossetas', texto: 'Depressão triangular na extremidade distal do sulco principal, junto à crista marginal distal.', externas: [[[principal.b[0] - 0.03, 0.3, 0], [-0.2, 1, 0]]] },

      /* ---------- Cristas e vertentes ---------- */
      { id: 'crista-m', nome: 'Crista marginal mesial', grupo: 'Cristas e vertentes', texto: 'Elevação de esmalte que fecha a face oclusal por mesial, unindo a cúspide mésio-vestibular à mésio-lingual.', externas: [[[-(largura - 0.08), principal.a[1] - 0.045, 0], [-0.45, 1, 0]]] },
      { id: 'crista-d', nome: 'Crista marginal distal', grupo: 'Cristas e vertentes', texto: 'Fecha a face oclusal por distal. É mais curta e mais baixa que a mesial.', externas: [[[largura - 0.05, principal.b[1] - 0.065, 0], [0.45, 1, 0]]] },
      { id: 'vert-t', nome: 'Vertente triturante', grupo: 'Cristas e vertentes', texto: 'Vertente interna da cúspide, voltada para o sulco principal. É a que trabalha na mastigação.', externas: p.cuspides.slice(0, 1).concat(p.cuspides.filter((c) => c.c[2] < 0).slice(0, 1)).map((c): [V, V] => [soma(c.c, [0.04, -0.3, -sinal(c.c[2]) * 0.12]), [0.3, 0.9, -sinal(c.c[2]) * 0.4]]) },
      { id: 'vert-l', nome: 'Vertente lisa', grupo: 'Cristas e vertentes', texto: 'Vertente externa da cúspide, voltada para a face livre (vestibular ou lingual).', externas: p.cuspides.slice(0, 1).concat(p.cuspides.filter((c) => c.c[2] < 0).slice(0, 1)).map((c): [V, V] => [soma(c.c, [0, 0.02, 0]), [-0.1, 0.55, sinal(c.c[2]) * 0.85]]) },

      /* ---------- Raiz ---------- */
      { id: 'tronco', nome: 'Tronco radicular', grupo: 'Raiz', texto: jac.tronco, externas: [[[0.02, -0.03, 0], [0, 0, 1]], [[0.02, -0.03, 0], [0, 0, -1]]] },
      ...(p.furca !== null ? [{ id: 'furca', nome: 'Furca', grupo: 'Raiz', texto: 'Região em que o tronco radicular se bifurca. No molar inferior a furca é vestíbulo-lingual, com entradas pelas duas faces.', externas: [[m.desdobra([0, p.furca, 0.1]), [0, -0.6, 0.8]], [m.desdobra([0, p.furca, -0.1]), [0, -0.6, -0.8]]] } as Estrutura] : []),
      { id: 'raiz-m', nome: 'Raiz mesial', grupo: 'Raiz', texto: jac['raiz-m'], externas: emVolta(naAltura(mesial, 0.5), -1) },
      { id: 'raiz-d', nome: 'Raiz distal', grupo: 'Raiz', texto: jac['raiz-d'], externas: emVolta(naAltura(distal, 0.5), 1) },
      { id: 'terco-c', nome: 'Terço cervical da raiz', grupo: 'Raiz', texto: 'O terço mais próximo da coroa. Inclui o tronco radicular e o começo de cada raiz.', externas: emVolta(naAltura(distal, 0.22), 1) },
      { id: 'terco-m', nome: 'Terço médio da raiz', grupo: 'Raiz', texto: 'A porção intermediária da raiz.', externas: emVolta(naAltura(mesial, 0.36), -1) },
      { id: 'terco-a', nome: 'Terço apical da raiz', grupo: 'Raiz', texto: 'O terço final, onde a raiz se afila e o canal se estreita até o forame.', externas: emVolta(naAltura(distal, 0.82), 1) },
      { id: 'apice-m', nome: 'Ápice da raiz mesial', grupo: 'Raiz', texto: 'A extremidade da raiz mesial.', externas: ponta(mesial, -1) },
      { id: 'apice-d', nome: 'Ápice da raiz distal', grupo: 'Raiz', texto: 'A extremidade da raiz distal.', externas: ponta(distal, 1) },

      /* ---------- Tecidos ---------- */
      { id: 'esmalte', nome: 'Esmalte', grupo: 'Tecidos', tecido: 'esmalte', folga: 0.06, texto: 'O tecido mais mineralizado do corpo. Cobre só a coroa: é mais espesso nas cúspides e afina até terminar na linha cervical.', internas: [...noEsmalte, ...p.cuspides.map((c) => soma(c.c, [0, c.r - 0.05, 0]))] },
      { id: 'jad', nome: 'Junção amelodentinária', grupo: 'Tecidos', folga: 0.05, texto: 'A fronteira entre o esmalte e a dentina. Acompanha o contorno externo da coroa.', internas: naJuncao },
      { id: 'dentina', nome: 'Dentina', grupo: 'Tecidos', tecido: 'dentina', folga: 0.06, texto: 'Forma o corpo do dente, da coroa à raiz. É atravessada por túbulos que vão da polpa em direção ao esmalte e ao cemento.', internas: [...naDentina, [0, 0.45, 0], [0, 0.42, 0.12], [0, 0.42, -0.12], [0.1, -0.02, 0], [-0.05, -0.02, 0.1]] },
      { id: 'cemento', nome: 'Cemento', grupo: 'Tecidos', tecido: 'cemento', folga: 0.07, texto: 'Camada fina que reveste a raiz e ancora as fibras do ligamento periodontal. É mais espesso no terço apical.', internas: noCemento },

      /* ---------- Cavidade pulpar ---------- */
      { id: 'camara', nome: 'Câmara pulpar', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.09, texto: jac.camara, internas: [cam.c, ...[-1, 1].flatMap((s): V[] => [soma(cam.c, [s * cam.r[0] * 0.45, 0, 0]), soma(cam.c, [0, 0, s * cam.r[2] * 0.5]), soma(cam.c, [s * cam.r[0] * 0.45, 0, s * cam.r[2] * 0.5])])] },
      { id: 'teto', nome: 'Teto da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede oclusal da câmara, de onde saem os cornos pulpares.', internas: [soma(cam.c, [0, cam.r[1] - 0.002, 0]), ...[-1, 1].flatMap((s): V[] => [soma(cam.c, [s * 0.06, cam.r[1] * 0.92, s * 0.05]), soma(cam.c, [0, cam.r[1] * 0.8, s * cam.r[2] * 0.7])])] },
      { id: 'assoalho', nome: 'Assoalho da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede voltada para a furca. É nele que ficam as embocaduras dos canais.', internas: [soma(cam.c, [0, -cam.r[1] + 0.002, 0]), ...[-1, 1].flatMap((s): V[] => [soma(cam.c, [s * 0.06, -cam.r[1] * 0.95, 0]), soma(cam.c, [0, -cam.r[1] * 0.85, s * cam.r[2] * 0.5])])] },
      ...p.cuspides.map((c): Estrutura => ({ id: `corno-${c.id}`, nome: c.cornoNome, grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: c.cornoTexto, internas: reta(entre(c.corno[0], c.corno[1], 0.3), entre(c.corno[0], c.corno[1], 0.95), 5) })),
      { id: 'emboc', nome: 'Embocadura dos canais', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.05, texto: jac.emboc, internas: p.canais.map((c): V => [c.a[0], c.a[1] - 0.02, c.a[2]]) },
      ...p.canais.map((c): Estrutura => ({ id: c.id, nome: c.nome, grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.032, texto: c.texto, internas: eixo(entre(c.a, c.b, 0.09), c.b, 26) })),
      {
        /* O forame é a saída do canal na superfície do ápice. Por fora, o nome se prende à ponta
           de cada raiz; no corte, ao último trecho do canal, já na saída. */
        id: 'forame', nome: 'Forame apical', grupo: 'Cavidade pulpar', folga: 0.05,
        texto: 'Abertura do canal radicular na superfície do ápice, por onde o feixe vásculo-nervoso entra no dente. Nem sempre coincide com o vértice anatômico da raiz.',
        externas: p.canais.flatMap((c): [V, V][] => {
          const b = m.desdobra(c.b), s = sinal(c.b[0]);
          return [[b, [s * 0.15, -1, 0]], [b, [s * 0.1, -0.75, 0.65]], [b, [s * 0.1, -0.75, -0.65]]];
        }),
        internas: p.canais.map((c) => m.desdobra(entre(c.a, c.b, 0.995))),
      },
    ];
    const guia = [p.cuspides[0], ...p.cuspides.filter((c) => c.c[2] < 0).slice(0, 1)];
    lista.push({
      id: 'crista-tri', nome: 'Crista triangular', grupo: 'Cristas e vertentes',
      texto: 'Crista que desce do vértice de cada cúspide em direção ao sulco principal, separando as duas vertentes triturantes da cúspide.',
      externas: guia.map((c): [V, V] => { const [a, b] = cristaDe(c); return [entre(a, b, 0.5), [0, 1, -sinal(c.c[2]) * 0.25]]; }),
    });
    /* os pontos acima foram descritos no dente reto: aplica a inclinação da coroa a eles */
    return lista.map((e) => ({ ...e, externas: e.externas?.map(([a, n]): [V, V] => [m.inclina(a), n]), internas: e.grupo === 'Cavidade pulpar' ? e.internas?.map(m.inclina) : e.internas }));
  }

  const mv = p.canais[0];
  return {
    fdi: p.fdi,
    arco: 'inferior',
    lado: 1,
    forma: une(0.13, inclinada(coroa), raizes),
    polpa,
    jac: { base: 0.05, onda: 0.035 },
    esmalte: { base: 0.085, extra: 0.05, y0: 0.35, y1: 0.7, faixa: 0.22 },
    cemento: 0.022,
    inclina: { x: incX, z: incZ, y0: Y0 },
    curva: { forca: p.curva, altura: ALTURA },
    regioes: { topo: Math.max(...p.cuspides.map((c) => c.c[1] + c.r)), apice: Math.min(p.raizes.mesial.b[1], p.raizes.distal.b[1]) - 0.04, cuspides: p.cuspides.map((c) => ({ nome: c.nome, c: ((v: V): V => { const h = Math.max(v[1] - Y0, 0); return [v[0] + incX * h, v[1], v[2] + incZ * h]; })(c.c) })) },
    centro: [0, -0.26, 0],
    raio: 1.34,
    chao: -1.46,
    planos: [
      /* mésio-distal: passa pelo canal vestibular da raiz mesial e pelo canal distal */
      { nome: 'Mésio-distal', normal: [0, 0, 1], fora: 0.62, fim: -0.35, padrao: Math.max(0, mv.a[2] * 0.7), vista: [0.26, 0.12] },
      /* vestíbulo-lingual: passa pelos canais da raiz mesial */
      { nome: 'Vestíbulo-lingual', normal: [-1, 0, 0], fora: 0.62, fim: -0.4, padrao: -(mv.a[0] + mv.b[0] + p.curva) / 2, vista: [-Math.PI / 2 + 0.3, 0.12] },
      /* transversal: na altura do tronco radicular, logo abaixo do assoalho da câmara */
      { nome: 'Transversal', normal: [0, 1, 0], fora: 0.92, fim: -1.2, padrao: -0.05, vista: [0.25, 1.05] },
    ],
    estruturas,
  };
}
