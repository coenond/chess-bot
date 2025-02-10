import { BISHOP, BLACK, Chess, KNIGHT, Move, PAWN, QUEEN, ROOK, WHITE } from "chess.js";
import type { Engine } from "./engine";

const BLACK_LOST = 1000;
const WHITE_LOST = -1000; 

export class v2Engine implements Engine {

    evaluate(chess: Chess): number {
        if (chess.isCheckmate()) {
            return chess.turn() === WHITE ? WHITE_LOST : BLACK_LOST
        }
        const board = chess.fen()
            .split(" ")[0] //get pieces part of fen
            .split(""); // convert into array;
        return this.getPawnBalance(board) + 
            this.getKnightBalance(board) + 
            this.getBishopBalance(board) +
            this.getRookBalance(board) +
            this.getQueenBalance(board)
    }

    minimax(chess: Chess, depth: number = 2): {evaluation: number, move: Move|null} {
        if (!depth || chess.isGameOver()) {
            return {
                evaluation: this.evaluate(chess), 
                move: null
            };
        }

        const moves = chess.moves({ verbose: true });
        var bestScore = chess.turn() === WHITE ? -1000 : 1000;
        var bestMove = moves[0];

        moves.map((move) => {
            chess.move({from: move.from, to: move.to})
            const { evaluation }= this.minimax(chess, depth-1);
            if ((chess.turn() === WHITE && evaluation < bestScore) ||
                (chess.turn() === BLACK && evaluation > bestScore) ) {
                bestScore = evaluation;
                bestMove = move;
            }
            chess.undo();
        });

        return {evaluation: bestScore, move: bestMove};
    }

    search(chess: Chess): Move {
        return this.minimax(chess, 3).move || chess.moves({ verbose: true })[0];
    }

    getPawnBalance(boardArray: string[]): number {
        const scoreBlack = boardArray
            .filter((char) => char.match(PAWN))
            .length;
        const scoreWhite = boardArray
            .filter((char) => char.match(PAWN.toUpperCase()))
            .length;
        return scoreWhite - scoreBlack;
    }

    getKnightBalance(boardArray: string[]): number {
        const scoreBlack = boardArray
            .filter((char) => char.match(KNIGHT))
            .length;
        const scoreWhite = boardArray
            .filter((char) => char.match(KNIGHT.toUpperCase()))
            .length;
        return (scoreWhite - scoreBlack) * 3;
    }

    getBishopBalance(boardArray: string[]): number {
        const scoreBlack = boardArray
            .filter((char) => char.match(BISHOP))
            .length;
        const scoreWhite = boardArray
            .filter((char) => char.match(BISHOP.toUpperCase()))
            .length;
        return (scoreWhite - scoreBlack) * 3;
    }

    getRookBalance(boardArray: string[]): number {
        const scoreBlack = boardArray
            .filter((char) => char.match(ROOK))
            .length;
        const scoreWhite = boardArray
            .filter((char) => char.match(ROOK.toUpperCase()))
            .length;
        return (scoreWhite - scoreBlack) * 5;
    }

    getQueenBalance(boardArray: string[]): number {
        const scoreBlack = boardArray
            .filter((char) => char.match(QUEEN))
            .length;
        const scoreWhite = boardArray
            .filter((char) => char.match(QUEEN.toUpperCase()))
            .length;
        return (scoreWhite - scoreBlack) * 9;
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