import test from "node:test";
import assert from "node:assert/strict";
import {
  createEndgameTracker, resetEndgameTracker, recordEndgamePosition,
  MAX_QUIET_TURNS
} from "../game/endgame.js";
import { LIGHT, DARK } from "../game/engine.js";

test("draw automatique si ny vato sisa dia telo sy roa", () => {
  const board = Array(45).fill(null);
  board[0] = LIGHT;
  board[2] = LIGHT;
  board[4] = LIGHT;
  board[40] = DARK;
  board[42] = DARK;
  const tracker = createEndgameTracker();
  resetEndgameTracker(tracker, board, LIGHT);
  const result = recordEndgamePosition(tracker, board, LIGHT, false);
  assert.equal(result.reason, "low-material");
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
