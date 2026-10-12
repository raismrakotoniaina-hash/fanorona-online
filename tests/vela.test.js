import test from "node:test";
import assert from "node:assert/strict";
import {
  createVelaSession, recordOfferTaken, completeVela, getVelaResultLabel, VELA_PHASE
} from "../game/vela.js";
import { initialBoard, countPieces, LIGHT, DARK, indexOf } from "../game/engine.js";
import { createVelaBoard, legalOfferMoves, legalVelaCaptures } from "../game/vela-board.js";

test("manomboka amin'ny dingana fanolorana raha mihoatra ny dimy ny vato", () => {
  const s = createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 9 });
  assert.equal(s.phase, VELA_PHASE.OFFERING);
  assert.equal(s.velaPlayer, "dark");
  assert.equal(s.winnerPieces, 9);
});

test("miova ho dingana faharoa rehefa dimy sisa ny vato", () => {
  let s = createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 7 });
  s = recordOfferTaken(s);
  assert.equal(s.winnerPieces, 6);
  assert.equal(s.phase, VELA_PHASE.OFFERING);
  s = recordOfferTaken(s);
  assert.equal(s.winnerPieces, 5);
  assert.equal(s.phase, VELA_PHASE.FINAL_GAME);
  assert.equal(s.offersTaken, 2);
});

test("raha efa dimy ny vato dia manomboka mivantana ny dingana faharoa", () => {
  const s = createVelaSession({ riatraWinner: "dark", winnerPiecesAfterRiatra: 5 });
  assert.equal(s.phase, VELA_PHASE.FINAL_GAME);
});

test("ny scoring raha afaka Vela dia 5-3", () => {
  const s = completeVela(
    createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 5 }),
    true
  );
  assert.equal(s.phase, VELA_PHASE.COMPLETED);
  assert.deepEqual(s.score, { light: 5, dark: 3 });
  assert.equal(getVelaResultLabel(s), "Afaka Vela");
});

test("ny scoring raha tsy afaka Vela dia 8-0", () => {
  const s = completeVela(
    createVelaSession({ riatraWinner: "dark", winnerPiecesAfterRiatra: 5 }),
    false
  );
  assert.deepEqual(s.score, { dark: 8, light: 0 });
  assert.equal(getVelaResultLabel(s), "Tsy afaka Vela");
});

test("tsy mamela hampiditra vokatra alohan'ny dingana faharoa", () => {
  const s = createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 8 });
  assert.throws(() => completeVela(s, true));
});

test("afaka mifarana ho azy ny Vela raha tapitra ny hetsika amin'ny dingana voalohany", () => {
  const s = createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 8 });
  const result = completeVela(s, true);
  assert.equal(result.phase, VELA_PHASE.COMPLETED);
  assert.deepEqual(result.score, { light: 5, dark: 3 });
});

test("mandà isa vato tsy mety", () => {
  assert.throws(() => createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 4 }));
});


test("Vela starts with the exact standard setup and 22 stones each", () => {
  const expected = initialBoard();
  for (const player of [LIGHT, DARK]) {
    const board = createVelaBoard(player);
    assert.deepEqual(board, expected);
    assert.deepEqual(countPieces(board), { light: 22, dark: 22 });
    assert.equal(board[indexOf(2, 4)], null);
  }
});

test("the Vela opening offer can be captured from the unchanged standard setup", () => {
  const board = createVelaBoard(LIGHT);
  const offers = legalOfferMoves(board, LIGHT, DARK);
  assert.ok(offers.length > 0);
  assert.ok(offers.some(move => move.to === indexOf(2, 4)));
});

test("Vela phase one removes exactly one offered stone even when a line contains more", () => {
  const board = createVelaBoard(LIGHT);
  const offer = legalOfferMoves(board, LIGHT, DARK).find(move => move.to === indexOf(2, 4));
  assert.ok(offer);
  const afterOffer = board.slice();
  afterOffer[offer.to] = LIGHT;
  afterOffer[offer.from] = null;
  const captures = legalVelaCaptures(afterOffer, DARK, offer.to);
  assert.ok(captures.length > 0);
  assert.ok(captures.every(move => move.victims.length === 1 && move.victims[0] === offer.to));
});
