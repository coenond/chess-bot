import { Chess, Move } from "chess.js";
import type { Engine, MoveHistoryEntry } from "./engine";

export class v0Engine implements Engine {

    evaluate(chess: Chess): number {
      return 0;
    }

    search(chess: Chess): { move: Move, historyEnty: MoveHistoryEntry } {
      const moves = chess.moves({ verbose: true });
      const move = moves[Math.floor(Math.random() * moves.length)];

      return {
        move,
        historyEnty: {
          id: crypto.randomUUID(),
          number: chess.history().length,
          nodes: 1,
          notation: move.san,
          time: 0,
          eval: 0,
      }};
    }

}
