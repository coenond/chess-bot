<script setup lang="ts">
import { ref } from 'vue'
import ChessBoard from '@/components/ChessBoard.vue'
import type { MoveHistoryEntry } from './engine/engine';

const showSideBard = true;

const moveHistory = ref<MoveHistoryEntry[]>([]);

const onMove = (move: MoveHistoryEntry) => moveHistory.value.push(move);

const formatNumber = (num: number): string => num >= 1000 ? `${(num/1000).toFixed(1)}k` : num.toString();

const formatEval = (eval_: number): string => {
  const sign = eval_ > 0 ? '+' : ''
  return `${sign}${eval_.toFixed(1)}`
}

const getEvalColor = (eval_: number): string => {
  if (eval_ > 0.5) return 'text-emerald-600 dark:text-emerald-400'
  if (eval_ < -0.5) return 'text-red-600 dark:text-red-400'
  return 'text-gray-600 dark:text-gray-400'
}
</script>

<template>
  <!-- <RouterView /> -->
  <div class="min-h-screen flex bg-background dark:bg-background-dark">
    <!-- Left Side: Chess Board -->
    <div :class="`${showSideBard ? 'w-3/5' : 'w-full'} flex p-4`">
      <ChessBoard @move="onMove" />
    </div>

    <!-- Divider -->
    <div v-if="showSideBard" class="w-[2px] bg-gray-400 dark:bg-gray-600 my-8"></div>

    <!-- Right Side: Stats Panel -->
    <div v-if="showSideBard" class="w-2/5 p-6">
      <h2 class="text-xl font-semibold mb-4">Game Stats</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-2 px-2 font-bold text-gray-600 dark:text-gray-300">#</th>
              <th class="text-left py-2 px-2 font-bold text-gray-600 dark:text-gray-300">Move</th>
              <th class="text-right py-2 px-2 font-bold text-gray-600 dark:text-gray-300">Time</th>
              <th class="text-right py-2 px-2 font-bold text-gray-600 dark:text-gray-300">Nodes</th>
              <th class="text-right py-2 px-2 font-bold text-gray-600 dark:text-gray-300">Eval</th>
            </tr>
          </thead>
          <tbody class="font-mono">
            <tr v-for="move in moveHistory"
                :key="move.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="py-2 px-2">{{ move.number }}</td>
              <td class="py-2 px-2">{{ move.notation }}</td>
              <td class="py-2 px-2 text-right">{{ Math.abs(move.time) }}ms</td>
              <td class="py-2 px-2 text-right">{{ formatNumber(move.nodes) }}</td>
              <td class="py-2 px-2 text-right" :class="getEvalColor(move.eval)">
                {{ formatEval(move.eval) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
