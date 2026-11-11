/* As fichas dos três molares inferiores, descritas para o lado esquerdo (36, 37 e 38).
   Medidas em unidades do modelo: a coroa do 36 tem cerca de 1 de largura mésio-distal.
   Morfologia e textos em revisão pelo autor. */
import { molarInferior, type MolarInferior } from './molar-inferior';

/* ---------- 36: primeiro molar inferior ---------- */
const M1: MolarInferior = {
  fdi: 36,
  coroa: { b: [0.3, 0.17, 0.25], r: 0.21 },
  cuspides: [
    { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', c: [-0.3, 0.6, 0.22], r: 0.17, corno: [[-0.16, 0.2, 0.1], [-0.26, 0.4, 0.19], 0.045, 0.014], texto: 'A maior das três cúspides vestibulares. É uma cúspide de contenção: oclui na fosseta e nas cristas marginais dos dentes superiores.', cornoNome: 'Corno pulpar mésio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular. É o mais alto e o mais exposto a uma abertura acidental.' },
    { id: 'cusp-cv', nome: 'Cúspide médio-vestibular', c: [0.04, 0.59, 0.24], r: 0.16, corno: [[0.09, 0.2, 0.1], [0.06, 0.39, 0.2], 0.042, 0.014], texto: 'A cúspide vestibular do meio, entre os sulcos mésio-vestibular e disto-vestibular.', cornoNome: 'Corno pulpar médio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide médio-vestibular.' },
    { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', c: [0.35, 0.54, 0.15], r: 0.14, corno: [[0.17, 0.19, 0.07], [0.3, 0.34, 0.13], 0.035, 0.012], texto: 'A menor das cinco, no ângulo disto-vestibular da coroa. É a que mais varia de tamanho.', cornoNome: 'Corno pulpar disto-vestibular', cornoTexto: 'O menor dos cornos, voltado para a cúspide disto-vestibular.' },
    { id: 'cusp-ml', nome: 'Cúspide mésio-lingual', c: [-0.28, 0.63, -0.22], r: 0.17, corno: [[-0.15, 0.2, -0.1], [-0.25, 0.42, -0.19], 0.045, 0.014], texto: 'A mais alta e mais aguda. As cúspides linguais do molar inferior são de balanceio e ficam mais altas que as vestibulares.', cornoNome: 'Corno pulpar mésio-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-lingual.' },
    { id: 'cusp-dl', nome: 'Cúspide disto-lingual', c: [0.2, 0.61, -0.22], r: 0.17, corno: [[0.12, 0.2, -0.1], [0.19, 0.4, -0.19], 0.042, 0.014], texto: 'A segunda cúspide lingual, um pouco mais baixa que a mésio-lingual.', cornoNome: 'Corno pulpar disto-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-lingual.' },
  ],
  fosseta: { c: [0.02, 0.8, 0], r: [0.34, 0.15, 0.13] },
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.36, 0.745, 0], b: [0.4, 0.705, 0], r: 0.04, texto: 'Sulco central que percorre a face oclusal de mesial a distal, separando as cúspides vestibulares das linguais.' },
    { id: 'sulco-mv', nome: 'Sulco mésio-vestibular', a: [-0.12, 0.735, 0], b: [-0.13, 0.62, 0.44], r: 0.034, desce: true, texto: 'Sai do sulco mésio-distal, separa as cúspides mésio-vestibular e médio-vestibular e desce pela face vestibular.' },
    { id: 'sulco-dv', nome: 'Sulco disto-vestibular', a: [0.22, 0.715, 0], b: [0.21, 0.58, 0.42], r: 0.032, desce: true, texto: 'Separa as cúspides médio-vestibular e disto-vestibular. É mais curto que o mésio-vestibular.' },
    { id: 'sulco-l', nome: 'Sulco lingual', a: [-0.04, 0.735, 0], b: [-0.04, 0.62, -0.44], r: 0.034, desce: true, texto: 'Separa as duas cúspides linguais e continua, raso, pela face lingual.' },
  ],
  raizes: { mesial: { a: [-0.25, 0.1, 0], b: [-0.34, -1.3, 0], r1: 0.26, r2: 0.055 }, distal: { a: [0.25, 0.1, 0], b: [0.3, -1.2, 0], r1: 0.24, r2: 0.055 }, uniao: 0.1 },
  curva: 0.1,
  furca: -0.1,
  camara: { c: [0, 0.17, 0], r: [0.22, 0.1, 0.14] },
  canais: [
    { id: 'canal-mv', nome: 'Canal mésio-vestibular', a: [-0.19, 0.11, 0.085], b: [-0.34, -1.345, 0.025], r1: 0.036, r2: 0.01, texto: 'Canal vestibular da raiz mesial. É estreito e costuma ser o mais curvo do dente.' },
    { id: 'canal-ml', nome: 'Canal mésio-lingual', a: [-0.19, 0.11, -0.085], b: [-0.34, -1.345, -0.025], r1: 0.036, r2: 0.01, texto: 'Canal lingual da raiz mesial. Pode terminar em forame próprio ou se unir ao mésio-vestibular perto do ápice.' },
    { id: 'canal-d', nome: 'Canal distal', a: [0.2, 0.11, 0], b: [0.3, -1.245, 0], r1: 0.048, r2: 0.011, achata: 0.62, texto: 'Canal da raiz distal: único, amplo e achatado no sentido mésio-distal. Em parte dos casos há dois canais distais.' },
  ],
  textos: {
    'face-o': 'Face triturante, de contorno trapezoidal com a base maior para vestibular. Reúne cinco cúspides, os sulcos e as fossetas.',
    'face-m': 'Face proximal voltada para o segundo pré-molar. É mais larga e mais plana que a distal.',
    'face-d': 'Face proximal voltada para o segundo molar. É menor e mais convexa que a mesial.',
    'contato-m': 'Onde o 36 toca o segundo pré-molar: na união dos terços médio e oclusal, um pouco deslocada para vestibular.',
    'contato-d': 'Onde o 36 toca o segundo molar, no terço médio da face distal.',
    tronco: 'Porção comum da raiz, entre a linha cervical e a furca, antes da divisão em duas raízes. No primeiro molar é curto.',
    'raiz-m': 'A mais larga das duas, achatada no sentido mésio-distal e curvada para distal. Tem dois canais: mésio-vestibular e mésio-lingual.',
    'raiz-d': 'Mais reta, mais curta e de secção mais arredondada. Em geral tem um canal único e amplo.',
    camara: 'A porção coronária da cavidade pulpar. No 36 é mais larga no sentido mésio-distal e mais alta por mesial.',
    emboc: 'A entrada de cada canal no assoalho da câmara. No 36 são três, em triângulo: duas mesiais e uma distal.',
  },
};

/* ---------- 37: segundo molar inferior ----------
   Coroa menor e mais retangular, quatro cúspides, sulcos em cruz. Raízes mais curtas,
   mais próximas e mais inclinadas para distal, com tronco radicular mais longo. */
const M2: MolarInferior = {
  fdi: 37,
  coroa: { b: [0.26, 0.16, 0.24], r: 0.2 },
  cuspides: [
    { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', c: [-0.24, 0.585, 0.21], r: 0.17, corno: [[-0.13, 0.2, 0.09], [-0.21, 0.39, 0.18], 0.043, 0.014], texto: 'A maior das duas cúspides vestibulares. É uma cúspide de contenção.', cornoNome: 'Corno pulpar mésio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular. É o mais alto.' },
    { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', c: [0.22, 0.565, 0.2], r: 0.165, corno: [[0.12, 0.2, 0.09], [0.19, 0.37, 0.17], 0.04, 0.013], texto: 'A segunda cúspide vestibular. No segundo molar não há uma terceira cúspide, a distal.', cornoNome: 'Corno pulpar disto-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-vestibular.' },
    { id: 'cusp-ml', nome: 'Cúspide mésio-lingual', c: [-0.23, 0.615, -0.21], r: 0.17, corno: [[-0.13, 0.2, -0.09], [-0.2, 0.41, -0.18], 0.043, 0.014], texto: 'A mais alta das quatro. As cúspides linguais do molar inferior são de balanceio.', cornoNome: 'Corno pulpar mésio-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-lingual.' },
    { id: 'cusp-dl', nome: 'Cúspide disto-lingual', c: [0.21, 0.595, -0.2], r: 0.165, corno: [[0.12, 0.2, -0.09], [0.18, 0.39, -0.17], 0.04, 0.013], texto: 'A segunda cúspide lingual, um pouco mais baixa que a mésio-lingual.', cornoNome: 'Corno pulpar disto-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-lingual.' },
  ],
  fosseta: { c: [0, 0.79, 0], r: [0.3, 0.15, 0.12] },
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.32, 0.735, 0], b: [0.34, 0.705, 0], r: 0.04, texto: 'Sulco central, de mesial a distal. Com os sulcos vestibular e lingual forma o desenho em cruz típico do segundo molar inferior.' },
    { id: 'sulco-v', nome: 'Sulco vestibular', a: [-0.01, 0.73, 0], b: [-0.01, 0.6, 0.42], r: 0.034, desce: true, texto: 'Separa as duas cúspides vestibulares e desce pela face vestibular, em linha com o sulco lingual.' },
    { id: 'sulco-l', nome: 'Sulco lingual', a: [-0.01, 0.73, 0], b: [-0.01, 0.61, -0.42], r: 0.034, desce: true, texto: 'Separa as duas cúspides linguais, em linha com o sulco vestibular.' },
  ],
  raizes: { mesial: { a: [-0.2, 0.1, 0], b: [-0.21, -1.16, 0], r1: 0.24, r2: 0.055 }, distal: { a: [0.2, 0.1, 0], b: [0.19, -1.08, 0], r1: 0.225, r2: 0.055 }, uniao: 0.1 },
  curva: 0.17,
  furca: -0.28,
  camara: { c: [0, 0.17, 0], r: [0.19, 0.095, 0.13] },
  canais: [
    { id: 'canal-mv', nome: 'Canal mésio-vestibular', a: [-0.15, 0.11, 0.075], b: [-0.21, -1.205, 0.022], r1: 0.034, r2: 0.01, texto: 'Canal vestibular da raiz mesial. No segundo molar os dois canais mesiais ficam mais próximos e muitas vezes se unem.' },
    { id: 'canal-ml', nome: 'Canal mésio-lingual', a: [-0.15, 0.11, -0.075], b: [-0.21, -1.205, -0.022], r1: 0.034, r2: 0.01, texto: 'Canal lingual da raiz mesial.' },
    { id: 'canal-d', nome: 'Canal distal', a: [0.16, 0.11, 0], b: [0.19, -1.125, 0], r1: 0.046, r2: 0.011, achata: 0.64, texto: 'Canal único e amplo da raiz distal.' },
  ],
  textos: {
    'face-o': 'Face triturante de contorno retangular, com quatro cúspides separadas por sulcos em cruz.',
    'face-m': 'Face proximal voltada para o primeiro molar.',
    'face-d': 'Face proximal voltada para o terceiro molar. É mais convexa que a mesial.',
    'contato-m': 'Onde o 37 toca o primeiro molar.',
    'contato-d': 'Onde o 37 toca o terceiro molar, quando ele está presente.',
    tronco: 'Porção comum da raiz, entre a linha cervical e a furca. No segundo molar é mais longo que no primeiro.',
    'raiz-m': 'Achatada no sentido mésio-distal e inclinada para distal. Em geral tem dois canais.',
    'raiz-d': 'Mais curta e mais próxima da mesial do que no primeiro molar; as duas podem aparecer fusionadas.',
    camara: 'A porção coronária da cavidade pulpar. É menor que a do primeiro molar e acompanha a coroa mais retangular.',
    emboc: 'A entrada de cada canal no assoalho da câmara. No 37 costumam ser três, com as duas mesiais bem próximas.',
  },
};

/* ---------- 38: terceiro molar inferior ----------
   O dente de anatomia mais variável. Aqui: coroa menor e arredondada, quatro cúspides
   baixas, raízes curtas, fusionadas e bem curvadas para distal, com dois canais. */
const M3: MolarInferior = {
  fdi: 38,
  coroa: { b: [0.23, 0.15, 0.22], r: 0.2 },
  cuspides: [
    { id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', c: [-0.2, 0.55, 0.19], r: 0.165, corno: [[-0.1, 0.2, 0.08], [-0.17, 0.36, 0.15], 0.04, 0.013], texto: 'Em geral a cúspide mais desenvolvida do terceiro molar.', cornoNome: 'Corno pulpar mésio-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-vestibular.' },
    { id: 'cusp-dv', nome: 'Cúspide disto-vestibular', c: [0.19, 0.52, 0.17], r: 0.15, corno: [[0.1, 0.19, 0.07], [0.15, 0.33, 0.13], 0.036, 0.012], texto: 'Menor e mais baixa. No terceiro molar as cúspides distais são as que mais variam.', cornoNome: 'Corno pulpar disto-vestibular', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-vestibular.' },
    { id: 'cusp-ml', nome: 'Cúspide mésio-lingual', c: [-0.19, 0.575, -0.19], r: 0.165, corno: [[-0.1, 0.2, -0.08], [-0.16, 0.38, -0.15], 0.04, 0.013], texto: 'A mais alta das cúspides linguais.', cornoNome: 'Corno pulpar mésio-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide mésio-lingual.' },
    { id: 'cusp-dl', nome: 'Cúspide disto-lingual', c: [0.18, 0.54, -0.17], r: 0.15, corno: [[0.1, 0.19, -0.07], [0.14, 0.35, -0.13], 0.036, 0.012], texto: 'A menor das quatro; em muitos terceiros molares é rudimentar ou falta.', cornoNome: 'Corno pulpar disto-lingual', cornoTexto: 'Prolongamento da câmara em direção à cúspide disto-lingual.' },
  ],
  fosseta: { c: [0, 0.75, 0], r: [0.25, 0.14, 0.11] },
  sulcos: [
    { id: 'sulco-md', nome: 'Sulco principal mésio-distal', a: [-0.27, 0.69, 0], b: [0.29, 0.665, 0], r: 0.038, texto: 'Sulco central, de mesial a distal. No terceiro molar costuma ser irregular e acompanhado de sulcos secundários.' },
    { id: 'sulco-v', nome: 'Sulco vestibular', a: [0, 0.685, 0], b: [0.01, 0.57, 0.38], r: 0.032, desce: true, texto: 'Separa as duas cúspides vestibulares.' },
    { id: 'sulco-l', nome: 'Sulco lingual', a: [0, 0.685, 0], b: [-0.01, 0.58, -0.38], r: 0.032, desce: true, texto: 'Separa as duas cúspides linguais.' },
  ],
  raizes: { mesial: { a: [-0.13, 0.1, 0], b: [-0.11, -0.96, 0], r1: 0.24, r2: 0.06 }, distal: { a: [0.13, 0.1, 0], b: [0.1, -0.9, 0], r1: 0.225, r2: 0.06 }, uniao: 0.17 },
  curva: 0.3,
  furca: null,
  camara: { c: [0, 0.17, 0], r: [0.17, 0.09, 0.12] },
  canais: [
    { id: 'canal-m', nome: 'Canal mesial', a: [-0.09, 0.11, 0], b: [-0.11, -1.008, 0], r1: 0.04, r2: 0.011, achata: 0.6, texto: 'Canal da porção mesial da raiz, achatado no sentido mésio-distal. O número de canais do terceiro molar é muito variável.' },
    { id: 'canal-d', nome: 'Canal distal', a: [0.09, 0.11, 0], b: [0.1, -0.948, 0], r1: 0.04, r2: 0.011, achata: 0.7, texto: 'Canal da porção distal da raiz.' },
  ],
  textos: {
    'face-o': 'Face triturante menor e de contorno arredondado, com cúspides baixas e sulcos irregulares.',
    'face-m': 'Face proximal voltada para o segundo molar.',
    'face-d': 'Face distal livre: o terceiro molar é o último dente da arcada.',
    'contato-m': 'Onde o 38 toca o segundo molar.',
    'contato-d': 'O 38 não tem dente vizinho por distal; esta é a região de maior convexidade da face distal.',
    tronco: 'No terceiro molar as raízes costumam ser fusionadas: o tronco radicular se prolonga por quase toda a raiz.',
    'raiz-m': 'Curta, cônica e bem curvada para distal. Aqui aparece fusionada à raiz distal.',
    'raiz-d': 'Mais curta que a mesial e fusionada a ela na maior parte do comprimento.',
    camara: 'A porção coronária da cavidade pulpar. No terceiro molar é ampla em relação ao tamanho do dente.',
    emboc: 'A entrada de cada canal no assoalho da câmara. Aqui são duas, uma mesial e uma distal.',
  },
};

export const molar36 = molarInferior(M1);
export const molar37 = molarInferior(M2);
export const molar38 = molarInferior(M3);
