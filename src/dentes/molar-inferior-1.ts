/* Primeiro molar inferior, desenhado como o dente 36 (lado esquerdo: mesial em x negativo).
   O 46 sai desta mesma ficha, espelhada (ver catalogo.ts).
   Nomenclatura da escola brasileira de anatomia dental (Madeira e Rizzolo como referência),
   em revisão pelo autor. */
import type { Dente, Estrutura, V } from '../atlas';
import type { Modelo } from '../modelo';
import { caixa, capsula, cava, colo, cone, dobra, elipse, escala, esfera, une } from '../no';

const CURVA = { forca: 0.1, altura: 1.3 }; // as raízes se curvam para distal à medida que descem

/* ---------- forma externa ---------- */
const coroa = cava(
  0.07,
  cava(
    0.1,
    une(
      0.12,
      colo(-0.05, 0.42, 0.8, caixa([0, 0.34, 0], [0.3, 0.17, 0.25], 0.21)), // corpo da coroa, estreitando para o colo
      esfera([-0.3, 0.6, 0.22], 0.17), // cúspide mésio-vestibular
      esfera([0.04, 0.59, 0.24], 0.16), // médio-vestibular
      esfera([0.35, 0.54, 0.15], 0.14), // disto-vestibular
      esfera([-0.28, 0.63, -0.22], 0.17), // mésio-lingual
      esfera([0.2, 0.61, -0.22], 0.17), // disto-lingual
    ),
    elipse([0.02, 0.8, 0], [0.34, 0.15, 0.13]), // fosseta central
  ),
  capsula([-0.36, 0.745, 0], [0.4, 0.705, 0], 0.04), // sulco principal mésio-distal
  capsula([-0.12, 0.735, 0], [-0.13, 0.62, 0.44], 0.034), // sulco mésio-vestibular
  capsula([0.22, 0.715, 0], [0.21, 0.58, 0.42], 0.032), // sulco disto-vestibular
  capsula([-0.04, 0.735, 0], [-0.04, 0.62, -0.44], 0.034), // sulco lingual
);

const raizes = dobra(
  CURVA.forca,
  CURVA.altura,
  escala(
    [1, 1, 0.86], // raízes mais largas no sentido vestíbulo-lingual
    une(0.1, cone([-0.25, 0.1, 0], [-0.34, -1.3, 0], 0.26, 0.055), cone([0.25, 0.1, 0], [0.3, -1.2, 0], 0.24, 0.055)),
  ),
);

/* ---------- cavidade pulpar ---------- */
const CANAL_MV: [V, V] = [[-0.19, 0.11, 0.085], [-0.34, -1.345, 0.025]];
const CANAL_ML: [V, V] = [[-0.19, 0.11, -0.085], [-0.34, -1.345, -0.025]];
const CANAL_D: [V, V] = [[0.2, 0.11, 0], [0.3, -1.245, 0]];
const naRaiz = (no: ReturnType<typeof cone>) => dobra(CURVA.forca, CURVA.altura, no);

const polpa = une(
  0.05,
  elipse([0, 0.17, 0], [0.22, 0.1, 0.14]), // câmara
  cone([-0.16, 0.2, 0.1], [-0.26, 0.4, 0.19], 0.045, 0.014), // cornos: mésio-vestibular
  cone([0.09, 0.2, 0.1], [0.06, 0.39, 0.2], 0.042, 0.014), // médio-vestibular
  cone([0.17, 0.19, 0.07], [0.3, 0.34, 0.13], 0.035, 0.012), // disto-vestibular
  cone([-0.15, 0.2, -0.1], [-0.25, 0.42, -0.19], 0.045, 0.014), // mésio-lingual
  cone([0.12, 0.2, -0.1], [0.19, 0.4, -0.19], 0.042, 0.014), // disto-lingual
  /* os canais vão até a superfície do ápice: é ali que se abre o forame apical */
  naRaiz(cone(CANAL_MV[0], CANAL_MV[1], 0.036, 0.01)),
  naRaiz(cone(CANAL_ML[0], CANAL_ML[1], 0.036, 0.01)),
  naRaiz(escala([1, 1, 0.62], cone(CANAL_D[0], CANAL_D[1], 0.048, 0.011))), // canal distal, achatado
);

/* ---------- estruturas nomeadas ---------- */
function estruturas(m: Modelo): Estrutura[] {
  const fdi = 36;
  const reta = (a: V, b: V, n: number): V[] => Array.from({ length: n }, (_, i) => [0, 1, 2].map((k) => a[k] + ((b[k] - a[k]) * i) / (n - 1)) as V);
  /* pontos ao longo de um eixo que vive no espaço "reto" das raízes (canais) */
  const eixo = (a: V, b: V, n: number): V[] => reta(a, b, n).map(m.desdobra);

  /* Amostras dos tecidos, tiradas da própria superfície: assenta um anel de pontos em volta
     do dente e desce da superfície para dentro pela profundidade pedida. */
  const anel = (cx: number, y: number, n: number, funda: (s: V) => number): V[] => {
    const pts: V[] = [];
    const c = m.desdobra([cx, y, 0]);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.25;
      const dir: V = [Math.cos(a), 0, Math.sin(a)];
      const s = m.assenta([c[0] + dir[0] * 0.05, y, dir[2] * 0.05], dir);
      const fu = funda(s.p);
      if (fu > 0) pts.push([s.p[0] - s.n[0] * fu, s.p[1] - s.n[1] * fu, s.p[2] - s.n[2] * fu]);
    }
    return pts;
  };
  const COROA = [0.2, 0.32, 0.44, 0.56];
  const RAIZ = [-0.25, -0.5, -0.75, -1.0];
  const noEsmalte = COROA.flatMap((y) => anel(0, y, 14, (s) => m.espessura(s) * 0.5));
  const naJuncao = COROA.flatMap((y) => anel(0, y, 14, (s) => m.espessura(s)));
  const naDentinaCoroa = COROA.flatMap((y) => anel(0, y, 14, (s) => m.espessura(s) + 0.07));
  const nasRaizes = (funda: number) => [-0.27, 0.29].flatMap((cx) => RAIZ.flatMap((y) => anel(cx, y, 10, () => funda)));

  return [
    /* ---------- Faces e contornos ---------- */
    { id: 'face-v', nome: 'Face vestibular', grupo: 'Faces e contornos', texto: 'Voltada para a bochecha. É convexa, com a maior convexidade no terço cervical, e é percorrida por dois sulcos que vêm da face oclusal.', externas: [[[0.12, 0.36, 0.46], [0, 0, 1]]] },
    { id: 'face-l', nome: 'Face lingual', grupo: 'Faces e contornos', texto: 'Voltada para a língua. É mais lisa e mais convexa que a vestibular, com a maior convexidade no terço médio.', externas: [[[0.1, 0.38, -0.46], [0, 0, -1]]] },
    { id: 'face-m', nome: 'Face mesial', grupo: 'Faces e contornos', texto: 'Face proximal voltada para o segundo pré-molar. É mais larga e mais plana que a distal.', externas: [[[-0.5, 0.3, 0.0], [-1, 0, 0]]] },
    { id: 'face-d', nome: 'Face distal', grupo: 'Faces e contornos', texto: 'Face proximal voltada para o segundo molar. É menor e mais convexa que a mesial.', externas: [[[0.5, 0.3, 0.0], [1, 0, 0]]] },
    { id: 'face-o', nome: 'Face oclusal', grupo: 'Faces e contornos', texto: 'Face triturante, de contorno trapezoidal com a base maior para vestibular. Reúne cinco cúspides, os sulcos e as fossetas.', externas: [[[0.17, 0.66, -0.08], [0, 1, 0]]] },
    { id: 'bossa-v', nome: 'Bossa vestibular', grupo: 'Faces e contornos', texto: 'Maior convexidade da face vestibular, no terço cervical. Desvia o alimento da margem gengival.', externas: [[[-0.05, 0.2, 0.46], [0, -0.15, 1]]] },
    { id: 'bossa-l', nome: 'Bossa lingual', grupo: 'Faces e contornos', texto: 'Maior convexidade da face lingual, no terço médio da coroa.', externas: [[[-0.08, 0.42, -0.47], [0, 0.1, -1]]] },
    { id: 'contato-m', nome: 'Área de contato mesial', grupo: 'Faces e contornos', texto: `Onde o ${fdi} toca o segundo pré-molar: na união dos terços médio e oclusal, um pouco deslocada para vestibular.`, externas: [[[-0.51, 0.47, 0.06], [-1, 0.1, 0.1]]] },
    { id: 'contato-d', nome: 'Área de contato distal', grupo: 'Faces e contornos', texto: `Onde o ${fdi} toca o segundo molar, no terço médio da face distal.`, externas: [[[0.5, 0.42, 0.03], [1, 0.1, 0]]] },
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
    { id: 'dentina', nome: 'Dentina', grupo: 'Tecidos', tecido: 'dentina', folga: 0.06, texto: 'Forma o corpo do dente, da coroa à raiz. É atravessada por túbulos que vão da polpa em direção ao esmalte e ao cemento.', internas: [...naDentinaCoroa, ...nasRaizes(0.06), [0, 0.45, 0], [0, 0.42, 0.12], [0, 0.42, -0.12], [0.1, -0.02, 0], [-0.05, -0.02, 0.1]] },
    { id: 'cemento', nome: 'Cemento', grupo: 'Tecidos', tecido: 'cemento', folga: 0.07, texto: 'Camada fina que reveste a raiz e ancora as fibras do ligamento periodontal. É mais espesso no terço apical.', internas: nasRaizes(0.011) },

    /* ---------- Cavidade pulpar ---------- */
    { id: 'camara', nome: 'Câmara pulpar', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.09, texto: `A porção coronária da cavidade pulpar. No ${fdi} é mais larga no sentido mésio-distal e mais alta por mesial.`, internas: [[0, 0.17, 0], [-0.1, 0.17, 0], [0.1, 0.17, 0], [0, 0.17, 0.07], [0, 0.17, -0.07], [-0.1, 0.17, 0.07], [0.1, 0.17, -0.07]] },
    { id: 'teto', nome: 'Teto da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede oclusal da câmara, de onde saem os cornos pulpares.', internas: [[0.0, 0.268, 0.0], [0.06, 0.262, 0.05], [-0.06, 0.262, -0.05], [0.0, 0.25, 0.1], [0.0, 0.25, -0.1], [0.14, 0.24, 0]] },
    { id: 'assoalho', nome: 'Assoalho da câmara', grupo: 'Cavidade pulpar', folga: 0.08, texto: 'A parede voltada para a furca. É nele que ficam as embocaduras dos canais.', internas: [[0.0, 0.072, 0.0], [0.0, 0.085, 0.07], [0.0, 0.085, -0.07], [0.06, 0.075, 0.0], [-0.06, 0.075, 0.0]] },
    { id: 'corno-mv', nome: 'Corno pulpar mésio-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular. É o mais alto e o mais exposto a uma abertura acidental.', internas: reta([-0.19, 0.26, 0.125], [-0.255, 0.39, 0.185], 5) },
    { id: 'corno-cv', nome: 'Corno pulpar médio-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide médio-vestibular.', internas: reta([0.08, 0.26, 0.13], [0.062, 0.38, 0.195], 5) },
    { id: 'corno-dv', nome: 'Corno pulpar disto-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'O menor dos cornos, voltado para a cúspide disto-vestibular.', internas: reta([0.22, 0.25, 0.095], [0.295, 0.335, 0.128], 5) },
    { id: 'corno-ml', nome: 'Corno pulpar mésio-lingual', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide mésio-lingual.', internas: reta([-0.18, 0.27, -0.125], [-0.245, 0.41, -0.185], 5) },
    { id: 'corno-dl', nome: 'Corno pulpar disto-lingual', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Prolongamento da câmara em direção à cúspide disto-lingual.', internas: reta([0.14, 0.26, -0.125], [0.185, 0.39, -0.185], 5) },
    { id: 'emboc', nome: 'Embocadura dos canais', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.05, texto: `A entrada de cada canal no assoalho da câmara. No ${fdi} são três, em triângulo: duas mesiais e uma distal.`, internas: [[-0.19, 0.09, 0.085], [-0.19, 0.09, -0.085], [0.2, 0.09, 0.0]] },
    { id: 'canal-mv', nome: 'Canal mésio-vestibular', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.03, texto: 'Canal vestibular da raiz mesial. É estreito e costuma ser o mais curvo do dente.', internas: eixo([CANAL_MV[0][0], -0.02, 0.08], CANAL_MV[1], 26) },
    { id: 'canal-ml', nome: 'Canal mésio-lingual', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.03, texto: 'Canal lingual da raiz mesial. Pode terminar em forame próprio ou se unir ao mésio-vestibular perto do ápice.', internas: eixo([CANAL_ML[0][0], -0.02, -0.08], CANAL_ML[1], 26) },
    { id: 'canal-d', nome: 'Canal distal', grupo: 'Cavidade pulpar', tecido: 'polpa', folga: 0.035, texto: 'Canal da raiz distal: único, amplo e achatado no sentido mésio-distal. Em parte dos casos há dois canais distais.', internas: eixo([CANAL_D[0][0], -0.02, 0], CANAL_D[1], 26) },
    {
      /* O forame é a saída do canal na superfície do ápice. Por fora, o nome se prende à ponta
         de cada raiz; no corte, ao último trecho do canal, já na saída. */
      id: 'forame', nome: 'Forame apical', grupo: 'Cavidade pulpar', folga: 0.05,
      texto: 'Abertura do canal radicular na superfície do ápice, por onde o feixe vásculo-nervoso entra no dente. Nem sempre coincide com o vértice anatômico da raiz.',
      externas: [
        [m.desdobra([-0.34, -1.36, 0.0]), [-0.15, -1, 0]], [m.desdobra([-0.34, -1.345, 0.03]), [-0.1, -0.75, 0.65]], [m.desdobra([-0.34, -1.345, -0.03]), [-0.1, -0.75, -0.65]],
        [m.desdobra([0.3, -1.26, 0.0]), [0.15, -1, 0]], [m.desdobra([0.3, -1.245, 0.03]), [0.1, -0.75, 0.65]], [m.desdobra([0.3, -1.245, -0.03]), [0.1, -0.75, -0.65]],
      ],
      internas: [m.desdobra([-0.34, -1.338, 0.025]), m.desdobra([-0.34, -1.338, -0.025]), m.desdobra([0.3, -1.238, 0])],
    },
  ];
}

export const molarInferior1: Dente = {
  fdi: 36,
  lado: 1,
  forma: une(0.13, coroa, raizes),
  polpa,
  jac: { base: 0.05, onda: 0.035 },
  esmalte: { base: 0.085, extra: 0.05, y0: 0.35, y1: 0.7, faixa: 0.22 },
  cemento: 0.022,
  curva: CURVA,
  centro: [0, -0.26, 0],
  raio: 1.34,
  chao: -1.46,
  planos: [
    { nome: 'Mésio-distal', normal: [0, 0, 1], fora: 0.62, fim: -0.35, padrao: 0.06, vista: [0.26, 0.12] },
    { nome: 'Vestíbulo-lingual', normal: [-1, 0, 0], fora: 0.62, fim: -0.4, padrao: 0.215, vista: [-Math.PI / 2 + 0.3, 0.12] },
    { nome: 'Transversal', normal: [0, 1, 0], fora: 0.92, fim: -1.2, padrao: -0.05, vista: [0.25, 1.05] },
  ],
  estruturas,
};
