<script setup lang="ts">
import FormError from "~/components/FormError.vue";
import NewPasswordFields from "~/components/NewPasswordFields.vue";
import RonLayout from "~/components/RonLayout.vue";
import { useMutation } from "~/composables/useMutation";

definePageMeta({ middleware: "login" });

const formFields = ref({ oldPassword: "", newPassword: "" });

const changePassword = useMutation(async () => {
  await $fetch("/api/auth/change_password", {
    method: "POST",
    body: formFields.value,
  });
});
</script>

<template>
  <RonLayout>
    <form @submit.prevent="changePassword.mutate()">
      <FormBody>
        <FormInstruction>Muuda parooli</FormInstruction>
        <FormField
          v-model.trim="formFields.oldPassword"
          label="Vana parool"
          type="password"
          placeholder="w5DB5jIm0soTMW"
          autocomplete="current-password"
          required
        />
        <NewPasswordFields v-model="formFields.newPassword" />
        <FormButton :loading="changePassword.pending.value"
          >Muuda parool</FormButton
        >
        <UAlert
          v-if="changePassword.success.value"
          color="success"
          variant="subtle"
          title="Parool on muudetud"
          description="Uue parooliga saab edaspidi sisse logida"
        />
        <FormError :error="changePassword.error.value" />
      </FormBody>
    </form>
  </RonLayout>
</template>
