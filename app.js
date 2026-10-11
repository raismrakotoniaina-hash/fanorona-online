(() => {
  "use strict";

  const ROWS = 5;
  const COLS = 9;
  const board = document.getElementById("game-board");
  const decorBoard = document.getElementById("decor-board");
  const resetButton = document.getElementById("reset-board");
  const message = document.getElementById("board-message");
  const year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  // Santatra hita maso ihany: mbola tsy manatanteraka na manamarina hetsika.
  function initialStone(row, col) {
    if (row < 2) return "light";
    if (row > 2) return "dark";
    if (row === 2 && col === 4) return null;
    return col % 2 === 0 ? "dark" : "light";
  }

  function makeNode(row, col, decorative) {
    const node = document.createElement("div");
    node.className = decorative ? "decor-node" : "board-point";
    node.classList.add((row + col) % 2 === 0 ? "diag-a" : "diag-b");

    const stoneColor = initialStone(row, col);
    if (decorative && stoneColor) node.classList.add(stoneColor);
    if (stoneColor) {
      const stone = document.createElement("span");
      if (!decorative) {
        stone.className = "stone stone-" + stoneColor;
        stone.setAttribute("aria-hidden", "true");
      } else {
        stone.classList.add(stoneColor);
      }
      node.appendChild(stone);
    }

    if (!decorative) {
      const stoneLabel = stoneColor ? ", vato " + (stoneColor === "light" ? "fotsy" : "mainty") : ", foana";
      node.setAttribute("aria-label", "Toerana " + (row + 1) + ", " + (col + 1) + stoneLabel);
      node.title = "Laharana " + (row + 1) + ", tsanganana " + (col + 1);
    }
    return node;
  }

  function renderBoard() {
    if (board) {
      board.replaceChildren();
      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          board.appendChild(makeNode(row, col, false));
        }
      }
    }

    if (decorBoard) {
      decorBoard.replaceChildren();
      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          decorBoard.appendChild(makeNode(row, col, true));
        }
      }
    }
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      renderBoard();
      if (message) message.textContent = "Naverina amin'ny endrika santatra ny solaitrabe. Mbola tsy mandeha ny hetsika.";
    });
  }

  renderBoard();
})();
