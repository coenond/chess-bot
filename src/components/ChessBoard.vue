<template>
  <div class="w-full max-w-2xl mx-auto p-4">
  <p class="py-4">You are playing: <b>{{ engine.name }}</b> - turn for {{ chess.turn() }}</p>
    <div
      class="aspect-square grid grid-cols-8 border border-gray-600 rounded-md overflow-hidden shadow-lg"
      @dragover.prevent
    >
      <template v-for="(row, rowIndex) in gamePosition" :key="rowIndex">
        <div
          v-for="(piece, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          :class="[
            'aspect-square flex items-center justify-center relative',
            getSquareColor(rowIndex, colIndex) === 'w' ? 'bg-neutral-200 dark:bg-neutral-200' : 'bg-emerald-700 dark:bg-emerald-700',
            'transition-all duration-300',
            moveOptions?.map(m => m.to).includes(getSquare(rowIndex+1, colIndex+1)) && piece ? 'shadow-[inset_0_0_4px_4px_rgba(239,68,68,0.6)]' : ''
          ]"
          @click="squareClickHandler(rowIndex, colIndex, piece)"
          @dragover.prevent
        >
          <!-- Just a dot -->
          <div
            v-if="moveOptions?.map(m => m.to).includes(getSquare(rowIndex+1, colIndex+1))"
            class="absolute w-3 h-3 bg-black/40 rounded-full"
          />
          <!-- Static pieces -->
          <div
            v-if="piece"
            :class="[
              'absolute w-full h-full flex items-center justify-center',
             piece.color === playerColor ? `cursor-grab hover:scale-110` : '',
            ]"
            :draggable="piece.color === playerColor"
          >
            <img
              :src="`${path}/pieces/${piece.type}-${piece.color}.svg`"
              :alt="`${piece.type}-${piece.color}`"
              class="w-4/5 h-4/5 pointer-events-none"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Chess, type Piece, type Square, type Move} from 'chess.js'
import { EngineFactory } from '@/engine/engine-factory';

const chess = new Chess()
const gamePosition = ref(chess.board());
const moveOptions = ref<Move[]|null>(null);
const selectedPiece = ref<Piece|null>(null);
const playerColor = 'w';
const engine = EngineFactory.create('v0');

const path = import.meta.env.MODE === 'development' ? '' : '/chess-bot';
const captureSound = new Audio(`${path}/sounds/capture.mp3`);
const moveSound = new Audio(`${path}/sounds/move.mp3`);
const castleSound = new Audio(`${path}/sounds/castle.mp3`);
const checkSound = new Audio(`${path}/sounds/move-check.mp3`);
const gameEndSound = new Audio(`${path}/sounds/game-end.mp3`);
const gameStartSound = new Audio(`${path}/sounds/game-start.mp3`);
const illegalSound = new Audio(`${path}/sounds/illegal.mp3`);
const moveOpponentSound = new Audio(`${path}/sounds/move-opponent.mp3`);
const notifySound = new Audio(`${path}/sounds/notify.mp3`);
const promoteSound = new Audio(`${path}/sounds/promote.mp3`);
const tenSecondSound = new Audio(`${path}/sounds/tenseconds.mp3`);

const getSquare = (row: number, col: number): Square => {
  const mapping: Record<number, number> = {1:8, 2:7, 3:6, 4:5, 5:4, 6:3, 7:2, 8:1};
  return String.fromCharCode(96 + col) + mapping[row] as Square
}

const getSquareColor = (row: number, col: number): string => (row + col) % 2 === 0 ? 'w' : 'b'

const playSound = (move: Move, isCheck = false) => {
  if (isCheck) {
    checkSound.play();
    return;
  }

  if (move.isPromotion()) {
    promoteSound.play();
    return;
  }

  if (move.isCapture() || move.isEnPassant()) {
    captureSound.play();
    return;
  }

  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    castleSound.play();
    return;
  }

  move.color === playerColor ? moveSound.play() : moveOpponentSound.play();
}

const makeMove = (move: Move) => {
    chess.move(move);
    playSound(move, chess.inCheck());

    if (chess.isCheckmate()) {
      setTimeout(() => {
        gamePosition.value = chess.board();
        gameEndSound.play();
        alert(`Game Over! Checkmate! ${chess.turn() !== playerColor ? 'You Win' : 'The Bot Wins'}!`);
        return;
      }, 200);
    }

    gamePosition.value = chess.board();
    selectedPiece.value = null;
    moveOptions.value = null;

    if (chess.turn() !== playerColor) {
      const botMove = engine.executor.search(chess);
      setTimeout(() => {
        makeMove(botMove);
      }, 400);
    }
}

const squareClickHandler = (row: number, col: number, piece: Piece|null) => {
  const squareClicked = getSquare(row+1, col+1);

  if (piece && !moveOptions.value && piece.color === chess.turn()) {
    selectedPiece.value = piece;
    moveOptions.value = chess.moves({ square: squareClicked, verbose: true })
    return
  }

  if (!piece && !selectedPiece.value) {
    return;
  }

  if (selectedPiece.value && moveOptions.value) {
    const move = moveOptions.value.find(m => m.to === squareClicked);
    if (move) {
      makeMove(move);
    } else {
      selectedPiece.value = null;
      moveOptions.value = null;
    }
  }
}

</script>