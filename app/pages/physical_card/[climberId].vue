<script setup lang="ts">
const { loggedIn, fetch } = useUserSession();
const route = useRoute();
const credentials = ref({
  email: "",
  password: "",
});
const cardSerialCode = ref("");
const insertStatus = ref<{ code: string; message?: unknown }>({
  code: "no_insert",
});
const toast = useToast();
async function login() {
  try {
    await $fetch("/api/login", {
      method: "POST",
      body: credentials.value,
    });

    await fetch();
  } catch (e) {
    toast.add({
      title: "Sisselogimine ebaõnnestus",
      description: "Kasutajanimi või parool olid valed",
      color: "error",
    });
  }
}

async function insertSerialCode() {
  try {
    insertStatus.value = { code: "loading" };
    await $fetch("/api/save_serial", {
      method: "POST",
      body: {
        climberIdCode: route.params.climberId,
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
</script>

<template>
  <div style="height: 100%; width: 100%; display: flex">
    <Title>Julgestajakaardi füüsiline kaart</Title>

    <Layout :show-results="false">
      <template #form>
        <div v-if="loggedIn">
          <p v-if="insertStatus.code == 'success'">Edukalt salvestatud</p>
          <form v-else @submit.prevent="insertSerialCode">
            <p>Sisesta kaardi seerianumber</p>
            <form-body>
              <label>Isikukood: {{ route.params.climberId }}</label>
              <label>
                Kaardi seerianumber
                <input v-model.trim="cardSerialCode" />
              </label>
              <Button :disabled="!cardSerialCode">
                <img
                  class="loading-spinner"
                  v-if="insertStatus.code == 'loading'"
                  src="/assets/Rolling-1s-200px.svg"
                /><template v-else>Sisesta</template>
              </Button>
              <p v-if="insertStatus.code == 'error'">
                Sisestamise viga! {{ insertStatus.message }}
              </p>
            </form-body>
          </form>
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

              <Button>Logi sisse</Button>
            </form-body>
          </form>
        </div>
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
    </Layout>
  </div>
</template>
