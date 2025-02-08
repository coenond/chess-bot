<template>
  <div class="w-full max-w-2xl mx-auto p-4">
    <div 
      class="aspect-square grid grid-cols-8 border border-gray-600 rounded-md overflow-hidden shadow-lg"
      @dragover.prevent
    >
      <template v-for="(row, rowIndex) in board" :key="rowIndex">
        <div
          v-for="(piece, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          :class="[
            'aspect-square flex items-center justify-center relative',
            (rowIndex + colIndex) % 2 === 0 
              ? 'bg-neutral-200 dark:bg-neutral-300' 
              : 'bg-emerald-700 dark:bg-emerald-600',
            {
              'ring-2 ring-blue-500 ring-inset': selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex
            },
            'transition-all duration-300'
          ]"
          @click="handleSquareClick(rowIndex, colIndex)"
          @dragover.prevent
          @drop="handleDrop($event, rowIndex, colIndex)"
        >
          <!-- Static pieces -->
          <div
            v-if="piece"
            :class="[
              'absolute w-full h-full flex items-center justify-center',
              'cursor-grab hover:scale-110',
            ]"
            draggable="true"
            @dragstart.stop="handleDragStart($event, piece, rowIndex, colIndex)"
            @click.stop="handleSquareClick(rowIndex, colIndex)"
          >
            <img
              :src="`/pieces/${piece}.svg`"
              :alt="piece"
              :ref="el => { if (el) pieceRefs[`${rowIndex}-${colIndex}`] = el }"
              class="w-4/5 h-4/5 pointer-events-none"
            />
          </div>
        </div>
      </template>

      <!-- Moving piece overlay -->
      <div
        v-if="movingPiece"
        :class="[
          'absolute w-1/8 h-1/8 flex items-center justify-center',
          'pointer-events-none'
        ]"
        :style="getMovingPieceStyle()"
      >
        <img
          :src="`/pieces/${movingPiece.piece}.svg`"
          :alt="movingPiece.piece"
          class="w-4/5 h-4/5"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

interface Position {
  row: number
  col: number
}

interface DraggedPiece {
  piece: string
  row: number
  col: number
}

interface MovingPiece {
  piece: string
  from: Position
  to: Position
  progress: number
}

const board = ref(INITIAL_POSITION.map(row => [...row]))
const draggedPiece = ref<DraggedPiece | null>(null)
const selectedSquare = ref<Position | null>(null)
const movingPiece = ref<MovingPiece | null>(null)
const isMoving = computed(() => movingPiece.value !== null)
const pieceRefs: { [key: string]: HTMLImageElement } = {}

const handleDragStart = (e: DragEvent, piece: string, row: number, col: number) => {
  draggedPiece.value = { piece, row, col }
  
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    
    // Create a clone of the piece image for dragging
    const img = pieceRefs[`${row}-${col}`]
    if (img) {
      const rect = img.getBoundingClientRect()
      const dragImage = img.cloneNode(true) as HTMLImageElement
      dragImage.style.width = `${rect.width}px`
      dragImage.style.height = `${rect.height}px`
      dragImage.style.position = 'fixed'
      dragImage.style.top = '-1000px'
      document.body.appendChild(dragImage)
      
      // Center the drag image on the cursor
      e.dataTransfer.setDragImage(
        dragImage, 
        rect.width / 2,
        rect.height / 2
      )
      
      // Clean up the temporary element after the drag starts
      setTimeout(() => document.body.removeChild(dragImage), 0)
    }
  }
}

const handleDrop = (e: DragEvent, toRow: number, toCol: number) => {
  e.preventDefault()
  if (!draggedPiece.value) return
  movePiece(draggedPiece.value.row, draggedPiece.value.col, toRow, toCol)
  draggedPiece.value = null
}

const handleSquareClick = (row: number, col: number) => {
  if (!selectedSquare.value) {
    // If there's a piece on this square, select it
    if (board.value[row][col]) {
      selectedSquare.value = { row, col }
    }
  } else {
    // If we click on a different square, move the piece
    if (row !== selectedSquare.value.row || col !== selectedSquare.value.col) {
      movePiece(selectedSquare.value.row, selectedSquare.value.col, row, col)
    }
    selectedSquare.value = null
  }
}

const isMovingPiece = (row: number, col: number) => {
  return movingPiece.value?.from.row === row && movingPiece.value?.from.col === col
}

const getMovingPieceStyle = () => {
  if (!movingPiece.value) return {}
  
  const { from, to, progress } = movingPiece.value
  const squareSize = 12.5 // 100% / 8 squares = 12.5%
  
  const fromX = from.col * squareSize
  const fromY = from.row * squareSize
  const toX = to.col * squareSize
  const toY = to.row * squareSize
  
  const currentX = fromX + (toX - fromX) * progress
  const currentY = fromY + (toY - fromY) * progress
  
  return {
    transform: `translate(${currentX}%, ${currentY}%)`,
    width: '12.5%',
    height: '12.5%',
    transition: 'transform 0.05s linear'
  }
}

const movePiece = async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
  const piece = board.value[fromRow][fromCol]
  if (!piece) return

  // Create temporary board state
  const newBoard = board.value.map(row => [...row])
  newBoard[fromRow][fromCol] = ''
  board.value = newBoard

  // Set up the moving piece animation
  movingPiece.value = {
    piece,
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
    progress: 0
  }

  return new Promise<void>((resolve) => {
    const startTime = performance.now()
    const duration = 300 // Animation duration in ms

    const animate = (currentTime: number) => {
      if (!movingPiece.value) return

      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      movingPiece.value.progress = progress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete, update final position
        const finalBoard = board.value.map(row => [...row])
        finalBoard[toRow][toCol] = piece
        board.value = finalBoard
        movingPiece.value = null
        resolve()
      }
    }

    requestAnimationFrame(animate)
  })
}

const getPieceStyle = (row: number, col: number) => {
  if (!movingPiece.value) return {}
  
  const { from, to, progress, piece } = movingPiece.value
  
  if (from.row === row && from.col === col) {
    const translateX = (to.col - from.col) * 100
    const translateY = (to.row - from.row) * 100
    
    return {
      transform: `translate(${translateX * progress}%, ${translateY * progress}%)`,
      transition: 'transform 0.05s linear'
    }
  }

  return {}
}
</script>

<style scoped>
.aspect-square {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>