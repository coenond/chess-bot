<script setup lang="ts">
import ChessBoard from '../components/ChessBoard.vue'
</script>

<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark">
    <!-- Left Side: Chess Board -->
    <div class="w-3/5 flex p-4">
      <ChessBoard />
    </div>

    <!-- Divider -->
    <div class="w-[2px] bg-gray-400 dark:bg-gray-600 my-8"></div>

    <!-- Right Side: Stats Panel -->
    <div class="w-2/5 p-6">
      <h2 class="text-xl font-semibold mb-4">Game Stats</h2>
      <div class="space-y-4">
        <div>
          <span class="text-gray-600 dark:text-gray-300">Search Time:</span>
          <span class="ml-2 font-mono">-</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-300">Search Depth:</span>
          <span class="ml-2 font-mono">-</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-300">Move History:</span>
          <ul class="mt-2 text-sm">
            <li class="font-mono">-</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
