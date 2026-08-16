<script setup lang="ts">
import type { InputTypeHTMLAttribute } from "vue";

defineProps<{
  label: string;
  type?: InputTypeHTMLAttribute;
  maxlength?: number;
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  title?: string;
}>();
const model = defineModel<string | null>({ required: true });
const emit = defineEmits<{ (e: "change" | "input"): void }>();
</script>

<template>
  <label>
    {{ label }}
    <input
      v-model="model"
      :type="type"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :required="required"
      :pattern="pattern"
      :title="title"
      @change="emit('change')"
      @input="emit('input')"
    />
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
  padding: 16px;
  gap: 10px;
  background: #f1faff;
  border: 1px solid #183642;
  border-radius: 24px;
  /* Inside auto layout */
  flex: none;
  flex-grow: 0;
  font-weight: 400;
}
</style>
