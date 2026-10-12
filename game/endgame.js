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
  const sortedCounts = [counts.light, counts.dark].sort((a, b) => a - b);

  if (sortedCounts[0] === 2 && sortedCounts[1] === 3) {
    return { reason: "low-material", counts };
  }
  if (occurrences >= REPETITION_LIMIT) {
    return { reason: "repetition", counts };
  }
  if (tracker.quietTurns >= MAX_QUIET_TURNS) {
    return { reason: "no-capture-limit", counts };
  }
  return null;
}
