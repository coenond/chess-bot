<template>
  <div class="w-full max-w-2xl mx-auto p-4">
    <div class="py-4 flex justify-between">
      <EngineSelector v-if="!gameStarted" @select="(engine) => setBlackPlayer(engine)"/>
      <button
          v-if="!gameStarted"
          @click="startGame"
          class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 dark:bg-emerald-700 dark:hover:bg-emerald-800"
        >
        Start Game
      </button>
    </div>
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
            v-if="gameStarted && piece"
            :class="[
              'absolute w-full h-full flex items-center justify-center',
             piece.color === turnColor ? `cursor-grab hover:scale-110` : '',
            ]"
            :draggable="piece.color === turnColor"
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

    <div class="py-4">
      <EngineSelector v-if="!gameStarted"  @select="(engine) => setWhitePlayer(engine)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Chess, type Piece, type Square, type Move} from 'chess.js'
import { EngineFactory } from '@/engine/engine-factory';
import EngineSelector from '@/components/EngineSelector.vue';

enum FenPositions {
  Start = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  Empty = '8/8/8/8/8/8/8/8 w - - 0 1',
}

const chess = new Chess();
const gamePosition = ref(chess.board());
const gameStarted = ref(false);
const moveOptions = ref<Move[]|null>(null);
const selectedPiece = ref<Piece|null>(null);

const turnColor = chess ? chess.turn() : '';
const playerColor = 'w';
const engine = EngineFactory.create('v1');
const whitePlayer = ref<EngineType|null>(null);
const blackPlayer = ref<EngineType|null>(null);

const path = import.meta.env.MODE === 'development' ? '' : '/chess-bot';
const captureSoundPath = `${path}/sounds/capture.mp3`;
const moveSoundPath = `${path}/sounds/move.mp3`;
const castleSoundPath = `${path}/sounds/castle.mp3`;
const checkSoundPath = `${path}/sounds/move-check.mp3`;
const gameEndSoundPath = `${path}/sounds/game-end.mp3`;
const gameStartSoundPath = `${path}/sounds/game-start.mp3`;
const illegalSoundPath = `${path}/sounds/illegal.mp3`;
const moveOpponentSoundPath = `${path}/sounds/move-opponent.mp3`;
const notifySoundPath = `${path}/sounds/notify.mp3`;
const promoteSoundPath = `${path}/sounds/promote.mp3`;
const tenSecondSoundPath = `${path}/sounds/tenseconds.mp3`;

const emit = defineEmits<{(e: 'move', move: MoveHistoryEntry): void}>()

const setWhitePlayer = (engine) => whitePlayer.value = EngineFactory.create(engine.version);
const setBlackPlayer = (engine) => blackPlayer.value = EngineFactory.create(engine.version);

const startGame = () => {
  if (!whitePlayer.value || !blackPlayer.value) {
    const illegalSound = new Audio(illegalSoundPath);
    illegalSound.play();
    return;
  }

  const gameStartSound = new Audio(gameStartSoundPath);
  gameStartSound.play();

  gameStarted.value = true;
  setTimeout(() => nextMove(), 500);
}

const getSquare = (row: number, col: number): Square => {
  const mapping: Record<number, number> = {1:8, 2:7, 3:6, 4:5, 5:4, 6:3, 7:2, 8:1};
  return String.fromCharCode(96 + col) + mapping[row] as Square
}

const getSquareColor = (row: number, col: number): string => (row + col) % 2 === 0 ? 'w' : 'b'

const playSound = (move: Move, isCheck = false) => {
  if (isCheck) {
    const checkSound = new Audio(checkSoundPath);
    checkSound.play();
    return;
  }

  if (move.isPromotion()) {
    const promoteSound = new Audio(promoteSoundPath);
    promoteSound.play();
    return;
  }

  if (move.isCapture() || move.isEnPassant()) {
    const captureSound = new Audio(captureSoundPath);
    captureSound.play();
    return;
  }

  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    const castleSound = new Audio(castleSoundPath);
    castleSound.play();
    return;
  }

  const moveSound = new Audio(moveSoundPath);
  moveSound.play();
}

const nextMove = () => {
  const player = chess.turn() === 'w' ? whitePlayer : blackPlayer;

  if (player.value.name === 'manual') return;

  const engineMove = player.value.executor.search(chess);
  emit('move', engineMove.historyEnty);
  makeMove(engineMove.move);
}

const makeMove = (move: Move) => {
    chess.move(move);
    playSound(move, chess.inCheck());

    if (chess.isCheckmate() || chess.isDraw()) {
      gamePosition.value = chess.board();
      gameEndSound.play();
      // todo - fix alert for stalemate
      alert(`Game Over! Checkmate! ${chess.turn() !== playerColor ? 'You Win' : 'The Bot Wins'}!`);
      return;
    }

    gamePosition.value = chess.board();
    selectedPiece.value = null;
    moveOptions.value = null;

    setTimeout(() => nextMove(), 100);
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
