import { useState } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Board = number[]; // 9 números, 0 = espaço vazio

interface Step {
  board: Board;
  moved: number; // qual peça moveu
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const GOAL: Board = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Vizinhos válidos de cada posição (0–8)
const NEIGHBORS: number[][] = [
  [1, 3],
  [0, 2, 4],
  [1, 5],
  [0, 4, 6],
  [1, 3, 5, 7],
  [2, 4, 8],
  [3, 7],
  [4, 6, 8],
  [5, 7],
];

// ─── Algoritmo A* ─────────────────────────────────────────────────────────────

function manhattan(board: Board): number {
  let dist = 0;
  for (let i = 0; i < 9; i++) {
    const v = board[i];
    if (v === 0) continue;
    const target = v - 1;
    dist += Math.abs(Math.floor(i / 3) - Math.floor(target / 3))
          + Math.abs((i % 3) - (target % 3));
  }
  return dist;
}

function isSolvable(board: Board): boolean {
  const flat = board.filter((x) => x !== 0);
  let inv = 0;
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++;
  return inv % 2 === 0;
}

function solve(start: Board): Step[] | null {
  if (!isSolvable(start)) return null;

  const key = (b: Board) => b.join(",");
  const goalKey = key(GOAL);

  type Node = { board: Board; g: number; f: number; path: Step[] };

  const open: Node[] = [{ board: start, g: 0, f: manhattan(start), path: [] }];
  const visited = new Map<string, number>();
  visited.set(key(start), 0);

  while (open.length > 0) {
    // pega o nó com menor f
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;

    if (key(cur.board) === goalKey) return cur.path;
    if (visited.size > 80_000) return null; // limite de segurança

    const z = cur.board.indexOf(0);
    for (const nb of NEIGHBORS[z]) {
      const next = [...cur.board];
      [next[z], next[nb]] = [next[nb], next[z]];
      const k = key(next);
      const ng = cur.g + 1;
      if (!visited.has(k) || visited.get(k)! > ng) {
        visited.set(k, ng);
        open.push({
          board: next,
          g: ng,
          f: ng + manhattan(next),
          path: [...cur.path, { board: next, moved: cur.board[nb] }],
        });
      }
    }
  }
  return null;
}

function shuffle(): Board {
  const b = [...GOAL];
  for (let i = 0; i < 200; i++) {
    const z = b.indexOf(0);
    const nb = NEIGHBORS[z];
    const pick = nb[Math.floor(Math.random() * nb.length)];
    [b[z], b[pick]] = [b[pick], b[z]];
  }
  return b;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function App() {
  const [board, setBoard] = useState<Board>([...GOAL]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [msg, setMsg] = useState("Embaralhe e clique em Resolver!");

  // tabuleiro exibido = estado no passo atual (ou o inicial)
  const displayed: Board = stepIdx > 0 ? steps[stepIdx - 1].board : board;

  function handleShuffle() {
    const b = shuffle();
    setBoard(b);
    setSteps([]);
    setStepIdx(0);
    setMsg(`Embaralhado! Heurística: ${manhattan(b)}`);
  }

  function handleSolve() {
    setMsg("Calculando...");
    setTimeout(() => {
      const result = solve(board);
      if (!result) {
        setMsg(isSolvable(board) ? "Limite atingido." : "Sem solução!");
        return;
      }
      setSteps(result);
      setStepIdx(0);
      setMsg(`Solução encontrada: ${result.length} movimentos.`);
    }, 10);
  }

  function handleTileClick(i: number) {
    const z = board.indexOf(0);
    if (NEIGHBORS[z].includes(i)) {
      const next = [...board];
      [next[z], next[i]] = [next[i], next[z]];
      setBoard(next);
      setSteps([]);
      setStepIdx(0);
      setMsg(next.join(",") === GOAL.join(",") ? "🎉 Resolvido!" : "");
    }
  }

  // ─── Estilos inline simples ───────────────────────────────────────────────

  const tileStyle = (val: number, i: number): React.CSSProperties => {
    const isEmpty = val === 0;
    const isCorrect = !isEmpty && GOAL[i] === val;
    return {
      width: 80, height: 80,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 600,
      borderRadius: 10,
      cursor: isEmpty ? "default" : "pointer",
      border: isEmpty ? "2px dashed #ccc" : "2px solid #ddd",
      background: isEmpty ? "#f5f5f5" : isCorrect ? "#d4edda" : "#fff",
      color: isCorrect ? "#276232" : "#333",
      transition: "background 0.2s",
      userSelect: "none",
    };
  };

  const btnStyle: React.CSSProperties = {
    padding: "8px 20px", fontSize: 14, borderRadius: 8,
    border: "1px solid #ccc", background: "#fff",
    cursor: "pointer", fontWeight: 500,
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 420, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>8 Puzzle</h1>
      <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>{msg}</p>

      {/* Tabuleiro */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 8, marginBottom: 20 }}>
        {displayed.map((val, i) => (
          <div key={i} style={tileStyle(val, i)} onClick={() => handleTileClick(i)}>
            {val !== 0 ? val : ""}
          </div>
        ))}
      </div>

      {/* Botões */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button style={btnStyle} onClick={handleShuffle}>Embaralhar</button>
        <button style={{ ...btnStyle, background: "#1a73e8", color: "#fff", border: "none" }} onClick={handleSolve}>
          Resolver (A*)
        </button>
      </div>

      {/* Passos */}
      {steps.length > 0 && (
        <div>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
            Passo {stepIdx} de {steps.length}
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button style={btnStyle} onClick={() => setStepIdx((i) => Math.max(0, i - 1))}>← Anterior</button>
            <button style={btnStyle} onClick={() => setStepIdx((i) => Math.min(steps.length, i + 1))}>Próximo →</button>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", fontSize: 13, color: "#444" }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                padding: "4px 8px", borderRadius: 6, marginBottom: 2,
                background: i === stepIdx - 1 ? "#e8f0fe" : "transparent",
                color: i === stepIdx - 1 ? "#1a73e8" : "#555",
              }}>
                {i + 1}. Mover peça <strong>{s.moved}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
