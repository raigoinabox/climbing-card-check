<script setup lang="ts">
const climber = ref<{ id: string; certificate: "none" } | ClimberDto | null>(
  null,
);

const fetchClimberData = async (id: string) => {
  try {
    return await $fetch(`/api/check?id=${id}`);
  } catch (e) {
    return {
      id,
      certificate: "none",
    } as const;
  }
};
const submit = async (idCode: string) => {
  climber.value = await fetchClimberData(idCode);
};
</script>

<template>
  <Layout :show-results="climber != null" @go-back="climber = null">
    <template #form>
      <ClimberSearchForm :submit="submit" />
    </template>

    <template #results>
      <ClimberStatus v-if="climber" :climber="climber" />
    </template>

    <template #instructions-header>Ronimisõiguse kontrollimine</template>
    <template #instructions>
      <div class="row">
        <div class="row-number-wrapper">
          <div class="row-number">1</div>
        </div>
        <p>Küsi ronija isikut tõendavat dokumenti</p>
      </div>
      <div class="row">
        <div class="row-number-wrapper">
          <div class="row-number">2</div>
        </div>
        <p>Veendu, et tegemist on sama inimesega</p>
      </div>
      <div class="row">
        <div class="row-number-wrapper">
          <div class="row-number">3</div>
        </div>
        <p>Kontrolli registrist ronija isikukoodi</p>
      </div>
      <div class="row">
        <div class="row-number-wrapper">
          <div class="row-number">4</div>
        </div>
        <p>Veendu, et tal on õigus julgestada</p>
      </div>
    </template>
  </Layout>
</template>
