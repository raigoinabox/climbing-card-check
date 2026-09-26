<script setup lang="ts">
import FormButton from "~/components/FormButton.vue";
import { useMutation } from "~/composables/useMutation";

const examState = ref({
  confirmResponsibilityDeclaration: false,
  confirmPrivacyPolicy: false,
});

const route = useRoute();
const confirmLegal = useMutation(async () => {
  const val = await $fetch("/api/confirm_legal", {
    method: "POST",
    body: { examUuid: route.params.examUuid, ...examState.value },
  });
  window.location.href = val;
});
</script>

<template>
  <RonLayout
    :show-results="false"
    :instructions="[
      'Kinnita nõusolek',
      'Maksa ronimisliidu tasu',
      'Su kaart registreeritakse',
    ]"
  >
    <template #instructions-header>Ronijaks registreerimine</template>
    <template #form>
      <form @submit.prevent="confirmLegal.mutate()">
        <FormInstruction>Viimased sammud</FormInstruction>
        <FormBody>
          <label
            ><input
              v-model="examState.confirmResponsibilityDeclaration"
              type="checkbox"
              required
            />
            Kinnitan, et nõustun
            <RonLink
              href="https://www.ronimisliit.ee/omavastutusdeklaratsioon/"
              target="_blank"
              >Omavastutusdeklaratsiooniga</RonLink
            ></label
          >
          <label
            ><input
              v-model="examState.confirmPrivacyPolicy"
              type="checkbox"
              required
            />
            Kinnitan, et nõustun
            <RonLink
              href="https://www.ronimisliit.ee/andmekaitsetingimused/"
              target="_blank"
              >Andmekaitsetingimustega</RonLink
            ></label
          >
          <FormButton :loading="confirmLegal.pending.value"
            >Maksa tasu</FormButton
          >
          <FormError :error="confirmLegal.error.value" />
        </FormBody>
      </form>
    </template>
  </RonLayout>
</template>
