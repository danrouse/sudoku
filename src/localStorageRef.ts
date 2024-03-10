import { ref, reactive, watch } from 'vue'

export const localStorageRef = <T>(key: string, defaultValue: any, deserializer?: (s: any) => any) => {
  const deserializedRef = ref(
    (JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue),
      (_, v) => deserializer ? deserializer(v) : v)) as T
  )
  watch(
    deserializedRef,
    () => localStorage.setItem(key, JSON.stringify(deserializedRef.value)),
    { deep: true }
  )
  return deserializedRef
}

// TODO: this is ugly /shrug
export const localStorageReactive = <T extends Object>(key: string, defaultValue: any, deserializer?: (s: any) => any) => {
  const deserializedRef = reactive(
    (JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue),
      (_, v) => deserializer ? deserializer(v) : v)) as T
  )
  watch(
    deserializedRef,
    () => localStorage.setItem(key, JSON.stringify(deserializedRef)),
    { deep: true }
  )
  return deserializedRef
}
