<script setup lang="ts">
import type { ClimberDto } from "~~/shared/types/api_types";
const climber = ref<{ id: string; certificate: "none" } | ClimberDto | null>(
  null,
);

const fetchClimberData = async (id: string) => {
  try {
    return await $fetch(`/api/check?id=${id}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return { id, certificate: "none" } as const;
  }
};
const submit = async (idCode: string) => {
  climber.value = await fetchClimberData(idCode);
};

const instructions = [
  "Küsi ronija isikut tõendavat dokumenti",
  "Veendu, et tegemist on sama inimesega",
  "Kontrolli registrist ronija isikukoodi",
  "Veendu, et tal on õigus julgestada",
];
</script>

<template>
  <RonLayout
    :instructions="instructions"
    :show-results="climber != null"
    @go-back="climber = null"
  >
    <template #form>
      <ClimberSearchForm :submit="submit" />
    </template>

    <template #results>
      <ClimberStatus v-if="climber" :climber="climber" />
    </template>

    <template #instructions-header>Ronimisõiguse kontrollimine</template>
  </RonLayout>
</template>
