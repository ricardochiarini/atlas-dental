/* Odontograma: as duas arcadas em vista oclusal, numeradas na notação FDI. Como em toda
   ficha clínica, o lado direito do paciente fica à esquerda de quem olha. Os dentes que já
   têm ficha são botões; os demais aparecem esmaecidos. */
import { DENTES, temFicha, type Classe } from './dentes/catalogo';

const NS = 'http://www.w3.org/2000/svg';
const LARGURA: Record<Classe, number> = { incisivo: 15, canino: 16, 'pre-molar': 17, molar: 23 };
const FUNDO: Record<Classe, number> = { incisivo: 11, canino: 15, 'pre-molar': 19, molar: 22 }; // medida vestíbulo-lingual

/* ordem de cada arcada, da direita do paciente para a esquerda */
const SUPERIOR = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const INFERIOR = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export function criaOdontograma(caixa: HTMLElement, aoEscolher: (fdi: number) => void) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 340 372');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Odontograma da dentição permanente');
  const botoes = new Map<number, SVGGElement>();

  const arcada = (ordem: number[], cy: number, sentido: 1 | -1) => {
    /* os dentes se distribuem por uma meia elipse; o passo acompanha a largura de cada um */
    const larguras = ordem.map((fdi) => LARGURA[DENTES.find((d) => d.fdi === fdi)!.classe]);
    const total = larguras.reduce((a, b) => a + b, 0);
    let acumulado = 0;
    ordem.forEach((fdi, i) => {
      const reg = DENTES.find((d) => d.fdi === fdi)!;
      const meio = (acumulado + larguras[i] / 2) / total; // 0 a 1 ao longo da arcada
      acumulado += larguras[i];
      const ang = Math.PI * (1 - meio); // de 180° (direita do paciente) a 0°
      const x = 170 + Math.cos(ang) * 128;
      const y = cy - sentido * Math.sin(ang) * 138;
      const gira = (Math.atan2(-sentido * Math.cos(ang) * 138, -Math.sin(ang) * 128) * 180) / Math.PI;

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      const forma = document.createElementNS(NS, 'rect');
      const w = LARGURA[reg.classe] - 2, h = FUNDO[reg.classe];
      forma.setAttribute('x', String(-w / 2));
      forma.setAttribute('y', String(-h / 2));
      forma.setAttribute('width', String(w));
      forma.setAttribute('height', String(h));
      forma.setAttribute('rx', String(reg.classe === 'molar' ? 6 : reg.classe === 'incisivo' ? 4 : 7));
      forma.setAttribute('transform', `rotate(${gira.toFixed(1)})`);
      g.appendChild(forma);

      /* o número fica do lado de fora da arcada */
      const num = document.createElementNS(NS, 'text');
      num.setAttribute('x', (Math.cos(ang) * 25).toFixed(1));
      num.setAttribute('y', (-sentido * Math.sin(ang) * 25 + 3.5).toFixed(1));
      num.setAttribute('text-anchor', 'middle');
      num.textContent = String(fdi);
      g.appendChild(num);

      const titulo = document.createElementNS(NS, 'title');
      const pronto = temFicha(fdi);
      titulo.textContent = `${fdi} · ${reg.nome} ${reg.onde}${pronto ? '' : ' (em preparação)'}`;
      g.appendChild(titulo);

      g.classList.add('dente');
      if (pronto) {
        g.classList.add('pronto');
        g.setAttribute('role', 'button');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', `Dente ${fdi}, ${reg.nome} ${reg.onde}`);
        g.addEventListener('click', () => aoEscolher(fdi));
        g.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          aoEscolher(fdi);
        });
        botoes.set(fdi, g);
      } else {
        g.setAttribute('aria-hidden', 'true');
      }
      svg.appendChild(g);
    });
  };

  arcada(SUPERIOR, 176, 1);
  arcada(INFERIOR, 196, -1);

  const rotulo = (texto: string, x: number, y: number) => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', String(x));
    t.setAttribute('y', String(y));
    t.setAttribute('text-anchor', 'middle');
    t.classList.add('legenda');
    t.textContent = texto;
    svg.appendChild(t);
  };
  rotulo('Superior', 170, 150);
  rotulo('Inferior', 170, 230);
  rotulo('Direita', 112, 190);
  rotulo('Esquerda', 228, 190);

  caixa.appendChild(svg);
  return {
    marca(fdi: number) {
      for (const [n, g] of botoes) g.setAttribute('aria-current', String(n === fdi));
    },
  };
}
