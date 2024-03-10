<script setup lang="ts">
defineProps<{
  expanded: boolean,
  onToggle?: () => void,
}>()
</script>

<template>
  <div @click="onToggle">
    <slot name="button" />
  </div>
  <div v-if="expanded" class="overlay">
    <div class="inner">
      <button class="close" @click="onToggle">❌</button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  /* background-color: rgba(0, 0, 0, 0.5); */
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  pointer-events: none;
}
@keyframes slide-in {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0%); }
}
.inner {
  background-color: rgba(255, 255, 255, 1);
  padding: 12px;
  max-height: calc(100% - 24px);
  overflow-y: auto;
  text-align: left;
  pointer-events: all;
  box-shadow: 0 0 10vw black;
  animation: slide-in 0.2s 1 ease-out;
}

.close {
  float: right;
  margin: 0 0 1em 1em;
}
</style>
