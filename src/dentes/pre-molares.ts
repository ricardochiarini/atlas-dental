/* As fichas dos quatro pré-molares, descritas para o lado esquerdo (24, 25, 34 e 35).
   Usam o mesmo molde dos molares superiores, que serve a todos os dentes posteriores.
   Morfologia e textos em revisão pelo autor. */
import { molarSuperior, type MolarSuperior } from './molar-superior';

/* descrições comuns aos pré-molares, no lugar das que foram escritas para molares */
const COMUNS = {
  'bossa-v': 'Maior convexidade da face vestibular, no terço cervical.',
  'crista-m': 'Elevação de esmalte que fecha a face oclusal por mesial, unindo a cúspide vestibular à lingual ou palatina.',
  'crista-d': 'Elevação de esmalte que fecha a face oclusal por distal.',
  'vert-t': 'Vertente interna da cúspide, voltada para o sulco principal.',
  'terco-c': 'O terço da raiz mais próximo da coroa.',
  apice: 'A extremidade da raiz.',
};

/* ---------- 24: primeiro pré-molar superior ----------
   Duas cúspides, com a vestibular maior. É o único pré-molar que costuma ter duas raízes. */
const PM1S: MolarSuperior = {
  fdi: 24,
  coroa: { b: [0.16, 0.17, 0.24], r: 0.19 },
  cuspides: [
    { id: 'cusp-v', nome: 'Cúspide vestibular', c: [-0.01, 0.64, 0.2], r: 0.2, corno: [[0, 0.2, 0.1], [0, 0.45, 0.17], 0.04, 0.013], texto: 'A maior e mais alta das duas, de vértice agudo. É a cúspide de balanceio.', cornoNome: 'Corno pulpar vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide vestibular. É o mais alto.' },
    { id: 'cusp-p', nome: 'Cúspide palatina', c: [-0.03, 0.58, -0.2], r: 0.17, corno: [[0, 0.2, -0.1], [-0.02, 0.4, -0.16], 0.036, 0.012], texto: 'Mais baixa e mais arredondada, deslocada para mesial. É a cúspide de contenção.', cornoNome: 'Corno pulpar palatino', cornoTexto: 'Prolongamento da câmara em direção à cúspide palatina.' },
  ],
  ponte: null,
  tuberculo: null,
  fossetas: [
    { id: 'fosseta-m', nome: 'Fosseta mesial', c: [-0.21, 0.8, 0], r: [0.07, 0.12, 0.1], texto: 'Depressão triangular na extremidade mesial do sulco principal.' },
    { id: 'fosseta-d', nome: 'Fosseta distal', c: [0.21, 0.8, 0], r: [0.07, 0.12, 0.1], texto: 'Depressão triangular na extremidade distal do sulco principal.' },
  ],
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.24, 0.745, 0], b: [0.24, 0.745, 0], r: 0.034, texto: 'Sulco central, longo e retilíneo, que separa a cúspide vestibular da palatina.' },
    { id: 'sulco-mm', nome: 'Sulco marginal mesial', a: [-0.24, 0.745, 0], b: [-0.4, 0.62, -0.03], r: 0.022, texto: 'Prolongamento do sulco principal que cruza a crista marginal mesial e chega à face mesial. É característico do primeiro pré-molar superior.' },
  ],
  raizes: [
    { id: 'raiz-v', nome: 'Raiz vestibular', a: [0, 0.1, 0.13], b: [0, -1.25, 0.23], r1: 0.17, r2: 0.045, fora: [0, 0, 1], texto: 'Uma das duas raízes do primeiro pré-molar superior. As duas se separam em geral no terço médio.' },
    { id: 'raiz-p', nome: 'Raiz palatina', a: [0, 0.1, -0.13], b: [0, -1.2, -0.22], r1: 0.16, r2: 0.045, fora: [0, 0, -1], texto: 'Um pouco mais curta que a vestibular. Quando as raízes são fusionadas, um sulco longitudinal marca a separação.' },
  ],
  uniao: 0.15,
  curva: 0.05,
  furcas: [[[-0.1, -0.5, 0], [-0.8, -0.5, 0]], [[0.1, -0.5, 0], [0.8, -0.5, 0]]],
  camara: { c: [0, 0.17, 0], r: [0.1, 0.1, 0.17] },
  canais: [
    { id: 'canal-v', nome: 'Canal vestibular', a: [0, 0.11, 0.1], b: [0, -1.295, 0.23], r1: 0.03, r2: 0.01, texto: 'Canal da raiz vestibular.' },
    { id: 'canal-p', nome: 'Canal palatino', a: [0, 0.11, -0.1], b: [0, -1.245, -0.22], r1: 0.03, r2: 0.01, texto: 'Canal da raiz palatina. O primeiro pré-molar superior tem dois canais na grande maioria dos casos, mesmo com raiz única.' },
  ],
  cortes: { md: 0.13, vp: 0 },
  textos: {
    'face-o': 'Face triturante de contorno hexagonal, mais larga no sentido vestíbulo-palatino, com duas cúspides separadas por um sulco central.',
    'face-m': 'Face proximal voltada para o canino. Tem uma depressão no terço cervical que continua na raiz.',
    'face-d': 'Face proximal voltada para o segundo pré-molar. É mais convexa que a mesial.',
    'contato-m': 'Onde o 24 toca o canino.',
    'contato-d': 'Onde o 24 toca o segundo pré-molar.',
    tronco: 'Porção comum da raiz, entre a linha cervical e a bifurcação. No primeiro pré-molar superior costuma ocupar o terço cervical e parte do médio.',
    furca: 'Região em que a raiz se divide em vestibular e palatina. As entradas ficam nas faces mesial e distal.',
    camara: 'A porção coronária da cavidade pulpar, achatada no sentido mésio-distal e larga no vestíbulo-palatino.',
    emboc: 'A entrada de cada canal no assoalho da câmara: uma vestibular e uma palatina.',
  },
  outrosTextos: { ...COMUNS, 'face-v': 'Voltada para a bochecha. É convexa, com uma crista vertical discreta no centro, lembrando a face vestibular do canino.', 'face-l': 'Voltada para o palato. É menor e mais convexa que a vestibular.' },
};

/* ---------- 25: segundo pré-molar superior ----------
   Cúspides quase do mesmo tamanho, coroa mais arredondada e raiz única. */
const PM2S: MolarSuperior = {
  fdi: 25,
  coroa: { b: [0.15, 0.17, 0.23], r: 0.19 },
  cuspides: [
    { id: 'cusp-v', nome: 'Cúspide vestibular', c: [0, 0.62, 0.2], r: 0.19, corno: [[0, 0.2, 0.09], [0, 0.43, 0.16], 0.038, 0.013], texto: 'Menos aguda que a do primeiro pré-molar. As duas cúspides têm quase a mesma altura.', cornoNome: 'Corno pulpar vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide vestibular.' },
    { id: 'cusp-p', nome: 'Cúspide palatina', c: [-0.02, 0.6, -0.2], r: 0.18, corno: [[0, 0.2, -0.09], [-0.01, 0.42, -0.16], 0.038, 0.013], texto: 'Quase tão alta quanto a vestibular. É a cúspide de contenção.', cornoNome: 'Corno pulpar palatino', cornoTexto: 'Prolongamento da câmara em direção à cúspide palatina.' },
  ],
  ponte: null,
  tuberculo: null,
  fossetas: [
    { id: 'fosseta-m', nome: 'Fosseta mesial', c: [-0.16, 0.79, 0], r: [0.07, 0.12, 0.1], texto: 'Depressão na extremidade mesial do sulco principal.' },
    { id: 'fosseta-d', nome: 'Fosseta distal', c: [0.16, 0.79, 0], r: [0.07, 0.12, 0.1], texto: 'Depressão na extremidade distal do sulco principal.' },
  ],
  sulcos: [{ id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.18, 0.74, 0], b: [0.18, 0.74, 0], r: 0.034, texto: 'Sulco central, mais curto que no primeiro pré-molar e acompanhado de sulcos secundários.' }],
  raizes: [
    { id: 'raiz', nome: 'Raiz', a: [0, 0.1, 0.07], b: [0, -1.3, 0.03], r1: 0.17, r2: 0.045, fora: [0, 0, 1], gemea: [[0, 0.1, -0.07], [0, -1.3, -0.03]], texto: 'Raiz única, achatada no sentido mésio-distal, com sulcos longitudinais nas faces proximais.' },
  ],
  uniao: 0.16,
  curva: 0.07,
  furcas: [],
  camara: { c: [0, 0.17, 0], r: [0.09, 0.1, 0.16] },
  canais: [{ id: 'canal', nome: 'Canal radicular', a: [0, 0.11, 0], b: [0, -1.345, 0], r1: 0.04, r2: 0.011, texto: 'Canal único e achatado na maior parte dos casos; pode haver dois canais que se unem ou se separam ao longo da raiz.' }],
  cortes: { md: 0, vp: 0 },
  textos: {
    'face-o': 'Face triturante de contorno ovalado, com duas cúspides de tamanho parecido e um sulco central curto.',
    'face-m': 'Face proximal voltada para o primeiro pré-molar. É convexa, sem a depressão do primeiro pré-molar.',
    'face-d': 'Face proximal voltada para o primeiro molar.',
    'contato-m': 'Onde o 25 toca o primeiro pré-molar.',
    'contato-d': 'Onde o 25 toca o primeiro molar.',
    tronco: 'Como a raiz é única, não há tronco radicular propriamente dito: esta é a porção cervical da raiz.',
    furca: '',
    camara: 'A porção coronária da cavidade pulpar, achatada no sentido mésio-distal.',
    emboc: 'A entrada do canal no assoalho da câmara. Com raiz única, a câmara continua no canal sem um limite nítido.',
  },
  outrosTextos: { ...COMUNS, 'face-v': 'Voltada para a bochecha. É menor e mais arredondada que a do primeiro pré-molar.', 'face-l': 'Voltada para o palato. Tem quase a mesma altura da vestibular.' },
};

/* ---------- 34: primeiro pré-molar inferior ----------
   Cúspide vestibular dominante e lingual pequena, sem função. Coroa inclinada para lingual. */
const PM1I: MolarSuperior = {
  fdi: 34,
  arco: 'inferior',
  coroa: { b: [0.15, 0.17, 0.2], r: 0.19 },
  cuspides: [
    { id: 'cusp-v', nome: 'Cúspide vestibular', c: [0, 0.66, 0.1], r: 0.2, corno: [[0, 0.2, 0.05], [0, 0.46, 0.09], 0.04, 0.013], texto: 'Grande e aguda, com o vértice deslocado para o centro da coroa. Faz quase todo o trabalho do dente.', cornoNome: 'Corno pulpar vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide vestibular. É o único bem desenvolvido.' },
    { id: 'cusp-l', nome: 'Cúspide lingual', c: [-0.02, 0.48, -0.23], r: 0.12, corno: [[0, 0.19, -0.08], [-0.01, 0.3, -0.17], 0.026, 0.01], texto: 'Pequena e baixa: não alcança o dente antagonista. Por isso o primeiro pré-molar inferior lembra um canino.', cornoNome: 'Corno pulpar lingual', cornoTexto: 'Quase ausente, como a cúspide.' },
  ],
  ponte: { a: [0, 0.6, 0.02], b: [-0.01, 0.5, -0.17], r: 0.055, nome: 'Crista transversal', texto: 'Crista de esmalte que une a cúspide vestibular à lingual, separando a fosseta mesial da distal.' },
  tuberculo: null,
  fossetas: [
    { id: 'fosseta-m', nome: 'Fosseta mesial', c: [-0.17, 0.7, -0.08], r: [0.07, 0.1, 0.08], texto: 'Depressão por mesial da crista transversal. É menor que a distal.' },
    { id: 'fosseta-d', nome: 'Fosseta distal', c: [0.18, 0.7, -0.08], r: [0.08, 0.1, 0.09], texto: 'Depressão por distal da crista transversal.' },
  ],
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.2, 0.655, -0.08], b: [0.21, 0.655, -0.08], r: 0.022, texto: 'Sulco curto e arqueado, interrompido pela crista transversal.' },
    { id: 'sulco-ml', nome: 'Sulco mésio-lingual', a: [-0.17, 0.65, -0.09], b: [-0.2, 0.5, -0.36], r: 0.022, desce: true, texto: 'Sai da fosseta mesial e desce pela face lingual, separando a crista marginal mesial da cúspide lingual. É característico deste dente.' },
  ],
  raizes: [{ id: 'raiz', nome: 'Raiz', a: [0, 0.1, 0.05], b: [0, -1.3, 0.02], r1: 0.17, r2: 0.045, fora: [0, 0, 1], gemea: [[0, 0.1, -0.05], [0, -1.3, -0.02]], texto: 'Raiz única, cônica, de secção ovalada e levemente inclinada para distal.' }],
  uniao: 0.16,
  curva: 0.08,
  furcas: [],
  camara: { c: [0, 0.17, 0], r: [0.085, 0.1, 0.13] },
  canais: [{ id: 'canal', nome: 'Canal radicular', a: [0, 0.11, 0], b: [0, -1.345, 0], r1: 0.038, r2: 0.011, texto: 'Canal único na maior parte dos casos. Uma parte dos primeiros pré-molares inferiores tem o canal dividido no terço médio.' }],
  cortes: { md: 0, vp: 0 },
  textos: {
    'face-o': 'Face triturante pequena, de contorno ovoide, inclinada para lingual. A cúspide vestibular ocupa quase toda a face.',
    'face-m': 'Face proximal voltada para o canino.',
    'face-d': 'Face proximal voltada para o segundo pré-molar.',
    'contato-m': 'Onde o 34 toca o canino.',
    'contato-d': 'Onde o 34 toca o segundo pré-molar.',
    tronco: 'Como a raiz é única, não há tronco radicular propriamente dito: esta é a porção cervical da raiz.',
    furca: '',
    camara: 'A porção coronária da cavidade pulpar. Acompanha a cúspide vestibular, com um único corno bem definido.',
    emboc: 'A entrada do canal. Com raiz única, a câmara continua no canal sem um limite nítido.',
  },
  outrosTextos: { ...COMUNS, 'face-v': 'Voltada para o lábio e a bochecha. É muito convexa e inclinada para lingual.', 'face-l': 'Voltada para a língua. É bem mais baixa e estreita que a vestibular.', 'bossa-l': 'Maior convexidade da face lingual, no terço médio.' },
};

/* ---------- 35: segundo pré-molar inferior ----------
   Aqui na forma de três cúspides (uma vestibular e duas linguais), com sulcos em Y. */
const PM2I: MolarSuperior = {
  fdi: 35,
  arco: 'inferior',
  coroa: { b: [0.17, 0.17, 0.21], r: 0.19 },
  cuspides: [
    { id: 'cusp-v', nome: 'Cúspide vestibular', c: [0, 0.62, 0.19], r: 0.2, corno: [[0, 0.2, 0.09], [0, 0.43, 0.16], 0.04, 0.013], texto: 'Menos aguda que a do primeiro pré-molar inferior. É a cúspide de contenção.', cornoNome: 'Corno pulpar vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide vestibular.' },
    { id: 'cusp-ml', nome: 'Cúspide mésio-lingual', c: [-0.13, 0.585, -0.2], r: 0.15, corno: [[-0.03, 0.2, -0.08], [-0.1, 0.4, -0.16], 0.032, 0.012], texto: 'A maior das duas cúspides linguais. No segundo pré-molar inferior as linguais são funcionais.', cornoNome: 'Corno pulpar mésio-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-lingual.' },
    { id: 'cusp-dl', nome: 'Cúspide disto-lingual', c: [0.14, 0.55, -0.2], r: 0.13, corno: [[0.03, 0.19, -0.08], [0.11, 0.36, -0.16], 0.028, 0.011], texto: 'A menor das três. Quando falta, o dente fica com duas cúspides e sulco em forma de U ou de H.', cornoNome: 'Corno pulpar disto-lingual', cornoTexto: 'Pequeno prolongamento voltado para a cúspide disto-lingual.' },
  ],
  ponte: null,
  tuberculo: null,
  fossetas: [{ id: 'fosseta-c', nome: 'Fosseta central', c: [0.01, 0.78, -0.02], r: [0.13, 0.12, 0.1], texto: 'Depressão no centro da face oclusal, onde os três sulcos se encontram em forma de Y.' }],
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.23, 0.705, -0.02], b: [0.24, 0.7, -0.02], r: 0.032, texto: 'Sulco central, que separa a cúspide vestibular das duas linguais.' },
    { id: 'sulco-l', nome: 'Sulco lingual', a: [0.01, 0.7, -0.02], b: [0.02, 0.57, -0.4], r: 0.03, desce: true, texto: 'Separa as duas cúspides linguais e desce pela face lingual. Com o sulco principal forma o Y.' },
  ],
  raizes: [{ id: 'raiz', nome: 'Raiz', a: [0, 0.1, 0.05], b: [0, -1.32, 0.02], r1: 0.18, r2: 0.045, fora: [0, 0, 1], gemea: [[0, 0.1, -0.05], [0, -1.32, -0.02]], texto: 'Raiz única, cônica e mais longa e volumosa que a do primeiro pré-molar inferior.' }],
  uniao: 0.16,
  curva: 0.09,
  furcas: [],
  camara: { c: [0, 0.17, 0], r: [0.1, 0.1, 0.14] },
  canais: [{ id: 'canal', nome: 'Canal radicular', a: [0, 0.11, 0], b: [0, -1.365, 0], r1: 0.04, r2: 0.011, texto: 'Canal único, amplo e de secção ovalada.' }],
  cortes: { md: 0, vp: 0 },
  textos: {
    'face-o': 'Face triturante de contorno arredondado ou quadrangular, com três cúspides e sulcos em Y. É a forma mais comum do segundo pré-molar inferior.',
    'face-m': 'Face proximal voltada para o primeiro pré-molar.',
    'face-d': 'Face proximal voltada para o primeiro molar.',
    'contato-m': 'Onde o 35 toca o primeiro pré-molar.',
    'contato-d': 'Onde o 35 toca o primeiro molar.',
    tronco: 'Como a raiz é única, não há tronco radicular propriamente dito: esta é a porção cervical da raiz.',
    furca: '',
    camara: 'A porção coronária da cavidade pulpar, com um corno para cada cúspide.',
    emboc: 'A entrada do canal. Com raiz única, a câmara continua no canal sem um limite nítido.',
  },
  outrosTextos: { ...COMUNS, 'crista-m': 'Elevação de esmalte que fecha a face oclusal por mesial, unindo a cúspide vestibular à mésio-lingual.', 'face-v': 'Voltada para a bochecha. É convexa e menos inclinada para lingual que a do primeiro pré-molar.', 'face-l': 'Voltada para a língua. É larga, porque abriga duas cúspides.' },
};

export const preMolar24 = molarSuperior(PM1S);
export const preMolar25 = molarSuperior(PM2S);
export const preMolar34 = molarSuperior(PM1I);
export const preMolar35 = molarSuperior(PM2I);
