<script setup lang="ts">
import type { ClassValue } from "vue";

defineProps<{ label: string; rootClass?: ClassValue }>();
defineOptions({ inheritAttrs: false });
const model = defineModel<string | null>({ required: true });
</script>

<template>
  <label :class="rootClass">
    {{ label }}
    <input v-model="model" v-bind="$attrs" />
  </label>
</template>

<style lang="css" scoped>
label {
  font-weight: 500;
  width: 100%;
}

input {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1em;
  gap: 0.625em;
  background: #f1faff;
  border: 1px solid #183642;
  border-radius: 1.5em;
  /* Inside auto layout */
  flex: none;
  flex-grow: 0;
  font-weight: 400;
}
</style>
