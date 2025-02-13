import { Chess, Move } from "chess.js";
import type { Engine, MoveHistoryEntry } from "./engine";

export class v1Engine implements Engine {

  private nodes = 0;

  evaluate(chess: Chess): number {
    const pieceValues: Record<string, number> = {
      p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
    };
    let score = 0;
    const piecesOnBoard = chess.board().flatMap(row => row.filter(p => p));

    for (const piece of piecesOnBoard) {
      if (piece) {
        score += piece.color === "w" ? pieceValues[piece.type] : -pieceValues[piece.type];
      }
    }

    if (score === -9) {
      console.log(chess.history());
      console.log(chess.ascii());
    }

    return score;
  }

  search(chess: Chess): { move: Move, historyEnty: MoveHistoryEntry } {
    this.nodes = 0;
    const startTime = new Date();
    const moves = chess.moves({ verbose: true });
    const isMaximizing = chess.turn() === "w";
    let bestMove = moves[0];
    let bestScore = isMaximizing ? -Infinity : Infinity;
    let currentEval = 0;

    for (const move of moves) {
      this.nodes++;
      chess.move(move);
      const score = this.minimax(chess, 2, isMaximizing);
      // console.log(`Move: ${move.san}, Score: ${score}`);


      if (isMaximizing && score > bestScore) {
        currentEval = this.evaluate(chess);
        bestScore = score;
        bestMove = move;
      }
      if (!isMaximizing && score < bestScore) {
        currentEval = this.evaluate(chess);
        bestScore = score;
        bestMove = move;
      }
      chess.undo();
    }

    const end = new Date();
    const seconds = end.getMilliseconds() - startTime.getMilliseconds();

    console.log(`===== Found: ${bestMove.san}, Score: ${bestScore}`);

    return {
      move: bestMove,
      historyEnty: {
        id: crypto.randomUUID(),
        number: chess.history().length,
        nodes: this.nodes,
        notation: bestMove.san,
        time: seconds,
        eval: currentEval,
    }};
  }

  minimax(chess: Chess, depth: number, isMaximizing: boolean): number {
    if (depth === 0 || chess.isGameOver()) {
      return this.evaluate(chess);
    }

    const moves = chess.moves();
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      this.nodes++;
      chess.move(move);
      const score = this.minimax(chess, depth-1, !isMaximizing);
      chess.undo();

      bestScore = isMaximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
    }

    return bestScore;
}

}
