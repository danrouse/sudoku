<script setup lang="ts">
import { Cell } from '../sudoku'
defineProps<{
  cells: Cell[],
  onButtonClick: (button: number) => void,
}>()
</script>

<template>
  <div class="buttons">
    <button
      v-for="(_, i) in Array(9)"
      @click="onButtonClick(i + 1)"
      :disabled="cells.filter(c => c.value === i + 1).length >= 9"
    >
      {{ i + 1 }}
    </button>
    <button
      @click="onButtonClick(0)"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.buttons {
  display: flex;
  /* display: inline-grid;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: repeat(10, auto); */
}
.buttons button {
  flex: 1;
  background: #d3d3d3;
  margin: 4px 0px;
  padding: 0.5em;
  /* width: 10%; */
  font-size: 1em;
  /* border-radius: 3px; */
}
.buttons button:hover:not(:disabled) {
  background: #666;
  color: white;
  cursor: pointer;
}
</style>
