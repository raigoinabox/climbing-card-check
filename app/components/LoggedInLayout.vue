<script setup lang="ts">
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";
import FormField from "./FormField.vue";
import { parseError } from "~/utils/app_utils.ts";

const { showResults, instructions = null } = defineProps<{
  showResults: boolean;
  instructions?: string[];
}>();

const { loggedIn, fetch } = useUserSession();
const credentials = ref({ email: "", password: "" });
const forgotPassword = ref<undefined | "form" | "sent">(undefined);
const toast = useToast();

async function login() {
  if (!forgotPassword.value) {
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
  } else {
    try {
      await $fetch("/api/forgot_password", {
        method: "POST",
        body: credentials.value,
      });
      forgotPassword.value = "sent";
    } catch (unknownError) {
      const error = parseError(unknownError);
      const data = error?.payload;
      if (
        data != null &&
        "retryAfter" in data &&
        typeof data.retryAfter == "string"
      ) {
        const retryAfter = new Date(data.retryAfter);
        toast.add({
          color: "error",
          title: "Palun proovige hiljem uuesti",
          description: `${retryAfter.toLocaleString()} võib uuesti proovida. Turvalisuse kaalutlustel piirame saadetud emailide hulka.`,
        });
      } else {
        toast.add({
          title: "Viga",
          description: error?.message ?? "Midagi läks valesti",
          color: "error",
        });
      }
    }
  }
}

const improvedInstructions =
  instructions == null ? undefined : ["Logi sisse", ...instructions];
</script>

<template>
  <RonLayout
    :show-results="showResults"
    :instructions="improvedInstructions"
    :wider="instructions == null && loggedIn"
  >
    <template #form>
      <div v-if="loggedIn" :class="{ ['w-full']: instructions == null }">
        <slot name="form"></slot>
      </div>
      <div v-else>
        <FormInstruction v-if="forgotPassword == null"
          >Logi sisse</FormInstruction
        >
        <FormInstruction v-else>Sisesta email</FormInstruction>
        <form @submit.prevent="login">
          <FormBody v-if="forgotPassword == null">
            <FormField
              v-model.trim="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
              autocomplete="username"
              required
            />

            <FormField
              v-model.trim="credentials.password"
              label="Parool"
              type="password"
              placeholder="w5DB5jIm0soTMW"
              autocomplete="current-password"
              required
            />
            <FormButton>Logi sisse</FormButton>
            <UButton
              variant="link"
              class="self-end"
              @click="forgotPassword = 'form'"
              >Unustasid salasõna?</UButton
            >
          </FormBody>
          <FormBody v-else-if="forgotPassword == 'form'">
            <FormField
              v-model.trim="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
              autocomplete="username"
              required
            />
            <FormButton>Saada email</FormButton>
          </FormBody>
          <FormBody v-else>
            <FormField
              v-model="credentials.email"
              label="Email"
              type="email"
              placeholder="admin@ronimisliit.ee"
              autocomplete="username"
              readonly
            />
            <p>Paroolivahetuse link on saadetud emailile</p>
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
