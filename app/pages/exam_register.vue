<script setup lang="ts">
import type { CardClimberDto } from "~~/shared/types/api_types";
import LoggedInLayout from "~/components/LoggedInLayout.vue";
import FormBody from "~/components/FormBody.vue";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import { getMessage } from "~/utils/app_utils";

const climber = ref<
  { id: string; certificate: "none" } | CardClimberDto | null
>(null);

function initialFormValues() {
  return {
    climberName: null,
    climberIdCode: null,
    climberEmail: null,
    examDate: null,
    examType: "roheline",
    commentary: null,
  };
}

const instructions = [
  "Sisesta eksami andmed",
  "Kontrolli need üle ja salvesta",
  "Ronijale saadetakse email",
];

const formState = ref<{
  error?: string | null;
  saving?: boolean;
  saved?: boolean;
}>({});
const examForm = ref(initialFormValues());

async function submitExam() {
  if (
    examForm.value.climberIdCode == null ||
    !isIdCodeValid(examForm.value.climberIdCode)
  ) {
    formState.value = { error: "Ronija isikukood ei valideeru" };
    return;
  }

  formState.value = { saving: true };
  try {
    await $fetch("/api/save_exam", { method: "POST", body: examForm.value });
    formState.value = { saved: true };
    examForm.value = initialFormValues();
  } catch (error) {
    formState.value = { error: getMessage(error) };
  }
}
</script>

<template>
  <div>
    <LoggedInLayout
      :instructions="instructions"
      :show-results="climber != null"
      @go-back="climber = null"
    >
      <template #form>
        <form @submit.prevent="submitExam">
          <FormInstruction>Sisesta eksami andmed</FormInstruction>
          <p v-if="formState.error" class="text-red-500">
            Viga: {{ formState.error }}
          </p>
          <p v-if="formState.saved">Salvestatud</p>
          <FormBody>
            <label>
              Ronija nimi
              <input v-model.trim="examForm.climberName" required />
            </label>
            <label>
              Ronija isikukood
              <input
                v-model.trim="examForm.climberIdCode"
                required
                maxlength="11"
                placeholder="12345678901"
              />
            </label>
            <label>
              Ronija email
              <input
                v-model.trim="examForm.climberEmail"
                type="email"
                required
              />
            </label>
            <label>
              Eksami toimumise kuupäev
              <input v-model.trim="examForm.examDate" type="date" required />
            </label>
            <label>
              Eksami tüüp
              <USelect
                v-model="examForm.examType"
                :items="['roheline', 'punane']"
                required
                class="w-full"
              />
            </label>
            <label>
              Kommentaar (valikuline)
              <UTextarea
                v-model="examForm.commentary"
                autoresize
                class="w-full"
              />
            </label>
            <FormButton :disabled="formState.saving">Sisesta</FormButton>
          </FormBody>
        </form>
      </template>

      <template #results></template>

      <template #instructions-header>Väljastatud kaardi lisamine</template>
    </LoggedInLayout>
  </div>
</template>
