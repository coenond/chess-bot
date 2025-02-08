<template>
  <div class="w-full max-w-2xl mx-auto p-4">
    <div class="aspect-square grid grid-cols-8 border border-gray-600 rounded-md overflow-hidden shadow-lg">
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <div
          v-for="(piece, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          :class="[
            'aspect-square flex items-center justify-center',
            (rowIndex + colIndex) % 2 === 0 
              ? 'bg-neutral-200 dark:bg-neutral-300' 
              : 'bg-emerald-700 dark:bg-emerald-600',
            'transition-all duration-300'
          ]"
          @dragover.prevent
          @drop="handleDrop($event, rowIndex, colIndex)"
        >
          <div
            v-if="piece"
            draggable
            @dragstart="handleDragStart($event, piece, rowIndex, colIndex)"
            class="w-full h-full flex items-center justify-center cursor-grab hover:scale-110 transition-transform"
          >
            <img
              :src="`/pieces/${piece}.svg`"
              :alt="piece"
              class="w-4/5 h-4/5 pointer-events-none"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const INITIAL_POSITION = [
  ['rook-b', 'knight-b', 'bishop-b', 'queen-b', 'king-b', 'bishop-b', 'knight-b', 'rook-b'],
  ['pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b', 'pawn-b'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w', 'pawn-w'],
  ['rook-w', 'knight-w', 'bishop-w', 'queen-w', 'king-w', 'bishop-w', 'knight-w', 'rook-w']
]

interface DraggedPiece {
  piece: string;
  row: number;
  col: number;
}

const board = ref(INITIAL_POSITION.map(row => [...row]))
const draggedPiece = ref<DraggedPiece | null>(null)

const handleDragStart = (e: DragEvent, piece: string, row: number, col: number) => {
  draggedPiece.value = { piece, row, col }
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDrop = (e: DragEvent, toRow: number, toCol: number) => {
  e.preventDefault()

  if (!draggedPiece.value) return

  const newBoard = board.value.map(row => [...row])
  newBoard[draggedPiece.value.row][draggedPiece.value.col] = ''
  newBoard[toRow][toCol] = draggedPiece.value.piece

  board.value = newBoard
  draggedPiece.value = null
}
</script>