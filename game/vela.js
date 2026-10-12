export const VELA_PHASE = Object.freeze({
  OFFERING: "OFFERING",
  FINAL_GAME: "FINAL_GAME",
  COMPLETED: "COMPLETED"
});

export function createVelaSession({ riatraWinner, winnerPiecesAfterRiatra }) {
  if (riatraWinner !== "light" && riatraWinner !== "dark") {
    throw new TypeError("riatraWinner must be 'light' or 'dark'");
  }
  if (!Number.isInteger(winnerPiecesAfterRiatra) || winnerPiecesAfterRiatra < 5) {
    throw new RangeError("winnerPiecesAfterRiatra must be an integer >= 5");
  }
  return {
    riatraWinner,
    velaPlayer: riatraWinner === "light" ? "dark" : "light",
    phase: winnerPiecesAfterRiatra === 5 ? VELA_PHASE.FINAL_GAME : VELA_PHASE.OFFERING,
    winnerPieces: winnerPiecesAfterRiatra,
    offersTaken: 0,
    escaped: null,
    score: null
  };
}

export function recordOfferTaken(session) {
  if (!session || session.phase !== VELA_PHASE.OFFERING) {
    throw new Error("Tsy ao amin'ny dingana fanolorana vato ny Vela.");
  }
  if (session.winnerPieces <= 5) {
    throw new Error("Tsy azo ahena ambanin'ny dimy ny vato amin'ity dingana ity.");
  }
  const winnerPieces = session.winnerPieces - 1;
  const next = {
    ...session,
    winnerPieces,
    offersTaken: session.offersTaken + 1,
    phase: winnerPieces === 5 ? VELA_PHASE.FINAL_GAME : VELA_PHASE.OFFERING
  };
  return next;
}

export function completeVela(session, escaped) {
  if (!session ||
      (session.phase !== VELA_PHASE.FINAL_GAME && session.phase !== VELA_PHASE.OFFERING)) {
    throw new Error("Tsy ao amin'ny dingana Vela azo faranana ny lalao.");
  }
  if (typeof escaped !== "boolean") {
    throw new TypeError("escaped must be true or false");
  }
  const winner = session.riatraWinner;
  const loser = session.velaPlayer;
  return {
    ...session,
    phase: VELA_PHASE.COMPLETED,
    escaped,
    score: escaped
      ? { [winner]: 5, [loser]: 3 }
      : { [winner]: 8, [loser]: 0 }
  };
}

export function getVelaResultLabel(session) {
  if (!session || session.phase !== VELA_PHASE.COMPLETED) return "Mbola tsy vita";
  return session.escaped ? "Afaka Vela" : "Tsy afaka Vela";
}
