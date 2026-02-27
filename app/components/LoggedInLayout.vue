<script setup lang="ts">
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";

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
        <p>Logi sisse</p>
        <form @submit.prevent="login">
          <form-body>
            <label>
              Email
              <input
                v-model="credentials.email"
                type="email"
                placeholder="admin@ronimisliit.ee"
              />
            </label>
            <label>
              Parool
              <input
                v-model="credentials.password"
                type="password"
                placeholder="w5DB5jIm0soTMW"
              />
            </label>

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
