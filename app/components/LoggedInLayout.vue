<script setup lang="ts">
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import FormField from "./FormField.vue";

const { showResults, instructions = null } = defineProps<{
  showResults: boolean;
  instructions?: string[];
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

const improvedInstructions =
  instructions == null ? undefined : ["Logi sisse", ...instructions];
</script>

<template>
  <RonLayout :show-results="showResults" :instructions="improvedInstructions" :wider="instructions == null && loggedIn">
    <template #form>
      <div v-if="loggedIn" :class="{['w-full']: instructions == null}">
        <slot name="form"></slot>
      </div>
      <div v-else>
        <FormInstruction>Logi sisse</FormInstruction>
        <form @submit.prevent="login">
          <FormBody>
            <FormField
              v-model="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
              autocomplete="username"
            />
            <FormField
              v-model="credentials.password"
              label="Parool"
              type="password"
              placeholder="w5DB5jIm0soTMW"
              autocomplete="current-password"
            />
            <FormButton>Logi sisse</FormButton>
          </FormBody>
        </form>
      </div>
    </template>

    <template #results>
      <slot name="results"></slot>
    </template>

    <template #instructions-header
      ><slot name="instructions-header"></slot
    ></template>
  </RonLayout>
</template>
