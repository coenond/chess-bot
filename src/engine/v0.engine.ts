import { Chess, Move } from "chess.js";
import type { Engine } from "./engine";

export class v0Engine implements Engine {

    evaluate(chess: Chess): number {
        return 0;
    }

    search(chess: Chess): Move {
        const moves = chess.moves({ verbose: true });
        return moves[Math.floor(Math.random() * moves.length)];
    }

}