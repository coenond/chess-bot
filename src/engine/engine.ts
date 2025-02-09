import type { Chess, Move } from "chess.js";

export type Engine = {
    evaluate(chess: Chess): number;
    search(chess: Chess): Move;
}