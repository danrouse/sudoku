<script setup lang="ts" generic="T">
const props = defineProps<{
  model: any,
  defaultValue: T,
  options: Array<[string, T]>,
  onChange: (next: T) => void,
}>()
</script>

<template>
  <div>
    <button
      v-for="[label, val] in options"
      @click="onChange(model === val ? props.defaultValue : val)"
      :class="{ selected: model === val }"
    >
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
.selected {
  background: purple;
}
</style>
