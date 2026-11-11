/* Tipos do atlas: o que é um dente, uma estrutura nomeada e um plano de corte. */
import type { No, V } from './no';

export type { V };

export const GRUPOS = ['Faces e contornos', 'Cúspides', 'Sulcos e fossetas', 'Cristas e vertentes', 'Raiz', 'Tecidos', 'Cavidade pulpar'] as const;
export type Grupo = (typeof GRUPOS)[number];

export type Tecido = 'fora' | 'esmalte' | 'dentina' | 'polpa' | 'cemento';

/* Eixos do modelo: x é o eixo mésio-distal, y vai de apical (−) a oclusal/incisal (+),
   z de lingual/palatina (−) a vestibular (+).
   - Estruturas EXTERNAS têm âncoras [ponto aproximado, direção para fora]. O programa
     assenta cada uma na superfície e mostra a que estiver virada para a câmera.
   - Estruturas INTERNAS têm amostras: pontos em 3D dentro da estrutura. Em qualquer plano
     de corte, o nome aparece onde uma amostra fica rente ao plano. Com `tecido`, o ponto
     ainda é conferido contra a função do dente, para o nome não cair no tecido errado. */
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

/** Plano de corte. `normal` aponta para a parte removida; a posição vai de `fora`
    (plano fora do dente) a `fim`; `padrao` é a posição clássica daquele corte. */
export interface Plano { nome: string; normal: V; fora: number; fim: number; padrao: number; vista: [number, number] }

/** A ficha de um dente: forma, tecidos, enquadramento e o que há para nomear. */
export interface Dente {
  fdi: number;
  /** dentes superiores são mostrados de coroa para baixo (a imagem é espelhada na vertical) */
  arco: 'superior' | 'inferior';
  /** +1 quando a mesial fica em x negativo (dentes do lado esquerdo), −1 no lado direito. */
  lado: 1 | -1;
  /** dentes anteriores: a vista de cima se chama incisal, não oclusal */
  incisal?: boolean;
  forma: No;
  polpa: No;
  /** junção amelocementária: altura média e ondulação em volta do dente */
  jac: { base: number; onda: number };
  /** esmalte: espessura no colo e acréscimo nas cúspides (entre y0 e y1); `faixa` é a altura em que ele afina até zero */
  esmalte: { base: number; extra: number; y0: number; y1: number; faixa: number };
  cemento: number;
  /** inclinação da coroa: deslocamento em x e em z por unidade de altura acima de y0 (a mesma do nó `cisalha`) */
  inclina: { x: number; z: number; y0: number };
  /** curvatura das raízes, a mesma usada nos nós `dobra` da forma */
  curva: { forca: number; altura: number };
  /** esfera que envolve o dente (o shader só percorre raios dentro dela) e altura do chão */
  centro: V;
  raio: number;
  chao: number;
  planos: Plano[];
  /** para pintar regiões no próprio dente: altura do topo da coroa e do ápice (os terços são
      contados entre eles e a linha cervical) e o vértice de cada cúspide */
  realce?: { topo: number; apice: number; cuspides: { nome: string; c: V }[] };
  /** as estruturas dependem do modelo já calculado, para gerar amostras a partir da superfície */
  estruturas(m: import('./modelo').Modelo): Estrutura[];
}
