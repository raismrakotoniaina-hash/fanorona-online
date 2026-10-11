import {
  initialBoard, legalMoves, applyMove, countPieces, allLegalMoves,
  opponent, LIGHT, DARK, coordinates
} from "./game/engine.js";
import {
  createVelaSession, recordOfferTaken, completeVela,
  getVelaResultLabel, VELA_PHASE
} from "./game/vela.js";
import {
  createVelaBoard, legalOfferMoves, legalVelaCaptures, applyVelaOffer, applyVelaCapture
} from "./game/vela-board.js";

(() => {
  "use strict";
  const boardEl = document.getElementById("game-board");
  const decorBoard = document.getElementById("decor-board");
  const resetButton = document.getElementById("reset-board");
  const message = document.getElementById("board-message");
  const year = document.getElementById("year");
  const velaPanel = document.getElementById("vela-panel");
  const velaStatus = document.getElementById("vela-status");
  const velaAction = document.getElementById("vela-action");
  const velaScore = document.getElementById("vela-score");
  const velaOfferButton = document.getElementById("vela-offer-taken");
  const velaEscapedButton = document.getElementById("vela-escaped");
  const velaFailedButton = document.getElementById("vela-failed");
  const ROWS = 5;
  const COLS = 9;
  let board = initialBoard();
  let turn = LIGHT;
  let selected = null;
  let turnContext = null;
  let gameOver = false;
  let velaSession = null;
  let velaOfferedIndex = null;

  if (year) year.textContent = String(new Date().getFullYear());

  function pointLabel(i) {
    const { row, col } = coordinates(i);
    return "Toerana " + (row + 1) + ", " + (col + 1);
  }

  function makeNode(i, decorative) {
    const node = document.createElement(decorative ? "div" : "button");
    const { row, col } = coordinates(i);
    node.className = decorative ? "decor-node" : "board-point";
    node.classList.add((row + col) % 2 === 0 ? "diag-a" : "diag-b");
    if (!decorative) {
      node.type = "button";
      node.setAttribute("aria-label", pointLabel(i) + (board[i] ? ", vato " + (board[i] === LIGHT ? "fotsy" : "mainty") : ", foana"));
      node.setAttribute("aria-pressed", String(selected === i));
      if (selected === i) node.classList.add("is-selected");
      if (selected !== null && availableMoves(selected).some(m => m.to === i)) node.classList.add("is-legal");
      node.addEventListener("click", () => handlePoint(i));
    }
    if (decorative) {
      if (board[i]) node.classList.add(board[i]);
    } else if (board[i]) {
      const stone = document.createElement("span");
      stone.className = "stone stone-" + board[i];
      stone.setAttribute("aria-hidden", "true");
      node.appendChild(stone);
    }
    if (decorative && board[i]) {
      const stone = document.createElement("span");
      stone.classList.add(board[i]);
      node.appendChild(stone);
    }
    return node;
  }

  function availableMoves(from) {
    if (velaSession && velaSession.phase === VELA_PHASE.OFFERING) {
      if (turn === velaSession.riatraWinner) {
        return legalOfferMoves(board, velaSession.riatraWinner, velaSession.velaPlayer).filter(move => move.from === from);
      }
      if (turn === velaSession.velaPlayer && velaOfferedIndex !== null) {
        return legalVelaCaptures(board, velaSession.velaPlayer, velaOfferedIndex).filter(move => move.from === from);
      }
    }
    return legalMoves(board, turn, from, turnContext);
  }

  function renderBoard() {
    if (boardEl) {
      boardEl.replaceChildren();
      for (let i = 0; i < ROWS * COLS; i += 1) boardEl.appendChild(makeNode(i, false));
    }
    if (decorBoard) {
      decorBoard.replaceChildren();
      for (let i = 0; i < ROWS * COLS; i += 1) decorBoard.appendChild(makeNode(i, true));
    }
  }

  function setMessage(text) {
    if (message) message.textContent = text;
  }

  function renderVelaPanel() {
    if (!velaPanel) return;
    velaPanel.hidden = !velaSession;
    if (!velaSession) return;

    if (velaStatus) {
      const phaseLabel = velaSession.phase === VELA_PHASE.OFFERING
        ? "Dingana 1 — fanolorana vato"
        : velaSession.phase === VELA_PHASE.FINAL_GAME
          ? "Dingana 2 — lalao amin'ny vato dimy"
          : "Vela be — vita";
      velaStatus.textContent = phaseLabel;
    }
    if (velaAction) {
      if (velaSession.phase === VELA_PHASE.OFFERING) {
        velaAction.textContent =
          "Mbola " + velaSession.winnerPieces + " ny vaton'ny mpandresy Riatra. " +
          "Ny mpandresy no manolotra vato amin’ny solaitrabe vaovao; tsy maintsy maka ilay vato natolotra ny mpilalao Vela.";
      } else if (velaSession.phase === VELA_PHASE.FINAL_GAME) {
        velaAction.textContent =
          "Vato dimy sisa. Mitohy eo amin’ity solaitrabe ity ny lalao: ny mpandresy Riatra mitady haka ny vato rehetra an’ny Vela.";
      } else {
        velaAction.textContent = getVelaResultLabel(velaSession) + ".";
      }
    }
    if (velaScore) {
      if (velaSession.score) {
        velaScore.textContent =
          "Vokatra: Fotsy " + velaSession.score.light + " — Mainty " + velaSession.score.dark + ".";
      } else {
        velaScore.textContent = "Vokatra tournoi: mbola tsy voafaritra.";
      }
    }
    if (velaOfferButton) velaOfferButton.hidden = true;
    if (velaEscapedButton) velaEscapedButton.hidden = true;
    if (velaFailedButton) velaFailedButton.hidden = true;
  }

  function startVelaAfterRiatra(winner) {
    // Araka ny fitsipika nomen'ny mpikarakara: solaitrabe vaovao, vato feno ho an'ny roa tonta.
    board = createVelaBoard(winner);
    turn = winner;
    selected = null;
    turnContext = null;
    gameOver = false;
    velaOfferedIndex = null;
    velaSession = createVelaSession({
      riatraWinner: winner,
      winnerPiecesAfterRiatra: countPieces(board)[winner]
    });
    renderVelaPanel();
    renderBoard();
    setMessage("Tapitra ny Riatra. Manomboka Vela be amin’ny solaitrabe vaovao: vato feno ho an’ny mpandresy sy ny mpilalao Vela. Anjaran’ny mpandresy ny manolotra vato.");
  }

  function handlePoint(i) {
    if (gameOver) return;
    if (selected === null) {
      if (board[i] !== turn) {
        setMessage("Anjaran'ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ". Kitiho aloha ny vato anao.");
        return;
      }
      const moves = availableMoves(i);
      if (!moves.length) {
        setMessage("Tsy afaka mihetsika io vato io amin'izao fotoana izao.");
        return;
      }
      selected = i;
      setMessage("Safidio ny toerana haleha. Ny fakana vato dia tsy maintsy atao raha misy.");
      renderBoard();
      return;
    }

    if (i === selected) {
      selected = null;
      renderBoard();
      return;
    }

    if (board[i] === turn) {
      const moves = availableMoves(i);
      if (moves.length) {
        selected = i;
        renderBoard();
        return;
      }
    }

    let options = availableMoves(selected).filter(m => m.to === i);
    if (!options.length) {
      setMessage("Tsy ara-dalàna io hetsika io. Safidio ny toerana voamarika.");
      return;
    }

    let move = options[0];
    if (options.length > 1 && options.some(m => m.mode === "approach") && options.some(m => m.mode === "withdrawal")) {
      const chooseApproach = window.confirm("Afaka misafidy fomba roa ianao. OK = fakana avy eo aloha (approach); Cancel = fakana avy ao aoriana (withdrawal).");
      move = options.find(m => m.mode === (chooseApproach ? "approach" : "withdrawal")) || move;
    }
    const movingFrom = selected;
    const oldContext = turnContext;
    selected = null;

    if (velaSession && velaSession.phase === VELA_PHASE.OFFERING) {
      try {
        if (turn === velaSession.riatraWinner) {
          board = applyVelaOffer(board, move, velaSession.riatraWinner, velaSession.velaPlayer);
          velaOfferedIndex = move.to;
          turn = velaSession.velaPlayer;
          setMessage("Vato natolotra. Anjaran’ny Vela ny maka ilay vato voamarika.");
        } else {
          board = applyVelaCapture(board, move, velaSession.velaPlayer, velaOfferedIndex);
          velaSession = recordOfferTaken(velaSession);
          velaOfferedIndex = null;
          if (velaSession.phase === VELA_PHASE.FINAL_GAME) {
            turn = velaSession.riatraWinner;
            setMessage("Vato dimy sisa. Manomboka ny dingana faharoa amin’ny Vela be.");
          } else {
            turn = velaSession.riatraWinner;
            setMessage("Voaray ilay vato natolotra. Anjaran’ny mpandresy ny manolotra indray.");
          }
        }
        turnContext = null;
        renderVelaPanel();
        renderBoard();
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }

    board = applyMove(board, move, turn);

    if (move.capture) {
      const capturedNow = new Set(oldContext ? oldContext.captured : []);
      move.victims.forEach(v => capturedNow.add(v));
      const visited = new Set(oldContext ? oldContext.visited : [movingFrom]);
      visited.add(move.to);
      const fromCoords = coordinates(move.from);
      const toCoords = coordinates(move.to);
      const lastDirection = {
        dr: toCoords.row - fromCoords.row,
        dc: toCoords.col - fromCoords.col
      };
      const nextContext = { captured: capturedNow, visited, lastDirection };
      const continuation = legalMoves(board, turn, move.to, nextContext);
      if (continuation.length) {
        turnContext = nextContext;
        selected = move.to;
        setMessage("Nahazo vato " + move.victims.length + ". Raha manohy ianao dia tsy maintsy miova lalana ary tsy mahazo miverina amin’ny toerana efa nolalovana.");
        renderBoard();
        return;
      }
    }

    turnContext = null;
    const remaining = countPieces(board);
    const nextPlayer = opponent(turn);

    if (velaSession && velaSession.phase === VELA_PHASE.FINAL_GAME) {
      if (remaining[velaSession.riatraWinner] === 0) {
        velaSession = completeVela(velaSession, false);
        gameOver = true;
        setMessage("Tsy afaka Vela: lany ny vato dimy an’ny mpandresy Riatra.");
        renderVelaPanel();
        renderBoard();
        return;
      }
      if (remaining[velaSession.velaPlayer] === 0) {
        velaSession = completeVela(velaSession, true);
        gameOver = true;
        setMessage("Afaka Vela: voafaka ny vato rehetra an’ny mpilalao Vela.");
        renderVelaPanel();
        renderBoard();
        return;
      }
      turn = nextPlayer;
      if (!allLegalMoves(board, turn).length) {
        const escaped = turn === velaSession.riatraWinner;
        velaSession = completeVela(velaSession, escaped);
        gameOver = true;
        setMessage(escaped ? "Afaka Vela: tsy manana hetsika ara-dalàna ny mpilalao Vela." : "Tsy afaka Vela: tsy afaka mihetsika ny mpandresy Riatra.");
        renderVelaPanel();
        renderBoard();
        return;
      }
      setMessage("Dingana faharoa Vela be. Anjaran’ny " + (turn === LIGHT ? "vato fotsy" : "vato mainty") + ".");
      renderBoard();
      return;
    }

    if (remaining[nextPlayer] === 0) {
      gameOver = true;
      setMessage("Tapitra ny Riatra! Mandresy ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ".");
      startVelaAfterRiatra(turn);
      renderBoard();
      return;
    }
    turn = nextPlayer;
    const nextMoves = allLegalMoves(board, turn);
    if (!nextMoves.length) {
      gameOver = true;
      setMessage("Tapitra ny Riatra: tsy manana hetsika ara-dalàna ny mpilalao manaraka.");
      startVelaAfterRiatra(turn);
    } else {
      setMessage("Vita ny hetsika. Anjaran'ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ".");
    }
    renderBoard();
  }

  if (velaOfferButton) velaOfferButton.addEventListener("click", () => {
    return; // Ny dingana Vela dia mandroso amin’ny hetsika tena izy eo amin’ny solaitrabe.
  });

  if (velaEscapedButton) velaEscapedButton.addEventListener("click", () => {
    if (!velaSession || velaSession.phase !== VELA_PHASE.FINAL_GAME) return;
    return; // Ny vokatra dia faritan’ny lalao eo amin’ny solaitrabe.
  });

  if (velaFailedButton) velaFailedButton.addEventListener("click", () => {
    if (!velaSession || velaSession.phase !== VELA_PHASE.FINAL_GAME) return;
    return; // Ny vokatra dia faritan’ny lalao eo amin’ny solaitrabe.
  });

  if (resetButton) resetButton.addEventListener("click", () => {
    board = initialBoard();
    turn = LIGHT;
    selected = null;
    turnContext = null;
    gameOver = false;
    velaSession = null;
    velaOfferedIndex = null;
    renderVelaPanel();
    renderBoard();
    setMessage("Lalao vaovao. Anjaran'ny vato fotsy.");
  });

  renderBoard();
  renderVelaPanel();
  setMessage("Lalao fanazarana. Anjaran'ny vato fotsy. Tsy maintsy maka vato raha misy.");
})();
