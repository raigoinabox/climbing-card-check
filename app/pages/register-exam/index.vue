<script setup lang="ts">
import LoggedInLayout from "~/components/LoggedInLayout.vue";
import FormBody from "~/components/FormBody.vue";
import { isIdCodeValid } from "#shared/utils/climber_utils";
import FormField from "~/components/FormField.vue";
import type { AccordionItem } from "@nuxt/ui";
import ClimberFormBody from "~/components/ClimberFormBody.vue";
import type { ExamDto, ExamClimberDto } from "#shared/types/api_types";
import { useMutation } from "~/composables/useMutation";

function createClimber() {
  return { name: "", idCode: "", email: "", foreigner: false, comment: "" };
}

const examForm = ref({
  examDate: null,
  examType: "roheline",
  climbers: [createClimber()],
} satisfies ExamDto);
const sentClimbers = ref<ExamClimberDto[]>([]);
const openClimber = ref("0");
const climberTabs = computed(() =>
  sentClimbers.value
    .map(
      (climber) => ({ label: climber.name, disabled: true }) as AccordionItem,
    )
    .concat(
      examForm.value.climbers.map(
        (climber, idx) =>
          ({
            label: climber.name || `Ronija ${idx == 0 ? "" : idx + 1}`,
          }) satisfies AccordionItem,
      ),
    ),
);

const saveExam = useMutation(async () => {
  const { savedCount } = await $fetch("/api/save_exam", {
    method: "POST",
    body: examForm.value,
  });

  for (const saved of examForm.value.climbers.splice(0, savedCount)) {
    sentClimbers.value.push(saved);
  }
});

async function submitExam() {
  if (examForm.value.climbers.length == 0) {
    saveExam.setError("Ronijad puuduvad");
    return;
  }

  for (const climber of examForm.value.climbers) {
    if (!climber.foreigner && !isIdCodeValid(climber.idCode)) {
      saveExam.setError(`${climber.name} isikukood ei valideeru`);
      return;
    }
  }

  await saveExam.mutate();

  const firstClimber = examForm.value.climbers[0];
  if (firstClimber != null) {
    saveExam.setError("Andmete salvestamisel viga");
  }
}
</script>

<template>
  <LoggedInLayout :show-results="false">
    <template #form>
      <form @submit.prevent="submitExam">
        <FormInstruction>Sisesta eksami andmed</FormInstruction>
        <FormBody>
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
              :content="{ bodyLock: false }"
            />
          </label>

          <UAccordion
            v-model="openClimber"
            :items="climberTabs"
            style="border-top: thin solid var(--ui-border)"
          >
            <template #leading="{ index, open }">
              <UBadge v-if="index < sentClimbers.length" color="success"
                >Salvestatud</UBadge
              >
              <UButton
                v-else
                :class="{ invisible: !open }"
                icon="i-lucide-trash"
                color="warning"
                variant="ghost"
                size="xs"
                @click="
                  (event) => {
                    event.stopPropagation();
                    examForm.climbers.splice(index - sentClimbers.length, 1);
                  }
                "
              />
            </template>
            <template #body="{ index }">
              <ClimberFormBody
                v-if="examForm.climbers[index - sentClimbers.length] != null"
                v-model:climber="
                  examForm.climbers[index - sentClimbers.length]!
                "
              />
            </template>
          </UAccordion>
          <div>
            <UButton
              icon="i-lucide-plus"
              class="mb-3"
              @click="
                () => {
                  const climbers = examForm.climbers;
                  const newClimber = createClimber();
                  const lastClimber = climbers[climbers.length - 1];
                  if (lastClimber != null) {
                    newClimber.comment = lastClimber.comment;
                  }
                  climbers.push(newClimber);
                  openClimber = String(
                    sentClimbers.length + climbers.length - 1,
                  );
                }
              "
              >Lisa eksamineeritav</UButton
            >
          </div>
          <FormButton :loading="saveExam.pending.value">Salvesta</FormButton>
          <UAlert
            v-if="saveExam.success.value"
            color="success"
            variant="subtle"
            title="Salvestatud"
            description="Registreerisime eksami ja saatsime ronijatele emailid"
          />
          <FormError :error="saveExam.error.value" />
        </FormBody>
      </form>
    </template>
  </LoggedInLayout>
</template>
