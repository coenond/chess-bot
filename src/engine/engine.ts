import type { Chess, Move } from "chess.js";

export type MoveHistoryEntry = {
  id: string,
  number: number,
  notation: string,
  time: number,
  nodes: number,
  eval: number,
}

export type Engine = {
    evaluate(chess: Chess): number;
    search(chess: Chess): { move: Move, historyEnty: MoveHistoryEntry };
}
