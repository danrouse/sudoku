<script setup lang="ts">
import { formatTime } from '../time';

const props = defineProps<{
  games: Array<{ duration: number; date: Date }>,
}>()

const games = props.games.slice().sort((a, b) => a.duration - b.duration)
</script>

<template>
<ul class="stats">
  <li>
    Games: {{ games.length }}
  </li>
  <li>
    Total time: {{ formatTime(games.reduce((acc, game) => acc + game.duration, 0)) }}
  </li>
  <li>
    Average: {{ formatTime(games.reduce((acc, game) => acc + game.duration, 0) / (games.length || 1)) }}
  </li>
</ul>
<ol class="history">
  <li v-for="{ duration, date } in games">
    {{ formatTime(duration) }}
    <time class="game-date">
      {{ date.toLocaleString('en-US', {}) }}
    </time>
  </li>
</ol>
</template>

<style scoped>
.stats {
  padding: 0 12px;
  margin: 0;
  list-style: none;
}
.history {
  margin: 0;
  padding: 12px 24px;
  list-style: none;
}
.game-date {
  font-size: 80%;
  opacity: 0.8;
}
.average {
  background-color: #ccc;
  font-style: italic;
  padding: 2px;
  text-align: center;
  font-size: 80%;
}
</style>
