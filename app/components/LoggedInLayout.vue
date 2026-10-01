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
const resetPassword = ref(false);

const login = useMutation(async () => {
  const result = await $fetch("/api/login", {
    method: "POST",
    body: credentials.value,
  });
  await fetch();
  resetPassword.value = result.resetPassword ?? false;
});

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
      <div v-if="openForgotPassword">
        <ForgotPasswordForm />
      </div>
      <div v-else-if="resetPassword && loggedIn">
        <SecureNewPasswordForm
          :old-password="credentials.password"
          @submit="resetPassword = false"
        />
      </div>
      <div v-else-if="loggedIn" :class="{ ['w-full']: instructions == null }">
        <slot name="form"></slot>
      </div>
      <div v-else>
        <FormInstruction>Logi sisse</FormInstruction>
        <form @submit.prevent="login.mutate()">
          <FormBody>
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
            <FormButton :loading="login.pending.value">Logi sisse</FormButton>
            <FormError :error="login.error.value" />
            <UButton
              variant="link"
              class="self-end"
              @click="openForgotPassword = true"
              >Unustasid salasõna?</UButton
            >
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
