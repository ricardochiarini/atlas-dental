/* As fichas dos seis dentes anteriores, descritas para o lado esquerdo
   (21, 22, 23 e 31, 32, 33). Medidas em unidades do modelo (1 ≈ 10 mm).
   Morfologia e textos em revisão pelo autor. */
import { anterior, type Anterior } from './anterior';

/* ---------- 21: incisivo central superior ---------- */
const IC_S: Anterior = {
  fdi: 21, arco: 'superior', canino: false,
  T: 1.08, W: 0.42, E: 0.34, distal: 0.1,
  raiz: { fim: [0, -1.22, 0], r1: 0.3, r2: 0.05, achata: 1, triangular: true },
  curva: 0.05,
  textos: {
    'face-v': 'Voltada para o lábio. É a maior face vestibular dos incisivos: trapezoidal, quase plana no terço incisal e convexa no cervical.',
    'face-l': 'Voltada para o palato. É mais estreita que a vestibular e escavada pela fossa palatina, entre as cristas marginais.',
    incisal: 'Borda de corte, quase reta e levemente inclinada para distal. No dente recém-irrompido tem três mamelões, que o desgaste apaga.',
    cingulo: 'Elevação arredondada no terço cervical da face palatina. No incisivo central superior é volumoso e centrado, ou levemente para distal.',
    fossa: 'Depressão ampla da face palatina, limitada pelas cristas marginais, pelo cíngulo e pela borda incisal. É ela que dá ao incisivo a forma de pá.',
    raiz: 'Raiz única, cônica e robusta, de secção triangular arredondada. É um pouco mais longa que a coroa.',
    camara: 'A porção coronária da cavidade pulpar. Acompanha a forma da coroa: larga no sentido mésio-distal e achatada no vestíbulo-palatino.',
    canal: 'Canal único, amplo e quase reto, de secção arredondada. É o canal mais simples da dentição.',
    'contato-m': 'Onde o 21 toca o outro incisivo central, no terço incisal, junto ao ângulo.',
    'contato-d': 'Onde o 21 toca o incisivo lateral, na união dos terços incisal e médio.',
  },
};

/* ---------- 22: incisivo lateral superior ---------- */
const IL_S: Anterior = {
  fdi: 22, arco: 'superior', canino: false,
  T: 0.95, W: 0.32, E: 0.3, distal: 0.23, mesial: 0.1, fossa: 0.74, forameCego: true,
  raiz: { fim: [0, -1.24, 0], r1: 0.25, r2: 0.045, achata: 1.15 },
  curva: 0.1,
  textos: {
    'face-v': 'Voltada para o lábio. Lembra a do central, mas é menor, mais estreita e mais convexa.',
    'face-l': 'Voltada para o palato. A fossa palatina é mais profunda que a do central e as cristas marginais, mais salientes.',
    incisal: 'Borda de corte mais curta e mais arredondada que a do central, bem inclinada para distal.',
    cingulo: 'Elevação no terço cervical da face palatina. É estreito e saliente; acima dele costuma haver uma fosseta, o forame cego.',
    fossa: 'Depressão da face palatina. No incisivo lateral é proporcionalmente mais profunda que no central.',
    raiz: 'Raiz única, delgada e longa em relação à coroa, achatada no sentido mésio-distal, com o ápice desviado para distal.',
    camara: 'A porção coronária da cavidade pulpar, parecida com a do central em escala menor.',
    canal: 'Canal único, mais estreito que o do central e muitas vezes curvo para distal no terço apical.',
    'contato-m': 'Onde o 22 toca o incisivo central, na união dos terços incisal e médio.',
    'contato-d': 'Onde o 22 toca o canino, no terço médio.',
  },
};

/* ---------- 23: canino superior ---------- */
const C_S: Anterior = {
  fdi: 23, arco: 'superior', canino: true,
  T: 1.05, W: 0.37, E: 0.4, distal: 0,
  raiz: { fim: [0, -1.62, 0], r1: 0.31, r2: 0.05, achata: 1.1 },
  curva: 0.08,
  textos: {
    'face-v': 'Voltada para o lábio. É pentagonal e muito convexa, com uma crista vertical que vai do colo ao vértice da cúspide.',
    'face-l': 'Voltada para o palato. Tem o cíngulo mais desenvolvido da dentição e uma crista central que divide a fossa em duas.',
    incisal: 'O ponto mais saliente do dente, deslocado para mesial. Dele descem as duas arestas, a mesial mais curta que a distal.',
    cingulo: 'Elevação no terço cervical da face palatina. No canino superior é grande e pode formar um pequeno tubérculo.',
    fossa: 'Depressão entre a crista palatina e a crista marginal mesial.',
    raiz: 'A raiz mais longa da dentição: única, cônica, achatada no sentido mésio-distal e com o ápice voltado para distal.',
    camara: 'A porção coronária da cavidade pulpar. É mais larga no sentido vestíbulo-palatino, com um único corno voltado para a cúspide.',
    canal: 'Canal único, longo e amplo, de secção oval no terço cervical e arredondada no apical.',
    'contato-m': 'Onde o 23 toca o incisivo lateral, na união dos terços incisal e médio.',
    'contato-d': 'Onde o 23 toca o primeiro pré-molar, no terço médio. É a área de contato mais cervical dos anteriores.',
  },
};

/* ---------- 31: incisivo central inferior ---------- */
const IC_I: Anterior = {
  fdi: 31, arco: 'inferior', canino: false,
  T: 0.93, W: 0.26, E: 0.3, distal: 0.03,
  raiz: { fim: [0, -1.18, 0], r1: 0.26, r2: 0.045, achata: 1.55 },
  curva: 0.03,
  textos: {
    'face-v': 'Voltada para o lábio. É estreita, alta e quase plana. É o menor dente da dentição permanente.',
    'face-l': 'Voltada para a língua. A fossa lingual é rasa e as cristas marginais, pouco marcadas.',
    incisal: 'Borda de corte reta e perpendicular ao longo eixo do dente. Os dois ângulos são quase iguais: é o dente mais simétrico da boca.',
    cingulo: 'Elevação discreta no terço cervical da face lingual, bem menor que a dos incisivos superiores.',
    fossa: 'Depressão rasa da face lingual, quase sem relevo.',
    raiz: 'Raiz única, muito achatada no sentido mésio-distal e larga no vestíbulo-lingual, com sulcos longitudinais nas faces proximais.',
    camara: 'A porção coronária da cavidade pulpar, estreita no sentido mésio-distal e larga no vestíbulo-lingual.',
    canal: 'Em geral um canal único e achatado. Em parte dos incisivos inferiores há dois canais, vestibular e lingual, que costumam se unir antes do ápice.',
    'contato-m': 'Onde o 31 toca o outro incisivo central, no terço incisal.',
    'contato-d': 'Onde o 31 toca o incisivo lateral, também no terço incisal, quase na mesma altura do contato mesial.',
  },
};

/* ---------- 32: incisivo lateral inferior ---------- */
const IL_I: Anterior = {
  fdi: 32, arco: 'inferior', canino: false,
  T: 0.98, W: 0.29, E: 0.32, distal: 0.1,
  raiz: { fim: [0, -1.33, 0], r1: 0.27, r2: 0.045, achata: 1.5 },
  curva: 0.06,
  textos: {
    'face-v': 'Voltada para o lábio. É um pouco maior que a do central e menos simétrica.',
    'face-l': 'Voltada para a língua, com fossa rasa e cristas marginais discretas.',
    incisal: 'Borda de corte levemente inclinada para distal e torcida em relação à raiz, acompanhando a curva da arcada.',
    cingulo: 'Elevação discreta no terço cervical da face lingual, deslocada para distal.',
    fossa: 'Depressão rasa da face lingual.',
    raiz: 'Raiz única, achatada no sentido mésio-distal, um pouco mais longa que a do central inferior.',
    camara: 'A porção coronária da cavidade pulpar, estreita no sentido mésio-distal.',
    canal: 'Em geral um canal único e achatado; como no central inferior, pode haver dois canais.',
    'contato-m': 'Onde o 32 toca o incisivo central, no terço incisal.',
    'contato-d': 'Onde o 32 toca o canino, um pouco mais cervical que o contato mesial.',
  },
};

/* ---------- 33: canino inferior ---------- */
const C_I: Anterior = {
  fdi: 33, arco: 'inferior', canino: true,
  T: 1.12, W: 0.34, E: 0.37, distal: 0,
  raiz: { fim: [0, -1.52, 0], r1: 0.29, r2: 0.05, achata: 1.3 },
  curva: 0.06,
  textos: {
    'face-v': 'Voltada para o lábio. É mais alta e mais estreita que a do canino superior, e menos convexa.',
    'face-l': 'Voltada para a língua. É mais lisa que a do canino superior: cíngulo e cristas são pouco salientes.',
    incisal: 'Vértice menos agudo que o do canino superior e mais deslocado para mesial. A aresta mesial é curta e quase horizontal.',
    cingulo: 'Elevação pouco marcada no terço cervical da face lingual.',
    fossa: 'Depressão rasa entre a crista lingual e a crista marginal mesial.',
    raiz: 'Raiz única, longa e achatada no sentido mésio-distal. Em alguns casos é bifurcada no terço apical, em vestibular e lingual.',
    camara: 'A porção coronária da cavidade pulpar, larga no sentido vestíbulo-lingual.',
    canal: 'Canal único na maior parte dos casos, de secção oval. Uma parte dos caninos inferiores tem dois canais.',
    'contato-m': 'Onde o 33 toca o incisivo lateral, no terço incisal.',
    'contato-d': 'Onde o 33 toca o primeiro pré-molar, na união dos terços incisal e médio.',
  },
};

export const dente21 = anterior(IC_S);
export const dente22 = anterior(IL_S);
export const dente23 = anterior(C_S);
export const dente31 = anterior(IC_I);
export const dente32 = anterior(IL_I);
export const dente33 = anterior(C_I);
