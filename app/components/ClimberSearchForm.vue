<script setup lang="ts">
import { useMutation } from "~/composables/useMutation";

const { submit } = defineProps<{
  submit: (climberId: string) => Promise<void>;
}>();

const idCode = ref("");

const isSubmitDisabled = computed(() => {
  return !idCode.value || idCode.value.length < 11;
});

const submitMutation = useMutation(() => submit(idCode.value));

async function submitForm() {
  if (!idCode.value) return;
  await submitMutation.mutate();
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <FormInstruction>Kontrolli ronimisõigust isikukoodi alusel</FormInstruction>
    <FormBody>
      <FormField
        v-model.trim="idCode"
        label="Isikukood"
        type="text"
        :maxlength="100"
        placeholder="12345678901"
      />
      <FormButton
        :loading="submitMutation.pending.value"
        :disabled="isSubmitDisabled"
      >
        KONTROLLI
      </FormButton>
    </FormBody>
  </form>
</template>
