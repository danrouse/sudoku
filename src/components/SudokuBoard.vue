<script setup lang="ts">
import { Cell, getNeighbors, getCandidates } from '../sudoku'
import { computed } from 'vue'

const props = defineProps<{
  cells: Cell[],
  selectedCellIndex: number,
  onCellClick: (index: number) => void,
  autoCandidateMode?: boolean,
  showNakedSingles?: boolean,
  showConflicts?: boolean,
}>()

const selectedNumber = computed(() => props.cells[props.selectedCellIndex].value)

const hasConflict = (index: number) => {
  const value = props.cells[index].value
  if (value === 0) return false
  return getNeighbors(index).some((neighborIndex) =>
    props.cells[neighborIndex].value === value)
}
</script>

<template>
  <table class="puzzle">
    <tr v-for="row in Array(9).keys()" class="row">
      <td
        v-for="({ value, notes, isGiven }, index) in cells.slice(row * 9, (row + 1) * 9)"
        :class="{
          cell: true,
          selectedCell: selectedCellIndex === (row * 9) + index,
          conflicts: showConflicts && hasConflict((row * 9) + index),
          given: isGiven,
          selectedNumber: selectedNumber && selectedNumber === value,
          nakedSingle: showNakedSingles && !value && getCandidates(cells, (row * 9) + index).size === 1
        }"
        @click="onCellClick((row * 9) + index)"
      >
        <span>
          {{ value || '' }}
        </span>
        <ol v-if="!value && (autoCandidateMode || notes.size > 0)" class="notes">
          <li
            v-for="(hasNote, i) in Array.from(autoCandidateMode ? getCandidates(cells, (row * 9) + index) : notes)
              .reduce((acc, cur) => { acc[cur - 1] = true; return acc; }, Array(9) as boolean[])"
            :class="{
              selectedNumber: selectedNumber && selectedNumber === i + 1
            }"
          >
            {{ hasNote ? i + 1 : '' }}
          </li>
        </ol>
      </td>
    </tr>
  </table>
</template>

<style scoped>
/* @import url('https://fonts.googleapis.com/css2?family=Sarabun&display=swap'); */

.puzzle {
  margin: 0;
  padding: 0;
  border: 4px solid black;
  background-color: #777;
  text-align: center;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
  font-family: Consolas;
  user-select: none;
}

.cell {
  background: white;
  color: #0786c1;
  width: 1.2em;
  height: 1.2em;
  line-height: 1.2em;
  font-size: 3em;
  margin: 0;
  padding: 0;
  cursor: pointer;
}
 
.row:hover td,
.puzzle:has(td:nth-child(1):hover) td:nth-child(1),
.puzzle:has(td:nth-child(2):hover) td:nth-child(2),
.puzzle:has(td:nth-child(3):hover) td:nth-child(3),
.puzzle:has(td:nth-child(4):hover) td:nth-child(4),
.puzzle:has(td:nth-child(5):hover) td:nth-child(5),
.puzzle:has(td:nth-child(6):hover) td:nth-child(6),
.puzzle:has(td:nth-child(7):hover) td:nth-child(7),
.puzzle:has(td:nth-child(8):hover) td:nth-child(8),
.puzzle:has(td:nth-child(9):hover) td:nth-child(9) {
  position: relative;
  & :after {
    content: '';
    display: block;
    position: absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    background: rgba(255, 251, 0, 0.2);
  }
  
}

.row:nth-child(3n):not(:nth-child(9n)) td {
  border-bottom: 2px solid #555;
}
.cell:nth-child(3n):not(:nth-child(9n)) {
  border-right: 2px solid #555;
}

.cell:hover {
  background-color: lightsalmon;
}

.cell.given {
  color: #111;
  /* background-color: #fafafa; */
}
.cell.nakedSingle {
  background: rgb(208, 249, 197);
}
.cell.selectedCell {
  background: #ffda00;
  outline: none;
  font-weight: bold;
}
.cell.selectedCell.given {
  background: #e6c500;
}
.cell.conflicts:not(.given) {
  color: red;
}


.cell.selectedNumber:not(.selectedCell) {
  background: #eae8e1;
  font-weight: bold;
}

.notes {
  list-style: none;
  padding: 0;
  font-size: 0.33em;
  line-height: 1.25;
  display: flex;
  flex-wrap: wrap;
  height: calc(100% - 4px);
  color: #505050;
  margin: 2px;
  text-shadow: none;
}
.notes li {
  width: calc(100% / 3);
  height: 1em;
}
.notes .selectedNumber {
  font-weight: bold;
}
</style>
