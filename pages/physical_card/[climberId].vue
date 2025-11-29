<script setup lang="ts">
const { loggedIn, fetch } = useUserSession();
const route = useRoute();
const credentials = ref({
  email: "",
  password: "",
});
const cardSerialCode = ref("");
const insertStatus = ref("no_insert");
async function login() {
  try {
    await $fetch("/api/login", {
      method: "POST",
      body: credentials.value,
    });

    await fetch();
  } catch (e) {
    console.log(e);
    alert("Bad credentials");
  }
}

async function insertSerialCode() {
  console.log(route.params.climberId);
  try {
    insertStatus.value = "loading";
    await $fetch("/api/save_serial", {
      method: "POST",
      body: {
        climberIdCode: route.params.climberId,
        serialCode: cardSerialCode.value,
      },
    });
    insertStatus.value = "success";
  } catch (e) {
    insertStatus.value = "error";
  }
}
</script>

<template>
  <div style="height: 100%; width: 100%; display: flex">
    <Layout :show-results="false">
      <template #form>
        <div v-if="loggedIn">
          <p v-if="insertStatus == 'success'">Edukalt salvestatud</p>
          <form v-else @submit.prevent="insertSerialCode">
            <p>Sisesta kaardi seerianumber</p>
            <form-body>
              <label>
                Kaardi seerianumber
                <input v-model.trim="cardSerialCode" />
              </label>
              <button :disabled="!cardSerialCode">
                <img
                class="loading-spinner"
                v-if="insertStatus == 'loading'"
                src="/assets/Rolling-1s-200px.svg"
              /><template v-else>Sisesta</template>
            </button>
              <p v-if="insertStatus == 'error'">Sisestamise viga!</p>
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
                  placeholder="admin@admin.com"
                />
              </label>
              <label>
                Parool
                <input
                  v-model="credentials.password"
                  type="password"
                  placeholder="iamtheadmin"
                />
              </label>

              <button>Logi sisse</button>
            </form-body>
          </form>
        </div>
      </template>
    </Layout>
  </div>
</template>
