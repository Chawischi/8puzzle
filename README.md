# 8 Puzzle — Solver com A*

Implementação interativa do clássico **8 Puzzle** (quebra-cabeça deslizante 3×3) com resolução automática via algoritmo **A\*** e heurística de distância Manhattan.

O usuário pode embaralhar o tabuleiro, mover peças manualmente ou solicitar a solução ótima e navegar por ela passo a passo.

---

## Como executar

**Pré-requisitos:** Node.js instalado.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## Funcionalidades

- **Embaralhar** — gera um estado aleatório sempre solucionável
- **Mover manualmente** — clique em qualquer peça adjacente ao espaço vazio
- **Resolver (A\*)** — calcula a sequência ótima de movimentos
- **Navegação passo a passo** — avance ou volte pelos movimentos da solução
- **Feedback visual** — peças já na posição correta ficam destacadas em verde

---

## Tecnologias

- React + TypeScript
- Vite
- Algoritmo A\* com heurística Manhattan

---

## Relatório de Uso de IA

A IA foi utilizada como apoio para esclarecer dúvidas conceituais e de implementação ao longo do desenvolvimento. Abaixo estão as principais questões levantadas.

---

**1. Por que o puzzle pode não ter solução e como verificar isso antes de tentar resolver?**

Nem toda permutação do tabuleiro é atingível a partir do estado objetivo. A IA explicou que o critério é contar as *inversões* (pares de peças onde uma de valor maior aparece antes de uma de valor menor). Se o número de inversões for ímpar, o estado é irresolúvel — não existe sequência de movimentos que chegue ao objetivo. Isso levou à implementação da função `isSolvable`, que filtra o espaço vazio e conta inversões antes de acionar o A*.

---

**2. Como funciona a heurística de distância Manhattan e por que ela é adequada para este problema?**

A dúvida era se a heurística escolhida afetaria a qualidade da solução. A IA explicou que Manhattan é *admissível* — nunca superestima o custo real — o que garante que o A* encontre sempre a solução de menor número de movimentos. O cálculo soma, para cada peça, a diferença absoluta entre a linha e coluna atual e a linha e coluna da posição correta.

---

**3. Como representar e gerar os vizinhos válidos de cada posição no tabuleiro?**

Surgiu a dúvida de como evitar movimentos inválidos (ex.: mover uma peça para fora da grade). A IA sugeriu pré-computar a lista de vizinhos para cada índice de 0 a 8 como uma constante (`NEIGHBORS`), eliminando verificações em tempo de execução e simplificando tanto o solver quanto o tratamento de cliques do usuário.

---

**4. Como exibir os passos da solução sem perder o estado manual do tabuleiro?**

O desafio era separar o "tabuleiro jogável" do "tabuleiro em replay". A IA sugeriu manter dois estados distintos — `board` para o estado atual editável e `steps + stepIdx` para a navegação da solução — derivando o tabuleiro exibido com uma expressão condicional simples:
```ts
const displayed = stepIdx > 0 ? steps[stepIdx - 1].board : board;
```
Assim, navegar pelos passos não destrói o estado do jogo.

---

**5. Qual limite de segurança usar no A\* para evitar travamento do navegador?**

Para puzzles muito distantes do objetivo, o A* pode explorar centenas de milhares de estados. A IA recomendou adicionar um limite no tamanho do mapa de visitados (80.000 nós) e executar o solver dentro de um `setTimeout` de 10ms para não bloquear a thread principal durante o cálculo, mantendo a interface responsiva.

---