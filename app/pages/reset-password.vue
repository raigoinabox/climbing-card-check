<script setup lang="ts">
import NewPasswordFields from "~/components/NewPasswordFields.vue";
import { useMutation } from "~/composables/useMutation";

const route = useRoute();
const passwords = ref({ token: route.query.token, newPassword: "" });
const { fetch } = useUserSession();
const resetPassword = useMutation(async () => {
  await $fetch("/api/reset_password", {
    method: "POST",
    body: passwords.value,
  });
  await fetch();
  await navigateTo("/");
});
</script>

<template>
  <RonLayout :show-results="false">
    <template #form>
      <form @submit.prevent="resetPassword.mutate()">
        <FormBody>
          <FormInstruction>Sisesta oma uus parool</FormInstruction>
          <NewPasswordFields v-model="passwords.newPassword" />
          <FormButton :loading="resetPassword.pending.value"
            >Salvesta</FormButton
          >
          <FormError :error="resetPassword.error.value" />
        </FormBody>
      </form>
    </template>
  </RonLayout>
</template>
