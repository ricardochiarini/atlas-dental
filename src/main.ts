/* Página do molar. O Three.js cuida do contexto WebGL e desenha um único retângulo que
   cobre a tela; todo o dente é calculado no shader de fragmento (molar.frag). Aqui ficam
   a câmera em órbita, o corte, os rótulos presos ao dente e o controle de desempenho. */
import * as THREE from 'three';
import fragmento from './molar.frag?raw';
import './estilo.css';

const VERTICE = /* glsl */ `in vec3 position; void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const tela = document.querySelector<HTMLCanvasElement>('#tela')!;
const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- WebGL ---------- */
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!renderer.capabilities.isWebGL2) throw new Error('sem WebGL 2');
} catch {
  document.querySelector<HTMLElement>('#sem-webgl')!.hidden = false;
  throw new Error('WebGL 2 indisponível');
}

const uniformes = {
  uRes: { value: new THREE.Vector2(1, 1) },
  uOlho: { value: new THREE.Vector3() },
  uBase: { value: new THREE.Matrix3() },
  uFoco: { value: 3 },
  uDesloc: { value: 0 },
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

/* ---------- estado ---------- */
const ALVO = new THREE.Vector3(0, -0.26, 0);
const olhar = { guinada: 0.45, inclinacao: 0.12, velG: 0, velI: 0 };
let distancia = 6.4;
let corte = 0; // 0 = dente inteiro, 1 = cortado ao meio
let corteAlvo = 0;
let girando = !reduz;
let arrastando = false;
let sujo = true; // só desenha um quadro quando algo mudou
let escala = 1; // fração da resolução, reduzida se o aparelho não acompanhar
let largura = 1;
let altura = 1;

const direita = new THREE.Vector3();
const cima = new THREE.Vector3();
const frente = new THREE.Vector3();

function atualizaCamera() {
  const ci = Math.cos(olhar.inclinacao);
  uniformes.uOlho.value.set(Math.sin(olhar.guinada) * ci, Math.sin(olhar.inclinacao), Math.cos(olhar.guinada) * ci).multiplyScalar(distancia).add(ALVO);
  frente.copy(ALVO).sub(uniformes.uOlho.value).normalize();
  direita.crossVectors(frente, THREE.Object3D.DEFAULT_UP).normalize();
  cima.crossVectors(direita, frente);
  uniformes.uBase.value.set(direita.x, cima.x, frente.x, direita.y, cima.y, frente.y, direita.z, cima.z, frente.z);
}

/* a mesma projeção do shader, para prender os rótulos a pontos do dente */
function projeta(p: THREE.Vector3): { x: number; y: number } {
  const v = p.clone().sub(uniformes.uOlho.value);
  const z = v.dot(frente);
  const ux = (v.dot(direita) / z) * uniformes.uFoco.value + uniformes.uDesloc.value;
  const uy = (v.dot(cima) / z) * uniformes.uFoco.value;
  return { x: (ux * altura + largura) / 2, y: (altura - uy * altura) / 2 };
}

function mede() {
  largura = innerWidth;
  altura = innerHeight;
  const estreito = largura < 860;
  /* no desktop o dente fica à direita do texto; no celular, centralizado e mais longe */
  uniformes.uDesloc.value = estreito ? 0 : Math.min(0.42, (largura / altura) * 0.24);
  distancia = estreito ? Math.max(6.4, 5.2 / Math.min(1, (largura / altura) * 1.45)) : 6.4;
  const dpr = Math.min(devicePixelRatio || 1, 1.5) * escala;
  renderer.setPixelRatio(dpr);
  renderer.setSize(largura, altura, false);
  uniformes.uRes.value.set(largura * dpr, altura * dpr);
  document.querySelector('#linhas')!.setAttribute('viewBox', `0 0 ${largura} ${altura}`);
  sujo = true;
}

/* ---------- rótulos ---------- */
interface Rotulo { el: HTMLElement; ponto: THREE.Vector3; lado: -1 | 1; linha: SVGLineElement; bola: SVGCircleElement }
const NS = 'http://www.w3.org/2000/svg';
const svg = document.querySelector<SVGSVGElement>('#linhas')!;
const PONTOS: Record<string, [number, number, -1 | 1]> = {
  esmalte: [-0.45, 0.42, -1],
  cemento: [-0.4, -0.72, -1],
  dentina: [0.33, 0.38, 1],
  polpa: [0.267, -0.5, 1], // dentro do canal da raiz distal
};
const rotulos: Rotulo[] = [...document.querySelectorAll<HTMLElement>('#rotulos li')].map((el) => {
  const [x, y, lado] = PONTOS[el.dataset.camada!];
  el.classList.add(lado < 0 ? 'esquerda' : 'direita');
  const linha = svg.appendChild(document.createElementNS(NS, 'line'));
  const bola = svg.appendChild(document.createElementNS(NS, 'circle'));
  bola.setAttribute('r', '3.5');
  return { el, ponto: new THREE.Vector3(x, y, 0), lado, linha, bola };
});

function posicionaRotulos() {
  /* aparecem com o corte quase completo e a face cortada virada para a câmera */
  const deFrente = Math.max(0, -frente.z);
  const visivel = THREE.MathUtils.smoothstep(corte, 0.8, 1) * THREE.MathUtils.smoothstep(deFrente, 0.55, 0.85);
  const opacidade = visivel.toFixed(3);
  for (const r of rotulos) {
    r.ponto.z = uniformes.uCorte.value;
    const a = projeta(r.ponto);
    const centro = projeta(new THREE.Vector3(0, r.ponto.y, uniformes.uCorte.value));
    const afasta = altura * 0.2;
    const bx = centro.x + r.lado * afasta;
    const by = a.y + (r.ponto.y > 0 ? -18 : 18);
    r.el.style.opacity = opacidade;
    r.el.style.transform = `translate(${r.lado < 0 ? bx - 190 - 10 : bx + 10}px, ${by - 14}px)`;
    r.linha.setAttribute('x1', a.x.toFixed(1));
    r.linha.setAttribute('y1', a.y.toFixed(1));
    r.linha.setAttribute('x2', bx.toFixed(1));
    r.linha.setAttribute('y2', by.toFixed(1));
    r.bola.setAttribute('cx', a.x.toFixed(1));
    r.bola.setAttribute('cy', a.y.toFixed(1));
    r.linha.style.opacity = r.bola.style.opacity = opacidade;
  }
}

/* ---------- interação ---------- */
const campoCorte = document.querySelector<HTMLInputElement>('#corte')!;
const valorCorte = document.querySelector<HTMLOutputElement>('#corte-valor')!;
const botaoGiro = document.querySelector<HTMLButtonElement>('#giro')!;

function defineCorte(v: number, doUsuario: boolean) {
  corteAlvo = THREE.MathUtils.clamp(v, 0, 1);
  if (doUsuario || reduz) corte = corteAlvo;
  campoCorte.value = String(Math.round(corteAlvo * 100));
  valorCorte.textContent = `${Math.round(corteAlvo * 100)}%`;
  sujo = true;
}
campoCorte.addEventListener('input', () => defineCorte(Number(campoCorte.value) / 100, true));

function defineGiro(ligado: boolean) {
  girando = ligado;
  botaoGiro.setAttribute('aria-pressed', String(ligado));
  sujo = true;
}
botaoGiro.addEventListener('click', () => defineGiro(!girando));
botaoGiro.setAttribute('aria-pressed', String(girando));

let ultimoX = 0;
let ultimoY = 0;
tela.addEventListener('pointerdown', (e) => {
  arrastando = true;
  ultimoX = e.clientX;
  ultimoY = e.clientY;
  tela.setPointerCapture(e.pointerId);
  defineGiro(false);
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
  defineGiro(false);
});

/* ---------- laço ---------- */
let visivel = true;
let antes = performance.now();
let lento = 0;

function quadro(agora: number) {
  requestAnimationFrame(quadro);
  const dt = Math.min(0.05, (agora - antes) / 1000);
  antes = agora;
  if (!visivel) return;

  if (girando) {
    /* vai e volta em torno da vista de frente, para o corte nunca ficar de costas por muito tempo */
    olhar.guinada += (Math.sin(agora * 0.00035) * 0.75 - olhar.guinada) * Math.min(1, dt * 1.6);
    olhar.inclinacao += (0.14 + Math.sin(agora * 0.00027) * 0.1 - olhar.inclinacao) * Math.min(1, dt * 1.6);
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
  olhar.inclinacao = THREE.MathUtils.clamp(olhar.inclinacao, -0.9, 1.15);

  if (Math.abs(corteAlvo - corte) > 0.0005) {
    corte += (corteAlvo - corte) * Math.min(1, dt * 3.2);
    sujo = true;
  }

  if (!sujo) return;
  sujo = false;

  /* 0 → plano fora do dente (z = 0,62); 1 → plano no meio (z = 0) */
  uniformes.uCorte.value = 0.62 * (1 - corte);
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
atualizaCamera();
requestAnimationFrame(quadro);

/* abre o corte sozinho pouco depois de carregar, para mostrar que há algo dentro */
if (reduz) defineCorte(1, false);
else setTimeout(() => defineCorte(1, false), 900);
