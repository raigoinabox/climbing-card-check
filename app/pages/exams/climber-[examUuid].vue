<script setup lang="ts">
import FormButton from "~/components/FormButton.vue";
import { useMutation } from "~/composables/useMutation";

const examState = ref({
  confirmResponsibilityDeclaration: false,
  confirmPrivacyPolicy: false,
});

const route = useRoute();
const { error, pending, mutate } = useMutation(async () => {
  const val = await $fetch("/api/exams/confirm_legal", {
    method: "POST",
    body: { examUuid: route.params.examUuid, ...examState.value },
  });
  window.location.href = val;
});
</script>

<template>
  <RonLayout
    :instructions="[
      'Kinnita nõusolek',
      'Maksa ronimisliidu tasu',
      'Su kaart registreeritakse',
    ]"
  >
    <form @submit.prevent="mutate()">
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
        <FormButton :loading="pending">Maksa tasu</FormButton>
        <FormError :error="error" />
      </FormBody>
    </form>

    <template #instructions-header>Ronijaks registreerimine</template>
  </RonLayout>
</template>
