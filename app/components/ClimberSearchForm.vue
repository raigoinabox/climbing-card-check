<script setup lang="ts">
import { useMutation } from "~/composables/useMutation";
import FormError from "./FormError.vue";

const { heading = "Kontrolli ronimisõigust isikukoodi alusel", submit } =
  defineProps<{
    heading?: string;
    submit: (climberId: string) => Promise<void>;
  }>();

const idCode = ref("");

const { mutate, pending, error } = useMutation(() => submit(idCode.value));
</script>

<template>
  <form @submit.prevent="mutate">
    <FormInstruction>{{ heading }}</FormInstruction>
    <FormBody>
      <FormField
        v-model.trim="idCode"
        label="Isikukood"
        type="text"
        :maxlength="100"
        placeholder="12345678901"
        required
      />
      <FormButton :loading="pending"> Kontrolli </FormButton>
      <FormError :error="error" />
    </FormBody>
  </form>
</template>
