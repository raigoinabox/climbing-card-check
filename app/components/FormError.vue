<script setup lang="ts">
defineProps<{ error?: { title?: string; description?: string } }>();
</script>

<template>
  <UAlert
    v-if="error"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :title="error.title"
    :description="error.description ?? 'Midagi läks valesti'"
  ></UAlert>
</template>
