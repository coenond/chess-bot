<template>
  <div class="w-full max-w-2xl mx-auto p-4">
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
            (rowIndex + colIndex) % 2 === 0 ? 'bg-neutral-200 dark:bg-neutral-300' : 'bg-emerald-700 dark:bg-emerald-600',
            'transition-all duration-300',
            moveOptions?.map(m => m.to).includes(getSquare(rowIndex+1, colIndex+1)) && piece ? 'shadow-[inset_0_0_2px_2px_rgba(239,68,68,0.8)]' : ''
          ]"
          @click="squareClickHandler(rowIndex, colIndex, piece)"
          @dragover.prevent
        >
          <!-- Just a dot -->
          <div
            v-if="moveOptions?.map(m => m.to).includes(getSquare(rowIndex+1, colIndex+1))"
            class="absolute w-3 h-3 bg-black/40 dark:bg-white/40 rounded-full"
          />
          <!-- Static pieces -->
          <div
            v-if="piece"
            class="absolute w-full h-full flex items-center justify-center cursor-grab hover:scale-110"
            draggable="true"
          >
            <img
              :src="`/pieces/${piece.type}-${piece.color}.svg`"
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

const chess = new Chess()
const gamePosition = ref(chess.board());
const moveOptions = ref<Move[]|null>(null);
const selectedPiece = ref<Piece|null>(null);

const getSquare = (row: number, col: number): Square => {
  const mapping: Record<number, number> = {1:8, 2:7, 3:6, 4:5, 5:4, 6:3, 7:2, 8:1};
  return String.fromCharCode(96 + col) + mapping[row] as Square
}


const squareClickHandler = (row: number, col: number, piece: Piece|null) => {
  const squareClicked = getSquare(row+1, col+1);

  if (piece && !moveOptions.value) {
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
      chess.move(move);
      gamePosition.value = chess.board();
    }
    selectedPiece.value = null;
    moveOptions.value = null;
    gamePosition.value = chess.board()
  }
}

</script>