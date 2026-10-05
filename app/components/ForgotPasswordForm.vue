<script lang="ts" setup>
import { useMutation } from "~/composables/useMutation";

const emit = defineEmits<{ (e: "back"): void }>();

const email = ref("");

const forgotPasswordFetch = useMutation(async () => {
  await $fetch("/api/forgot_password", {
    method: "POST",
    body: { email: email.value },
  });
});

const forgotPasswordError = computed(() => {
  const error = forgotPasswordFetch.error.value;
  const data = error?.payload;
  if (
    data != null &&
    "retryAfter" in data &&
    typeof data.retryAfter == "string"
  ) {
    const retryAfter = new Date(data.retryAfter);
    return {
      title: `Palun proovige uuesti ${retryAfter.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`,
      description: `Turvalisuse kaalutlustel piirame saadetud emailide hulka.`,
    };
  } else {
    return undefined;
  }
});
</script>

<template>
  <UButton
    variant="ghost"
    color="neutral"
    icon="i-lucide-arrow-left"
    size="sm"
    @click="emit('back')"
    >Tagasi</UButton
  >
  <FormInstruction>Sisesta email</FormInstruction>
  <form @submit.prevent="forgotPasswordFetch.mutate()">
    <FormBody v-if="!forgotPasswordFetch.success.value">
      <FormField
        v-model.trim="email"
        label="Email"
        type="email"
        placeholder="admin@ronimisliit.ee"
        autocomplete="username"
        required
      />
      <FormButton :loading="forgotPasswordFetch.pending.value"
        >Saada email</FormButton
      >
      <FormError
        :error="forgotPasswordError ?? forgotPasswordFetch.error.value"
      />
    </FormBody>
    <FormBody v-else>
      <FormField
        v-model="email"
        label="Email"
        type="email"
        placeholder="admin@ronimisliit.ee"
        autocomplete="username"
        readonly
      />
      <p>Paroolivahetuse link on saadetud emailile</p>
    </FormBody>
  </form>
</template>
