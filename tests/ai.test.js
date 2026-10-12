import test from "node:test";
import assert from "node:assert/strict";
import { chooseAiMove } from "../game/ai.js";
import { initialBoard, allLegalMoves, legalMoves, applyMove, LIGHT, DARK, indexOf } from "../game/engine.js";

test("AI chooses a legal move from the standard opening board", () => {
  const board = initialBoard();
  const move = chooseAiMove(board, LIGHT, null, 1);
  assert.ok(move);
  assert.ok(allLegalMoves(board, LIGHT).some(candidate =>
    candidate.from === move.from && candidate.to === move.to &&
    candidate.mode === move.mode && candidate.capture === move.capture
  ));
});

test("AI prioritizes a legal capture when one is mandatory", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 1)] = LIGHT;
  board[indexOf(2, 3)] = DARK;
  board[indexOf(0, 0)] = LIGHT;
  const move = chooseAiMove(board, LIGHT, null, 1);
  assert.ok(move);
  assert.equal(move.capture, true);
  assert.ok(legalMoves(board, LIGHT, move.from).some(candidate =>
    candidate.to === move.to && candidate.mode === move.mode && candidate.capture
  ));
});
