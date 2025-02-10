import { Chess, Move } from "chess.js";
import type { Engine } from "./engine";

export class v1Engine implements Engine {

  evaluate(chess: Chess): number {
    const pieceValues: Record<string, number> = {
      p: 1000, n: 3000, b: 3000, r: 5000, q: 9000, k: 0
    };
    let score = 0;
    const board = chess.board();

    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = pieceValues[square.type] || 0;
          score += square.color === "w" ? value : -value;
        }
      }
    }

    return score;
  }

  search(chess: Chess): Move {
    const moves = chess.moves({ verbose: true });
    const isMaximizing = chess.turn() === "w";
    let bestMove = moves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      chess.move(move);
      const score = this.minimax(chess, 2, isMaximizing);
      console.log(`Move: ${move.san}, Score: ${score}`);
      chess.undo();


      if (isMaximizing && score > bestScore) {
        bestScore = score; bestMove = move;
      }
      if (!isMaximizing && score < bestScore) {
        bestScore = score; bestMove = move;
      }
    }

    console.log(`===== Found: ${bestMove.san}, Score: ${bestScore}`);

    return bestMove;
  }

  minimax(chess: Chess, depth: number, isMaximizing: boolean): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluate(chess);
    }

    const moves = chess.moves();
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      chess.move(move);
      const score = this.minimax(chess, depth-1, !isMaximizing);
      chess.undo();

      bestScore = isMaximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
    }

    return bestScore;
}

}
