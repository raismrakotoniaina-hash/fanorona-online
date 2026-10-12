import test from "node:test";
import assert from "node:assert/strict";
import {
  createEndgameTracker, resetEndgameTracker, recordEndgamePosition,
  MAX_QUIET_TURNS, createMatchClock, startClockTurn, getClockRemaining, stopClockTurn, formatClock
} from "../game/endgame.js";
import { LIGHT, DARK } from "../game/engine.js";

test("tsy manambara sahala amin'ny isan'ny vato fotsiny", () => {
  const board = Array(45).fill(null);
  board[0] = LIGHT;
  board[2] = LIGHT;
  board[4] = LIGHT;
  board[40] = DARK;
  board[42] = DARK;
  const tracker = createEndgameTracker();
  resetEndgameTracker(tracker, board, LIGHT);
  assert.equal(recordEndgamePosition(tracker, board, LIGHT, false), null);
});

test("draw automatique rehefa miverina in-telo ny position miaraka amin'ny anjaran'ny mpilalao", () => {
  const board = Array(45).fill(null);
  board[0] = LIGHT;
  board[44] = DARK;
  const tracker = createEndgameTracker();
  resetEndgameTracker(tracker, board, LIGHT);
  assert.equal(recordEndgamePosition(tracker, board, DARK, false), null);
  assert.equal(recordEndgamePosition(tracker, board, LIGHT, false), null);
  assert.equal(recordEndgamePosition(tracker, board, LIGHT, false).reason, "repetition");
});

test("miverina aotra ny counter rehefa misy fakana vato", () => {
  const board = Array(45).fill(null);
  board[0] = LIGHT;
  board[44] = DARK;
  const tracker = createEndgameTracker();
  resetEndgameTracker(tracker, board, LIGHT);
  for (let i = 0; i < MAX_QUIET_TURNS - 1; i += 1) {
    recordEndgamePosition(tracker, board, i % 2 ? LIGHT : DARK, false);
  }
  recordEndgamePosition(tracker, board, LIGHT, true);
  assert.equal(tracker.quietTurns, 0);
});

test("manome 2 minitra isaky ny mpilalao ary mampihena ny fotoanan'ny anjarany", () => {
  const clock = createMatchClock();
  startClockTurn(clock, LIGHT, 1000);
  assert.equal(getClockRemaining(clock, LIGHT, 31000), 90000);
  const stopped = stopClockTurn(clock, 31000);
  assert.equal(stopped.expired, false);
  assert.equal(clock.remaining.light, 90000);
  assert.equal(clock.remaining.dark, 120000);
  assert.equal(formatClock(90000), "01:30");
});

test("lazaina fa lany fotoana rehefa tonga aotra", () => {
  const clock = createMatchClock();
  startClockTurn(clock, DARK, 1000);
  assert.equal(stopClockTurn(clock, 121000).expired, true);
});
