/* As fichas dos três molares superiores, descritas para o lado esquerdo (26, 27 e 28).
   Morfologia e textos em revisão pelo autor. */
import { molarSuperior, type MolarSuperior } from './molar-superior';

/* ---------- 26: primeiro molar superior ----------
   Coroa romboidal, mais larga no sentido vestíbulo-palatino. Quatro cúspides, com a
   mésio-palatina a maior; ponte de esmalte; tubérculo de Carabelli. Três raízes divergentes. */
const M1: MolarSuperior = {
  fdi: 26,
  coroa: { b: [0.27, 0.17, 0.3], r: 0.21 },
  cuspides: [
    { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', c: [-0.27, 0.6, 0.27], r: 0.17, corno: [[-0.14, 0.2, 0.13], [-0.23, 0.4, 0.23], 0.045, 0.014], texto: 'A maior das duas cúspides vestibulares. As vestibulares do molar superior são cúspides de balanceio.', cornoNome: 'Corno pulpar mésio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular. É o mais alto e o mais exposto a uma abertura acidental.' },
    { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', c: [0.24, 0.58, 0.26], r: 0.16, corno: [[0.12, 0.2, 0.13], [0.2, 0.38, 0.22], 0.04, 0.013], texto: 'A segunda cúspide vestibular, um pouco menor. Recebe a ponte de esmalte que vem da mésio-palatina.', cornoNome: 'Corno pulpar disto-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-vestibular.' },
    { id: 'cusp-mp', nome: 'Cúspide mésio-palatina', c: [-0.2, 0.62, -0.26], r: 0.2, corno: [[-0.1, 0.2, -0.13], [-0.17, 0.42, -0.22], 0.048, 0.015], texto: 'A maior cúspide do dente. É a principal cúspide de contenção: oclui na fosseta central do molar inferior.', cornoNome: 'Corno pulpar mésio-palatino', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-palatina. É volumoso, como a cúspide.' },
    { id: 'cusp-dp', nome: 'Cúspide disto-palatina', c: [0.27, 0.55, -0.27], r: 0.145, corno: [[0.13, 0.19, -0.12], [0.22, 0.35, -0.22], 0.036, 0.012], texto: 'A menor das quatro. Diminui do primeiro para o terceiro molar e pode faltar.', cornoNome: 'Corno pulpar disto-palatino', cornoTexto: 'O menor dos cornos, voltado para a cúspide disto-palatina.' },
  ],
  ponte: { a: [-0.13, 0.62, -0.15], b: [0.17, 0.6, 0.17], r: 0.075 },
  tuberculo: { c: [-0.2, 0.42, -0.5], r: 0.075 },
  fossetas: [
    { id: 'fosseta-c', nome: 'Fosseta central', c: [-0.08, 0.8, 0.07], r: [0.2, 0.15, 0.15], texto: 'Depressão principal da face oclusal, por mesial da ponte de esmalte. Recebe a cúspide disto-vestibular do molar inferior.' },
    { id: 'fosseta-d', nome: 'Fosseta distal', c: [0.27, 0.77, -0.06], r: [0.11, 0.13, 0.14], texto: 'Depressão por distal da ponte de esmalte, de onde sai o sulco disto-palatino.' },
  ],
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.36, 0.745, 0.03], b: [-0.02, 0.735, 0.06], r: 0.038, texto: 'Sulco central que vai da fosseta mesial à central. No molar superior ele é interrompido pela ponte de esmalte.' },
    { id: 'sulco-v', nome: 'Sulco vestibular', a: [-0.02, 0.735, 0.06], b: [-0.02, 0.6, 0.48], r: 0.034, desce: true, texto: 'Sai da fosseta central, separa as duas cúspides vestibulares e desce pela face vestibular.' },
    { id: 'sulco-dp', nome: 'Sulco disto-palatino', a: [0.3, 0.715, -0.03], b: [0.06, 0.6, -0.5], r: 0.034, desce: true, texto: 'Sai da fosseta distal, separa as cúspides mésio-palatina e disto-palatina e desce pela face palatina.' },
  ],
  raizes: [
    { id: 'raiz-mv', nome: 'Raiz mésio-vestibular', a: [-0.22, 0.1, 0.19], b: [-0.25, -1.2, 0.25], r1: 0.2, r2: 0.05, fora: [-0.6, 0, 0.8], texto: 'Achatada no sentido mésio-distal e larga no vestíbulo-palatino. É a que mais vezes tem dois canais.' },
    { id: 'raiz-dv', nome: 'Raiz disto-vestibular', a: [0.2, 0.1, 0.19], b: [0.3, -1.1, 0.24], r1: 0.17, r2: 0.05, fora: [0.6, 0, 0.8], texto: 'A menor e mais delgada das três, de secção arredondada.' },
    { id: 'raiz-p', nome: 'Raiz palatina', a: [-0.12, 0.1, -0.2], b: [-0.22, -1.3, -0.5], r1: 0.23, r2: 0.06, fora: [0, 0, -1], texto: 'A mais longa e mais volumosa. Diverge para o palato e pode curvar-se para vestibular no terço apical.' },
  ],
  uniao: 0.1,
  curva: 0.06,
  furcas: [[[0, -0.12, 0.2], [0, -0.6, 0.8]], [[-0.16, -0.12, 0], [-0.8, -0.6, 0]], [[0.12, -0.12, 0], [0.8, -0.6, 0]]],
  camara: { c: [-0.02, 0.17, 0], r: [0.18, 0.1, 0.25] },
  canais: [
    { id: 'canal-mv', nome: 'Canal mésio-vestibular', a: [-0.13, 0.11, 0.17], b: [-0.25, -1.245, 0.25], r1: 0.032, r2: 0.01, texto: 'Canal da raiz mésio-vestibular. Com frequência há um segundo canal nessa raiz, o MV2, que aqui não foi desenhado.' },
    { id: 'canal-dv', nome: 'Canal disto-vestibular', a: [0.12, 0.11, 0.17], b: [0.3, -1.145, 0.24], r1: 0.03, r2: 0.01, texto: 'Canal único e estreito da raiz disto-vestibular.' },
    { id: 'canal-p', nome: 'Canal palatino', a: [-0.12, 0.11, -0.13], b: [-0.22, -1.355, -0.5], r1: 0.046, r2: 0.011, texto: 'O canal mais amplo e mais reto do dente, na raiz palatina.' },
  ],
  cortes: { md: 0.2, vp: 0.15 },
  textos: {
    'face-o': 'Face triturante de contorno romboidal, mais larga no sentido vestíbulo-palatino. Tem quatro cúspides, e a ponte de esmalte a divide em duas áreas.',
    'face-m': 'Face proximal voltada para o segundo pré-molar. É a maior das faces proximais.',
    'face-d': 'Face proximal voltada para o segundo molar. É menor e mais convexa que a mesial.',
    'contato-m': 'Onde o 26 toca o segundo pré-molar, na união dos terços médio e oclusal.',
    'contato-d': 'Onde o 26 toca o segundo molar, no terço médio da face distal.',
    tronco: 'Porção comum da raiz, entre a linha cervical e a trifurcação.',
    furca: 'Região em que o tronco radicular se divide em três raízes. O molar superior tem três entradas de furca: vestibular, mesial e distal.',
    camara: 'A porção coronária da cavidade pulpar. No molar superior é mais larga no sentido vestíbulo-palatino, acompanhando a coroa.',
    emboc: 'A entrada de cada canal no assoalho da câmara. No 26 formam um triângulo: mésio-vestibular, disto-vestibular e palatina.',
  },
};

/* ---------- 27: segundo molar superior ----------
   Coroa menor, cúspide disto-palatina reduzida, sem tubérculo de Carabelli. Raízes mais
   próximas, menos divergentes e inclinadas para distal. */
const M2: MolarSuperior = {
  fdi: 27,
  coroa: { b: [0.24, 0.16, 0.29], r: 0.2 },
  cuspides: [
    { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', c: [-0.24, 0.58, 0.26], r: 0.165, corno: [[-0.12, 0.2, 0.12], [-0.2, 0.38, 0.22], 0.042, 0.014], texto: 'A maior das duas cúspides vestibulares.', cornoNome: 'Corno pulpar mésio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular.' },
    { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', c: [0.2, 0.555, 0.24], r: 0.15, corno: [[0.1, 0.2, 0.12], [0.16, 0.36, 0.2], 0.038, 0.013], texto: 'A segunda cúspide vestibular, menor que no primeiro molar.', cornoNome: 'Corno pulpar disto-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-vestibular.' },
    { id: 'cusp-mp', nome: 'Cúspide mésio-palatina', c: [-0.17, 0.6, -0.25], r: 0.19, corno: [[-0.09, 0.2, -0.12], [-0.14, 0.4, -0.21], 0.045, 0.014], texto: 'A maior cúspide do dente e a principal cúspide de contenção.', cornoNome: 'Corno pulpar mésio-palatino', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-palatina.' },
    { id: 'cusp-dp', nome: 'Cúspide disto-palatina', c: [0.22, 0.51, -0.24], r: 0.12, corno: [[0.1, 0.19, -0.11], [0.18, 0.32, -0.19], 0.032, 0.011], texto: 'Bem reduzida no segundo molar. Quando falta, a coroa fica com três cúspides e contorno em forma de coração.', cornoNome: 'Corno pulpar disto-palatino', cornoTexto: 'Pequeno prolongamento voltado para a cúspide disto-palatina.' },
  ],
  ponte: { a: [-0.11, 0.6, -0.14], b: [0.14, 0.575, 0.15], r: 0.07 },
  tuberculo: null,
  fossetas: [
    { id: 'fosseta-c', nome: 'Fosseta central', c: [-0.07, 0.78, 0.07], r: [0.18, 0.15, 0.14], texto: 'Depressão principal da face oclusal, por mesial da ponte de esmalte.' },
    { id: 'fosseta-d', nome: 'Fosseta distal', c: [0.23, 0.74, -0.06], r: [0.09, 0.12, 0.12], texto: 'Depressão por distal da ponte de esmalte. É menor que no primeiro molar.' },
  ],
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.32, 0.725, 0.03], b: [-0.02, 0.715, 0.06], r: 0.036, texto: 'Sulco central, da fosseta mesial à central, interrompido pela ponte de esmalte.' },
    { id: 'sulco-v', nome: 'Sulco vestibular', a: [-0.02, 0.715, 0.06], b: [-0.02, 0.59, 0.46], r: 0.032, desce: true, texto: 'Separa as duas cúspides vestibulares e desce pela face vestibular.' },
    { id: 'sulco-dp', nome: 'Sulco disto-palatino', a: [0.25, 0.69, -0.03], b: [0.06, 0.58, -0.47], r: 0.03, desce: true, texto: 'Separa as cúspides palatinas. É mais raso que no primeiro molar.' },
  ],
  raizes: [
    { id: 'raiz-mv', nome: 'Raiz mésio-vestibular', a: [-0.18, 0.1, 0.17], b: [-0.21, -1.12, 0.23], r1: 0.19, r2: 0.05, fora: [-0.6, 0, 0.8], texto: 'Achatada no sentido mésio-distal. No segundo molar fica mais próxima da disto-vestibular.' },
    { id: 'raiz-dv', nome: 'Raiz disto-vestibular', a: [0.17, 0.1, 0.17], b: [0.19, -1.02, 0.21], r1: 0.16, r2: 0.05, fora: [0.6, 0, 0.8], texto: 'A menor das três. Pode aparecer fusionada à mésio-vestibular.' },
    { id: 'raiz-p', nome: 'Raiz palatina', a: [-0.1, 0.1, -0.17], b: [-0.2, -1.2, -0.4], r1: 0.22, r2: 0.06, fora: [0, 0, -1], texto: 'A mais longa e volumosa, menos divergente que no primeiro molar.' },
  ],
  uniao: 0.11,
  curva: 0.13,
  furcas: [[[0, -0.2, 0.19], [0, -0.6, 0.8]], [[-0.13, -0.2, 0], [-0.8, -0.6, 0]], [[0.1, -0.2, 0], [0.8, -0.6, 0]]],
  camara: { c: [-0.02, 0.17, 0], r: [0.16, 0.095, 0.19] },
  canais: [
    { id: 'canal-mv', nome: 'Canal mésio-vestibular', a: [-0.11, 0.11, 0.12], b: [-0.21, -1.165, 0.23], r1: 0.03, r2: 0.01, texto: 'Canal da raiz mésio-vestibular.' },
    { id: 'canal-dv', nome: 'Canal disto-vestibular', a: [0.1, 0.11, 0.12], b: [0.19, -1.065, 0.21], r1: 0.028, r2: 0.01, texto: 'Canal único e estreito da raiz disto-vestibular.' },
    { id: 'canal-p', nome: 'Canal palatino', a: [-0.1, 0.11, -0.12], b: [-0.2, -1.255, -0.4], r1: 0.044, r2: 0.011, texto: 'O canal mais amplo do dente, na raiz palatina.' },
  ],
  cortes: { md: 0.15, vp: 0.1 },
  textos: {
    'face-o': 'Face triturante menor e mais achatada no sentido mésio-distal que a do primeiro molar, com a cúspide disto-palatina reduzida.',
    'face-m': 'Face proximal voltada para o primeiro molar.',
    'face-d': 'Face proximal voltada para o terceiro molar.',
    'contato-m': 'Onde o 27 toca o primeiro molar.',
    'contato-d': 'Onde o 27 toca o terceiro molar, quando ele está presente.',
    tronco: 'Porção comum da raiz, entre a linha cervical e a trifurcação. É mais longo que no primeiro molar.',
    furca: 'Região em que o tronco radicular se divide. As entradas ficam mais apicais e mais estreitas que no primeiro molar.',
    camara: 'A porção coronária da cavidade pulpar, mais estreita no sentido mésio-distal.',
    emboc: 'A entrada de cada canal no assoalho da câmara. No 27 as três ficam mais próximas, quase em linha.',
  },
};

/* ---------- 28: terceiro molar superior ----------
   O mais variável. Aqui: coroa pequena de três cúspides, sem a disto-palatina, e raízes
   curtas e fusionadas, inclinadas para distal. */
const M3: MolarSuperior = {
  fdi: 28,
  coroa: { b: [0.21, 0.15, 0.26], r: 0.2 },
  cuspides: [
    { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', c: [-0.19, 0.55, 0.22], r: 0.16, corno: [[-0.09, 0.2, 0.1], [-0.16, 0.36, 0.18], 0.04, 0.013], texto: 'Em geral a cúspide vestibular mais desenvolvida do terceiro molar.', cornoNome: 'Corno pulpar mésio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular.' },
    { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', c: [0.17, 0.52, 0.2], r: 0.14, corno: [[0.08, 0.19, 0.09], [0.13, 0.33, 0.16], 0.034, 0.012], texto: 'Menor e mais baixa; é a que mais varia.', cornoNome: 'Corno pulpar disto-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-vestibular.' },
    { id: 'cusp-mp', nome: 'Cúspide palatina', c: [-0.04, 0.57, -0.22], r: 0.19, corno: [[-0.02, 0.2, -0.1], [-0.03, 0.38, -0.18], 0.044, 0.014], texto: 'Única cúspide palatina nesta forma de três cúspides, a mais comum no terceiro molar superior.', cornoNome: 'Corno pulpar palatino', cornoTexto: 'Prolongamento da câmara em direção à cúspide palatina.' },
  ],
  ponte: null,
  tuberculo: null,
  fossetas: [{ id: 'fosseta-c', nome: 'Fosseta central', c: [-0.02, 0.74, 0.03], r: [0.2, 0.14, 0.14], texto: 'Depressão no centro da face oclusal, de onde saem sulcos curtos e irregulares.' }],
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.27, 0.69, 0.02], b: [0.25, 0.66, 0.0], r: 0.036, texto: 'Sulco central, irregular e acompanhado de sulcos secundários no terceiro molar.' },
    { id: 'sulco-v', nome: 'Sulco vestibular', a: [-0.01, 0.68, 0.03], b: [-0.01, 0.56, 0.42], r: 0.03, desce: true, texto: 'Separa as duas cúspides vestibulares.' },
  ],
  raizes: [
    { id: 'raiz-mv', nome: 'Raiz mésio-vestibular', a: [-0.11, 0.1, 0.1], b: [-0.1, -0.92, 0.13], r1: 0.2, r2: 0.06, fora: [-0.6, 0, 0.8], texto: 'Curta e fusionada às outras duas na maior parte do comprimento.' },
    { id: 'raiz-dv', nome: 'Raiz disto-vestibular', a: [0.11, 0.1, 0.1], b: [0.1, -0.86, 0.11], r1: 0.17, r2: 0.06, fora: [0.6, 0, 0.8], texto: 'A menor das três, fusionada à mésio-vestibular.' },
    { id: 'raiz-p', nome: 'Raiz palatina', a: [0, 0.1, -0.12], b: [0, -0.96, -0.17], r1: 0.21, r2: 0.06, fora: [0, 0, -1], texto: 'Fusionada às vestibulares, formando com elas uma raiz cônica única.' },
  ],
  uniao: 0.18,
  curva: 0.24,
  furcas: [],
  camara: { c: [0, 0.17, 0], r: [0.15, 0.09, 0.17] },
  canais: [
    { id: 'canal-mv', nome: 'Canal mésio-vestibular', a: [-0.07, 0.11, 0.08], b: [-0.1, -0.968, 0.13], r1: 0.028, r2: 0.01, texto: 'Canal da porção mésio-vestibular da raiz. O número de canais do terceiro molar é muito variável.' },
    { id: 'canal-dv', nome: 'Canal disto-vestibular', a: [0.07, 0.11, 0.08], b: [0.1, -0.908, 0.11], r1: 0.026, r2: 0.01, texto: 'Canal da porção disto-vestibular da raiz.' },
    { id: 'canal-p', nome: 'Canal palatino', a: [0, 0.11, -0.08], b: [0, -1.008, -0.17], r1: 0.04, r2: 0.011, texto: 'Canal da porção palatina da raiz, o mais amplo.' },
  ],
  cortes: { md: 0.1, vp: 0.04 },
  textos: {
    'face-o': 'Face triturante pequena, de contorno triangular ou em forma de coração, com três cúspides.',
    'face-m': 'Face proximal voltada para o segundo molar.',
    'face-d': 'Face distal livre: o terceiro molar é o último dente da arcada.',
    'contato-m': 'Onde o 28 toca o segundo molar.',
    'contato-d': 'O 28 não tem dente vizinho por distal; esta é a região de maior convexidade da face distal.',
    tronco: 'No terceiro molar as raízes costumam ser fusionadas: o tronco radicular se prolonga por quase toda a raiz.',
    furca: '',
    camara: 'A porção coronária da cavidade pulpar, ampla em relação ao tamanho do dente.',
    emboc: 'A entrada de cada canal no assoalho da câmara, com as três bem próximas.',
  },
};

export const molar26 = molarSuperior(M1);
export const molar27 = molarSuperior(M2);
export const molar28 = molarSuperior(M3);
