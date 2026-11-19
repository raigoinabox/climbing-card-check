<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";

const model = defineModel<"roheline" | "punane">();

const items: SelectItem[] = [
  { value: "roheline", label: "Roheline", ui: { itemLabel: "text-green-800" } },
  { value: "punane", label: "Punane", ui: { itemLabel: "text-red-800" } },
];
</script>

<template>
  <label>
    Kaardi tüüp
    <USelect
      v-model="model"
      :items="items"
      required
      class="w-full"
      :class="{
        ['text-green-800']: modelValue == 'roheline',
        ['text-red-800']: modelValue == 'punane',
      }"
      :content="{ bodyLock: false }"
      size="lg"
    >
    </USelect>
  </label>
</template>
