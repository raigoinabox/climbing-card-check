<script setup lang="ts">
import FormField from "~/components/FormField.vue";
import { useMutation } from "~/composables/useMutation.ts";

const { loggedIn, fetch } = useUserSession();

const credentials = ref({ email: "", password: "" });
const openForgotPassword = ref(false);
const resetPassword = ref(false);

if (loggedIn.value && !resetPassword.value) {
  await navigateTo("/");
}

const login = useMutation(async () => {
  const result = await $fetch("/api/auth/login", {
    method: "POST",
    body: credentials.value,
  });
  await fetch();
  if (result.resetPassword) {
    resetPassword.value = true;
  } else {
    await navigateTo("/");
  }
});
</script>

<template>
  <RonLayout>
    <div v-if="openForgotPassword">
      <ForgotPasswordForm @back="openForgotPassword = false" />
    </div>
    <div v-else-if="resetPassword">
      <SecureNewPasswordForm
        :old-password="credentials.password"
        @submit="navigateTo('/')"
      />
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

    <template #results>
      <slot name="results"></slot>
    </template>

    <template #instructions-header
      ><slot name="instructions-header"></slot
    ></template>
  </RonLayout>
</template>
