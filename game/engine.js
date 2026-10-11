export const ROWS = 5;
export const COLS = 9;
export const LIGHT = "light";
export const DARK = "dark";

export function opponent(player) {
  return player === LIGHT ? DARK : LIGHT;
}

export function initialBoard() {
  const board = Array(ROWS * COLS).fill(null);
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const i = row * COLS + col;
      if (row < 2) board[i] = LIGHT;
      else if (row > 2) board[i] = DARK;
      else if (col !== 4) {
        // Ny laharana afovoany dia mifandimby amin'ny lafiny roa amin'ilay toerana foana.
        // Izany no mahatonga ny vato eo ankavian'ny afovoany tsy hitovy loko
        // amin'ny vato eo ankavanany.
        board[i] = col < 4
          ? (col % 2 === 0 ? DARK : LIGHT)
          : (col % 2 === 0 ? LIGHT : DARK);
      }
    }
  }
  return board;
}

export function indexOf(row, col) {
  return row * COLS + col;
}

export function coordinates(index) {
  return { row: Math.floor(index / COLS), col: index % COLS };
}

export function neighbors(index) {
  const { row, col } = coordinates(index);
  const result = [];
  for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
    const diagonal = dr !== 0 && dc !== 0;
    if (diagonal && (row + col) % 2 !== 0) continue;
    result.push({ index: indexOf(nr, nc), dr, dc });
  }
  return result;
}

function ray(board, start, dr, dc, color) {
  const { row, col } = coordinates(start);
  let r = row + dr;
  let c = col + dc;
  const found = [];
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[indexOf(r, c)] === color) {
    found.push(indexOf(r, c));
    r += dr;
    c += dc;
  }
  return found;
}

function captureOptions(board, from, to, player, blocked = new Set()) {
  const { row: fr, col: fc } = coordinates(from);
  const { row: tr, col: tc } = coordinates(to);
  const dr = tr - fr;
  const dc = tc - fc;
  const options = [];
  for (const mode of ["approach", "withdrawal"]) {
    const sr = mode === "approach" ? tr + dr : fr - dr;
    const sc = mode === "approach" ? tc + dc : fc - dc;
    if (sr < 0 || sr >= ROWS || sc < 0 || sc >= COLS) continue;
    // A capture ray must follow a line that exists on the board.
    const next = indexOf(sr, sc);
    const lineExists = neighbors(mode === "approach" ? to : from).some(n => n.index === next);
    if (!lineExists || board[next] !== opponent(player) || blocked.has(next)) continue;
    const victims = ray(board, mode === "approach" ? to : from, mode === "approach" ? dr : -dr, mode === "approach" ? dc : -dc, opponent(player));
    const usable = victims.filter(v => !blocked.has(v));
    if (usable.length) options.push({ mode, victims: usable });
  }
  return options;
}

export function legalMoves(board, player, from, context = null) {
  if (from < 0 || from >= board.length || board[from] !== player) return [];
  const candidates = [];
  const blocked = context ? context.captured : new Set();
  for (const n of neighbors(from)) {
    const to = n.index;
    if (board[to] !== null) continue;
    if (context && context.visited.has(to)) continue;
    // Amin'ny fakana mitohy, tsy azo averina avy hatrany ny tari-dalana teo aloha.
    if (context && context.lastDirection &&
        n.dr === context.lastDirection.dr && n.dc === context.lastDirection.dc) continue;
    const options = captureOptions(board, from, to, player, blocked);
    if (options.length) {
      for (const option of options) candidates.push({ from, to, capture: true, mode: option.mode, victims: option.victims });
    } else if (!context) {
      candidates.push({ from, to, capture: false, mode: null, victims: [] });
    }
  }
  if (context) return candidates.filter(m => m.capture);
  const anyCapture = board.some((piece, i) => piece === player &&
    neighbors(i).some(n => board[n.index] === null && captureOptions(board, i, n.index, player).length));
  return anyCapture ? candidates.filter(m => m.capture) : candidates;
}

export function applyMove(board, move, player) {
  const next = board.slice();
  next[move.to] = player;
  next[move.from] = null;
  for (const victim of move.victims) next[victim] = null;
  return next;
}

export function countPieces(board) {
  return board.reduce((counts, piece) => {
    if (piece) counts[piece] += 1;
    return counts;
  }, { light: 0, dark: 0 });
}

export function allLegalMoves(board, player) {
  const moves = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === player) moves.push(...legalMoves(board, player, i));
  }
  return moves;
}
