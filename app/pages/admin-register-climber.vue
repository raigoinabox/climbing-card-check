<script setup lang="ts">
import FormBody from "~/components/FormBody.vue";
import FormField from "~/components/FormField.vue";
import ClimberFormBody from "~/components/ClimberFormBody.vue";
import { useMutation } from "~/composables/useMutation";

definePageMeta({ middleware: "login" });

function createClimber() {
  return { name: "", idCode: "", email: "", foreigner: false, comment: "" };
}

const examForm = ref({
  examinerName: "",
  examDate: null,
  examType: "roheline",
  climber: createClimber(),
});

const addClimber = useMutation(async () => {
  await $fetch("/api/exams/admin_add_exam", {
    method: "POST",
    body: examForm.value,
  });
});
</script>

<template>
  <RonLayout form-width="50em">
    <form @submit.prevent="addClimber.mutate()">
      <FormInstruction>Lisa ronija makstud tasuga</FormInstruction>
      <p>
        Kui on vaja vana Talinna Kaljuronimisklubi kaart üle kanda või mingil
        erandjuhul tavapärasest protsessit mööda minna, saab registreerida
        ronija kellel on tasu makstud
      </p>

      <FormBody>
        <FormField
          v-model.trim="examForm.examinerName"
          label="Eksamineerija nimi"
          required
        />
        <FormField
          v-model.trim="examForm.examDate"
          label="Eksami toimumise kuupäev"
          type="date"
          required
        />
        <label>
          Kaardi tüüp
          <USelect
            v-model="examForm.examType"
            :items="['roheline', 'punane']"
            required
            class="w-full"
          />
        </label>
        <ClimberFormBody v-model:climber="examForm.climber" />
        <FormButton :loading="addClimber.pending.value">Salvesta</FormButton>
        <UAlert
          v-if="addClimber.success.value"
          color="success"
          variant="subtle"
          title="Salvestatud"
          description="Salvestasime ronija andmed"
        />
        <FormError :error="addClimber.error.value" />
      </FormBody>
    </form>
  </RonLayout>
</template>

<style scoped>
p {
  margin-bottom: 1em;
}
</style>
