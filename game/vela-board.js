import {
  neighbors, allLegalMoves, applyMove, opponent, initialBoard, LIGHT, DARK
} from "./engine.js";

/**
 * Creates a fresh full-set Vela board. The colors are swapped when DARK is
 * the offer player so the initial offer opportunities are equivalent.
 */
export function createVelaBoard(offerPlayer) {
  if (offerPlayer !== LIGHT && offerPlayer !== DARK) {
    throw new TypeError("offerPlayer must be 'light' or 'dark'");
  }
  const board = initialBoard();
  if (offerPlayer === DARK) {
    return board.map(piece => piece === LIGHT ? DARK : piece === DARK ? LIGHT : null);
  }
  return board;
}

/**
 * Legal offers for Vela phase 1.
 * The Riatra winner moves one stone without capturing, and the move must
 * leave that offered stone capturable by the Vela player on their next turn.
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
      const canTakeOfferedStone = allLegalMoves(nextBoard, velaPlayer)
        .some(candidate => candidate.capture && candidate.victims.length === 1 && candidate.victims[0] === to);
      if (canTakeOfferedStone) offers.push(move);
    }
  }
  return offers;
}

/** Legal captures for the Vela player that actually take the offered stone. */
export function legalVelaCaptures(board, velaPlayer, offeredIndex) {
  return allLegalMoves(board, velaPlayer).filter(move =>
    move.capture && move.victims.length === 1 && move.victims[0] === offeredIndex
  );
}

export function applyVelaOffer(board, move, offerPlayer, velaPlayer) {
  const valid = legalOfferMoves(board, offerPlayer, velaPlayer)
    .some(candidate => candidate.from === move.from && candidate.to === move.to);
  if (!valid) throw new Error("Tsy mety io fanolorana vato io: tsy azo alaina amin'ny anjaran'ny Vela.");
  return applyMove(board, { ...move, capture: false, mode: null, victims: [] }, offerPlayer);
}

export function applyVelaCapture(board, move, velaPlayer, offeredIndex) {
  const valid = legalVelaCaptures(board, velaPlayer, offeredIndex)
    .some(candidate =>
      candidate.from === move.from &&
      candidate.to === move.to &&
      candidate.mode === move.mode &&
      candidate.victims.length === move.victims.length &&
      candidate.victims.every((victim, i) => victim === move.victims[i])
    );
  if (!valid) throw new Error("Tsy maintsy maka ilay vato natolotra ny mpilalao Vela.");
  return applyMove(board, move, velaPlayer);
}
