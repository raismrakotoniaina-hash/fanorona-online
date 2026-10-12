import {
  allLegalMoves, legalMoves, applyMove, countPieces, opponent, LIGHT, DARK, coordinates
} from "./engine.js";

function nextContext(board, move, context) {
  const captured = new Set(context ? context.captured : []);
  for (const victim of move.victims || []) captured.add(victim);
  const visited = new Set(context ? context.visited : [move.from]);
  visited.add(move.to);
  const from = coordinates(move.from);
  const to = coordinates(move.to);
  return {
    captured,
    visited,
    lastDirection: { dr: to.row - from.row, dc: to.col - from.col },
    piece: move.to
  };
}

function scoreBoard(board, perspective) {
  const counts = countPieces(board);
  const material = (counts[perspective] - counts[opponent(perspective)]) * 120;
  const mine = allLegalMoves(board, perspective).length;
  const theirs = allLegalMoves(board, opponent(perspective)).length;
  let centrality = 0;
  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) continue;
    const { row, col } = coordinates(i);
    const value = 4 - Math.abs(2 - row) + 4 - Math.abs(4 - col);
    centrality += board[i] === perspective ? value : -value;
  }
  return material + (mine - theirs) * 2 + centrality;
}

function movesFor(board, player, context) {
  if (context) return legalMoves(board, player, context.piece, context);
  return allLegalMoves(board, player);
}

function search(board, player, context, depth, perspective, alpha, beta) {
  const moves = movesFor(board, player, context);
  if (!moves.length) {
    if (context) return search(board, opponent(player), null, depth - 1, perspective, alpha, beta);
    return player === perspective ? -100000 - depth : 100000 + depth;
  }
  if (depth <= 0 && !context) return scoreBoard(board, perspective);

  const maximizing = player === perspective;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const nextBoard = applyMove(board, move, player);
    const nextCaptureContext = move.capture ? nextContext(nextBoard, move, context) : null;
    const continuation = move.capture && legalMoves(nextBoard, player, move.to, nextCaptureContext).length > 0;
    const nextPlayer = continuation ? player : opponent(player);
    const nextContextValue = continuation ? nextCaptureContext : null;
    const nextDepth = continuation ? depth : depth - 1;
    const value = search(nextBoard, nextPlayer, nextContextValue, nextDepth, perspective, alpha, beta);
    if (maximizing) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

export function chooseAiMove(board, player, context = null, depth = 2) {
  const moves = movesFor(board, player, context);
  if (!moves.length) return null;
  let bestMove = moves[0];
  let bestScore = -Infinity;
  for (const move of moves) {
    const nextBoard = applyMove(board, move, player);
    const nextCaptureContext = move.capture ? nextContext(nextBoard, move, context) : null;
    const continuation = move.capture && legalMoves(nextBoard, player, move.to, nextCaptureContext).length > 0;
    const nextPlayer = continuation ? player : opponent(player);
    const nextContextValue = continuation ? nextCaptureContext : null;
    const nextDepth = continuation ? depth : depth - 1;
    const score = search(nextBoard, nextPlayer, nextContextValue, nextDepth, player, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
