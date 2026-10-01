<script setup lang="ts">
import type { CardClimberDto } from "~~/shared/types/api_types";
import LoggedInLayout from "~/components/LoggedInLayout.vue";
import { useMutation } from "~/composables/useMutation";

const climber = ref<{ id: string; certificate: "none" } | CardClimberDto>();

const cardSerialCode = ref("");
const saveSerial = useMutation(async () => {
  if (climber.value) {
    await $fetch("/api/save_serial", {
      method: "POST",
      body: {
        climberIdCode: climber.value.id,
        serialCode: cardSerialCode.value,
      },
    });
  } else {
    throw new Error("Isikukood puudub");
  }
});

async function fetchClimberData(id: string) {
  try {
    return await $fetch(`/api/physical_status?id=${id}`);
  } catch {
    return { id, certificate: "none" } as const;
  }
}
async function searchClimber(idCode: string) {
  climber.value = await fetchClimberData(idCode);
}

function handleModalClose() {
  if (saveSerial.success.value) {
    saveSerial.reset();
    climber.value = undefined;
    cardSerialCode.value = "";
  }
}

const instructions = [
  "Küsi ronija isikut tõendavat dokumenti",
  "Kirjuta inimese nimi kaardile",
  "Sisesta kaardi kood vormi",
];
</script>

<template>
  <LoggedInLayout
    :instructions="instructions"
    :show-results="climber != null"
    @go-back="climber = undefined"
  >
    <template #form>
      <ClimberSearchForm :submit="searchClimber" />
    </template>

    <template #results>
      <ClimberStatus v-if="climber" :climber="climber">
        <template v-if="climber.certificate != 'none'" #information>
          <div class="row">
            <p class="heading">VÄLJASTATUD KAART</p>
            <p class="content">
              {{ climber.cardSerialId ?? "PUUDUB" }}
              <UModal
                title="Sisesta kaardi seerianumber"
                @after:leave="handleModalClose"
              >
                <UButton style="vertical-align: middle">SEO UUEGA</UButton>

                <template #body>
                  <p v-if="saveSerial.success.value">Edukalt salvestatud</p>
                  <form v-else @submit.prevent="saveSerial.mutate()">
                    <form-body>
                      <label>Isikukood: {{ climber.id }}</label>
                      <label>Nimi: {{ climber.name }}</label>
                      <FormField
                        v-model.trim="cardSerialCode"
                        label="Kaardi seerianumber"
                      />
                      <FormButton
                        :loading="saveSerial.pending.value"
                        :disabled="!cardSerialCode"
                      >
                        Salvesta
                      </FormButton>
                      <FormError :error="saveSerial.error.value" />
                    </form-body>
                  </form>
                </template>
              </UModal>
            </p>
          </div>
        </template>
      </ClimberStatus>
    </template>

    <template #instructions-header>Väljastatud kaardi lisamine</template>
  </LoggedInLayout>
</template>
