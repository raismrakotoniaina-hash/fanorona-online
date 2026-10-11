import test from "node:test";
import assert from "node:assert/strict";
import { LIGHT, DARK, indexOf, countPieces } from "../game/engine.js";
import {
  createVelaBoard, legalOfferMoves, legalVelaCaptures, applyVelaOffer, applyVelaCapture
} from "../game/vela-board.js";

function offerPosition() {
  const board = Array(45).fill(null);
  board[indexOf(2, 2)] = LIGHT;
  board[indexOf(2, 1)] = DARK;
  return board;
}

test("manolotra vato amin'ny hetsika tsy maka izay ahafahan'ny Vela maka azy", () => {
  const board = offerPosition();
  const offers = legalOfferMoves(board, LIGHT, DARK);
  assert.ok(offers.some(move => move.from === indexOf(2, 2) && move.to === indexOf(2, 3)));
});

test("ny hetsika fanolorana dia tsy tokony hanaisotra vato", () => {
  const board = offerPosition();
  const move = legalOfferMoves(board, LIGHT, DARK)
    .find(candidate => candidate.from === indexOf(2, 2) && candidate.to === indexOf(2, 3));
  assert.ok(move);
  const next = applyVelaOffer(board, move, LIGHT, DARK);
  assert.equal(countPieces(next).light, 1);
  assert.equal(countPieces(next).dark, 1);
  assert.equal(next[indexOf(2, 3)], LIGHT);
});

test("tsy ekena ny fanolorana raha tsy afaka maka ilay vato ny Vela", () => {
  const board = Array(45).fill(null);
  board[indexOf(0, 0)] = LIGHT;
  board[indexOf(4, 8)] = DARK;
  const move = { from: indexOf(0, 0), to: indexOf(0, 1), capture: false, mode: null, victims: [] };
  assert.throws(() => applyVelaOffer(board, move, LIGHT, DARK));
});

test("ny Vela dia mahazo ny fakana izay tena manala ilay vato natolotra", () => {
  const board = offerPosition();
  const offer = legalOfferMoves(board, LIGHT, DARK)
    .find(move => move.from === indexOf(2, 2) && move.to === indexOf(2, 3));
  assert.ok(offer);
  const afterOffer = applyVelaOffer(board, offer, LIGHT, DARK);
  const captures = legalVelaCaptures(afterOffer, DARK, indexOf(2, 3));
  assert.ok(captures.length > 0);
  const afterCapture = applyVelaCapture(afterOffer, captures[0], DARK, indexOf(2, 3));
  assert.equal(afterCapture[indexOf(2, 3)], null);
  assert.equal(countPieces(afterCapture).light, 0);
});

test("mandà fakana tsy manala ilay vato natolotra", () => {
  const board = offerPosition();
  const offer = legalOfferMoves(board, LIGHT, DARK)
    .find(move => move.from === indexOf(2, 2) && move.to === indexOf(2, 3));
  const afterOffer = applyVelaOffer(board, offer, LIGHT, DARK);
  const unrelated = { from: indexOf(2, 1), to: indexOf(1, 1), capture: false, mode: null, victims: [] };
  assert.throws(() => applyVelaCapture(afterOffer, unrelated, DARK, indexOf(2, 3)));
});


test("misy fanolorana ara-dalàna amin'ny solaitrabe Vela vaovao ho an'ny mpandresy tsirairay", () => {
  for (const offerPlayer of [LIGHT, DARK]) {
    const board = createVelaBoard(offerPlayer);
    assert.equal(countPieces(board).light, 22);
    assert.equal(countPieces(board).dark, 22);
    assert.ok(legalOfferMoves(board, offerPlayer, offerPlayer === LIGHT ? DARK : LIGHT).length > 0);
  }
});

test("Vela offer remains legal when the offered stone is first in a multi-stone capture line", () => {
  const board = Array(45).fill(null);
  board[indexOf(2, 2)] = LIGHT;
  board[indexOf(2, 1)] = DARK;
  board[indexOf(2, 0)] = DARK;
  const offer = legalOfferMoves(board, LIGHT, DARK)
    .find(move => move.from === indexOf(2, 2) && move.to === indexOf(2, 3));
  assert.ok(offer, "the offered stone can be captured even though another stone is behind it");
  const afterOffer = applyVelaOffer(board, offer, LIGHT, DARK);
  const captures = legalVelaCaptures(afterOffer, DARK, indexOf(2, 3));
  assert.ok(captures.some(move => move.mode === "withdrawal"));
  assert.ok(captures.every(move => move.victims.length === 1 && move.victims[0] === indexOf(2, 3)));
});
