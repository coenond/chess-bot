<template>
  <div class="relative w-64">
    <!-- Main button -->
    <button
      @click="isOpen = !isOpen"
      class="z-0 w-full px-4 py-2 bg-neutral-800 border border-neutral-200 border-neutral-700 rounded-lg shadow-sm flex items-center justify-between hover:bg-neutral-50 hover:bg-neutral-700 transition-colors duration-150"
    >
      <div class="flex flex-col items-start">
        <span v-if="selectedEngine" class="text-sm font-medium">{{ selectedEngine.name }}</span>
        <span v-else class="text-sm text-neutral-500">Select engine</span>
        <span v-if="selectedEngine" class="text-xs text-neutral-500 text-neutral-400">{{ selectedEngine.version }}</span>
        <span v-else class="text-sm text-neutral-500">-</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute w-full mt-2 bg-neutral-800 border border-neutral-200 border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50"
      >
        <button
          v-for="engine in engines"
          :key="engine.name"
          @click="selectEngine(engine)"
          class="w-full px-4 py-2 text-left hover:bg-neutral-50 hover:bg-neutral-700 transition-colors duration-150"
        >
          <div class="flex flex-col">
            <span class="text-sm font-medium">{{ engine.name }}</span>
            <span class="text-xs text-neutral-500 text-neutral-400">{{ engine.version }}</span>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EngineFactory } from '@/engine/engine-factory';

const isOpen = ref(false)
const engines = EngineFactory.getEngines();
const selectedEngine = ref(null);

const selectEngine = (engine) => {
  selectedEngine.value = engine
  isOpen.value = false
  emit('select', engine)
}

const emit = defineEmits(['select'])
</script>
