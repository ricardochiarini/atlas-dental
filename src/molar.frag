// Anatomia de um molar inferior, desenhada por distância (SDF) e percorrida raio a raio.
// Não há malha nem textura: o dente é a função dente(p), que diz a que distância um ponto
// está da superfície. As camadas (esmalte, dentina, polpa, cemento) são regiões dessa função.
precision highp float;

uniform vec2 uRes;
uniform vec3 uOlho;      // posição da câmera
uniform mat3 uBase;      // direita, cima e frente da câmera
uniform float uFoco;     // distância focal
uniform float uDesloc;   // desloca o dente na horizontal, para dar lugar ao texto
uniform float uCorte;    // tudo com z maior que isto é removido
uniform vec3 uLuz;
uniform vec3 uFundo, uEsmalte, uDentina, uPolpa, uCemento, uTinta;

out vec4 saida;

const vec3 CENTRO = vec3(0.0, -0.26, 0.0);
const float CHAO = -1.46;

// ---------- peças ----------
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k) { return -smin(-a, -b, k); }

float sdCaixa(vec3 p, vec3 b, float r) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdElipse(vec3 p, vec3 r) { float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float sdCapsula(vec3 p, vec3 a, vec3 b, float r) { vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }

// cone de pontas redondas, de raio r1 em a até r2 em b (Inigo Quilez)
float sdCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
  vec3 ba = b - a; float l2 = dot(ba, ba); float rr = r1 - r2; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
  vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2;
  vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv); float y2 = y * y * l2; float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

// as raízes se curvam para distal (x positivo) à medida que descem
vec3 dobra(vec3 p) { float t = clamp(-p.y / 1.3, 0.0, 1.0); p.x -= 0.10 * t * t; return p; }

// ---------- o dente ----------
// Eixos: x é mesial (−) → distal (+), y é apical (−) → oclusal (+), z é lingual (−) → vestibular (+).
float coroa(vec3 p) {
  // estreitamento em direção ao colo
  float colo = mix(0.80, 1.0, smoothstep(-0.05, 0.42, p.y));
  vec3 q = p - vec3(0.0, 0.34, 0.0); q.xz /= colo;
  float d = sdCaixa(q, vec3(0.30, 0.17, 0.25), 0.21) * colo;

  // cinco cúspides: mésio-vestibular, disto-vestibular, distal, mésio-lingual, disto-lingual
  d = smin(d, length(p - vec3(-0.30, 0.60, 0.22)) - 0.17, 0.12);
  d = smin(d, length(p - vec3(0.04, 0.59, 0.24)) - 0.16, 0.12);
  d = smin(d, length(p - vec3(0.35, 0.54, 0.15)) - 0.14, 0.12);
  d = smin(d, length(p - vec3(-0.28, 0.63, -0.22)) - 0.17, 0.12);
  d = smin(d, length(p - vec3(0.20, 0.61, -0.22)) - 0.17, 0.12);

  // fossa central e sulcos: central, dois vestibulares e o lingual
  d = smax(d, -sdElipse(p - vec3(0.02, 0.80, 0.0), vec3(0.34, 0.15, 0.13)), 0.10);
  d = smax(d, -sdCapsula(p, vec3(-0.36, 0.745, 0.0), vec3(0.40, 0.705, 0.0), 0.040), 0.07);
  d = smax(d, -sdCapsula(p, vec3(-0.12, 0.735, 0.0), vec3(-0.13, 0.62, 0.44), 0.034), 0.07);
  d = smax(d, -sdCapsula(p, vec3(0.22, 0.715, 0.0), vec3(0.21, 0.58, 0.42), 0.032), 0.07);
  d = smax(d, -sdCapsula(p, vec3(-0.04, 0.735, 0.0), vec3(-0.04, 0.62, -0.44), 0.034), 0.07);
  return d;
}

float raizes(vec3 p) {
  vec3 q = dobra(p); q.z *= 0.86; // raízes mais largas no sentido vestíbulo-lingual
  float mesial = sdCone(q, vec3(-0.25, 0.10, 0.0), vec3(-0.34, -1.30, 0.0), 0.26, 0.055);
  float distal = sdCone(q, vec3(0.25, 0.10, 0.0), vec3(0.30, -1.20, 0.0), 0.24, 0.055);
  return smin(mesial, distal, 0.10);
}

float dente(vec3 p) { return smin(coroa(p), raizes(p), 0.13); }

// câmara pulpar, cornos em direção às cúspides e um canal por raiz
float polpa(vec3 p) {
  float d = sdElipse(p - vec3(0.0, 0.17, 0.0), vec3(0.22, 0.10, 0.14));
  d = smin(d, sdCone(p, vec3(-0.16, 0.20, 0.10), vec3(-0.26, 0.40, 0.19), 0.045, 0.014), 0.05);
  d = smin(d, sdCone(p, vec3(0.09, 0.20, 0.10), vec3(0.06, 0.39, 0.20), 0.042, 0.014), 0.05);
  d = smin(d, sdCone(p, vec3(-0.15, 0.20, -0.10), vec3(-0.25, 0.42, -0.19), 0.045, 0.014), 0.05);
  d = smin(d, sdCone(p, vec3(0.12, 0.20, -0.10), vec3(0.19, 0.40, -0.19), 0.042, 0.014), 0.05);
  vec3 q = dobra(p);
  d = smin(d, sdCone(q, vec3(-0.21, 0.12, 0.0), vec3(-0.335, -1.22, 0.0), 0.050, 0.012), 0.06);
  d = smin(d, sdCone(q, vec3(0.21, 0.12, 0.0), vec3(0.295, -1.12, 0.0), 0.046, 0.012), 0.06);
  return d;
}

// junção amelocementária: a linha onde o esmalte termina, levemente ondulada
float jac(vec3 p) { return 0.05 + 0.035 * cos(2.0 * atan(p.z, p.x)); }

// espessura do esmalte: maior nas cúspides, afinando até zero no colo
float espessura(vec3 p) { float c = jac(p); return (0.085 + 0.05 * smoothstep(0.35, 0.70, p.y)) * smoothstep(c, c + 0.22, p.y); }

float cena(vec3 p) { return max(dente(p), p.z - uCorte); }

// ---------- luz ----------
vec3 emLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 srgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }

vec3 normalDoDente(vec3 p) {
  const vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(dente(p + e.xyy) - dente(p - e.xyy), dente(p + e.yxy) - dente(p - e.yxy), dente(p + e.yyx) - dente(p - e.yyx)));
}

float oclusao(vec3 p, vec3 n) {
  float o = 0.0, peso = 1.0;
  for (int i = 1; i <= 4; i++) { float h = 0.045 * float(i); o += (h - cena(p + n * h)) * peso; peso *= 0.6; }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}

float sombra(vec3 p, vec3 l) {
  float res = 1.0, t = 0.03;
  for (int i = 0; i < 22; i++) { float h = cena(p + l * t); res = min(res, 9.0 * h / t); t += clamp(h, 0.02, 0.16); if (res < 0.01 || t > 1.8) break; }
  return clamp(res, 0.0, 1.0);
}

// cor de um ponto da superfície; px é o tamanho de um pixel naquela distância
vec3 tinge(vec3 p, vec3 rd, float px) {
  vec3 l = normalize(uLuz), v = -rd;
  float dt = dente(p);
  bool face = p.z > uCorte - 0.004 && dt < -0.002;
  vec3 n = face ? vec3(0.0, 0.0, 1.0) : normalDoDente(p);

  float ndl = dot(n, l);
  float ao = oclusao(p, n);
  float sb = sombra(p + n * 0.012, l);
  vec3 ceu = mix(emLinear(uFundo) * 0.55, vec3(1.0), n.y * 0.5 + 0.5);

  vec3 resultado = vec3(0.0);
  if (face) {
    // face do corte: cada camada com a sua cor, como numa prancha de anatomia
    float dp = polpa(p);
    float esp = espessura(p);
    float c = jac(p);
    float w = px * 1.4;

    vec3 cor = emLinear(uDentina) * (1.0 + 0.045 * sin(dp * 85.0)); // linhas incrementais da dentina
    float cem = smoothstep(-0.022 - w, -0.022 + w, dt) * smoothstep(c + 0.05, c - 0.01, p.y);
    cor = mix(cor, emLinear(uCemento), cem);
    float esm = esp > 0.004 ? smoothstep(-esp - w, -esp + w, dt) : 0.0;
    cor = mix(cor, emLinear(uEsmalte), esm);
    float pol = smoothstep(w, -w, dp);
    cor = mix(cor, emLinear(uPolpa) * mix(1.0, 0.78, smoothstep(0.0, -0.07, dp)), pol);

    // traço fino nas fronteiras entre camadas
    float traco = smoothstep(w * 2.2, 0.0, abs(dp));
    if (esp > 0.004) traco = max(traco, smoothstep(w * 2.2, 0.0, abs(dt + esp)));
    cor = mix(cor, emLinear(uTinta), traco * 0.30);

    float luz = 0.80 + 0.20 * max(ndl, 0.0) * sb;
    resultado = cor * luz * mix(0.85, 1.0, ao);
  } else {

  // superfície externa: esmalte brilhante na coroa, cemento fosco na raiz
  float c = jac(p);
  float naCoroa = smoothstep(c - 0.03, c + 0.06, p.y);
  vec3 base = mix(emLinear(uCemento), emLinear(uEsmalte), naCoroa);

  float difusa = pow(ndl * 0.5 + 0.5, 1.6);                       // luz envolvente, sem sombra dura
  vec3 h = normalize(l + v);
  float brilho = pow(max(dot(n, h), 0.0), mix(16.0, 85.0, naCoroa)) * mix(0.06, 0.55, naCoroa) * sb;
  float borda = pow(1.0 - max(dot(n, v), 0.0), 4.0) * mix(0.06, 0.30, naCoroa);

  // esmalte fino deixa passar um pouco da cor da dentina
  float fino = 1.0 - clamp(-dente(p - n * 0.12) / 0.12, 0.0, 1.0);
  vec3 cor = base * (ceu * 0.42 * ao + difusa * mix(0.55, 1.0, sb) * 0.72);
  cor += emLinear(uDentina) * fino * 0.10 * naCoroa;
  cor += vec3(brilho) + ceu * borda * ao;
  resultado = cor;
  }
  return resultado;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  uv.x -= uDesloc;
  vec3 rd = normalize(uBase * vec3(uv, uFoco));
  vec3 ro = uOlho;
  float pixel = 2.0 / (uRes.y * uFoco);

  // fundo: a cor da página, com a sombra do dente no chão
  vec3 fundo = emLinear(uFundo);
  if (rd.y < 0.0) {
    vec3 g = ro + rd * ((CHAO - ro.y) / rd.y);
    float s = exp(-dot(g.xz * vec2(1.0, 1.35), g.xz * vec2(1.0, 1.35)) * 1.9);
    fundo = mix(fundo, vec3(0.0), s * 0.30);
  }

  // só percorre o raio dentro da esfera que envolve o dente
  vec3 oc = ro - CENTRO;
  float b = dot(oc, rd), cc = dot(oc, oc) - 1.34 * 1.34, disc = b * b - cc;
  vec3 cor = fundo;

  if (disc > 0.0) {
    float raiz = sqrt(disc), t = max(-b - raiz, 0.0), fim = -b + raiz;
    float menor = 1e3, tMenor = t;
    bool bateu = false;

    for (int i = 0; i < 110; i++) {
      float d = cena(ro + rd * t);
      if (d / t < menor) { menor = d / t; tMenor = t; }
      if (d < 0.0006 * t) { bateu = true; break; }
      t += d * 0.82;
      if (t > fim) break;
    }

    if (bateu) {
      cor = tinge(ro + rd * t, rd, pixel * t);
    } else if (menor < pixel) {
      // raio que passou de raspão: mistura a borda com o fundo, em vez de serrilhar
      cor = mix(tinge(ro + rd * tMenor, rd, pixel * tMenor), fundo, smoothstep(0.0, pixel, menor));
    }
  }

  // pontilhado mínimo para o degradê do fundo não formar faixas
  float ruido = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  saida = vec4(srgb(cor) + (ruido - 0.5) / 255.0, 1.0);
}
