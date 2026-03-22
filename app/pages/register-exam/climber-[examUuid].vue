<script setup lang="ts">
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import FormButton from "~/components/FormButton.vue";
import { getMessage } from "~/utils/app_utils";

const examState = ref({
  confirmResponsibilityDeclaration: false,
  confirmPrivacyPolicy: false,
});

const route = useRoute();
const toast = useToast();

async function openPaymentOptions() {
  try {
    const val = await $fetch("/api/confirm_legal", {
      method: "POST",
      body: { examUuid: route.params.examUuid, ...examState.value },
    });
    window.location.href = val;
    toast.add({ title: "Töötab" });
  } catch (e) {
    toast.add({
      color: "error",
      title: "Viga",
      description: getMessage(e) ?? "Maksemeetodi saamine ebaõnnestus",
    });
  }
}
</script>

<template>
  <RonLayout
    :show-results="false"
    :instructions="[
      'Kinnita seaduslik osa',
      'Maksa ronimisliidu tasu',
      'Su kaart registreeritakse',
    ]"
  >
    <template #instructions-header>Ronijaks registreerimine</template>
    <template #form>
      <form @submit.prevent="openPaymentOptions">
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
          <FormButton>Maksa tasu</FormButton>
        </FormBody>
      </form>
    </template>
  </RonLayout>
</template>
