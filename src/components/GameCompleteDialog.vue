<script setup lang="ts">
import { formatTime } from '../time'
const props = defineProps<{
  gameHistory: Array<{ duration: number; date: Date }>,
}>()
const game = props.gameHistory[props.gameHistory.length - 1]
const averageDuration = props.gameHistory.reduce((acc, game) => acc + game.duration, 0) / props.gameHistory.length
const difference = (averageDuration - game.duration) / averageDuration
const differencePercent = Math.abs(Math.floor(difference * 10000) / 100)
const ranking = props.gameHistory.slice().sort((a, b) => a.duration - b.duration).indexOf(game) + 1
const ordinalEnding = (number: number) =>
  (number % 10 === 1 && number !== 11) ? 'st' :
  (number % 10 === 2 && number !== 12) ? 'nd' :
  (number % 10 === 3 && number !== 13) ? 'rd' :
  'th'

const NUM_RANKING_SEGMENTS = 25
const longestGameDuration = props.gameHistory.reduce((max, cur) => cur.duration > max ? cur.duration : max, 0)
const segments = props.gameHistory.reduce((acc, cur) => {
  const segment = Math.floor(NUM_RANKING_SEGMENTS * cur.duration / longestGameDuration)
  acc[segment] = (acc[segment] || 0) + 1
  return acc
}, new Array(NUM_RANKING_SEGMENTS).fill(0))
const largestSegment = Math.max(...segments)
</script>

<template>
  <p>
    Complete!
    <span class="time">{{ formatTime(game.duration) }}</span>
    <span class="speed-comparison">{{ differencePercent }}% {{ game.duration > averageDuration ? 'slower' : 'faster' }} than average with this ruleset</span>
  </p>
  <figure class="speed-chart">
    <ol class="chart">
      <li v-for="(count, i) in segments" :style="{
        height: `${100 * count / largestSegment}%`,
        width: `${100 / NUM_RANKING_SEGMENTS}%`
      }" :class="{ selected: i === Math.floor(NUM_RANKING_SEGMENTS * game.duration / longestGameDuration)}">
        <!-- {{ count }}, {{ formatTime(i * (longestGameDuration / NUM_RANKING_SEGMENTS)) }} - {{ formatTime((i + 1) * (longestGameDuration / NUM_RANKING_SEGMENTS)) }}  -->
      </li>
    </ol>
    <figcaption>
      {{ ranking }}<sup>{{ ordinalEnding(ranking) }}</sup> <small>/ {{ gameHistory.length }}</small>
    </figcaption>
  </figure>

</template>

<style scoped>

.time {
  font-size: 200%;
  font-weight: bold;
  display: block;
}
.speed-comparison {
  font-style: italic;
  font-size: 80%;
  color: rgba(0, 0, 0, 0.6)
}

.chart {
  display: flex;
  height: 10em;
  width: 30em;
  align-items: flex-end;
  list-style: none;
  padding: 0;
  margin: 0;
}
.chart li {
  width: 1em;
  height: 1em;
  background: rgb(135, 206, 235);
  /* border: 1px solid rgb(14, 82, 109); */
}
.chart li.selected {
  background-color: yellow;
  border: 1px solid skyblue;
}
</style>
