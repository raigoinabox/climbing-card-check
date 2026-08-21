<script setup lang="ts">
import LoggedInLayout from "~/components/LoggedInLayout.vue";
import FormBody from "~/components/FormBody.vue";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import { getMessage } from "~/utils/app_utils";
import FormField from "~/components/FormField.vue";
import { useToast } from "@nuxt/ui/runtime/composables/useToast.js";

interface ExamData {
  climberName: string | null;
  climberIdCode: string | null;
  climberIdCodeForeign: boolean;
  climberEmail: string | null;
  examDate: string | null;
  examType: "roheline";
  commentary: string;
}

function initialFormValues() {
  return {
    climberName: null,
    climberIdCode: null,
    climberIdCodeForeign: false,
    climberEmail: null,
    examDate: null,
    examType: "roheline",
    commentary: "",
  } satisfies ExamData;
}

const instructions = [
  "Sisesta eksami andmed",
  "Kontrolli need üle ja salvesta",
  "Ronijale saadetakse email",
];

const formSaving = ref<boolean>(false);
const examForm = ref<ExamData>(initialFormValues());
const suggestForeigner = ref(false);

const toast = useToast();

function handleIdCodeChange() {
  const idCode = examForm.value.climberIdCode;
  if (idCode != null && !isIdCodeValid(idCode)) {
    suggestForeigner.value = true;
  }
}

function handleIdCodeInput() {
  const idCode = examForm.value.climberIdCode;
  if (idCode != null && 12 <= idCode.length) {
    suggestForeigner.value = true;
  }
}

async function submitExam() {
  if (
    examForm.value.climberIdCode == null ||
    (!examForm.value.climberIdCodeForeign &&
      !isIdCodeValid(examForm.value.climberIdCode))
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

    examForm.value.climberName = null;
    examForm.value.climberIdCode = null;
    examForm.value.climberEmail = null;
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
    <LoggedInLayout :instructions="instructions" :show-results="false">
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
              :maxlength="100"
              pattern="\d+"
              title="Ainult numbrimärgid"
              placeholder="12345678901"
              @change="handleIdCodeChange"
              @input="handleIdCodeInput"
            />
            <UCheckbox
              v-if="suggestForeigner"
              v-model="examForm.climberIdCodeForeign"
              label="Kas on välismaalase isikukood?"
              description="Siis jätame isikukoodi kontrolli vahele"
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

      <template #instructions-header>Väljastatud kaardi lisamine</template>
    </LoggedInLayout>
</template>
