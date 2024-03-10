<script setup lang="ts">
import SudokuBoard from './components/SudokuBoard.vue'
import NumberButtons from './components/NumberButtons.vue'
import StatsView from './components/StatsView.vue'
import ModalDialog from './components/ModalDialog.vue'
import ToggleableSidebar from './components/ToggleableSidebar.vue'
import RadioGroup from './components/RadioGroup.vue'
import GameCompleteDialog from './components/GameCompleteDialog.vue'

import { ref, reactive, onMounted, onUnmounted, toRaw, watch } from 'vue'
import {
  generatePuzzle,
  isPuzzleComplete,
  isPuzzleEffectivelyComplete,
  getNeighbors,
  getNextSingleIndex,
  Cell
} from './sudoku'
import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type'
import { formatTime } from './time'
import { localStorageRef, localStorageReactive } from './localStorageRef'

enum NotationMode {
  Default,
  AutoCandidate,
  NoteTaking,
}

// Gameplay user state
const selectedCellIndex = ref(0)
const notationMode = ref(NotationMode.Default)

// Game state
const secondsElapsed = ref(0)
const finishTime = ref(0)
const cells = ref([] as Cell[])
const history = ref([] as Cell[][])
const isEffectivelyComplete = ref(false)

// UI elements
const hasGameCompleteDialog = ref(false)
const isPaused = ref(false)
const showSidebar = ref(false)

// Assists and difficulty settings
const difficulty = localStorageRef<Difficulty>('sudoku-difficulty', 'expert')
const difficulties = ['easy', 'medium', 'hard', 'expert']
const assists = localStorageReactive<{[key: string]: boolean}>('sudoku-user-assists', {
  showEffectivelyComplete: true,
  showNakedSingles: true,
  removeInvalidatedNotes: true,
  finishPuzzleOnEffectivelyComplete: true,
  showConflicts: false,
})
watch([difficulty, assists], () => {
  const key = getHistoryKey()
  if (!gameHistory.value[key]) gameHistory.value[key] = []
})

interface GameHistory {
  [rulesKey: string]: GameHistoryItem[]
}
interface GameHistoryItem {
  duration: number,
  date: Date,
}
const getHistoryKey = (d: Difficulty = difficulty.value, a: typeof assists = assists) =>
  d + '|' + Object.entries(a).toSorted((a, b) => a[0].localeCompare(b[0])).map(tup => tup.join(':'), '').join(',')

const currentHistoryKey = ref(getHistoryKey())

const checkPuzzleCompletion = () => {
  if (isPuzzleComplete(cells.value)) {
    finishTime.value = secondsElapsed.value
    handlePuzzleCompleted(finishTime.value)
  } else if (
    (assists.showEffectivelyComplete || assists.finishPuzzleOnEffectivelyComplete) &&
    isPuzzleEffectivelyComplete(cells.value)
  ) {
    if (assists.showEffectivelyComplete) {
      isEffectivelyComplete.value = true
    }
    if (assists.finishPuzzleOnEffectivelyComplete) {
      finishTime.value = secondsElapsed.value
      handlePuzzleCompleted(finishTime.value)
    }
  }
}

const updateCellValue = (cellIndex: number, cellValue?: number) => {
  if (cells.value[cellIndex].isGiven) return

  history.value.push(structuredClone(toRaw(cells.value)))
  
  cells.value[cellIndex].value = cellValue || 0

  if (assists.removeInvalidatedNotes) {
    getNeighbors(cellIndex).forEach((neighborIndex) =>
      (cells.value[neighborIndex].notes.delete(cellValue || 0)))
  }
  checkPuzzleCompletion()
}

const toggleCellNote = (cellIndex: number, note: number) => {
  if (cells.value[cellIndex].isGiven) return
  const toggleMethod = cells.value[cellIndex].notes.has(note) ? 'delete' : 'add'
  cells.value[cellIndex].notes[toggleMethod](note)
}

const clearCell = (cellIndex: number) => {
  if (cells.value[cellIndex].value === 0) {
    cells.value[cellIndex].notes = new Set()
  } else {
    updateCellValue(cellIndex, 0)
  }
}

const handleNumberButtonClick = (button: number) => {
  if (!button) {
    clearCell(selectedCellIndex.value)
  } else {
    updateCellValue(selectedCellIndex.value, button)
  }
}

const actions = {
  startNewGame: () => {
    cells.value = generatePuzzle(difficulty.value)
    secondsElapsed.value = 0
    finishTime.value = 0
    isEffectivelyComplete.value = false
    history.value = []
    currentHistoryKey.value = getHistoryKey()
    while (assists.finishPuzzleOnEffectivelyComplete && isPuzzleEffectivelyComplete(cells.value)) {
      cells.value = generatePuzzle(difficulty.value)
    }
    checkPuzzleCompletion()
  },

  moveSelectionDown: () => selectedCellIndex.value = selectedCellIndex.value + 9 > 80 ? selectedCellIndex.value - 72 : selectedCellIndex.value + 9,
  moveSelectionUp: () => selectedCellIndex.value = selectedCellIndex.value - 9 < 0 ? 72 + selectedCellIndex.value : selectedCellIndex.value - 9,
  moveSelectionLeft: () => selectedCellIndex.value = selectedCellIndex.value % 9 === 0 ? selectedCellIndex.value + 8 : selectedCellIndex.value - 1,
  moveSelectionRight: () => selectedCellIndex.value = selectedCellIndex.value % 9 === 8 ? selectedCellIndex.value - 8 : selectedCellIndex.value + 1,

  clearSelectedCell: () => clearCell(selectedCellIndex.value),
  toggleSidebar: () => showSidebar.value = !showSidebar.value,
  togglePause: () => isPaused.value = !isPaused.value,
  toggleAutoCandidateMode: () => notationMode.value = notationMode.value === NotationMode.AutoCandidate ? NotationMode.Default : NotationMode.AutoCandidate,

  selectNextSingle: () => selectedCellIndex.value = getNextSingleIndex(cells.value),

  undo: () => { const previous = history.value.pop(); if (previous) { cells.value = previous } },
}

const keyboardHandlers: { [key: string]: keyof typeof actions } = {
  ArrowDown: 'moveSelectionDown',
  ArrowUp: 'moveSelectionUp',
  ArrowLeft: 'moveSelectionLeft',
  ArrowRight: 'moveSelectionRight',

  Tab: 'selectNextSingle',

  Backspace: 'clearSelectedCell',
  Delete: 'clearSelectedCell',

  Escape: 'toggleSidebar',
  ' ': 'togglePause',

  a: 'toggleAutoCandidateMode',
  n: 'startNewGame',
  z: 'undo',
}

const handleKeyDown = (event: KeyboardEvent) => {
  console.log('handleKeyDown', event.key, keyboardHandlers[event.key])
  if (keyboardHandlers[event.key]) {
    event.preventDefault()
    actions[keyboardHandlers[event.key]]()
  } else {
    const matchingNumericKey = event.code.match(/Digit([1-9])/)
    if (matchingNumericKey && (event.shiftKey || notationMode.value === NotationMode.NoteTaking)) {
      toggleCellNote(selectedCellIndex.value, Number(matchingNumericKey[1]))
    } else if (matchingNumericKey) {
      updateCellValue(selectedCellIndex.value, Number(matchingNumericKey[1]))
    }
  }
}

let clockInterval: number
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  clockInterval = setInterval(() => {
    if (!isPaused.value) secondsElapsed.value += 1
  }, 1000)
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (clockInterval) clearInterval(clockInterval)
})


const gameHistory = localStorageRef<GameHistory>(
  'sudoku-game-history',
  {},
  // deserialize JSON's ISO date strings into Date objects
  (v: any) => typeof v === 'string' && new Date(v).toISOString() === v ? new Date(v) : v
)
// backwards compatibility: check for any missing assist keys in history,
// rewrite them to add any new keys with disabled values on load.
// this updated version will be used next time the value is saved
for (let savedHistoryKey in gameHistory.value) {
  const [diff, key] = savedHistoryKey.split('|')
  const parsedAssists = key.split(',').reduce((acc: any, cur: string) => {
    const tup = cur.split(':')
    acc[tup[0]] = JSON.parse(tup[1])
    return acc
  }, {})
  Object.keys(assists).forEach(key => {
    if (!parsedAssists.hasOwnProperty(key)) {
      parsedAssists[key] = false
    }
  })
  Object.keys(parsedAssists).forEach(key => {
    if (!assists.hasOwnProperty(key)) {
      delete parsedAssists[key]
    }
  })
  const adjustedHistoryKey = getHistoryKey(diff as Difficulty, parsedAssists)
  if (adjustedHistoryKey !== savedHistoryKey) {
    gameHistory.value[adjustedHistoryKey] = (gameHistory.value[adjustedHistoryKey] || []).concat(gameHistory.value[savedHistoryKey])
    delete gameHistory.value[savedHistoryKey]
  }
}
const currentKey = getHistoryKey()
if (!gameHistory.value[currentKey]) gameHistory.value[currentKey] = []

const handlePuzzleCompleted = (secs: number) => {  
  gameHistory.value[currentHistoryKey.value].push({ duration: secs, date: new Date() })
  hasGameCompleteDialog.value = true
}

actions.startNewGame()
</script>

<template>
  <ModalDialog v-if="hasGameCompleteDialog" @close="() => hasGameCompleteDialog = false">
    <GameCompleteDialog :gameHistory="gameHistory[currentHistoryKey]" />
  </ModalDialog>
  <ModalDialog v-if="isPaused" @close="() => isPaused = false">
    Paused
  </ModalDialog>

  <div class="sidebars">
    <ToggleableSidebar :expanded="showSidebar" @toggle="actions.toggleSidebar">
      <template #button>
        <button class="sidebarButton">Options & Stats</button>
      </template>
      <div class="assistOptions">
        <label>
          Difficulty
          <select v-model="difficulty">
            <option v-for="diff in difficulties" :value="diff">{{ diff }}</option>
          </select>
        </label>
        <label>
          <input type="checkbox" v-model="assists.showEffectivelyComplete" />
          Show when puzzle is effectively complete
        </label>
        <label>
          <input type="checkbox" v-model="assists.finishPuzzleOnEffectivelyComplete" />
          Finish puzzle when it is effectively complete
        </label>
        <label>
          <input type="checkbox" v-model="assists.showNakedSingles" />
          Highlight naked singles
        </label>
        <label>
          <input type="checkbox" v-model="assists.removeInvalidatedNotes" />
          Remove invalidated notes
        </label>
        <label>
          <input type="checkbox" v-model="assists.showConflicts" />
          Show conflicts
        </label>
      </div>
      <StatsView :games="gameHistory[getHistoryKey()]" :key="getHistoryKey()" />
    </ToggleableSidebar>
  </div>

  <div class="gameArea">

    <div class="upper">
      <time class="timer">{{ formatTime(finishTime || secondsElapsed, true) }}</time>
      <div>
        <button @click="actions.startNewGame">New Game</button>
        <button @click="actions.togglePause">Pause</button>
      </div>
    </div>

    <div :class="{
      isEffectivelyComplete: assists.showEffectivelyComplete && isEffectivelyComplete
    }">
      <SudokuBoard
        :cells="cells"
        :selected-cell-index="selectedCellIndex"
        :auto-candidate-mode="notationMode === NotationMode.AutoCandidate"
        :show-naked-singles="assists.showNakedSingles"
        :show-conflicts="assists.showConflicts"
        @cell-click="index => selectedCellIndex = index"
      />
    </div>
    <NumberButtons @button-click="handleNumberButtonClick" :cells="cells" />
    <RadioGroup
      :model="notationMode"
      @change="(v: NotationMode) => notationMode = v"
      :default-value="NotationMode.Default"
      :options="[
        ['Note taking mode', NotationMode.NoteTaking],
        ['Auto candidate mode', NotationMode.AutoCandidate],
      ]"
    />
  </div>
</template>

<style scoped>
.timer {
  background: var(--foo);
  border-radius: 4px;
  color: #eee;
  padding: 4px 16px;
  font-size: 0.9em;
  font-weight: bold;
}

.isEffectivelyComplete {
  box-shadow: 0 0 20px teal;
}

.sidebars {
  position: absolute;
  top: 24px;
  left: 24px;
}
.sidebarButton {

}

.assistOptions {
  display: flex;
  flex-direction: column;
}

.gameArea {  
}
.upper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
