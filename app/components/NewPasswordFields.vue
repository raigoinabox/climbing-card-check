<script setup lang="ts">
const newPassword = defineModel<string>({ required: true });
const confirmPassword = ref("");
</script>

<template>
  <FormField
    v-model.trim="newPassword"
    label="Uus parool"
    type="password"
    autocomplete="new-password"
    minlength="15"
    required
  />
  <FormField
    v-model.trim="confirmPassword"
    label="Kinnita uus parool"
    type="password"
    autocomplete="new-password"
    minlength="15"
    required
    :custom-validity="
      newPassword != confirmPassword ? 'Paroolid ei ühti' : undefined
    "
  />
</template>
