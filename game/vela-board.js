import {
  neighbors, allLegalMoves, applyMove, opponent, initialBoard, LIGHT, DARK
} from "./engine.js";

/**
 * Vela starts with the exact standard Fanorona opening: 22 stones each
 * and the centre point empty. The offer move is made on this same layout.
 */
export function createVelaBoard(offerPlayer) {
  if (offerPlayer !== LIGHT && offerPlayer !== DARK) {
    throw new TypeError("offerPlayer must be 'light' or 'dark'");
  }
  return initialBoard();
}

/**
 * Legal offers for Vela phase 1.
 * The Riatra winner moves one stone without capturing. The move is valid
 * when it gives the Vela player at least one legal capture anywhere on the board.
 * The Vela player is not forced to capture the stone that was just moved.
 */
export function legalOfferMoves(board, offerPlayer, velaPlayer) {
  if (opponent(offerPlayer) !== velaPlayer) return [];
  const offers = [];
  for (let from = 0; from < board.length; from += 1) {
    if (board[from] !== offerPlayer) continue;
    for (const neighbor of neighbors(from)) {
      const to = neighbor.index;
      if (board[to] !== null) continue;
      const move = { from, to, capture: false, mode: null, victims: [] };
      const nextBoard = applyMove(board, move, offerPlayer);
      const canCaptureAnyStone = allLegalMoves(nextBoard, velaPlayer)
        .some(candidate => candidate.capture);
      if (canCaptureAnyStone) offers.push(move);
    }
  }
  return offers;
}

/**
 * Vela phase 1 allows any legal capture, but removes exactly one stone per turn.
 * If a capture line contains several stones, only its first stone is removed.
 * Keeping approach/withdrawal as separate moves lets the UI ask the player to choose.
 */
export function legalVelaCaptures(board, velaPlayer) {
  return allLegalMoves(board, velaPlayer)
    .filter(move => move.capture)
    .map(move => ({ ...move, victims: move.victims.length ? [move.victims[0]] : [] }));
}

export function applyVelaOffer(board, move, offerPlayer, velaPlayer) {
  const valid = legalOfferMoves(board, offerPlayer, velaPlayer)
    .some(candidate => candidate.from === move.from && candidate.to === move.to);
  if (!valid) throw new Error("Tsy mety io fanolorana vato io: tsy azo alaina amin'ny anjaran'ny Vela.");
  return applyMove(board, { ...move, capture: false, mode: null, victims: [] }, offerPlayer);
}

export function applyVelaCapture(board, move, velaPlayer) {
  const valid = legalVelaCaptures(board, velaPlayer)
    .some(candidate =>
      candidate.from === move.from &&
      candidate.to === move.to &&
      candidate.mode === move.mode &&
      candidate.victims.length === move.victims.length &&
      candidate.victims.every((victim, i) => victim === move.victims[i])
    );
  if (!valid) throw new Error("Tsy ara-dalàna io fakana Vela io.");
  return applyMove(board, move, velaPlayer);
}
