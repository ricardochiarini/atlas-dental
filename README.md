# Anatomia de um molar

Um primeiro molar inferior em WebGL que dá para girar e abrir em corte, do esmalte à polpa. Faz parte do laboratório de [ricardochiarini.com](https://ricardochiarini.com/lab).

**Não há modelo 3D.** Nenhuma malha, textura ou arquivo importado: o dente inteiro é uma função matemática, avaliada em cada pixel por um shader.

## Como funciona

A técnica é a de campos de distância (SDF) com marcha de raios.

- `dente(p)` devolve a distância de um ponto qualquer até a superfície do dente. Ela é montada somando e subtraindo formas simples com transições suaves: uma caixa arredondada para a coroa, cinco esferas para as cúspides, uma elipse e quatro cápsulas subtraídas para a fossa e os sulcos, e dois cones para as raízes.
- Para cada pixel sai um raio da câmera. Ele avança de acordo com a distância que a função informa, até encostar na superfície.
- **O corte** é a interseção do dente com um meio-espaço: `max(dente(p), p.z - corte)`. Custa uma linha.
- **As camadas** são regiões da mesma função. O esmalte é a faixa próxima da superfície, acima da junção amelocementária e mais espessa nas cúspides. A polpa é outra função de distância (câmara, cornos e canais). O cemento é uma faixa fina sobre a raiz. O que sobra é dentina.
- A luz usa a própria função: oclusão e sombra suave saem de amostras da distância, sem mapas.

Tudo isso está em [`src/molar.frag`](src/molar.frag), comentado.

## O resto

[`src/main.ts`](src/main.ts) cuida do que não é desenho:

- **Câmera em órbita** com inércia, por mouse, toque ou setas do teclado.
- **Rótulos presos ao dente.** O JavaScript repete a projeção da câmera do shader para saber onde cada ponto do corte cai na tela.
- **Cores compartilhadas.** O shader lê as mesmas variáveis CSS da página, então o dente acompanha os temas claro e escuro.
- **Desenho sob demanda.** Um quadro só é calculado quando algo muda. Se o aparelho não acompanhar, a resolução interna cai aos poucos.
- **Movimento reduzido.** Com essa preferência no sistema, o giro automático e a abertura animada do corte ficam desligados.

O Three.js entra só para criar o contexto WebGL e desenhar o retângulo que cobre a tela.

## Limites

É uma ilustração esquemática, não material clínico. A raiz mesial foi desenhada com um canal só, e o corte é sempre no plano mésio-distal.

## Rodar

```bash
npm install
npm run dev
```

## Créditos

Anatomia, design e código por [Ricardo Chiarini](https://ricardochiarini.com), cirurgião-dentista e desenvolvedor. As funções de distância básicas seguem as fórmulas publicadas por Inigo Quilez. A fonte é a Instrument Serif, sob a SIL Open Font License.
