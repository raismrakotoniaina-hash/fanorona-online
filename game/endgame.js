import { allLegalMoves } from "./engine.js";

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

export function recordEndgamePosition(tracker, board, nextPlayer, capturedThisTurn, phase = "riatra") {
  tracker.quietTurns = capturedThisTurn ? 0 : tracker.quietTurns + 1;
  const key = positionKey(board, nextPlayer);
  const occurrences = (tracker.positions.get(key) || 0) + 1;
  tracker.positions.set(key, occurrences);

  const counts = board.reduce((result, piece) => {
    if (piece) result[piece] += 1;
    return result;
  }, { light: 0, dark: 0 });

  // Riatra: amin'ny toe-javatra 1 manoloana 5 dia ajanona avy hatrany,
  // satria tsy tohizana amin'ny fifamezivezena tsy misy fiafarana ilay lalao.
  const low = Math.min(counts.light, counts.dark);
  const high = Math.max(counts.light, counts.dark);
  if (phase === "riatra" && low === 1 && high === 5) return { reason: "one-vs-five", counts };

  // Tsy mamarana lalao amin'ny isan'ny vato fotsiny: ny toerana sy ny
  // fiverimberenan'ny lalao no jerena, mba tsy hampitsahatra 3-4 na 5-3 an-jambany.
  // Vela be, dingana faharoa: rehefa vato 3 sy 2 sisa no tavela,
  // raisina ho sahala ny Vela; tsy ampiharina amin'ny Riatra ny fepetra isa 3-2.
  if (phase === "vela" && low === 2 && high === 3) return { reason: "vela-three-vs-two", counts };

  if (occurrences >= REPETITION_LIMIT) return { reason: "repetition", counts };
  if (tracker.quietTurns >= MAX_QUIET_TURNS) return { reason: "no-capture-limit", counts };
  return null;
}

export const DEFAULT_PLAYER_TIME_MS = 120000;

export function createMatchClock(initialMs = DEFAULT_PLAYER_TIME_MS) {
  return { remaining: { light: initialMs, dark: initialMs }, activePlayer: null, startedAt: null, running: false };
}

export function startClockTurn(clock, player, now = Date.now()) {
  clock.activePlayer = player;
  clock.startedAt = now;
  clock.running = true;
  return clock;
}

export function getClockRemaining(clock, player, now = Date.now()) {
  const stored = clock.remaining[player];
  if (!clock.running || clock.activePlayer !== player || clock.startedAt === null) return stored;
  return Math.max(0, stored - (now - clock.startedAt));
}

export function stopClockTurn(clock, now = Date.now()) {
  if (!clock.running || clock.activePlayer === null || clock.startedAt === null) {
    return { player: clock.activePlayer, expired: false, remainingMs: null };
  }
  const player = clock.activePlayer;
  const remainingMs = getClockRemaining(clock, player, now);
  clock.remaining[player] = remainingMs;
  clock.running = false;
  clock.startedAt = null;
  return { player, expired: remainingMs <= 0, remainingMs };
}

export function formatClock(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}
