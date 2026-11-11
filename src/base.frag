// Shader base do atlas. O dente é desenhado por distância (SDF) e percorrido raio a raio:
// não há malha nem textura. A forma de cada dente (dente, polpa, jac, espessura) é gerada
// a partir da ficha dele em src/dentes e entra no marcador mais abaixo.
precision highp float;

uniform vec2 uRes;
uniform vec3 uOlho;      // posição da câmera
uniform mat3 uBase;      // direita, cima e frente da câmera
uniform float uFoco;     // distância focal
uniform float uDesloc;   // desloca o dente na horizontal, para dar lugar ao texto
uniform vec3 uPlano;     // normal do plano de corte (aponta para a parte removida)
uniform float uCorte;    // posição do plano: sai tudo em que dot(p, uPlano) > uCorte
uniform vec3 uLuz;
uniform vec3 uFundo, uEsmalte, uDentina, uPolpa, uCemento, uTinta;
uniform vec3 uCentro;    // centro e raio da esfera que envolve o dente
uniform float uRaio;
uniform float uChao;     // altura do chão, onde cai a sombra
uniform int uReg;         // região da estrutura escolhida, pintada no dente: 0 nenhuma, 1 cúspide, 2 vertente lisa,
                          // 3 vertente triturante, 4 face (pela direção), 5 terço da raiz, 6 face oclusal,
                          // 7 trechos (sulco, raiz), 8 em volta de pontos, 9 raiz inteira, 10 linha cervical,
                          // 11 acima de uma altura (borda incisal)
uniform vec4 uSegA[4];    // início e raio de cada trecho
uniform vec3 uSegB[4];
uniform int uNSeg;
uniform vec4 uEsf[6];     // centro e raio em volta de cada ponto
uniform int uNEsf;
uniform int uRegI;        // qual cúspide, ou qual terço
uniform vec3 uRegN;       // para onde a face está voltada
uniform vec3 uAcento;     // a cor de destaque da página
uniform float uTopo, uApice, uColo;
uniform vec3 uCusp[5];
uniform int uNCusp;
uniform int uZero;        // sempre 0. Começar os laços nele impede o compilador de desenrolá-los e de copiar a
                          // função do dente em cada chamada; sem isso a compilação leva dezenas de segundos
uniform float uInverte;  // -1 nos dentes superiores: a imagem é espelhada na vertical, com a coroa para baixo

out vec4 saida;


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

// ---------- o dente (gerado a partir da ficha) ----------
//@DENTE@

float cena(vec3 p) { return max(dente(p), dot(p, uPlano) - uCorte); }

// ---------- luz ----------
vec3 emLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 srgb(vec3 c) { return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }

// ruído suave em 3D, para a textura das superfícies
float acaso(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(acaso(i), acaso(i + vec3(1.0, 0.0, 0.0)), f.x), mix(acaso(i + vec3(0.0, 1.0, 0.0)), acaso(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(acaso(i + vec3(0.0, 0.0, 1.0)), acaso(i + vec3(1.0, 0.0, 1.0)), f.x), mix(acaso(i + vec3(0.0, 1.0, 1.0)), acaso(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}

float graos(vec3 q) { return ruido(q) + 0.5 * ruido(q.zxy * 2.3 + 7.0); }

vec3 normalDoDente(vec3 p) {
  // o passo da normal acompanha o tamanho do pixel: de perto, mais fino e mais nítido
  vec2 e = vec2(clamp(3.0 * distance(p, uOlho) / (uRes.y * uFoco), 0.0004, 0.0015), 0.0);
  // quatro amostras em tetraedro, num laço: a função do dente entra no código uma vez só
  vec3 n = vec3(0.0);
  for (int i = uZero; i < 4; i++) {
    vec3 d = 0.5773 * (2.0 * vec3(float(((i + 3) >> 1) & 1), float((i >> 1) & 1), float(i & 1)) - 1.0);
    n += d * dente(p + e.x * d);
  }
  return normalize(n);
}

float oclusao(vec3 p, vec3 n) {
  float o = 0.0, peso = 1.0;
  for (int i = uZero + 1; i <= 4; i++) { float h = 0.045 * float(i); o += (h - cena(p + n * h)) * peso; peso *= 0.6; }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}

float sombra(vec3 p, vec3 l) {
  float res = 1.0, t = 0.03;
  for (int i = uZero; i < 22; i++) { float h = cena(p + l * t); res = min(res, 9.0 * h / t); t += clamp(h, 0.02, 0.16); if (res < 0.01 || t > 1.8) break; }
  return clamp(res, 0.0, 1.0);
}

// cor de um ponto da superfície; px é o tamanho de um pixel naquela distância
vec3 tinge(vec3 p, vec3 rd, float px) {
  vec3 l = normalize(uLuz), v = -rd;
  float dt = dente(p);
  bool face = dot(p, uPlano) - uCorte > -0.004 && dt < -0.002;
  vec3 n = uPlano;
  if (!face) n = normalDoDente(p);

  float ndl = dot(n, l);
  float ao = oclusao(p, n);
  float sb = sombra(p + n * 0.012, l);
  vec3 ceu = mix(emLinear(uFundo) * 0.55, vec3(1.0), n.y * 0.5 + 0.5);

  vec3 resultado = vec3(0.0);
  if (face) {
    // face do corte: cada tecido com a sua cor, como numa prancha de anatomia
    float dp = polpa(p);
    float esp = espessura(p);
    float c = jac(p);
    float w = px * 1.4;

    vec3 cor = emLinear(uDentina) * (1.0 + 0.045 * sin(dp * 85.0)); // linhas incrementais da dentina
    float cem = smoothstep(-CEMENTO - w, -CEMENTO + w, dt) * smoothstep(c + 0.05, c - 0.01, p.y);
    cor = mix(cor, emLinear(uCemento), cem);
    float esm = esp > 0.004 ? smoothstep(-esp - w, -esp + w, dt) : 0.0;
    cor = mix(cor, emLinear(uEsmalte), esm);
    float pol = smoothstep(w, -w, dp);
    cor = mix(cor, emLinear(uPolpa) * mix(1.0, 0.78, smoothstep(0.0, -0.07, dp)), pol);

    // traço fino nas fronteiras entre tecidos
    float traco = smoothstep(w * 2.2, 0.0, abs(dp));
    if (esp > 0.004) traco = max(traco, smoothstep(w * 2.2, 0.0, abs(dt + esp)));
    cor = mix(cor, emLinear(uTinta), traco * 0.30);

    // luz quase chapada: a face cortada precisa ser lida em qualquer orientação
    float luz = 0.86 + 0.14 * max(ndl, 0.0) * sb;
    resultado = cor * luz * mix(0.9, 1.0, ao);
  } else {
    // superfície externa: esmalte brilhante na coroa, cemento fosco na raiz
    float c = jac(p);
    float naCoroa = smoothstep(c - 0.03, c + 0.06, p.y);
    vec3 base = mix(emLinear(uCemento), emLinear(uEsmalte), naCoroa);

    // ---- a região da estrutura escolhida fica tingida, de borda suave ----
    if (uReg != 0) {
      float m = 0.0;
      float alto = smoothstep(c + 0.36 * (uTopo - c), c + 0.5 * (uTopo - c), p.y); // metade oclusal da coroa
      if (uReg <= 3) {
        float perto1 = 1e3, perto2 = 1e3;
        int qual = 0;
        for (int i = uZero; i < uNCusp; i++) {
          float d = distance(p, uCusp[i]);
          if (d < perto1) { perto2 = perto1; perto1 = d; qual = i; } else if (d < perto2) perto2 = d;
        }
        if (uReg == 1) {
          // a cúspide vai do vértice até onde começa a vizinha
          m = alto * (qual == uRegI ? 1.0 : 0.0) * (uNCusp > 1 ? smoothstep(0.0, 0.014, (perto2 - perto1) * 0.5) : 1.0);
        } else {
          // do vértice para a face livre é a vertente lisa; do vértice para o sulco, a triturante
          float cz = uCusp[qual].z;
          float fora = smoothstep(-0.012, 0.012, sign(cz) * (p.z - cz));
          // a lisa olha para a face livre; a triturante, para cima, dentro da face oclusal
          m = alto * (uReg == 2 ? fora * smoothstep(0.05, 0.4, sign(cz) * n.z) : (1.0 - fora) * smoothstep(0.0, 0.35, n.y));
        }
      } else if (uReg == 4) {
        m = naCoroa * smoothstep(0.30, 0.62, dot(n, uRegN));
      } else if (uReg == 6) {
        m = alto * smoothstep(0.35, 0.65, n.y);
      } else if (uReg == 5) {
        // terços da raiz: três partes iguais, em linha reta, do colo ao ápice
        float t = clamp((uColo - p.y) / max(uColo - uApice, 0.01), 0.0, 1.0) * 3.0;
        float k = float(uRegI);
        m = (1.0 - naCoroa) * smoothstep(k - 0.03, k + 0.03, t) * (1.0 - smoothstep(k + 0.97, k + 1.03, t));
      } else if (uReg == 7) {
        float d = 1e3;
        for (int i = uZero; i < uNSeg; i++) d = min(d, sdCapsula(p, uSegA[i].xyz, uSegB[i], uSegA[i].w));
        m = smoothstep(0.012, -0.012, d);
      } else if (uReg == 8) {
        float d = 1e3;
        for (int i = uZero; i < uNEsf; i++) d = min(d, distance(p, uEsf[i].xyz) - uEsf[i].w);
        m = smoothstep(0.03, -0.03, d);
      } else if (uReg == 9) {
        m = 1.0 - naCoroa;
      } else if (uReg == 10) {
        m = smoothstep(0.045, 0.02, abs(p.y - c - 0.015));
      } else if (uReg == 11) {
        m = smoothstep(uRegN.x - 0.02, uRegN.x + 0.02, p.y);
      }
      // no cemento, que é escuro, a tinta precisa ser mais forte para aparecer
      base = mix(base, emLinear(uAcento), mix(0.92, 0.82, naCoroa) * m);
    }

    // ---- textura: só aparece quando o pixel é menor que o detalhe, para não cintilar de longe ----
    float perto = smoothstep(0.0045, 0.0012, px);
    // periquimácias: ondas finas e horizontais do esmalte, mais nítidas no terço cervical
    float cervical = 1.0 - smoothstep(c + 0.08, c + 0.5, p.y);
    float onda = cos(p.y * 560.0 + 3.0 * ruido(p * 9.0));
    // cemento: superfície fosca e irregular
    vec3 q = p.yzx * 46.0 + p * 11.0; // eixos misturados, para a grade do ruído não aparecer
    float g0 = graos(q);
    vec3 grao = vec3(graos(q + vec3(0.35, 0.0, 0.0)) - g0, graos(q + vec3(0.0, 0.35, 0.0)) - g0, graos(q + vec3(0.0, 0.0, 0.35)) - g0);
    vec3 relevo = vec3(0.0, onda * 0.05 * cervical * naCoroa, 0.0) + grao * 0.34 * (1.0 - naCoroa);
    vec3 nt = normalize(n + (relevo - n * dot(relevo, n)) * perto);
    float ndt = dot(nt, l);

    // manchas suaves: o cemento varia de tom; o esmalte, quase nada
    float mancha = ruido(p * 5.0) * 0.6 + ruido(p * 17.0) * 0.4 - 0.5;
    base *= 1.0 + mancha * mix(0.16, 0.03, naCoroa);
    // perto do colo o esmalte é mais fino e mais amarelado
    base = mix(base, emLinear(uDentina), 0.16 * cervical * naCoroa);

    float difusa = pow(ndt * 0.5 + 0.5, 1.6);                       // luz envolvente, sem sombra dura
    vec3 h = normalize(l + v);
    float ndh = max(dot(nt, h), 0.0);
    // dois brilhos no esmalte: um reflexo estreito e um halo largo, de superfície úmida
    float brilho = (pow(ndh, mix(16.0, 110.0, naCoroa)) * mix(0.05, 0.55, naCoroa) + pow(ndh, 14.0) * 0.07 * naCoroa) * sb;
    float borda = pow(1.0 - max(dot(nt, v), 0.0), 4.0) * mix(0.05, 0.30, naCoroa);

    // esmalte fino deixa passar um pouco da cor da dentina
    float fino = 1.0 - clamp(-dente(p - n * 0.12) / 0.12, 0.0, 1.0);
    vec3 cor = base * (ceu * 0.42 * ao + difusa * mix(0.55, 1.0, sb) * 0.72);
    cor += emLinear(uDentina) * fino * 0.10 * naCoroa;
    // a borda fina do esmalte é translúcida: fica um pouco mais fria e acinzentada
    cor = mix(cor, cor * vec3(0.90, 0.94, 1.0), fino * 0.35 * naCoroa * (1.0 - cervical));
    cor += vec3(brilho) + ceu * borda * ao;
    resultado = cor;
  }
  return resultado;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;
  uv.x -= uDesloc;
  uv.y *= uInverte;
  vec3 rd = normalize(uBase * vec3(uv, uFoco));
  vec3 ro = uOlho;
  float pixel = 2.0 / (uRes.y * uFoco);

  // fundo: a cor da página, com a sombra do dente no chão
  vec3 fundo = emLinear(uFundo);
  float tChao = (uChao - ro.y) / rd.y;
  if (tChao > 0.0) {
    vec3 g = ro + rd * tChao;
    float s = exp(-dot(g.xz * vec2(1.0, 1.35), g.xz * vec2(1.0, 1.35)) * 1.9);
    fundo = mix(fundo, vec3(0.0), s * 0.30);
  }

  // só percorre o raio dentro da esfera que envolve o dente
  vec3 oc = ro - uCentro;
  float b = dot(oc, rd), cc = dot(oc, oc) - uRaio * uRaio, disc = b * b - cc;
  vec3 cor = fundo;

  if (disc > 0.0) {
    float raiz = sqrt(disc), t = max(-b - raiz, 0.0), fim = -b + raiz;
    float menor = 1e3, tMenor = t;
    bool bateu = false;

    for (int i = uZero; i < 110; i++) {
      float d = cena(ro + rd * t);
      if (d / t < menor) { menor = d / t; tMenor = t; }
      if (d < min(0.0006, pixel * 0.4) * t) { bateu = true; break; }
      t += d * 0.82;
      if (t > fim) break;
    }

    // uma única chamada de tinge para os dois casos, pelo mesmo motivo do uZero
    bool raspao = !bateu && menor < pixel;
    if (bateu || raspao) {
      float tt = bateu ? t : tMenor;
      vec3 c = tinge(ro + rd * tt, rd, pixel * tt);
      // raio que passou de raspão: mistura a borda com o fundo, em vez de serrilhar
      cor = raspao ? mix(c, fundo, smoothstep(0.0, pixel, menor)) : c;
    }
  }

  // pontilhado mínimo para o degradê do fundo não formar faixas
  float ruido = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  saida = vec4(srgb(cor) + (ruido - 0.5) / 255.0, 1.0);
}
