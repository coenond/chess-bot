import { BISHOP, BLACK, Chess, KING, KNIGHT, Move, PAWN, QUEEN, ROOK, WHITE } from "chess.js";
import type { Engine, MoveHistoryEntry } from "./engine";

const BLACK_LOST = 100000;
const WHITE_LOST = -100000; 

export class v2Engine implements Engine {

    counter: number;

    depth = 4;

    // KNIGHT positions
    knightPositionsA = [18,19,20,21,26,27,28,29,34,35,36,37,42,43,44,45];
    knightPositionsB = [10,11,12,13,17,22,25,30,33,38,41,46,50,51,52,53];
    knightPositionsC = [2,3,4,5,9,14,16,23,24,31,32,39,40,47,48,49,54,58,59,60,61];

    // BISHOP positions
    badSquaresWhiteBishop = [-1];
    badSquaresBlackBishop = [-1];
    bestSquaresWhiteBishop = [49,54];
    bestSquaresBlackBishop = [9,14];

    // ROOK positions
    badSquaresWhiteRook = [40, 47, 48, 55, 56, 57, 62, 63];
    badSquaresBlackRook = [0,1,6,7,8,15,16,23];
    bestSquaresWhiteRook = [8,9,10,11,12,13,14,15];
    bestSquaresBlackRook = [48,49,50,51,52,53,54,55];

    constructor() {
        this.counter = 0;
    }

    getBoard(chess:Chess): string[] {
        const boardString = chess.fen().split(' ')[0]; // Get the board part of the FEN
        const rows = boardString.split('/'); // Split by rows
        const board: string[] = [];

        // Iterate over each row
        rows.forEach(row => {
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                
                // If it's a number, it represents empty squares, add that many empty squares
                if (/\d/.test(char)) {
                    const emptySquares = parseInt(char, 10);
                    for (let j = 0; j < emptySquares; j++) {
                    board.push(''); // Empty square
                    }
                } else {
                    board.push(char); // Add the piece
                }
            }
        })
        return board;
    }

    evaluate(chess: Chess): number {
        this.counter++; 
        if (chess.isCheckmate()) {
            const moveCount = chess.moveNumber()
            return chess.turn() === WHITE 
                ? (WHITE_LOST + Number(moveCount))
                : (BLACK_LOST - Number(moveCount))
        }
        if (chess.isDraw() || chess.isThreefoldRepetition()) {
            return 0;
        }

        const board = this.getBoard(chess);

        return this.evaluatePieces(board);
    }

    minimax(chess: Chess, depth: number = this.depth, alpha: number = WHITE_LOST, beta: number = BLACK_LOST): {evaluation: number, move: Move|null} {
        if (!depth || chess.isGameOver()) {
            return {
                evaluation: this.evaluate(chess), 
                move: null
            };
        }   

        const moves: Move[] = chess.moves({ verbose: true });

        if (depth === this.depth || depth === this.depth-1) {
            moves.sort((a: Move, b: Move) : number => {
                return (
                    b.isCapture() || 
                    b.isQueensideCastle() || 
                    b.isKingsideCastle() ||
                    b.isPromotion() ||
                    b.san.includes('+')) ? 1 : - 1;
            })
        }

        var bestScore = chess.turn() === WHITE ? WHITE_LOST : BLACK_LOST;
        var bestMove = moves[0];
        var bestEval = chess.turn() === WHITE ? WHITE_LOST : BLACK_LOST;

        if(depth === 4 && chess.turn() === BLACK ) moves.reverse();

        moves.some((move: Move) => {
            chess.move(move);
            const { evaluation } = this.minimax(chess, depth-1, alpha, beta);

            if (evaluation === bestScore && depth === this.depth) {
                const newEval = this.evaluate(chess);
                if((chess.turn() === WHITE && newEval < bestEval) || 
                    (chess.turn() === BLACK && newEval > bestEval)) {
                    bestScore = evaluation;
                    bestMove = move;
                    bestEval = newEval;
                }
            }

            if (((chess.turn() === WHITE && evaluation < bestScore) ||
                (chess.turn() === BLACK && evaluation > bestScore)) ) {
                bestScore = evaluation;
                bestMove = move;
                // also save best 1 move eval in case of equals;
                bestEval = this.evaluate(chess);
            }

            if (chess.turn() === WHITE) {
                beta = Math.min(beta, evaluation);
            }
            else if (chess.turn() === BLACK) {
                alpha = Math.max(evaluation, alpha);
            }
            if( beta < alpha ) {
                chess.undo();
                return true;
            }

            chess.undo();
            return false;
        });

        return {evaluation: bestScore, move: bestMove};
    }

    search(chess: Chess): { move: Move, historyEnty: MoveHistoryEntry } {
        this.counter = 0;
        const startTime = new Date();
        const result = this.minimax(chess, this.depth);
        console.log("evaluated positions: ", this.counter);

        console.log("evaluation result: ", result.evaluation);
        console.log("played move ", result?.move?.san);

        const end = new Date();
        const seconds = end.getMilliseconds() - startTime.getMilliseconds();

        return {
            move: result.move || chess.moves({ verbose: true })[0],
            historyEnty: {
                id: crypto.randomUUID(),
                number: chess.history().length,
                nodes: this.counter,
                notation: result?.move?.san ?? chess.moves({ verbose: true })[0].san,
                time: seconds,
                eval: result.evaluation/100,
        }};
    }

    evaluatePieces(boardArray: string[]): number {
        return boardArray.reduce((evaluation: number, piece: string, index): number => {
            if(piece === '') return evaluation;

            // PAWN
            else if (piece === PAWN) return evaluation - 98 - (Math.floor(index/8)*2);
            else if (piece === PAWN.toUpperCase()) return evaluation + 98 + (8-Math.floor(index/8)*2);

            // KNIGHT
            else if (piece === KNIGHT || piece === KNIGHT.toUpperCase()) {
                var score = 3; // todo just set te correct position numbers in ther arrays
                if (this.knightPositionsA.includes(index)) score = 320;
                else if (this.knightPositionsB.includes(index)) score = 300;
                else if (this.knightPositionsC.includes(index)) score = 275;
                else score = 250
                if(piece === KNIGHT) score *= -1;
                return evaluation + score;
            }

            // BISHOP
            else if (piece === BISHOP.toUpperCase()) {
                if(this.badSquaresWhiteBishop.includes(index)) return evaluation + 300;
                else if (this.bestSquaresWhiteBishop.includes(index)) return evaluation + 350;
                else return evaluation + 325;
            }
            else if (piece === BISHOP) {
                if(this.badSquaresBlackBishop.includes(index)) return evaluation - 300;
                else if (this.bestSquaresBlackBishop.includes(index)) return evaluation - 350;
                else return evaluation - 325;
            }

            // ROOK
            else if (piece === ROOK.toUpperCase()) {
                const file = index % 8;
                let pawnsInFile = 2
                for(let i = file; i < 64 && pawnsInFile > 0; i += 8){
                    if (boardArray[i].toLowerCase() === PAWN ) pawnsInFile--;
                }
                const rookEval = evaluation + (15 * pawnsInFile)
                if(this.badSquaresWhiteRook.includes(index)) return rookEval + 450;
                else if (this.bestSquaresWhiteRook.includes(index)) return rookEval + 525;
                else return rookEval + 500;
            }
            else if (piece === ROOK) {
                const file = index % 8;
                let pawnsInFile = 2
                for(let i = file; i < 64 && pawnsInFile > 0; i += 8){
                    if (boardArray[i].toLowerCase() === PAWN) pawnsInFile--;
                }
                const rookEval = evaluation - (15 * pawnsInFile)
                if(this.badSquaresBlackRook.includes(index)) return rookEval - 450;
                else if (this.bestSquaresBlackRook.includes(index)) return rookEval - 525;
                else return rookEval - 500;
            }

            // QUEEN
            else if (piece === QUEEN) return evaluation - 900;
            else if (piece === QUEEN.toUpperCase()) return evaluation + 900;

            // KING SAFETY
            else if (piece === KING.toUpperCase() && [56, 57, 58, 62, 63].includes(index)) return evaluation + 20;
            else if (piece === KING && [0, 1, 2, 6, 7].includes(index)) return evaluation - 20;

            return evaluation;
        }, 0);
    }
}