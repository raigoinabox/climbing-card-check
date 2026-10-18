<script setup lang="ts">
import { FormError, UButton, UPopover } from "#components";
import { useMutation } from "~/composables/useMutation";

const { uuid } = defineProps<{ uuid: string }>();

const { pending, mutate, error, success } = useMutation(async () => {
  await $fetch("/api/exams/send_email_again", {
    method: "POST",
    body: { uuid },
  });
});
</script>

<template>
  <div style="display: flex">
    <UButton
      :color="success ? 'success' : 'neutral'"
      variant="subtle"
      :disabled="pending || success"
      loading-auto
      :icon="success ? 'i-lucide-check' : undefined"
      @click="mutate()"
    >
      Saada email
    </UButton>

    <UPopover v-if="error">
      <UButton
        color="error"
        icon="i-lucide-badge-alert"
        style="margin-left: 0.5em"
      />
      <template #content>
        <FormError :error="error" />
      </template>
    </UPopover>
  </div>
</template>
