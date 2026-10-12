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
  const stopCaptureButton = document.getElementById("stop-capture");
  const message = document.getElementById("board-message");
  const year = document.getElementById("year");
  const velaPanel = document.getElementById("vela-panel");
  const velaStatus = document.getElementById("vela-status");
  const velaAction = document.getElementById("vela-action");
  const velaScore = document.getElementById("vela-score");
  const velaOfferButton = document.getElementById("vela-offer-taken");
  const velaEscapedButton = document.getElementById("vela-escaped");
  const velaFailedButton = document.getElementById("vela-failed");
  const boardKicker = document.querySelector(".board-kicker");
  const boardHeading = document.querySelector(".board-head h3");
  const riatraTimer = document.getElementById("riatra-timer");
  const moveChoice = document.createElement("div");
  moveChoice.className = "move-choice";
  moveChoice.hidden = true;
  moveChoice.style.pointerEvents = "none";
  moveChoice.setAttribute("role", "group");
  moveChoice.setAttribute("aria-label", "Safidio ny lalana fakana vato");
  // Apetraho eo ambanin’ny solaitrabe ny safidy sy ny bokotra famaranana,
  // mba ho hita avy hatrany amin’ny finday fa tsy miafina ao amin’ny sidebar.
  const boardPanel = boardEl ? boardEl.closest(".board-panel") : null;
  const boardLegend = boardPanel ? boardPanel.querySelector(".board-legend") : null;
  if (boardLegend) {
    boardLegend.insertAdjacentElement("afterend", moveChoice);
    if (stopCaptureButton) moveChoice.insertAdjacentElement("afterend", stopCaptureButton);
  } else if (message) {
    message.insertAdjacentElement("afterend", moveChoice);
  }
  const ROWS = 5;
  const COLS = 9;
  let board = initialBoard();
  let turn = LIGHT;
  let selected = null;
  let turnContext = null;
  let gameOver = false;
  let velaSession = null;
  let velaOfferedIndex = null;
  let riatraDeadline = null;
  let riatraTimerInterval = null;

  if (year) year.textContent = String(new Date().getFullYear());

  function stopRiatraTimer() {
    if (riatraTimerInterval !== null) {
      clearInterval(riatraTimerInterval);
      riatraTimerInterval = null;
    }
    riatraDeadline = null;
    if (riatraTimer) riatraTimer.hidden = true;
  }

  function updateRiatraTimer() {
    if (riatraDeadline === null || gameOver || velaSession) return;
    const secondsLeft = Math.max(0, Math.ceil((riatraDeadline - Date.now()) / 1000));
    if (riatraTimer) {
      const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
      const seconds = String(secondsLeft % 60).padStart(2, "0");
      riatraTimer.textContent = "Fotoana sisa amin’ny Riatra: " + minutes + ":" + seconds;
      riatraTimer.hidden = false;
    }
    if (secondsLeft === 0) {
      stopRiatraTimer();
      gameOver = true;
      selected = null;
      turnContext = null;
      hideMoveChoice();
      if (stopCaptureButton) stopCaptureButton.hidden = true;
      setMessage("TAPITRA NY FOTOANA — SAHALA NY RIATRA! Isa 2 avy: Fotsy 2 — Mainty 2. Tsy averina ny lalao ary tsy misy Vela.");
      renderBoard();
    }
  }

  function startRiatraTimerIfNeeded() {
    if (velaSession || gameOver || riatraDeadline !== null) return;
    const pieces = countPieces(board);
    if (pieces.light > 5 || pieces.dark > 5) return;
    riatraDeadline = Date.now() + 5 * 60 * 1000;
    if (riatraTimer) riatraTimer.hidden = false;
    updateRiatraTimer();
    riatraTimerInterval = setInterval(updateRiatraTimer, 250);
    setMessage("Vitsy vato sisa amin’ny Riatra. Nanomboka ny compte à rebours 5 minitra; raha tapitra dia sahala ary isa 2 avy.");
  }

  function pointLabel(i) {
    const { row, col } = coordinates(i);
    return "Toerana " + (row + 1) + ", " + (col + 1);
  }

  function makeNode(i, decorative) {
    const node = document.createElement(decorative ? "div" : "button");
    const { row, col } = coordinates(i);
    node.className = decorative ? "decor-node" : "board-point";
    if ((row + col) % 2 === 0) node.classList.add("diag-strong");
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
    if (boardKicker) boardKicker.textContent = velaSession ? "VELA" : "FANORONA RIATRA";
    if (boardHeading) boardHeading.textContent = velaSession ? "Vela be" : "Lalao fanazarana";
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
    stopRiatraTimer();
    // Vela dia manomboka amin’ilay filaharana fanombohana mahazatra, vato 22 avy.
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

  function completeTurn() {
    selected = null;
    turnContext = null;
    if (stopCaptureButton) stopCaptureButton.hidden = true;
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
    stopRiatraTimer();
    gameOver = true;
    setMessage("Tapitra ny Riatra! Mandresy ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ".");
    startVelaAfterRiatra(turn);
    renderBoard();
    return;
  }
  turn = nextPlayer;
  const nextMoves = allLegalMoves(board, turn);
  if (!nextMoves.length) {
    const otherPlayer = opponent(turn);
    const otherMoves = allLegalMoves(board, otherPlayer);
    if (!otherMoves.length) {
      // Sahala amin'ny Riatra: samy tsy manana hetsika ara-dalàna ny roa tonta.
      gameOver = true;
      selected = null;
      turnContext = null;
      renderVelaPanel();
      setMessage("SAHALA NY RIATRA! Samy tsy manana hetsika ara-dalàna ny mpilalao roa. Isa 2 avy: Fotsy 2 — Mainty 2. Tsy misy Vela amin'ity lalao ity satria tsy nisy mpandresy tamin'ny Riatra.");
    } else {
      // Raha ny mpilalao tokony hilalao no tsy afaka mihetsika, mandresy ny mpifanandrina aminy.
      gameOver = true;
      setMessage("Tapitra ny Riatra: tsy afaka mihetsika ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ". Mandresy ny vato " + (otherPlayer === LIGHT ? "fotsy" : "mainty") + ".");
      startVelaAfterRiatra(otherPlayer);
    }
  } else {
    startRiatraTimerIfNeeded();
    if (riatraDeadline === null) {
      setMessage("Vita ny hetsika. Anjaran'ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ".");
    }
  }
  renderBoard();
  }

  function hideMoveChoice() {
    moveChoice.hidden = true;
    moveChoice.style.pointerEvents = "none";
    moveChoice.replaceChildren();
  }

  function showMoveChoice(options) {
    moveChoice.replaceChildren();
    moveChoice.hidden = false;
    moveChoice.style.pointerEvents = "auto";
    const title = document.createElement("p");
    title.textContent = "Safidio ny fomba fakana amin’ity toerana ity:";
    moveChoice.appendChild(title);
    options.forEach((move, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-outline";
      button.dataset.captureMode = move.mode || "";
      button.textContent = move.mode === "approach"
        ? "Fakana avy eo aloha (" + move.victims.length + " vato)"
        : move.mode === "withdrawal"
          ? "Fakana avy ao aoriana (" + move.victims.length + " vato)"
          : "Lalana " + (index + 1);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        commitMove(move);
      });
      moveChoice.appendChild(button);
    });
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "button button-quiet";
    cancel.textContent = "Aoka aloha";
    cancel.addEventListener("click", hideMoveChoice);
    moveChoice.appendChild(cancel);
    moveChoice.setAttribute("aria-live", "polite");
    const firstChoice = moveChoice.querySelector("button");
    if (firstChoice) {
      firstChoice.focus({ preventScroll: true });
      moveChoice.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function commitMove(move) {
    if (gameOver) {
      hideMoveChoice();
      return;
    }
    hideMoveChoice();
    const movingFrom = move.from;
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

        // Vela be dingana voalohany: tsy avela hijanona tsy misy valiny ny solaitrabe.
        // Raha tsy afaka maka ilay vato natolotra ny mpilalao Vela, tsy afaka izy.
        if (velaSession.phase === VELA_PHASE.OFFERING &&
            turn === velaSession.velaPlayer &&
            velaOfferedIndex !== null &&
            legalVelaCaptures(board, velaSession.velaPlayer, velaOfferedIndex).length === 0) {
          velaSession = completeVela(velaSession, false);
          gameOver = true;
          velaOfferedIndex = null;
          setMessage("TAPITRA NY VELA BE: tsy afaka naka ilay vato natolotra ny mpilalao Vela. Vokatra 8–0.");
        }

        // Rehefa avy naka ny vato natolotra ny mpilalao Vela, raha tsy misy
        // fanolorana ara-dalàna intsony, dia tapitra ho azy ny dingana voalohany.
        if (velaSession.phase === VELA_PHASE.OFFERING &&
            turn === velaSession.riatraWinner &&
            legalOfferMoves(board, velaSession.riatraWinner, velaSession.velaPlayer).length === 0) {
          velaSession = completeVela(velaSession, true);
          gameOver = true;
          velaOfferedIndex = null;
          setMessage("TAPITRA NY VELA BE: tsy misy fanolorana ara-dalàna intsony. Afaka Vela ny mpilalao. Vokatra 5–3.");
        }

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
      const nextContext = { captured: capturedNow, visited, lastDirection, piece: move.to };
      const continuation = legalMoves(board, turn, move.to, nextContext);
      if (continuation.length) {
        turnContext = nextContext;
        selected = move.to;
        if (stopCaptureButton) stopCaptureButton.hidden = false;
        setMessage("Nahazo vato " + move.victims.length + ". Afaka manohy maka amin’ny lalana hafa ianao, na manindry “Atsaharo ny fakana” hamaranana ny anjaranao.");
        renderBoard();
        return;
      }
    }

    completeTurn();
  }

  function handlePoint(i) {
    if (gameOver || !moveChoice.hidden) return;
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
      if (turnContext) {
        setMessage("Mbola misy fakana mitohy. Ampiasao ny bokotra “Atsaharo ny fakana” raha te hamarana ny anjaranao ianao.");
      } else {
        selected = null;
      }
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

    if (options.length > 1) {
      showMoveChoice(options);
      return;
    }
    commitMove(options[0]);
  }

  if (stopCaptureButton) stopCaptureButton.addEventListener("click", (event) => {
    event.preventDefault();
    if (!turnContext || gameOver) return;
    // Ny fakana voalohany dia tsy maintsy atao; rehefa tonga eto kosa,
    // dia safidin’ny mpilalao ny tsy hanohy intsony ny fakana mitohy.
    hideMoveChoice();
    selected = null;
    turnContext = null;
    stopCaptureButton.hidden = true;
    completeTurn();
    renderBoard();
  });

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
    hideMoveChoice();
    board = initialBoard();
    turn = LIGHT;
    selected = null;
    turnContext = null;
    if (stopCaptureButton) stopCaptureButton.hidden = true;
    gameOver = false;
    stopRiatraTimer();
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
