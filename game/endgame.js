export const MAX_QUIET_TURNS = 60;
export const REPETITION_LIMIT = 3;

export function createEndgameTracker() {
  return { positions: new Map(), quietTurns: 0 };
}

export function resetEndgameTracker(tracker, board, nextPlayer) {
  tracker.positions.clear();
  tracker.quietTurns = 0;
  tracker.positions.set(positionKey(board, nextPlayer), 1);
  return tracker;
}

function positionKey(board, nextPlayer) {
  return board.map(piece => piece || "-").join("") + "|" + nextPlayer;
}

export function recordEndgamePosition(tracker, board, nextPlayer, capturedThisTurn) {
  tracker.quietTurns = capturedThisTurn ? 0 : tracker.quietTurns + 1;
  const key = positionKey(board, nextPlayer);
  const occurrences = (tracker.positions.get(key) || 0) + 1;
  tracker.positions.set(key, occurrences);

  const counts = board.reduce((result, piece) => {
    if (piece) result[piece] += 1;
    return result;
  }, { light: 0, dark: 0 });

  // Tsy mamarana lalao amin'ny isan'ny vato fotsiny: ny toerana sy ny
  // fiverimberenan'ny lalao no jerena, mba tsy hampitsahatra 3-4 na 5-3 an-jambany.
  if (occurrences >= REPETITION_LIMIT) return { reason: "repetition", counts };
  if (tracker.quietTurns >= MAX_QUIET_TURNS) return { reason: "no-capture-limit", counts };
  return null;
}
