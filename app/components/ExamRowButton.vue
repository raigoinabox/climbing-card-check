<script setup lang="ts">
import { FormError, UButton, UPopover } from "#components";
import { useMutation } from "~/composables/useMutation";

const { uuid } = defineProps<{ uuid: string }>();

const errorShown = ref(true);

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
      :color="success ? 'success' : error ? 'error' : 'neutral'"
      variant="subtle"
      :disabled="pending || success"
      loading-auto
      :icon="
        success ? 'i-lucide-check' : error ? 'i-lucide-badge-alert' : undefined
      "
      @click="mutate()"
    >
      Saada email
    </UButton>

    <UPopover v-if="error" v-model:open="errorShown">
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
