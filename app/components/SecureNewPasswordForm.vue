<script lang="ts" setup>
import { useMutation } from "~/composables/useMutation";

const { oldPassword } = defineProps<{ oldPassword: string }>();

const emit = defineEmits<{ (e: "submit"): void }>();

const passwords = ref({ newPassword: "", passwordRepeat: "" });

const createPassword = useMutation(async () => {
  await $fetch("/api/new_secure_password", {
    method: "POST",
    body: passwords.value,
  });
});

async function submitForm() {
  if (passwords.value.newPassword == oldPassword) {
    createPassword.setError({
      title: "Vali teine parool",
      description: "Vana parool ei ole lubatud",
    });
    return;
  } else if (passwords.value.newPassword != passwords.value.passwordRepeat) {
    createPassword.setError({ description: "Sisestatud paroolid ei ühti" });
    return;
  }
  await createPassword.mutate();
  emit("submit");
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <FormBody>
      <FormInstruction>Loo uus parool</FormInstruction>
      <p>Turvalisuse kaalutlustel pead sa endale uue parooli looma</p>
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
      <FormButton :loading="createPassword.pending.value">Salvesta</FormButton>
      <FormError :error="createPassword.error.value" />
    </FormBody>
  </form>
</template>
