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

test("la rangée centrale alterne les couleurs de part et d'autre du centre vide", () => {
  const board = initialBoard();
  assert.deepEqual(
    Array.from({ length: 9 }, (_, col) => board[indexOf(2, col)]),
    [DARK, LIGHT, DARK, LIGHT, null, DARK, LIGHT, DARK, LIGHT]
  );
  assert.equal(countPieces(board).light, 22);
  assert.equal(countPieces(board).dark, 22);
});

test("les déplacements orthogonaux restent disponibles sur les bords", () => {
  const n = neighbors(indexOf(0, 0)).map(x => x.index);
  assert.deepEqual(n.sort((a, b) => a - b), [1, 9, 10]);
});

test("les diagonales ne sont légales que depuis les intersections fortes", () => {
  const board = Array(45).fill(null);
  board[indexOf(1, 1)] = LIGHT; // weak point: diagonals not drawn
  assert.equal(legalMoves(board, LIGHT, indexOf(1, 1)).some(m => m.to === indexOf(0, 0)), false);
  board.fill(null);
  board[indexOf(1, 2)] = LIGHT; // strong point: diagonal is drawn
  assert.ok(legalMoves(board, LIGHT, indexOf(1, 2)).some(m => m.to === indexOf(0, 1)));
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

test("la prise par retrait est détectée", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 2)] = LIGHT;
  board[indexOf(2, 1)] = DARK;
  const moves = legalMoves(board, LIGHT, indexOf(2, 2));
  const move = moves.find(m => m.to === indexOf(2, 3) && m.mode === "withdrawal");
  assert.ok(move);
  assert.deepEqual(move.victims, [indexOf(2, 1)]);
});

test("une prise continue ne peut pas répéter immédiatement la même direction", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 1)] = LIGHT;
  board[indexOf(2, 3)] = DARK;
  board[indexOf(2, 4)] = DARK;
  board[indexOf(1, 2)] = DARK;

  const first = legalMoves(board, LIGHT, indexOf(2, 1))
    .find(m => m.to === indexOf(2, 2) && m.mode === "approach");
  assert.ok(first);
  const afterFirst = applyMove(board, first, LIGHT);
  const context = {
    captured: new Set(first.victims),
    visited: new Set([first.from, first.to]),
    lastDirection: { dr: 0, dc: 1 }
  };
  const next = legalMoves(afterFirst, LIGHT, first.to, context);

  assert.equal(next.some(m => m.to === indexOf(2, 3)), false);
  assert.ok(next.some(m => m.to === indexOf(3, 2) && m.mode === "withdrawal"));
});

test("une prise par retrait capture la ligne derrière la position de départ", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 2)] = LIGHT;
  board[indexOf(2, 1)] = DARK;
  board[indexOf(2, 0)] = DARK;
  const move = legalMoves(board, LIGHT, indexOf(2, 2))
    .find(m => m.to === indexOf(2, 3) && m.mode === "withdrawal");
  assert.ok(move);
  assert.deepEqual(move.victims, [indexOf(2, 1), indexOf(2, 0)]);
});

test("une chaîne de prises doit continuer avec le même pion", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 1)] = LIGHT;
  board[indexOf(2, 3)] = DARK;
  board[indexOf(1, 2)] = DARK;
  const first = legalMoves(board, LIGHT, indexOf(2, 1))
    .find(m => m.to === indexOf(2, 2) && m.mode === "approach");
  assert.ok(first);
  const after = applyMove(board, first, LIGHT);
  const context = {
    captured: new Set(first.victims),
    visited: new Set([first.from, first.to]),
    lastDirection: { dr: 0, dc: 1 },
    piece: first.to
  };
  assert.deepEqual(legalMoves(after, LIGHT, indexOf(0, 0), context), []);
});

test("une pièce ne peut pas aller sur une position occupée", () => {
  const board = Array(45).fill(null);
  board[indexOf(1, 1)] = LIGHT;
  board[indexOf(1, 2)] = DARK;
  assert.equal(legalMoves(board, LIGHT, indexOf(1, 1)).some(m => m.to === indexOf(1, 2)), false);
});
