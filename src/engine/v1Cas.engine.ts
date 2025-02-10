import { Chess, Move } from "chess.js";
import type { Engine } from "./engine";

export class v1Engine implements Engine {

    evaluate(chess: Chess): number {
        const board = chess.fen()
            .split(" ")[0] //get pieces part of fen
            .split(""); // convert into array;
        
        return this.countAllPieces(board, true) - this.countAllPieces(board);
    }

    search(chess: Chess): Move {
        const moves = chess.moves({ verbose: true });
        var bestScore = 1000;
        var bestMove = moves[0];
        moves.map((move) => {
            chess.move({from: move.from, to: move.to})
            const result = this.evaluate(chess)
            if (result < bestScore) {
                bestScore = result;
                bestMove = move;

            }
            chess.undo();
        });
        return bestMove;
    }

    countAllPieces(
        boardArray: string[],
        isWhite: boolean = false
    ): number {
        
        return boardArray
            .filter((char) => isWhite ? char.match(/[A-Z]/) : char.match(/[a-z]/))
            .length; // take the length
    }

}