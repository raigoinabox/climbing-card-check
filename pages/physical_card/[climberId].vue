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
  <div>
    <div v-if="loggedIn">
      <p v-if="insertStatus == 'success'">Edukalt salvestatud</p>
      <form v-else @submit.prevent="insertSerialCode">
        <label>
          Kaarti seerianumber
          <input v-model.trim="cardSerialCode" />
        </label>
        <button>Sisesta</button>
        <p v-if="insertStatus == 'error'">Sisestamise viga!</p>
      </form>
    </div>
    <div v-else>
      Not logged in
      <form @submit.prevent="login">
        <input v-model="credentials.email" type="email" placeholder="Email" />
        <input
          v-model="credentials.password"
          type="password"
          placeholder="Parool"
        />
        <button>Logi sisse</button>
      </form>
    </div>
  </div>
</template>
