import test from "node:test";
import assert from "node:assert/strict";
import {
  createVelaSession, recordOfferTaken, completeVela, getVelaResultLabel, VELA_PHASE
} from "../game/vela.js";

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

test("mandà isa vato tsy mety", () => {
  assert.throws(() => createVelaSession({ riatraWinner: "light", winnerPiecesAfterRiatra: 4 }));
});
