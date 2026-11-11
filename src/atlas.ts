/* As estruturas do atlas do dente 36 (primeiro molar inferior esquerdo).
   Eixos do modelo: x vai de mesial (−) a distal (+), y de apical (−) a oclusal (+),
   z de lingual (−) a vestibular (+).

   - Estruturas EXTERNAS têm âncoras [ponto aproximado, direção para fora]. O programa
     assenta cada uma na superfície e mostra a que estiver virada para a câmera.
   - Estruturas INTERNAS têm amostras: pontos em 3D dentro da estrutura. Em qualquer plano
     de corte, o nome aparece onde uma amostra fica rente ao plano. Com `tecido`, o ponto
     ainda é conferido contra a função do dente, para o nome não cair no tecido errado.

   Nomenclatura da escola brasileira de anatomia dental (Madeira e Rizzolo como referência),
   a ser revisada pelo autor. */
import { assenta, desdobra, espessura, type Tecido, type V } from './sdf';

export const GRUPOS = ['Faces e contornos', 'Cúspides', 'Sulcos e fossetas', 'Cristas e vertentes', 'Raiz', 'Tecidos', 'Cavidade pulpar'] as const;
export type Grupo = (typeof GRUPOS)[number];

export interface Estrutura {
  id: string;
  nome: string;
  grupo: Grupo;
  texto: string;
  externas?: [V, V][];
  internas?: V[];
  tecido?: Tecido;
  /** Distância máxima entre a amostra e o plano de corte para o nome aparecer. */
  folga?: number;
}

/* pontos ao longo de um eixo que vive no espaço "reto" das raízes (canais) */
function eixo(a: V, b: V, n: number): V[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return desdobra([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
  });
}
const reta = (a: V, b: V, n: number): V[] => Array.from({ length: n }, (_, i) => [0, 1, 2].map((k) => a[k] + ((b[k] - a[k]) * i) / (n - 1)) as V);

/* Amostras dos tecidos, geradas a partir da própria superfície: assenta um anel de pontos
   em volta do dente e desce da superfície para dentro pela profundidade pedida. */
function anel(y: number, raio: number, n: number, funda: (s: V) => number): V[] {
  const pts: V[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.2;
    const dir: V = [Math.cos(a), 0, Math.sin(a)];
    const s = assenta([dir[0] * raio, y, dir[2] * raio], dir);
    const f = funda(s.p);
    if (f > 0) pts.push([s.p[0] - s.n[0] * f, s.p[1] - s.n[1] * f, s.p[2] - s.n[2] * f]);
  }
  return pts;
}
const ALTURAS_COROA = [0.2, 0.32, 0.44, 0.56];
const ALTURAS_RAIZ = [-0.25, -0.5, -0.75, -1.0];
const noEsmalte = ALTURAS_COROA.flatMap((y) => anel(y, 0.2, 14, (s) => espessura(s) * 0.5));
const naJuncao = ALTURAS_COROA.flatMap((y) => anel(y, 0.2, 14, (s) => espessura(s)));
const naDentinaCoroa = ALTURAS_COROA.flatMap((y) => anel(y, 0.2, 14, (s) => espessura(s) + 0.07));
/* na raiz os anéis são por raiz: mesial em x −0,27 e distal em x +0,30 */
const anelRaiz = (cx: number, funda: number) =>
  ALTURAS_RAIZ.flatMap((y) => {
    const pts: V[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      const dir: V = [Math.cos(a), 0, Math.sin(a)];
      const c = desdobra([cx, y, 0]);
      const s = assenta([c[0] + dir[0] * 0.05, y, dir[2] * 0.05], dir);
      pts.push([s.p[0] - s.n[0] * funda, s.p[1] - s.n[1] * funda, s.p[2] - s.n[2] * funda]);
    }
    return pts;
  });
const noCemento = [...anelRaiz(-0.27, 0.011), ...anelRaiz(0.29, 0.011)];
const naDentinaRaiz = [...anelRaiz(-0.27, 0.06), ...anelRaiz(0.29, 0.06)];

const CANAL_MV: [V, V] = [[-0.19, 0.11, 0.085], [-0.34, -1.345, 0.025]];
const CANAL_ML: [V, V] = [[-0.19, 0.11, -0.085], [-0.34, -1.345, -0.025]];
const CANAL_D: [V, V] = [[0.2, 0.11, 0], [0.3, -1.245, 0]];

export const ESTRUTURAS: Estrutura[] = [
  /* ---------- Faces e contornos ---------- */
  { id: 'face-v', nome: 'Face vestibular', grupo: 'Faces e contornos', texto: 'Voltada para a bochecha. É convexa, com a maior convexidade no terço cervical, e é percorrida por dois sulcos que vêm da face oclusal.', externas: [[[0.12, 0.36, 0.46], [0, 0, 1]]] },
  { id: 'face-l', nome: 'Face lingual', grupo: 'Faces e contornos', texto: 'Voltada para a língua. É mais lisa e mais convexa que a vestibular, com a maior convexidade no terço médio.', externas: [[[0.1, 0.38, -0.46], [0, 0, -1]]] },
  { id: 'face-m', nome: 'Face mesial', grupo: 'Faces e contornos', texto: 'Face proximal voltada para o segundo pré-molar. É mais larga e mais plana que a distal.', externas: [[[-0.5, 0.3, 0.0], [-1, 0, 0]]] },
  { id: 'face-d', nome: 'Face distal', grupo: 'Faces e contornos', texto: 'Face proximal voltada para o segundo molar. É menor e mais convexa que a mesial.', externas: [[[0.5, 0.3, 0.0], [1, 0, 0]]] },
  { id: 'face-o', nome: 'Face oclusal', grupo: 'Faces e contornos', texto: 'Face triturante, de contorno trapezoidal com a base maior para vestibular. Reúne cinco cúspides, os sulcos e as fossetas.', externas: [[[0.17, 0.66, -0.08], [0, 1, 0]]] },
  { id: 'bossa-v', nome: 'Bossa vestibular', grupo: 'Faces e contornos', texto: 'Maior convexidade da face vestibular, no terço cervical. Desvia o alimento da margem gengival.', externas: [[[-0.05, 0.2, 0.46], [0, -0.15, 1]]] },
  { id: 'bossa-l', nome: 'Bossa lingual', grupo: 'Faces e contornos', texto: 'Maior convexidade da face lingual, no terço médio da coroa.', externas: [[[-0.08, 0.42, -0.47], [0, 0.1, -1]]] },
  { id: 'contato-m', nome: 'Área de contato mesial', grupo: 'Faces e contornos', texto: 'Onde o 36 toca o segundo pré-molar: na união dos terços médio e oclusal, um pouco deslocada para vestibular.', externas: [[[-0.51, 0.47, 0.06], [-1, 0.1, 0.1]]] },
  { id: 'contato-d', nome: 'Área de contato distal', grupo: 'Faces e contornos', texto: 'Onde o 36 toca o segundo molar, no terço médio da face distal.', externas: [[[0.5, 0.42, 0.03], [1, 0.1, 0]]] },
  {
    id: 'cervical', nome: 'Linha cervical', grupo: 'Faces e contornos',
    texto: 'Limite entre a coroa e a raiz, o colo anatômico. É a junção amelocementária, onde o esmalte termina e o cemento começa.',
    externas: [[[0.0, 0.07, 0.38], [0, 0, 1]], [[0.0, 0.07, -0.38], [0, 0, -1]], [[-0.42, 0.03, 0.0], [-1, 0, 0]], [[0.42, 0.03, 0.0], [1, 0, 0]]],
  },

  /* ---------- Cúspides ---------- */
  { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', grupo: 'Cúspides', texto: 'A maior das três cúspides vestibulares. É uma cúspide de contenção: oclui na fosseta e nas cristas marginais dos dentes superiores.', externas: [[[-0.3, 0.74, 0.24], [-0.2, 0.9, 0.4]], [[-0.32, 0.56, 0.4], [-0.15, 0.25, 1]], [[-0.47, 0.58, 0.2], [-1, 0.25, 0.2]]] },
  { id: 'cusp-cv', nome: 'Cúspide médio-vestibular', grupo: 'Cúspides', texto: 'A cúspide vestibular do meio, entre os sulcos mésio-vestibular e disto-vestibular.', externas: [[[0.04, 0.72, 0.27], [0.0, 0.9, 0.45]], [[0.05, 0.54, 0.41], [0, 0.25, 1]]] },
  { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', grupo: 'Cúspides', texto: 'A menor das cinco, no ângulo disto-vestibular da coroa. É a que mais varia de tamanho.', externas: [[[0.37, 0.66, 0.17], [0.45, 0.85, 0.3]], [[0.4, 0.5, 0.3], [0.45, 0.2, 0.9]], [[0.5, 0.5, 0.14], [1, 0.25, 0.2]]] },
  { id: 'cusp-ml', nome: 'Cúspide mésio-lingual', grupo: 'Cúspides', texto: 'A mais alta e mais aguda. As cúspides linguais do molar inferior são de balanceio e ficam mais altas que as vestibulares.', externas: [[[-0.28, 0.78, -0.24], [-0.2, 0.9, -0.4]], [[-0.3, 0.58, -0.4], [-0.15, 0.25, -1]], [[-0.46, 0.6, -0.2], [-1, 0.25, -0.2]]] },
  { id: 'cusp-dl', nome: 'Cúspide disto-lingual', grupo: 'Cúspides', texto: 'A segunda cúspide lingual, um pouco mais baixa que a mésio-lingual.', externas: [[[0.2, 0.76, -0.24], [0.15, 0.9, -0.4]], [[0.22, 0.56, -0.4], [0.1, 0.25, -1]], [[0.45, 0.56, -0.2], [1, 0.25, -0.2]]] },

  /* ---------- Sulcos e fossetas ---------- */
  { id: 'sulco-md', nome: 'Sulco principal mésio-distal', grupo: 'Sulcos e fossetas', texto: 'Sulco central que percorre a face oclusal de mesial a distal, separando as cúspides vestibulares das linguais.', externas: [[[-0.2, 0.69, 0.0], [0, 1, 0]], [[0.3, 0.67, 0.0], [0, 1, 0]]] },
  { id: 'sulco-mv', nome: 'Sulco mésio-vestibular', grupo: 'Sulcos e fossetas', texto: 'Sai do sulco mésio-distal, separa as cúspides mésio-vestibular e médio-vestibular e desce pela face vestibular.', externas: [[[-0.125, 0.67, 0.2], [0, 1, 0.3]], [[-0.13, 0.6, 0.4], [0, 0.55, 0.85]]] },
  { id: 'sulco-dv', nome: 'Sulco disto-vestibular', grupo: 'Sulcos e fossetas', texto: 'Separa as cúspides médio-vestibular e disto-vestibular. É mais curto que o mésio-vestibular.', externas: [[[0.215, 0.64, 0.2], [0, 1, 0.3]], [[0.21, 0.56, 0.38], [0.1, 0.55, 0.85]]] },
  { id: 'sulco-l', nome: 'Sulco lingual', grupo: 'Sulcos e fossetas', texto: 'Separa as duas cúspides linguais e continua, raso, pela face lingual.', externas: [[[-0.04, 0.67, -0.2], [0, 1, -0.3]], [[-0.04, 0.6, -0.4], [0, 0.55, -0.85]]] },
  { id: 'fosseta-c', nome: 'Fosseta central', grupo: 'Sulcos e fossetas', texto: 'Depressão no centro da face oclusal, no encontro do sulco mésio-distal com os sulcos vestibulares e o lingual.', externas: [[[0.03, 0.66, 0.0], [0, 1, 0]]] },
  { id: 'fosseta-m', nome: 'Fosseta mesial', grupo: 'Sulcos e fossetas', texto: 'Depressão triangular na extremidade mesial do sulco principal, junto à crista marginal mesial.', externas: [[[-0.33, 0.7, 0.0], [0.2, 1, 0]]] },
  { id: 'fosseta-d', nome: 'Fosseta distal', grupo: 'Sulcos e fossetas', texto: 'Depressão triangular na extremidade distal do sulco principal, junto à crista marginal distal.', externas: [[[0.37, 0.66, 0.0], [-0.2, 1, 0]]] },

  /* ---------- Cristas e vertentes ---------- */
  { id: 'crista-m', nome: 'Crista marginal mesial', grupo: 'Cristas e vertentes', texto: 'Elevação de esmalte que fecha a face oclusal por mesial, unindo as cúspides mésio-vestibular e mésio-lingual.', externas: [[[-0.43, 0.7, 0.0], [-0.45, 1, 0]]] },
  { id: 'crista-d', nome: 'Crista marginal distal', grupo: 'Cristas e vertentes', texto: 'Fecha a face oclusal por distal. É mais curta e mais baixa que a mesial.', externas: [[[0.46, 0.64, 0.0], [0.45, 1, 0]]] },
  { id: 'vert-t', nome: 'Vertente triturante', grupo: 'Cristas e vertentes', texto: 'Vertente interna da cúspide, voltada para o sulco principal. É a que trabalha na mastigação.', externas: [[[-0.26, 0.68, 0.1], [0.3, 0.9, -0.4]], [[-0.24, 0.7, -0.1], [0.3, 0.9, 0.4]]] },
  { id: 'vert-l', nome: 'Vertente lisa', grupo: 'Cristas e vertentes', texto: 'Vertente externa da cúspide, voltada para a face livre (vestibular ou lingual).', externas: [[[-0.3, 0.64, 0.35], [-0.1, 0.55, 0.85]], [[-0.28, 0.67, -0.35], [-0.1, 0.55, -0.85]]] },

  /* ---------- Raiz ---------- */
  { id: 'tronco', nome: 'Tronco radicular', grupo: 'Raiz', texto: 'Porção comum da raiz, entre a linha cervical e a furca, antes da divisão em duas raízes.', externas: [[[0.02, -0.03, 0.34], [0, 0, 1]], [[0.02, -0.03, -0.34], [0, 0, -1]]] },
  { id: 'furca', nome: 'Furca', grupo: 'Raiz', texto: 'Região em que o tronco radicular se bifurca. No molar inferior a furca é vestíbulo-lingual, com entradas pelas duas faces.', externas: [[[0.0, -0.1, 0.1], [0, -0.6, 0.8]], [[0.0, -0.1, -0.1], [0, -0.6, -0.8]]] },
  { id: 'raiz-m', nome: 'Raiz mesial', grupo: 'Raiz', texto: 'A mais larga das duas, achatada no sentido mésio-distal e curvada para distal. Tem dois canais: mésio-vestibular e mésio-lingual.', externas: [[[-0.27, -0.6, 0.18], [0, 0, 1]], [[-0.27, -0.6, -0.18], [0, 0, -1]], [[-0.43, -0.6, 0.0], [-1, 0, 0]]] },
  { id: 'raiz-d', nome: 'Raiz distal', grupo: 'Raiz', texto: 'Mais reta, mais curta e de secção mais arredondada. Em geral tem um canal único e amplo.', externas: [[[0.3, -0.6, 0.16], [0, 0, 1]], [[0.3, -0.6, -0.16], [0, 0, -1]], [[0.44, -0.6, 0.0], [1, 0, 0]]] },
  { id: 'terco-c', nome: 'Terço cervical da raiz', grupo: 'Raiz', texto: 'O terço mais próximo da coroa. Inclui o tronco radicular e o começo de cada raiz.', externas: [[[0.3, -0.2, 0.2], [0.2, 0, 1]], [[0.3, -0.2, -0.2], [0.2, 0, -1]], [[0.46, -0.2, 0.0], [1, 0, 0]]] },
  { id: 'terco-m', nome: 'Terço médio da raiz', grupo: 'Raiz', texto: 'A porção intermediária da raiz.', externas: [[[-0.27, -0.42, 0.19], [-0.2, 0, 1]], [[-0.27, -0.42, -0.19], [-0.2, 0, -1]], [[-0.43, -0.42, 0.0], [-1, 0, 0]]] },
  { id: 'terco-a', nome: 'Terço apical da raiz', grupo: 'Raiz', texto: 'O terço final, onde a raiz se afila e o canal se estreita até o forame.', externas: [[[0.36, -0.98, 0.1], [0.2, 0, 1]], [[0.36, -0.98, -0.1], [0.2, 0, -1]], [[0.44, -0.98, 0.0], [1, 0, 0]]] },
  { id: 'apice-m', nome: 'Ápice da raiz mesial', grupo: 'Raiz', texto: 'A extremidade da raiz mesial, onde ficam os forames dos canais mesiais.', externas: [[[-0.25, -1.3, 0.04], [-0.1, -0.6, 0.8]], [[-0.25, -1.3, -0.04], [-0.1, -0.6, -0.8]], [[-0.25, -1.36, 0.0], [-0.3, -1, 0]]] },
  { id: 'apice-d', nome: 'Ápice da raiz distal', grupo: 'Raiz', texto: 'A extremidade da raiz distal.', externas: [[[0.38, -1.2, 0.04], [0.2, -0.6, 0.8]], [[0.38, -1.2, -0.04], [0.2, -0.6, -0.8]], [[0.39, -1.26, 0.0], [0.3, -1, 0]]] },

  /* ---------- Tecidos ---------- */
  { id: 'esmalte', nome: 'Esmalte', grupo: 'Tecidos', tecido: 'esmalte', folga: 0.06, texto: 'O tecido mais mineralizado do corpo. Cobre só a coroa: é mais espesso nas cúspides e afina até terminar na linha cervical.', internas: [...noEsmalte, [-0.3, 0.72, 0.2], [0.04, 0.7, 0.24], [-0.28, 0.75, -0.22], [0.2, 0.73, -0.22], [0.35, 0.64, 0.15]] },
  { id: 'jad', nome: 'Junção amelodentinária', grupo: 'Tecidos', folga: 0.05, texto: 'A fronteira entre o esmalte e a dentina. Acompanha o contorno externo da coroa.', internas: naJuncao },
  { id: 'dentina', nome: 'Dentina', grupo: 'Tecidos', tecido: 'dentina', folga: 0.06, texto: 'Forma o corpo do dente, da coroa à raiz. É atravessada por túbulos que vão da polpa em direção ao esmalte e ao cemento.', internas: [...naDentinaCoroa, ...naDentinaRaiz, [0, 0.45, 0], [0, 0.42, 0.12], [0, 0.42, -0.12], [0.1, -0.02, 0], [-0.05, -0.02, 0.1]] },
  { id: 'cemento', nome: 'Cemento', grupo: 'Tecidos', tecido: 'cemento', folga: 0.07, texto: 'Camada fina que reveste a raiz e ancora as fibras do ligamento periodontal. É mais espesso no terço apical.', internas: noCemento },

  /* ---------- Cavidade pulpar ---------- */
  { id: 'camara', nome: 'Câmara pulpar', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.09, texto: 'A porção coronária da cavidade pulpar. No 36 é mais larga no sentido mésio-distal e mais alta por mesial.', internas: [[0, 0.17, 0], [-0.1, 0.17, 0], [0.1, 0.17, 0], [0, 0.17, 0.07], [0, 0.17, -0.07], [-0.1, 0.17, 0.07], [0.1, 0.17, -0.07]] },
  { id: 'teto', nome: 'Teto da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede oclusal da câmara, de onde saem os cornos pulpares.', internas: [[0.0, 0.268, 0.0], [0.06, 0.262, 0.05], [-0.06, 0.262, -0.05], [0.0, 0.25, 0.1], [0.0, 0.25, -0.1], [0.14, 0.24, 0]] },
  { id: 'assoalho', nome: 'Assoalho da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede voltada para a furca. É nele que ficam as embocaduras dos canais.', internas: [[0.0, 0.072, 0.0], [0.0, 0.085, 0.07], [0.0, 0.085, -0.07], [0.06, 0.075, 0.0], [-0.06, 0.075, 0.0]] },
  { id: 'corno-mv', nome: 'Corno pulpar mésio-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular. É o mais alto e o mais exposto a uma abertura acidental.', internas: reta([-0.19, 0.26, 0.125], [-0.255, 0.39, 0.185], 5) },
  { id: 'corno-cv', nome: 'Corno pulpar médio-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide médio-vestibular.', internas: reta([0.08, 0.26, 0.13], [0.062, 0.38, 0.195], 5) },
  { id: 'corno-dv', nome: 'Corno pulpar disto-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'O menor dos cornos, voltado para a cúspide disto-vestibular.', internas: reta([0.22, 0.25, 0.095], [0.295, 0.335, 0.128], 5) },
  { id: 'corno-ml', nome: 'Corno pulpar mésio-lingual', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide mésio-lingual.', internas: reta([-0.18, 0.27, -0.125], [-0.245, 0.41, -0.185], 5) },
  { id: 'corno-dl', nome: 'Corno pulpar disto-lingual', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide disto-lingual.', internas: reta([0.14, 0.26, -0.125], [0.185, 0.39, -0.185], 5) },
  { id: 'emboc', nome: 'Embocadura dos canais', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.05, texto: 'A entrada de cada canal no assoalho da câmara. No 36 são três, em triângulo: duas mesiais e uma distal.', internas: [[-0.19, 0.09, 0.085], [-0.19, 0.09, -0.085], [0.2, 0.09, 0.0]] },
  { id: 'canal-mv', nome: 'Canal mésio-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.03, texto: 'Canal vestibular da raiz mesial. É estreito e costuma ser o mais curvo do dente.', internas: eixo([CANAL_MV[0][0], -0.02, 0.08], CANAL_MV[1], 26) },
  { id: 'canal-ml', nome: 'Canal mésio-lingual', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.03, texto: 'Canal lingual da raiz mesial. Pode terminar em forame próprio ou se unir ao mésio-vestibular perto do ápice.', internas: eixo([CANAL_ML[0][0], -0.02, -0.08], CANAL_ML[1], 26) },
  { id: 'canal-d', nome: 'Canal distal', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Canal da raiz distal: único, amplo e achatado no sentido mésio-distal. Em parte dos casos há dois canais distais.', internas: eixo([CANAL_D[0][0], -0.02, 0], CANAL_D[1], 26) },
  {
    /* O forame é a saída do canal na superfície do ápice. Por fora, o nome se prende à ponta
       de cada raiz; no corte, ao último trecho do canal, já na saída. */
    id: 'forame', nome: 'Forame apical', grupo: 'Cavidade pulpar', folga: 0.05,
    texto: 'Abertura do canal radicular na superfície do ápice, por onde o feixe vásculo-nervoso entra no dente. Nem sempre coincide com o vértice anatômico da raiz.',
    externas: [
      [desdobra([-0.34, -1.36, 0.0]), [-0.15, -1, 0]], [desdobra([-0.34, -1.345, 0.03]), [-0.1, -0.75, 0.65]], [desdobra([-0.34, -1.345, -0.03]), [-0.1, -0.75, -0.65]],
      [desdobra([0.3, -1.26, 0.0]), [0.15, -1, 0]], [desdobra([0.3, -1.245, 0.03]), [0.1, -0.75, 0.65]], [desdobra([0.3, -1.245, -0.03]), [0.1, -0.75, -0.65]],
    ],
    internas: [desdobra([-0.34, -1.338, 0.025]), desdobra([-0.34, -1.338, -0.025]), desdobra([0.3, -1.238, 0])],
  },
];

/** Vistas externas prontas: [guinada, inclinação]. A guinada 0 olha a face vestibular. */
export const VISTAS: Record<string, [number, number]> = {
  Vestibular: [0, 0.1],
  Lingual: [Math.PI, 0.1],
  Mesial: [-Math.PI / 2, 0.1],
  Distal: [Math.PI / 2, 0.1],
  Oclusal: [0.0, 1.2],
};

/** Planos de corte. `normal` aponta para a parte removida; a posição vai de `fora`
    (plano fora do dente) a `fim`; `padrao` é a posição clássica de cada corte. */
export interface Plano { nome: string; normal: V; fora: number; fim: number; padrao: number; vista: [number, number] }
export const PLANOS: Plano[] = [
  { nome: 'Mésio-distal', normal: [0, 0, 1], fora: 0.62, fim: -0.35, padrao: 0.06, vista: [0.26, 0.12] },
  { nome: 'Vestíbulo-lingual', normal: [-1, 0, 0], fora: 0.62, fim: -0.4, padrao: 0.215, vista: [-Math.PI / 2 + 0.3, 0.12] },
  { nome: 'Transversal', normal: [0, 1, 0], fora: 0.92, fim: -1.2, padrao: -0.05, vista: [0.25, 1.05] },
];
