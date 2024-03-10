import { getSudoku } from 'sudoku-gen'
import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type'

export interface Cell {
  value: number;
  notes: Set<number>;
  isGiven: boolean;
  answer?: number;
}

export const generatePuzzle = (difficulty: Difficulty = 'expert') => {
  const sudoku = getSudoku(difficulty)
  return sudoku.puzzle.split('').map((val, i) => ({
    value: val === '-' ? 0 : Number(val),
    isGiven: val !== '-',
    answer: Number(sudoku.solution[i]),
    notes: new Set<number>(),
  })) as Cell[]
}

export const getNeighbors = (index: number) => {
  const neighbors = []
  const row = Math.floor(index / 9)
  const col = index % 9
  for (let i = 0; i < 9; i++) {
    const y = (Math.floor(row / 3) * 3) + Math.floor(i / 3)
    const x = (Math.floor(col / 3) * 3) + (i % 3)
    neighbors.push(
      (row * 9) + i, // row (horizontal)
      (i * 9) + col, // column (vertical)
      (y * 9) + x, // square
    )
  }
  return neighbors.filter(i => i !== index)
}

export const getCandidates = (cells: Cell[], cellIndex: number) => {
  const candidates = new Set<number>()
  const neighbors = getNeighbors(cellIndex)
  for (let val = 1; val <= 9; val++) {
    if (!neighbors.some(neighborIndex => cells[neighborIndex].value === val)) {
      candidates.add(val)
    }
  }
  return candidates
}

export const getNextSingleIndex = (cells: Cell[]) => {
  for (let index in cells) {
    if (!cells[index] && getCandidates(cells, Number(index)).size === 1)
      return Number(index)
  }
  return 0
}

export const isPuzzleComplete = (puzzle: Cell[]) => puzzle.every(cell => cell.value === cell.answer)

export const isPuzzleEffectivelyComplete = (puzzle: Cell[]) => {
  let puzzleCopy = puzzle.slice()
  for (let i = 0; i < puzzleCopy.length; i++) {
    if (puzzleCopy[i].value) continue
    const candidates = getCandidates(puzzleCopy, Number(i))
    if (candidates.size === 1) {
      // a cell with only a single candidate was found ("naked single"),
      // set that cell's value in the copy then restart
      puzzleCopy[i] = { ...puzzleCopy[i], value: candidates.values().next().value }
      i = -1
      if (isPuzzleComplete(puzzleCopy)) {
        return true
      }
    }
  }
  return false
}
