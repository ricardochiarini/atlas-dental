/* Página do atlas. O Three.js cuida do contexto WebGL e desenha um único retângulo que
   cobre a tela; todo o dente é calculado no shader de fragmento (molar.frag). Aqui ficam
   a câmera em órbita, os planos de corte, os nomes presos ao dente e o controle de desempenho. */
import * as THREE from 'three';
import { ESTRUTURAS, GRUPOS, PLANOS, VISTAS, type Estrutura, type Grupo, type Plano } from './atlas';
import fragmento from './molar.frag?raw';
import { assenta, dente, escondido, tecido, type V } from './sdf';
import './estilo.css';

const VERTICE = /* glsl */ `in vec3 position; void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const $ = <T extends Element>(s: string) => document.querySelector<T>(s)!;

const tela = $<HTMLCanvasElement>('#tela');
/* sem animação: preferência do sistema, ou ?semanim no endereço (útil para conferir e capturar telas) */
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches || location.search.includes('semanim');

/* ---------- WebGL ---------- */
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('sem WebGL 2');
} catch {
  $<HTMLElement>('#sem-webgl').hidden = false;
  throw new Error('WebGL 2 indisponível');
}

const uniformes = {
  uRes: { value: new THREE.Vector2(1, 1) },
  uOlho: { value: new THREE.Vector3() },
  uBase: { value: new THREE.Matrix3() },
  uFoco: { value: 3 },
  uDesloc: { value: 0 },
  uPlano: { value: new THREE.Vector3(0, 0, 1) },
  uCorte: { value: 0.62 },
  uLuz: { value: new THREE.Vector3(-0.5, 0.8, 0.7) },
  uFundo: { value: new THREE.Color() },
  uEsmalte: { value: new THREE.Color() },
  uDentina: { value: new THREE.Color() },
  uPolpa: { value: new THREE.Color() },
  uCemento: { value: new THREE.Color() },
  uTinta: { value: new THREE.Color() },
};

const cena = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
cena.add(
  new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERTICE, fragmentShader: fragmento, uniforms: uniformes, depthTest: false, depthWrite: false }),
  ),
);

/* ---------- estado ---------- */
const ALVO = new THREE.Vector3(0, -0.26, 0);
const olhar = { guinada: 0.45, inclinacao: 0.12, velG: 0, velI: 0 };
let destino: { guinada: number; inclinacao: number } | null = null; // para onde a câmera está indo sozinha
let distancia = 6.4;
let plano: Plano = PLANOS[0];
let corte = 0; // 0 = plano fora do dente; 1 = plano no fim do percurso
let corteAlvo = 0;
let girando = !reduz;
let arrastando = false;
let sujo = true; // só desenha um quadro quando algo mudou
let escala = 1; // fração da resolução, reduzida se o aparelho não acompanhar
let largura = 1;
let altura = 1;
let estreito = false;
let selecionada: string | null = null;
const ocultos = new Set<Grupo>();

const direita = new THREE.Vector3();
const cima = new THREE.Vector3();
const frente = new THREE.Vector3();

/** posição do plano (o valor de uCorte) para uma fração do percurso */
const posicao = (p: Plano, s: number) => p.fora + (p.fim - p.fora) * s;
/** fração do percurso que deixa o plano na posição clássica daquele corte */
const fracaoPadrao = (p: Plano) => (p.padrao - p.fora) / (p.fim - p.fora);

/* ---------- cores: as mesmas variáveis CSS da página ---------- */
function leCores() {
  const css = getComputedStyle(document.documentElement);
  const cor = (nome: string, alvo: THREE.Color) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(css.getPropertyValue(nome).trim().slice(i, i + 2), 16) / 255);
    alvo.setRGB(r, g, b, THREE.LinearSRGBColorSpace); // o shader faz a própria conversão de gama
  };
  cor('--bg', uniformes.uFundo.value);
  cor('--esmalte', uniformes.uEsmalte.value);
  cor('--dentina', uniformes.uDentina.value);
  cor('--polpa', uniformes.uPolpa.value);
  cor('--cemento', uniformes.uCemento.value);
  cor('--fg', uniformes.uTinta.value);
  sujo = true;
}

function atualizaCamera() {
  const ci = Math.cos(olhar.inclinacao);
  uniformes.uOlho.value.set(Math.sin(olhar.guinada) * ci, Math.sin(olhar.inclinacao), Math.cos(olhar.guinada) * ci).multiplyScalar(distancia).add(ALVO);
  frente.copy(ALVO).sub(uniformes.uOlho.value).normalize();
  direita.crossVectors(frente, THREE.Object3D.DEFAULT_UP).normalize();
  cima.crossVectors(direita, frente);
  uniformes.uBase.value.set(direita.x, cima.x, frente.x, direita.y, cima.y, frente.y, direita.z, cima.z, frente.z);
}

/* a mesma projeção do shader, para prender os nomes a pontos do dente */
const aux = new THREE.Vector3();
function projeta(p: V): { x: number; y: number } {
  aux.set(p[0], p[1], p[2]).sub(uniformes.uOlho.value);
  const z = aux.dot(frente);
  const ux = (aux.dot(direita) / z) * uniformes.uFoco.value + uniformes.uDesloc.value;
  const uy = (aux.dot(cima) / z) * uniformes.uFoco.value;
  return { x: (ux * altura + largura) / 2, y: (altura - uy * altura) / 2 };
}

function mede() {
  largura = innerWidth;
  altura = innerHeight;
  estreito = largura <= 860;
  /* no desktop o dente fica à direita do texto; no celular, centralizado, mais longe e mais alto */
  uniformes.uDesloc.value = estreito ? 0 : Math.min(0.42, (largura / altura) * 0.24);
  distancia = estreito ? Math.max(7.4, 6.0 / Math.min(1, (largura / altura) * 1.45)) : 6.4;
  ALVO.y = estreito ? -0.62 : -0.26;
  const dpr = Math.min(devicePixelRatio || 1, 1.5) * escala;
  renderer.setPixelRatio(dpr);
  renderer.setSize(largura, altura, false);
  uniformes.uRes.value.set(largura * dpr, altura * dpr);
  $('#linhas').setAttribute('viewBox', `0 0 ${largura} ${altura}`);
  sujo = true;
}

/* ---------- atlas ---------- */
interface Rotulo {
  e: Estrutura;
  ancoras: { p: V; n: V }[]; // âncoras externas, já assentadas na superfície
  botao: HTMLButtonElement;
  linha: SVGLineElement;
  bola: SVGCircleElement;
  item: HTMLButtonElement; // a entrada no índice
}

const NS = 'http://www.w3.org/2000/svg';
const svg = $<SVGSVGElement>('#linhas');
const camadaRotulos = $<HTMLElement>('#rotulos');
const lista = $<HTMLElement>('#lista');

const rotulos: Rotulo[] = ESTRUTURAS.map((e) => {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'rot';
  botao.textContent = e.nome;
  botao.addEventListener('click', () => seleciona(e.id, false));
  camadaRotulos.appendChild(botao);

  const linha = svg.appendChild(document.createElementNS(NS, 'line'));
  const bola = svg.appendChild(document.createElementNS(NS, 'circle'));
  bola.setAttribute('r', '3.5');

  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'item';
  item.textContent = e.nome;
  item.addEventListener('click', () => seleciona(e.id, true));

  return { e, ancoras: (e.externas ?? []).map(([p, n]) => assenta(p, n)), botao, linha, bola, item };
});

/* Índice: um bloco por grupo. O cabeçalho liga e desliga os nomes daquele grupo no dente. */
for (const grupo of GRUPOS) {
  const doGrupo = rotulos.filter((r) => r.e.grupo === grupo);
  const cab = document.createElement('button');
  cab.type = 'button';
  cab.className = 'grupo hud';
  cab.setAttribute('aria-pressed', 'true');
  cab.title = 'Mostrar ou esconder os nomes deste grupo no dente';
  cab.innerHTML = `<span>${grupo}</span><i>${doGrupo.length}</i>`;
  cab.addEventListener('click', () => {
    const mostrar = ocultos.has(grupo);
    if (mostrar) ocultos.delete(grupo);
    else ocultos.add(grupo);
    cab.setAttribute('aria-pressed', String(mostrar));
    sujo = true;
  });
  lista.appendChild(cab);
  for (const r of doGrupo) lista.appendChild(r.item);
}
$('#total').textContent = String(ESTRUTURAS.length);

/* Em qual plano e em que ponto uma estrutura interna aparece. Devolve o ponto já sobre o plano. */
function pontoNoCorte(e: Estrutura, n: V, h: number): V | null {
  let melhor: V | null = null;
  let menor = e.folga ?? 0.05;
  for (const a of e.internas ?? []) {
    const d = a[0] * n[0] + a[1] * n[1] + a[2] * n[2] - h;
    if (Math.abs(d) >= menor) continue;
    const p: V = [a[0] - n[0] * d, a[1] - n[1] * d, a[2] - n[2] * d];
    if (e.tecido ? tecido(p) !== e.tecido : dente(p) > -0.001) continue;
    menor = Math.abs(d);
    melhor = p;
  }
  return melhor;
}

function seleciona(id: string, moverCamera: boolean) {
  const r = rotulos.find((x) => x.e.id === id);
  if (!r) return;
  selecionada = id;
  for (const x of rotulos) x.item.setAttribute('aria-current', String(x === r));
  $('#ficha-grupo').textContent = r.e.grupo;
  $('#ficha-nome').textContent = r.e.nome;
  $('#ficha-texto').textContent = r.e.texto;

  if (moverCamera) {
    defineGiro(false);
    if (r.e.internas) {
      /* escolhe o primeiro corte clássico em que a estrutura aparece */
      const p = PLANOS.find((pl) => pontoNoCorte(r.e, pl.normal, pl.padrao)) ?? PLANOS[0];
      abreCorte(p);
    } else {
      /* gira até a normal da primeira âncora apontar para a câmera */
      const n = r.ancoras[0].n;
      defineCorte(0, false);
      marca(botoesVista, null);
      marca(botoesPlano, null);
      destino = { guinada: Math.atan2(n[0], n[2]), inclinacao: THREE.MathUtils.clamp(Math.asin(n[1]) * 0.85, -0.5, 1.15) };
    }
    /* se o grupo estava escondido, volta a mostrar: a pessoa pediu para ver esta estrutura */
    if (ocultos.delete(r.e.grupo)) lista.querySelectorAll<HTMLElement>('.grupo').forEach((c) => c.textContent?.startsWith(r.e.grupo) && c.setAttribute('aria-pressed', 'true'));
  }
  sujo = true;
}

/* Escolhe, para cada estrutura, o ponto que a câmera enxerga; depois distribui os nomes
   em duas colunas, uma de cada lado do dente, sem deixar um nome sobre o outro. */
interface Visivel { r: Rotulo; x: number; y: number; alvoY: number }

function posicionaRotulos() {
  const olho = uniformes.uOlho.value;
  const o: V = [olho.x, olho.y, olho.z];
  const n = plano.normal;
  const h = uniformes.uCorte.value;
  const cortando = corte > 0.02;
  /* a face cortada só é legível se estiver virada para a câmera */
  const faceVisivel = cortando && -(frente.x * n[0] + frente.y * n[1] + frente.z * n[2]) > 0.3;
  const esq: Visivel[] = [];
  const dir: Visivel[] = [];
  const centro = projeta([ALVO.x, ALVO.y, ALVO.z]);

  for (const r of rotulos) {
    let ponto: V | null = null;

    if (ocultos.has(r.e.grupo) && r.e.id !== selecionada) {
      ponto = null;
    } else if (r.e.internas) {
      if (faceVisivel) ponto = pontoNoCorte(r.e, n, h);
    } else {
      let melhor = 0.16; // o ponto precisa estar razoavelmente de frente
      for (const a of r.ancoras) {
        if (a.p[0] * n[0] + a.p[1] * n[1] + a.p[2] * n[2] > h + 0.004) continue; // removido pelo corte
        aux.set(o[0] - a.p[0], o[1] - a.p[1], o[2] - a.p[2]).normalize();
        const deFrente = aux.x * a.n[0] + aux.y * a.n[1] + aux.z * a.n[2];
        if (deFrente <= melhor || escondido(a.p, a.n, o, n, h)) continue;
        melhor = deFrente;
        ponto = a.p;
      }
    }

    const on = ponto !== null;
    const sel = r.e.id === selecionada;
    r.botao.classList.toggle('on', on);
    r.linha.classList.toggle('on', on);
    r.bola.classList.toggle('on', on);
    r.botao.classList.toggle('sel', sel);
    r.linha.classList.toggle('sel', sel && on);
    r.bola.classList.toggle('sel', sel && on);
    if (!ponto) continue;

    const s = projeta(ponto);
    (s.x < centro.x ? esq : dir).push({ r, x: s.x, y: s.y, alvoY: s.y });
  }

  /* raio do dente na tela, para afastar as colunas dele */
  const pxPorUnidade = (uniformes.uFoco.value / distancia) * (altura / 2);
  const coluna = 0.66 * pxPorUnidade + 46;
  const topo = 70;
  const baseEsq = altura - 60;
  const baseDir = altura - (estreito ? 60 : 215); // deixa lugar para a ficha

  const distribui = (lado: Visivel[], base: number) => {
    lado.sort((a, b) => a.y - b.y);
    const vao = Math.min(27, (base - topo) / Math.max(1, lado.length - 1));
    for (let i = 0; i < lado.length; i++) lado[i].alvoY = Math.max(i ? lado[i - 1].alvoY + vao : topo, lado[i].y);
    /* se passou do limite de baixo, empurra a pilha para cima */
    for (let i = lado.length - 1; i >= 0; i--) {
      const max = i === lado.length - 1 ? base : lado[i + 1].alvoY - vao;
      if (lado[i].alvoY > max) lado[i].alvoY = max;
    }
  };
  distribui(esq, baseEsq);
  distribui(dir, baseDir);

  const aplica = (lado: Visivel[], sinal: -1 | 1) => {
    for (const v of lado) {
      const cx = estreito ? v.x : centro.x + sinal * coluna;
      const cy = estreito ? v.y : v.alvoY;
      v.r.botao.classList.toggle('esq', sinal < 0);
      v.r.botao.style.setProperty('--x', `${cx.toFixed(1)}px`);
      v.r.botao.style.setProperty('--y', `${cy.toFixed(1)}px`);
      v.r.linha.setAttribute('x1', v.x.toFixed(1));
      v.r.linha.setAttribute('y1', v.y.toFixed(1));
      v.r.linha.setAttribute('x2', (cx - sinal * 2).toFixed(1));
      v.r.linha.setAttribute('y2', cy.toFixed(1));
      v.r.bola.setAttribute('cx', v.x.toFixed(1));
      v.r.bola.setAttribute('cy', v.y.toFixed(1));
    }
  };
  aplica(esq, -1);
  aplica(dir, 1);
}

/* ---------- controles ---------- */
const campoCorte = $<HTMLInputElement>('#corte');
const valorCorte = $<HTMLOutputElement>('#corte-valor');
const botaoGiro = $<HTMLButtonElement>('#giro');

function defineCorte(v: number, imediato: boolean) {
  corteAlvo = THREE.MathUtils.clamp(v, 0, 1);
  if (imediato || reduz) corte = corteAlvo;
  campoCorte.value = String(Math.round(corteAlvo * 100));
  valorCorte.textContent = corteAlvo < 0.005 ? 'sem corte' : plano.nome.toLowerCase();
  sujo = true;
}
campoCorte.addEventListener('input', () => {
  defineCorte(Number(campoCorte.value) / 100, true);
  marca(botoesVista, null);
});

function defineGiro(ligado: boolean) {
  girando = ligado;
  if (ligado) destino = null;
  botaoGiro.setAttribute('aria-pressed', String(ligado));
  sujo = true;
}
botaoGiro.addEventListener('click', () => {
  defineGiro(!girando);
  marca(botoesVista, null);
});
botaoGiro.setAttribute('aria-pressed', String(girando));

function marca(botoes: HTMLButtonElement[], ativo: HTMLButtonElement | null) {
  for (const b of botoes) b.setAttribute('aria-pressed', String(b === ativo));
}
function chip(caixa: HTMLElement, nome: string, aoClicar: (b: HTMLButtonElement) => void) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'hud';
  b.textContent = nome;
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => aoClicar(b));
  return caixa.appendChild(b);
}

/* vistas externas: fecham o corte e giram a câmera */
const botoesVista = Object.entries(VISTAS).map(([nome, [guinada, inclinacao]]) =>
  chip($('#vistas'), nome, (b) => {
    defineGiro(false);
    defineCorte(0, false);
    destino = { guinada, inclinacao };
    marca(botoesVista, b);
    marca(botoesPlano, null);
  }),
);

/* cortes: trocam o plano, levam-no à posição clássica e viram a face cortada para a câmera */
function abreCorte(p: Plano) {
  defineGiro(false);
  if (p !== plano) {
    plano = p;
    corte = 0; // o plano novo entra de fora para dentro
    uniformes.uPlano.value.set(p.normal[0], p.normal[1], p.normal[2]);
  }
  defineCorte(fracaoPadrao(p), false);
  destino = { guinada: p.vista[0], inclinacao: p.vista[1] };
  marca(botoesVista, null);
  marca(botoesPlano, botoesPlano[PLANOS.indexOf(p)]);
}
const botoesPlano = PLANOS.map((p) => chip($('#planos'), p.nome, () => abreCorte(p)));

/* ---------- ponteiro e teclado ---------- */
let ultimoX = 0;
let ultimoY = 0;
tela.addEventListener('pointerdown', (e) => {
  arrastando = true;
  destino = null;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
  tela.setPointerCapture(e.pointerId);
  defineGiro(false);
  marca(botoesVista, null);
});
tela.addEventListener('pointermove', (e) => {
  /* a luz acompanha o ponteiro de leve, mesmo sem arrastar */
  uniformes.uLuz.value.set(-0.5 + (e.clientX / largura - 0.5) * 0.9, 0.8 - (e.clientY / altura - 0.5) * 0.5, 0.7);
  sujo = true;
  if (!arrastando) return;
  olhar.velG = -(e.clientX - ultimoX) * 0.006;
  olhar.velI = (e.clientY - ultimoY) * 0.004;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
});
const solta = () => (arrastando = false);
tela.addEventListener('pointerup', solta);
tela.addEventListener('pointercancel', solta);

tela.addEventListener('keydown', (e) => {
  const passo = 0.12;
  if (e.key === 'ArrowLeft') olhar.guinada -= passo;
  else if (e.key === 'ArrowRight') olhar.guinada += passo;
  else if (e.key === 'ArrowUp') olhar.inclinacao += passo * 0.6;
  else if (e.key === 'ArrowDown') olhar.inclinacao -= passo * 0.6;
  else return;
  e.preventDefault();
  destino = null;
  defineGiro(false);
  marca(botoesVista, null);
});

/* ---------- laço ---------- */
let visivel = true;
let antes = performance.now();
let lento = 0;

/* menor diferença entre dois ângulos, para a câmera ir pelo caminho curto */
const voltaCurta = (de: number, para: number) => Math.atan2(Math.sin(para - de), Math.cos(para - de));

function quadro(agora: number) {
  requestAnimationFrame(quadro);
  const dt = Math.min(0.05, (agora - antes) / 1000);
  antes = agora;
  if (!visivel) return;

  if (girando) {
    /* vai e volta em torno da vista vestibular */
    olhar.guinada += voltaCurta(olhar.guinada, Math.sin(agora * 0.00035) * 0.75) * Math.min(1, dt * 1.6);
    olhar.inclinacao += (0.14 + Math.sin(agora * 0.00027) * 0.1 - olhar.inclinacao) * Math.min(1, dt * 1.6);
    sujo = true;
  } else if (destino) {
    const dg = voltaCurta(olhar.guinada, destino.guinada);
    const di = destino.inclinacao - olhar.inclinacao;
    if (reduz || Math.abs(dg) + Math.abs(di) < 0.002) {
      olhar.guinada += dg;
      olhar.inclinacao += di;
      destino = null;
    } else {
      const k = Math.min(1, dt * 5);
      olhar.guinada += dg * k;
      olhar.inclinacao += di * k;
    }
    sujo = true;
  }

  if (Math.abs(olhar.velG) + Math.abs(olhar.velI) > 0.0002) {
    olhar.guinada += olhar.velG;
    olhar.inclinacao += olhar.velI;
    const atrito = arrastando ? 0 : Math.pow(0.002, dt); // ao soltar, o dente desliza e para
    olhar.velG *= atrito;
    olhar.velI *= atrito;
    sujo = true;
  }
  olhar.inclinacao = THREE.MathUtils.clamp(olhar.inclinacao, -0.9, 1.3);

  if (Math.abs(corteAlvo - corte) > 0.0005) {
    corte += (corteAlvo - corte) * Math.min(1, dt * 3.2);
    if (Math.abs(corteAlvo - corte) <= 0.0005) corte = corteAlvo;
    sujo = true;
  }

  if (!sujo) return;
  sujo = false;

  uniformes.uCorte.value = posicao(plano, corte);
  atualizaCamera();
  renderer.render(cena, camera);
  posicionaRotulos();

  /* se os quadros estiverem demorando, baixa a resolução interna uma vez por vez */
  lento = dt > 0.034 ? lento + 1 : Math.max(0, lento - 1);
  if (lento > 20 && escala > 0.5) {
    escala = Math.max(0.5, escala - 0.17);
    lento = 0;
    mede();
  }
}

/* ---------- partida ---------- */
addEventListener('resize', mede);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', leCores);
document.addEventListener('visibilitychange', () => (visivel = !document.hidden));

leCores();
mede();
defineCorte(0, true);
atualizaCamera();
requestAnimationFrame(quadro);
