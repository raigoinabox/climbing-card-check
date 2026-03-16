<script setup lang="ts">
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import FormField from "./FormField.vue";

const { showResults, instructions } = defineProps<{
  showResults: boolean;
  instructions: string[];
}>();

const { loggedIn, fetch } = useUserSession();
const credentials = ref({ email: "", password: "" });
const toast = useToast();
async function login() {
  try {
    await $fetch("/api/login", { method: "POST", body: credentials.value });

    await fetch();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    toast.add({
      title: "Sisselogimine ebaõnnestus",
      description: "Kasutajanimi või parool olid valed",
      color: "error",
    });
  }
}

const improvedInstructions = ["Logi sisse", ...instructions];
</script>

<template>
  <RonLayout :show-results="showResults" :instructions="improvedInstructions">
    <template #form>
      <div v-if="loggedIn">
        <slot name="form"></slot>
      </div>
      <div v-else>
        <FormInstruction>Logi sisse</FormInstruction>
        <form @submit.prevent="login">
          <form-body>
            <FormField
              v-model="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
            />
            <FormField
              v-model="credentials.password"
              label="Parool"
              type="password"
              placeholder="w5DB5jIm0soTMW"
            />
            <FormButton>Logi sisse</FormButton>
          </form-body>
        </form>
      </div>
    </template>

    <template #results>
      <slot name="results"></slot>
    </template>

    <template #instructions-header>Väljastatud kaardi lisamine</template>
  </RonLayout>
</template>
