<script setup lang="ts">
const { submit } = defineProps<{
  submit: (climberId: string) => Promise<unknown>;
}>();

const idCode = ref("");
const isLoading = ref(false);

const isSubmitDisabled = computed(() => {
  return !idCode.value || idCode.value.length !== 11;
});
async function submitForm() {
  if (!idCode.value) return;
  isLoading.value = true;
  try {
    await submit(idCode.value);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <p>Kontrolli ronimisõigust isikukoodi alusel</p>
    <FormBody>
      <label
        >Isikukood
        <input
          type="text"
          v-model.trim="idCode"
          maxlength="11"
          placeholder="12345678901"
        />
      </label>
      <Button :disabled="isSubmitDisabled">
        <img
          class="loading-spinner"
          v-if="isLoading"
          src="/assets/Rolling-1s-200px.svg"
        />{{ isLoading ? "" : "KONTROLLI" }}
      </Button>
    </FormBody>
  </form>
</template>
