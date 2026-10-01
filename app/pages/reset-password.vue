<script setup lang="ts">
import { useMutation } from "~/composables/useMutation";

const route = useRoute();
const passwords = ref({
  token: route.query.token,
  newPassword: "",
  passwordRepeat: "",
});
const { fetch } = useUserSession();
const resetPassword = useMutation(async () => {
  await $fetch("/api/reset_password", {
    method: "POST",
    body: passwords.value,
  });
  await fetch();
  await navigateTo("/");
});

async function submitForm() {
  if (passwords.value.newPassword != passwords.value.passwordRepeat) {
    resetPassword.setError({ description: "Paroolid ei ühti" });
    return;
  }

  resetPassword.mutate();
}
</script>

<template>
  <RonLayout :show-results="false">
    <template #form>
      <form @submit.prevent="submitForm">
        <FormBody>
          <FormInstruction>Sisesta oma uus parool</FormInstruction>
          <FormField
            v-model.trim="passwords.newPassword"
            label="Uus parool"
            type="password"
            autocomplete="new-password"
            minlength="14"
            required
          />
          <FormField
            v-model.trim="passwords.passwordRepeat"
            label="Sama parool uuesti"
            type="password"
            autocomplete="new-password"
            minlength="14"
            required
          />
          <FormButton :loading="resetPassword.pending.value"
            >Salvesta</FormButton
          >
          <FormError :error="resetPassword.error.value" />
        </FormBody>
      </form>
    </template>
  </RonLayout>
</template>
