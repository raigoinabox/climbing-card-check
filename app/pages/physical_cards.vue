<script setup lang="ts">
const { loggedIn, fetch } = useUserSession();
const credentials = ref({
  email: "",
  password: "",
});
const toast = useToast();
async function login() {
  try {
    await $fetch("/api/login", {
      method: "POST",
      body: credentials.value,
    });

    await fetch();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    toast.add({
      title: "Sisselogimine ebaõnnestus",
      description: "Kasutajanimi või parool olid valed",
      color: "error",
    });
  }
}

const climber = ref<
  { id: string; certificate: "none" } | CardClimberDto | null
>(null);

const cardSerialCode = ref("");
const insertStatus = ref<{ code: string; message?: unknown }>({
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
      if (typeof e == "object" && e != null && "statusMessage" in e) {
        insertStatus.value = { code: "error", message: e.statusMessage };
      } else {
        insertStatus.value = { code: "error" };
      }
    }
  }
}
const fetchClimberData = async (id: string) => {
  try {
    return await $fetch(`/api/physical_status?id=${id}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return {
      id,
      certificate: "none",
    } as const;
  }
};
const searchClimber = async (idCode: string) => {
  climber.value = await fetchClimberData(idCode);
};

function handleModalClose() {
  if (insertStatus.value.code == "success") {
    climber.value = null;
    insertStatus.value = { code: "no_insert" };
    cardSerialCode.value = "";
  }
}
</script>

<template>
  <div>
    <RonLayout :show-results="climber != null" @go-back="climber = null">
      <template #form>
        <div v-if="loggedIn">
          <ClimberSearchForm :submit="searchClimber" />
        </div>
        <div v-else>
          <p>Logi sisse</p>
          <form @submit.prevent="login">
            <form-body>
              <label>
                Email
                <input
                  v-model="credentials.email"
                  type="email"
                  placeholder="admin@ronimisliit.ee"
                />
              </label>
              <label>
                Parool
                <input
                  v-model="credentials.password"
                  type="password"
                  placeholder="w5DB5jIm0soTMW"
                />
              </label>

              <FormButton>Logi sisse</FormButton>
            </form-body>
          </form>
        </div>
      </template>

      <template #results>
        <ClimberStatus v-if="climber" :climber="climber">
          <template v-if="climber.certificate != 'none'" #information>
            <div class="row">
              <p class="heading">VÄLJASTATUD KAART</p>
              <p class="content">
                {{ climber.cardSerialId ?? "PUUDUB" }}
                <UModal @after:leave="handleModalClose">
                  <FormButton>SEO UUEGA</FormButton>

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
      <template #instructions>
        <div class="row">
          <div class="row-number-wrapper">
            <div class="row-number">1</div>
          </div>
          <p>Logi sisse</p>
        </div>
        <div class="row">
          <div class="row-number-wrapper">
            <div class="row-number">2</div>
          </div>
          <p>Küsi ronija isikut tõendavat dokumenti</p>
        </div>
        <div class="row">
          <div class="row-number-wrapper">
            <div class="row-number">3</div>
          </div>
          <p>Kirjuta inimese nimi kaardile</p>
        </div>
        <div class="row">
          <div class="row-number-wrapper">
            <div class="row-number">4</div>
          </div>
          <p>Sisesta kaardi kood vormi</p>
        </div>
      </template>
    </RonLayout>
  </div>
</template>
