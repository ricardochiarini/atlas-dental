/* As estruturas do atlas. Eixos do modelo: x vai de mesial (−) a distal (+), y de apical (−)
   a oclusal (+), z de lingual (−) a vestibular (+).
   Estruturas externas têm uma ou mais âncoras [ponto aproximado, direção para fora]; o
   programa assenta cada uma na superfície e mostra a que estiver virada para a câmera.
   Estruturas internas ficam na face do corte e têm só [x, y]. */
import type { V } from './sdf';

export type Grupo = 'Coroa' | 'Raiz' | 'Interior';

export interface Estrutura {
  id: string;
  nome: string;
  grupo: Grupo;
  texto: string;
  externas?: [V, V][];
  interna?: [number, number];
}

export const ESTRUTURAS: Estrutura[] = [
  {
    id: 'cusp-mv', nome: 'Cúspide mésio-vestibular', grupo: 'Coroa',
    texto: 'A maior das três cúspides vestibulares. Junto com as outras, tritura o alimento contra o dente antagonista.',
    externas: [[[-0.3, 0.74, 0.24], [-0.2, 0.9, 0.4]], [[-0.32, 0.56, 0.4], [-0.15, 0.25, 1]], [[-0.47, 0.58, 0.2], [-1, 0.25, 0.2]]],
  },
  {
    id: 'cusp-dv', nome: 'Cúspide disto-vestibular', grupo: 'Coroa',
    texto: 'A cúspide vestibular do meio, entre a mésio-vestibular e a distal.',
    externas: [[[0.04, 0.72, 0.27], [0.0, 0.9, 0.45]], [[0.05, 0.54, 0.41], [0, 0.25, 1]]],
  },
  {
    id: 'cusp-d', nome: 'Cúspide distal', grupo: 'Coroa',
    texto: 'A menor das cinco, no canto disto-vestibular da coroa.',
    externas: [[[0.37, 0.66, 0.17], [0.45, 0.85, 0.3]], [[0.4, 0.5, 0.3], [0.45, 0.2, 0.9]], [[0.5, 0.5, 0.14], [1, 0.25, 0.2]]],
  },
  {
    id: 'cusp-ml', nome: 'Cúspide mésio-lingual', grupo: 'Coroa',
    texto: 'A mais alta e mais pontiaguda. As cúspides linguais do molar inferior são mais altas que as vestibulares.',
    externas: [[[-0.28, 0.78, -0.24], [-0.2, 0.9, -0.4]], [[-0.3, 0.58, -0.4], [-0.15, 0.25, -1]], [[-0.46, 0.6, -0.2], [-1, 0.25, -0.2]]],
  },
  {
    id: 'cusp-dl', nome: 'Cúspide disto-lingual', grupo: 'Coroa',
    texto: 'A segunda cúspide lingual, um pouco mais baixa que a mésio-lingual.',
    externas: [[[0.2, 0.76, -0.24], [0.15, 0.9, -0.4]], [[0.22, 0.56, -0.4], [0.1, 0.25, -1]], [[0.45, 0.56, -0.2], [1, 0.25, -0.2]]],
  },
  {
    id: 'fossa', nome: 'Fossa central', grupo: 'Coroa',
    texto: 'Depressão no centro da face oclusal, onde os sulcos principais se encontram.',
    externas: [[[0.08, 0.66, 0.0], [0, 1, 0]]],
  },
  {
    id: 'sulco-v', nome: 'Sulco vestibular', grupo: 'Coroa',
    texto: 'Sai da fossa central e desce pela face vestibular, separando as cúspides mésio-vestibular e disto-vestibular.',
    externas: [[[-0.13, 0.6, 0.4], [0, 0.55, 0.85]]],
  },
  {
    id: 'sulco-l', nome: 'Sulco lingual', grupo: 'Coroa',
    texto: 'Separa as duas cúspides linguais e continua pela face lingual.',
    externas: [[[-0.04, 0.6, -0.4], [0, 0.55, -0.85]]],
  },
  {
    id: 'cervical', nome: 'Linha cervical', grupo: 'Coroa',
    texto: 'Limite entre a coroa e a raiz, onde o esmalte termina e o cemento começa. É a junção amelocementária.',
    externas: [
      [[0.0, 0.07, 0.38], [0, 0, 1]],
      [[0.0, 0.07, -0.38], [0, 0, -1]],
      [[-0.42, 0.03, 0.0], [-1, 0, 0]],
      [[0.42, 0.03, 0.0], [1, 0, 0]],
    ],
  },
  {
    id: 'raiz-m', nome: 'Raiz mesial', grupo: 'Raiz',
    texto: 'A mais larga das duas, achatada no sentido mésio-distal. Costuma ter dois canais; aqui foi desenhada com um.',
    externas: [
      [[-0.27, -0.6, 0.18], [0, 0, 1]],
      [[-0.27, -0.6, -0.18], [0, 0, -1]],
      [[-0.43, -0.6, 0.0], [-1, 0, 0]],
    ],
  },
  {
    id: 'raiz-d', nome: 'Raiz distal', grupo: 'Raiz',
    texto: 'Mais reta e arredondada, em geral com um único canal amplo.',
    externas: [
      [[0.3, -0.6, 0.16], [0, 0, 1]],
      [[0.3, -0.6, -0.16], [0, 0, -1]],
      [[0.44, -0.6, 0.0], [1, 0, 0]],
    ],
  },
  {
    id: 'furca', nome: 'Furca', grupo: 'Raiz',
    texto: 'Região em que o tronco radicular se divide nas duas raízes.',
    externas: [
      [[0.0, -0.1, 0.1], [0, -0.6, 0.8]],
      [[0.0, -0.1, -0.1], [0, -0.6, -0.8]],
    ],
  },
  {
    id: 'apice', nome: 'Ápice radicular', grupo: 'Raiz',
    texto: 'A ponta da raiz. É por ali que vasos e nervos entram no dente.',
    externas: [
      [[-0.25, -1.3, 0.04], [-0.1, -0.6, 0.8]],
      [[-0.25, -1.3, -0.04], [-0.1, -0.6, -0.8]],
      [[-0.25, -1.36, 0.0], [-0.3, -1, 0]],
    ],
  },
  {
    id: 'esmalte', nome: 'Esmalte', grupo: 'Interior',
    texto: 'O tecido mais mineralizado do corpo. Cobre só a coroa e é mais espesso nas cúspides.',
    interna: [-0.455, 0.42],
  },
  {
    id: 'jad', nome: 'Junção amelodentinária', grupo: 'Interior',
    texto: 'A fronteira entre o esmalte e a dentina.',
    interna: [0.405, 0.4],
  },
  {
    id: 'dentina', nome: 'Dentina', grupo: 'Interior',
    texto: 'Forma o corpo do dente. É atravessada por túbulos que vão da polpa em direção ao esmalte.',
    interna: [0.3, 0.26],
  },
  {
    id: 'camara', nome: 'Câmara pulpar', grupo: 'Interior',
    texto: 'Espaço no centro da coroa que abriga a polpa coronária, com cornos voltados para as cúspides.',
    interna: [-0.03, 0.17],
  },
  {
    id: 'canal', nome: 'Canal radicular', grupo: 'Interior',
    texto: 'Continuação da polpa dentro da raiz, da câmara até o forame apical.',
    interna: [0.262, -0.45],
  },
  {
    id: 'cemento', nome: 'Cemento', grupo: 'Interior',
    texto: 'Camada fina que reveste a raiz e ancora as fibras do ligamento periodontal.',
    interna: [-0.405, -0.7],
  },
  {
    id: 'forame', nome: 'Forame apical', grupo: 'Interior',
    texto: 'Abertura no ápice por onde o feixe vásculo-nervoso entra no canal radicular.',
    interna: [0.37, -1.2],
  },
];

/** Vistas prontas: [guinada, inclinação, corte]. A guinada 0 olha a face vestibular. */
export const VISTAS: Record<string, [number, number, number]> = {
  Vestibular: [0, 0.1, 0],
  Lingual: [Math.PI, 0.1, 0],
  Mesial: [-Math.PI / 2, 0.1, 0],
  Distal: [Math.PI / 2, 0.1, 0],
  Oclusal: [0.0, 1.15, 0],
  Corte: [0.28, 0.12, 1],
};
