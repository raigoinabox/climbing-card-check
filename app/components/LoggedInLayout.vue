<script setup lang="ts">
import FormField from "./FormField.vue";
import { useMutation } from "~/composables/useMutation.ts";

const { showResults, instructions = null } = defineProps<{
  showResults: boolean;
  instructions?: string[];
}>();

const { loggedIn, fetch } = useUserSession();
const credentials = ref({ email: "", password: "" });
const openForgotPassword = ref(false);

const loginFetch = useMutation(async () => {
  await $fetch("/api/login", { method: "POST", body: credentials.value });
  await fetch();
});
const forgotPasswordFetch = useMutation(async () => {
  await $fetch("/api/forgot_password", {
    method: "POST",
    body: credentials.value,
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
      title: `Palun proovige uuesti ${retryAfter.toLocaleString(undefined, {dateStyle: "medium", timeStyle: "short"})}`,
      description: `Turvalisuse kaalutlustel piirame saadetud emailide hulka.`,
    };
  } else {
    return undefined;
  }
});

async function login() {
  if (!openForgotPassword.value) {
    await loginFetch.mutate();
  } else {
    await forgotPasswordFetch.mutate();
  }
}

const improvedInstructions =
  instructions == null ? undefined : ["Logi sisse", ...instructions];
</script>

<template>
  <RonLayout
    :show-results="showResults"
    :instructions="improvedInstructions"
    :wider="instructions == null && loggedIn"
  >
    <template #form>
      <div v-if="loggedIn" :class="{ ['w-full']: instructions == null }">
        <slot name="form"></slot>
      </div>
      <div v-else>
        <FormInstruction v-if="!openForgotPassword">Logi sisse</FormInstruction>
        <FormInstruction v-else>Sisesta email</FormInstruction>
        <form @submit.prevent="login">
          <FormBody v-if="!openForgotPassword">
            <FormField
              v-model.trim="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
              autocomplete="username"
              required
            />

            <FormField
              v-model.trim="credentials.password"
              label="Parool"
              type="password"
              placeholder="w5DB5jIm0soTMW"
              autocomplete="current-password"
              required
            />
            <FormButton :loading="loginFetch.pending.value"
              >Logi sisse</FormButton
            >
            <FormError :error="loginFetch.error.value" />
            <UButton
              variant="link"
              class="self-end"
              @click="openForgotPassword = true"
              >Unustasid salasõna?</UButton
            >
          </FormBody>
          <FormBody v-else-if="!forgotPasswordFetch.success.value">
            <FormField
              v-model.trim="credentials.email"
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
              v-model="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
              autocomplete="username"
              readonly
            />
            <p>Paroolivahetuse link on saadetud emailile</p>
          </FormBody>
        </form>
      </div>
    </template>

    <template #results>
      <slot name="results"></slot>
    </template>

    <template #instructions-header
      ><slot name="instructions-header"></slot
    ></template>
  </RonLayout>
</template>
