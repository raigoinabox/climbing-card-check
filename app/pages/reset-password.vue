<script setup lang="ts">
import { getMessage } from "~/utils/app_utils";

const route = useRoute();
const passwords = ref({
  token: route.query.token,
  newPassword: "",
  passwordRepeat: "",
});
const toast = useToast();
const { fetch } = useUserSession();

async function submitForm() {
  if (passwords.value.newPassword != passwords.value.passwordRepeat) {
    toast.add({
      color: "error",
      title: "Paroolid ei ühti",
      description: "Tee kindlaks, et sa sisestasid mõlemad paroolid õigesti",
    });
    return;
  }

  try {
    await $fetch("/api/reset_password", {
      method: "POST",
      body: passwords.value,
    });
    await fetch();
    await navigateTo("/");
  } catch (error) {
    toast.add({
      color: "error",
      title: "Viga",
      description: getMessage(error) ?? "Süsteemi viga",
    });
  }
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
          <FormButton>Salvesta</FormButton>
        </FormBody>
      </form>
    </template>
  </RonLayout>
</template>
