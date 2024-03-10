<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{
  onClose: () => void,
}>()

const outerElem = ref(null)
</script>

<template>
  <div
    class="outer"
    ref="outerElem"
    @click="(evt) => evt.target === outerElem && onClose()"
  >
    <div class="inner">
      <button class="close" aria-label="Close" @click="onClose">
        ❌
      </button>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.outer {
  position: fixed;
  top: 0; bottom: 0;
  left: 0; right: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.inner {
  background: #fff;
  padding: 24px;
  position: relative;
}
.close {
  float: right;
  appearance: none;
  background: transparent;
  border: none;
  position: absolute;
  top: 12px;
  right: 12px;
}
.close:hover {
  background: #fff;
  cursor: pointer;
}
</style>
