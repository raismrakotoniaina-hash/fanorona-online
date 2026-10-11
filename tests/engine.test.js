import test from "node:test";
import assert from "node:assert/strict";
import {
  initialBoard, countPieces, neighbors, legalMoves, applyMove,
  LIGHT, DARK, indexOf, allLegalMoves
} from "../game/engine.js";

test("position initiale : 45 points et 22 pierres par joueur", () => {
  const board = initialBoard();
  assert.equal(board.length, 45);
  assert.deepEqual(countPieces(board), { light: 22, dark: 22 });
  assert.equal(board[indexOf(2, 4)], null);
});

test("les déplacements orthogonaux restent disponibles sur les bords", () => {
  const n = neighbors(indexOf(0, 0)).map(x => x.index);
  assert.deepEqual(n.sort((a, b) => a - b), [1, 9, 10]);
});

test("un déplacement simple déplace la pierre sans en créer", () => {
  const board = Array(45).fill(null);
  board[indexOf(0, 0)] = LIGHT;
  const move = legalMoves(board, LIGHT, indexOf(0, 0)).find(m => m.to === indexOf(0, 1));
  assert.ok(move);
  const next = applyMove(board, move, LIGHT);
  assert.equal(next[indexOf(0, 0)], null);
  assert.equal(next[indexOf(0, 1)], LIGHT);
  assert.equal(countPieces(next).light, 1);
});

test("la prise par approche est détectée", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 1)] = LIGHT;
  board[indexOf(2, 3)] = DARK;
  const moves = legalMoves(board, LIGHT, indexOf(2, 1));
  const move = moves.find(m => m.to === indexOf(2, 2) && m.mode === "approach");
  assert.ok(move);
  assert.deepEqual(move.victims, [indexOf(2, 3)]);
  const next = applyMove(board, move, LIGHT);
  assert.equal(next[indexOf(2, 3)], null);
});

test("tsy mamela hetsika tsotra raha misy fakana vato", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 1)] = LIGHT;
  board[indexOf(2, 3)] = DARK;
  board[indexOf(0, 0)] = LIGHT;
  const moves = allLegalMoves(board, LIGHT);
  assert.ok(moves.length > 0);
  assert.ok(moves.every(m => m.capture));
});
