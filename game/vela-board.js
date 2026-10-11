import {
  neighbors, allLegalMoves, applyMove, opponent, initialBoard, LIGHT, DARK
} from "./engine.js";

/**
 * Creates a fresh full-set Vela board with 22 stones per player.
 * The single empty point is repositioned until the opening offer can
 * actually be captured, instead of assuming the Riatra layout works.
 */
export function createVelaBoard(offerPlayer) {
  if (offerPlayer !== LIGHT && offerPlayer !== DARK) {
    throw new TypeError("offerPlayer must be 'light' or 'dark'");
  }

  let oriented = initialBoard();
  if (offerPlayer === DARK) {
    oriented = oriented.slice().reverse().map(piece =>
      piece === LIGHT ? DARK : piece === DARK ? LIGHT : null
    );
  }

  const emptyIndex = oriented.findIndex(piece => piece === null);
  for (let candidate = 0; candidate < oriented.length; candidate += 1) {
    if (candidate === emptyIndex) continue;
    const board = oriented.slice();
    board[emptyIndex] = board[candidate];
    board[candidate] = null;
    if (legalOfferMoves(board, offerPlayer, opponent(offerPlayer)).length > 0) {
      return board;
    }
  }

  throw new Error("Tsy nahita solaitrabe Vela misy fanolorana ara-dalàna.");
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
