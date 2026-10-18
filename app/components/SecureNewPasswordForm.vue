<script lang="ts" setup>
import { useMutation } from "~/composables/useMutation";

const { oldPassword } = defineProps<{ oldPassword: string }>();

const emit = defineEmits<{ (e: "submit"): void }>();

const newPassword = ref("");

const createPassword = useMutation(async () => {
  await $fetch("/api/auth/change_password", {
    method: "POST",
    body: { oldPassword, newPassword: newPassword.value },
  });
});

async function submitForm() {
  if (newPassword.value == oldPassword) {
    createPassword.setError({
      title: "Vali teine parool",
      description: "Vana parool ei ole lubatud",
    });
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
      <NewPasswordFields v-model="newPassword" />
      <FormButton :loading="createPassword.pending.value">Salvesta</FormButton>
      <FormError :error="createPassword.error.value" />
    </FormBody>
  </form>
</template>
