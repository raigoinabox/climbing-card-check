<script setup lang="ts">
import type { CardClimberDto } from "~~/shared/types/api_types";
import LoggedInLayout from "~/components/LoggedInLayout.vue";
import FormBody from "~/components/FormBody.vue";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import { getMessage } from "~/utils/app_utils";
import FormField from "~/components/FormField.vue";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";

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

const formSaving = ref<boolean>(false);
const examForm = ref(initialFormValues());
const toast = useToast();

async function submitExam() {
  if (
    examForm.value.climberIdCode == null ||
    !isIdCodeValid(examForm.value.climberIdCode)
  ) {
    toast.add({
      color: "error",
      title: "Viga",
      description: "Ronija isikukood ei valideeru",
    });
    return;
  }

  formSaving.value = true;
  try {
    await $fetch("/api/save_exam", { method: "POST", body: examForm.value });
    toast.add({
      color: "success",
      title: "Salvestatud",
      description: "Registreerisime eksami ja saatsime ronijale emaili",
    });
    examForm.value = initialFormValues();
  } catch (error) {
    toast.add({
      color: "error",
      title: "Viga",
      description: getMessage(error) ?? "Andmete viga",
    });
  } finally {
    formSaving.value = false;
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
          <FormBody>
            <FormField
              v-model.trim="examForm.climberName"
              label="Ronija nimi"
              required
            />
            <FormField
              v-model.trim="examForm.climberIdCode"
              label="Ronija isikukood"
              required
              :maxlength="11"
              placeholder="12345678901"
            />
            <FormField
              v-model.trim="examForm.climberEmail"
              label="Ronija email"
              type="email"
              required
            />
            <FormField
              v-model.trim="examForm.examDate"
              label="Eksami toimumise kuupäev"
              type="date"
              required
            />
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
            <FormButton :disabled="formSaving">Sisesta</FormButton>
          </FormBody>
        </form>
      </template>

      <template #results></template>

      <template #instructions-header>Väljastatud kaardi lisamine</template>
    </LoggedInLayout>
  </div>
</template>
