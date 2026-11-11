/* Os 32 dentes permanentes, na notação FDI, e quais já têm ficha no atlas.
   Cada anatomia é desenhada uma vez, no lado esquerdo; o lado direito é o espelho. */
import type { Dente, Estrutura, V } from '../atlas';
import { criaModelo, type Modelo } from '../modelo';
import { espelho } from '../no';
import { dente21, dente22, dente23, dente31, dente32, dente33 } from './anteriores';
import { molar36, molar37, molar38 } from './molares-inferiores';
import { molar26, molar27, molar28 } from './molares-superiores';
import { preMolar24, preMolar25, preMolar34, preMolar35 } from './pre-molares';

export type Classe = 'incisivo' | 'canino' | 'pre-molar' | 'molar';

export interface Registro {
  fdi: number;
  nome: string; // "Primeiro molar"
  onde: string; // "inferior esquerdo"
  classe: Classe;
}

const POSICOES: [string, Classe][] = [
  ['Incisivo central', 'incisivo'],
  ['Incisivo lateral', 'incisivo'],
  ['Canino', 'canino'],
  ['Primeiro pré-molar', 'pre-molar'],
  ['Segundo pré-molar', 'pre-molar'],
  ['Primeiro molar', 'molar'],
  ['Segundo molar', 'molar'],
  ['Terceiro molar', 'molar'],
];
const QUADRANTES: Record<number, string> = { 1: 'superior direito', 2: 'superior esquerdo', 3: 'inferior esquerdo', 4: 'inferior direito' };

export const DENTES: Registro[] = [1, 2, 3, 4].flatMap((q) => POSICOES.map(([nome, classe], i) => ({ fdi: q * 10 + i + 1, nome, onde: QUADRANTES[q], classe })));

export const registro = (fdi: number) => DENTES.find((d) => d.fdi === fdi);

/* ---------- espelho: do lado esquerdo para o direito ---------- */
const mx = (v: V): V => [-v[0], v[1], v[2]];

function espelha(def: Dente, fdi: number): Dente {
  return {
    ...def,
    fdi,
    lado: -1,
    forma: espelho(def.forma),
    polpa: espelho(def.polpa),
    centro: mx(def.centro),
    realce: def.realce && { ...def.realce, cuspides: def.realce.cuspides.map((c) => ({ ...c, c: mx(c.c) })) },
    planos: def.planos.map((p) => ({ ...p, normal: mx(p.normal), vista: [-p.vista[0], p.vista[1]] })),
    /* as estruturas são calculadas no dente original e depois espelhadas, ponto a ponto */
    estruturas: (): Estrutura[] =>
      def.estruturas(criaModelo(def)).map((e) => ({
        ...e,
        texto: e.texto.replaceAll(String(def.fdi), String(fdi)),
        externas: e.externas?.map(([p, n]) => [mx(p), mx(n)] as [V, V]),
        internas: e.internas?.map(mx),
      })),
  };
}

/* fichas prontas; as demais aparecem no odontograma como "em preparação" */
const FICHAS: Record<number, () => Dente> = {
  21: () => dente21,
  22: () => dente22,
  23: () => dente23,
  31: () => dente31,
  32: () => dente32,
  33: () => dente33,
  11: () => espelha(dente21, 11),
  12: () => espelha(dente22, 12),
  13: () => espelha(dente23, 13),
  41: () => espelha(dente31, 41),
  42: () => espelha(dente32, 42),
  43: () => espelha(dente33, 43),
  24: () => preMolar24,
  25: () => preMolar25,
  34: () => preMolar34,
  35: () => preMolar35,
  14: () => espelha(preMolar24, 14),
  15: () => espelha(preMolar25, 15),
  44: () => espelha(preMolar34, 44),
  45: () => espelha(preMolar35, 45),
  26: () => molar26,
  27: () => molar27,
  28: () => molar28,
  16: () => espelha(molar26, 16),
  17: () => espelha(molar27, 17),
  18: () => espelha(molar28, 18),
  36: () => molar36,
  37: () => molar37,
  38: () => molar38,
  46: () => espelha(molar36, 46),
  47: () => espelha(molar37, 47),
  48: () => espelha(molar38, 48),
};

export const temFicha = (fdi: number) => fdi in FICHAS;

const prontos = new Map<number, { def: Dente; modelo: Modelo }>();
export function carrega(fdi: number): { def: Dente; modelo: Modelo } {
  let d = prontos.get(fdi);
  if (!d) {
    const def = FICHAS[fdi]();
    d = { def, modelo: criaModelo(def) };
    prontos.set(fdi, d);
  }
  return d;
}
