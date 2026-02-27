<script setup lang="ts">
import type { CardClimberDto } from "~~/shared/types/api_types";
import LoggedInLayout from "~/components/LoggedInLayout.vue";
import { getMessage } from "~/utils/app_utils";

const climber = ref<
  { id: string; certificate: "none" } | CardClimberDto | null
>(null);

const cardSerialCode = ref("");
const insertStatus = ref<{ code: string; message?: string | null }>({
  code: "no_insert",
});
async function insertSerialCode() {
  if (climber.value == null) {
    insertStatus.value = {
      code: "error",
      message: "Süsteemi viga, isikukood puudub",
    };
  } else {
    try {
      insertStatus.value = { code: "loading" };
      await $fetch("/api/save_serial", {
        method: "POST",
        body: {
          climberIdCode: climber.value.id,
          serialCode: cardSerialCode.value,
        },
      });
      insertStatus.value = { code: "success" };
    } catch (e) {
      insertStatus.value = { code: "error", message: getMessage(e) };
    }
  }
}
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
  if (insertStatus.value.code == "success") {
    climber.value = null;
    insertStatus.value = { code: "no_insert" };
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
  <div>
    <LoggedInLayout
      :instructions="instructions"
      :show-results="climber != null"
      @go-back="climber = null"
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
                <UModal @after:leave="handleModalClose">
                  <UButton style="vertical-align: middle">SEO UUEGA</UButton>

                  <template #body>
                    <p v-if="insertStatus.code == 'success'">
                      Edukalt salvestatud
                    </p>
                    <form v-else @submit.prevent="insertSerialCode">
                      <p>Sisesta kaardi seerianumber</p>
                      <form-body>
                        <label>Isikukood: {{ climber.id }}</label>
                        <label>Nimi: {{ climber.name }}</label>
                        <label>
                          Kaardi seerianumber
                          <input v-model.trim="cardSerialCode" />
                        </label>
                        <FormButton :disabled="!cardSerialCode">
                          <img
                            v-if="insertStatus.code == 'loading'"
                            class="loading-spinner"
                            src="/assets/Rolling-1s-200px.svg"
                          /><template v-else>Sisesta</template>
                        </FormButton>
                        <p v-if="insertStatus.code == 'error'">
                          Sisestamise viga! {{ insertStatus.message }}
                        </p>
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
  </div>
</template>
