import { Chess, Move, type Square } from "chess.js";
import type { Engine, MoveHistoryEntry } from "../engine";
import { bishopTable, kingTable, knightTable, pawnTable, queenTable, rookTable } from "./piece-square-tables";

export class v2Engine implements Engine {

  private readonly depth = 3;
  private nodes = 0;
  private pieceValues ={ p: 100, n: 310, b: 325, r: 550, q: 960, k: 2000 };

  evaluate(chess: Chess): number {
    let score = 0;
    this.nodes++;

    if (chess.isDraw()) return 0;
    if (chess.isCheckmate()) return chess.turn() === "w" ? -Infinity : Infinity;

    score += this.pieceEval(chess);

    return score;
  }

  /**
   * evalute caputres and excangs
   */
  pieceEval(chess: Chess): number {
    const board = chess.board();
    let evaluation = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = board[row][col];
        if (!square) continue;

        const isW = square.color === 'w';
        const rowPerspective = isW ? row : 7-row;

        let positionValue = 0;

        switch (square.type) {
          case 'p': positionValue = pawnTable[rowPerspective][col]; break;
          case 'n': positionValue = knightTable[rowPerspective][col]; break;
          case 'b': positionValue = bishopTable[rowPerspective][col]; break;
          case 'r': positionValue = rookTable[rowPerspective][col]; break;
          case 'q': positionValue = queenTable[rowPerspective][col]; break;
          case 'k': positionValue = kingTable[rowPerspective][col]; break;
        }

        evaluation += (isW ? 1 : -1) * (this.pieceValues[square.type] + positionValue);
      }
    }

    return evaluation;
  }

  search(chess: Chess): { move: Move, historyEnty: MoveHistoryEntry } {
    this.nodes = 0;
    const startTime = performance.now();
    const moves = chess.moves({ verbose: true });
    const isMaximizing = chess.turn() === "w";
    let bestMove = moves[0];
    let bestScore = -Infinity;
    let currentEval = 0;

    for (const move of moves) {
      chess.move(move);
      // const score = this.minimax(chess, this.depth, isMaximizing);
      const score = this.alphaBeta(chess, this.depth, -Infinity, Infinity, !isMaximizing);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      chess.undo();
    }

    console.log(`===== Found: ${bestMove.san}, Score: ${bestScore}`);
    const miliseconds = Math.floor(performance.now() - startTime);

    return {
      move: bestMove,
      historyEnty: {
        id: crypto.randomUUID(),
        number: chess.history().length,
        nodes: this.nodes,
        notation: bestMove.san,
        time: miliseconds,
        eval: this.evaluate(chess) / 100,
    }};
  }

  alphaBeta(chess: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || chess.isGameOver()) {
        return this.evaluate(chess);
    }

    const moves = chess.moves({ verbose: true }).sort((a, b) => {
      const aScore = (a.isCapture() ? this.pieceValues[a.captured as keyof typeof this.pieceValues] : 0);
      const bScore = (b.isCapture() ? this.pieceValues[b.captured as keyof typeof this.pieceValues] : 0);
      return bScore - aScore;
    });

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (const move of moves) {
            chess.move(move);
            bestScore = Math.max(bestScore, this.alphaBeta(chess, depth-1, alpha, beta, false));
            chess.undo();

            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break;
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            chess.move(move);
            bestScore = Math.min(bestScore, this.alphaBeta(chess, depth-1, alpha, beta, true));
            chess.undo();

            beta = Math.min(beta, bestScore);
            if (beta <= alpha) break;
        }
        return bestScore;
    }
  }

}
