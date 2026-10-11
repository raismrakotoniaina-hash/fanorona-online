import {
  initialBoard, neighbors, legalMoves, applyMove, countPieces,
  opponent, LIGHT, DARK, coordinates
} from "./game/engine.js";

(() => {
  "use strict";
  const boardEl = document.getElementById("game-board");
  const decorBoard = document.getElementById("decor-board");
  const resetButton = document.getElementById("reset-board");
  const message = document.getElementById("board-message");
  const year = document.getElementById("year");
  const ROWS = 5;
  const COLS = 9;
  let board = initialBoard();
  let turn = LIGHT;
  let selected = null;
  let turnContext = null;
  let gameOver = false;

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
      if (selected !== null && legalMoves(board, turn, selected, turnContext).some(m => m.to === i)) node.classList.add("is-legal");
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

  function handlePoint(i) {
    if (gameOver) return;
    if (selected === null) {
      if (board[i] !== turn) {
        setMessage("Anjaran'ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ". Kitiho aloha ny vato anao.");
        return;
      }
      const moves = legalMoves(board, turn, i, turnContext);
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
      const moves = legalMoves(board, turn, i, turnContext);
      if (moves.length) {
        selected = i;
        renderBoard();
        return;
      }
    }

    let options = legalMoves(board, turn, selected, turnContext).filter(m => m.to === i);
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
    board = applyMove(board, move, turn);
    selected = null;

    if (move.capture) {
      const capturedNow = new Set(oldContext ? oldContext.captured : []);
      move.victims.forEach(v => capturedNow.add(v));
      const visited = new Set(oldContext ? oldContext.visited : [movingFrom]);
      visited.add(move.to);
      const continuation = legalMoves(board, turn, move.to, { captured: capturedNow, visited });
      if (continuation.length) {
        turnContext = { captured: capturedNow, visited };
        selected = move.to;
        setMessage("Nahazo vato " + move.victims.length + ". Tsy maintsy manohy maka vato amin'ity lalana ity ianao.");
        renderBoard();
        return;
      }
    }

    turnContext = null;
    const remaining = countPieces(board);
    const nextPlayer = opponent(turn);
    if (remaining[nextPlayer] === 0) {
      gameOver = true;
      setMessage("Tapitra ny lalao! Mandresy ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ".");
      renderBoard();
      return;
    }
    turn = nextPlayer;
    const nextMoves = legalMoves(board, turn, 0);
    if (!nextMoves.length && !board.some(p => p === turn)) {
      gameOver = true;
      setMessage("Tapitra ny lalao: tsy manana vato intsony ny mpilalao manaraka.");
    } else {
      setMessage("Vita ny hetsika. Anjaran'ny vato " + (turn === LIGHT ? "fotsy" : "mainty") + ".");
    }
    renderBoard();
  }

  if (resetButton) resetButton.addEventListener("click", () => {
    board = initialBoard();
    turn = LIGHT;
    selected = null;
    turnContext = null;
    gameOver = false;
    renderBoard();
    setMessage("Lalao vaovao. Anjaran'ny vato fotsy.");
  });

  renderBoard();
  setMessage("Lalao fanazarana. Anjaran'ny vato fotsy. Tsy maintsy maka vato raha misy.");
})();