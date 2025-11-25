<script setup lang="ts">
// Authentication state
const isAuthenticated = ref(false);
const loginData = ref({
  username: "",
  password: "",
});
const authCredentials = ref<typeof loginData | null>(null);
const loginError = ref("");
const isLoggingIn = ref(false);

// Form data
const formData = ref({
  idCode: "",
  name: "",
  email: "",
  cardType: "",
  examDate: new Date().toISOString().split("T")[0],
  comment: "",
});
const submittedData = ref<typeof formData | null>(null);
const isLoading = ref(false);
const showMobileInstructions = ref(false);

const isLoginDisabled = computed(() => {
  return (
    !loginData.value.username || !loginData.value.password || isLoggingIn.value
  );
});
const isSubmitDisabled = computed(() => {
  return (
    !formData.value.idCode ||
    formData.value.idCode.length !== 11 ||
    !formData.value.name ||
    !formData.value.email ||
    !formData.value.cardType ||
    !formData.value.examDate ||
    !isValidEmail(formData.value.email) ||
    isLoading.value
  );
});

const login = () => {
  if (isLoginDisabled.value) return;

  isLoggingIn.value = true;
  loginError.value = "";

  fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData.value),
  })
    .then(async (response) => ({ response, body: await response.json() }))
    .then(({ response, body }) => {
      if (body.success) {
        isAuthenticated.value = true;
        authCredentials.value = { ...loginData.value };
        loginData.value = { username: "", password: "" };
        nextTick(() => {
          document.getElementById("idCode")?.focus();
        });
      } else {
        loginError.value =
          response.status === 401 || !body.error
            ? "Vale kasutajanimi või parool"
            : body.error;
      }
    })
    .catch(() => {
      loginError.value = "Sisselogimine ebaõnnestus";
    })
    .finally(() => {
      isLoggingIn.value = false;
    });
};
const logout = () => {
  isAuthenticated.value = false;
  authCredentials.value = null;
  submittedData.value = null;
  resetForm();
};
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const submit = () => {
  if (isSubmitDisabled.value) return;

  isLoading.value = true;

  const payload = {
    ...formData.value,
    ...authCredentials.value,
  };

  fetch("/api/add-climber", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        submittedData.value = { ...formData.value };
        resetForm();
        nextTick(() => {
          document.getElementById("idCode")?.focus();
        });
      } else {
        alert("Viga andmete lisamisel: " + (data.error || "Tundmatu viga"));
      }
    })
    .catch(() => {
      alert("Viga andmete lisamisel");
    })
    .finally(() => {
      isLoading.value = false;
    });
};
const goBack = () => {
  submittedData.value = null;
  showMobileInstructions.value = false;
  resetForm();
};
const addAnother = () => {
  submittedData.value = null;
  resetForm();
};
const resetForm = () => {
  formData.value = {
    idCode: "",
    name: "",
    email: "",
    cardType: "",
    examDate: new Date().toISOString().split("T")[0],
    comment: "",
  };
};
const toggleMobileInstructions = () => {
  showMobileInstructions.value = !showMobileInstructions.value;
};
const getCardTypeName = (cardType: string) => {
  switch (cardType) {
    case "green":
      return "Roheline";
    case "red":
      return "Punane";
    default:
      return cardType;
  }
};
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("et-EE");
};
</script>

<template>
  <div>
    <Title>Julgestajakaardi registri vorm</Title>

    <div id="left-background"></div>
    <div id="left" v-if="submittedData == null">
      <!-- Login Form -->
      <form v-if="!isAuthenticated" id="form" @submit.prevent="login">
        <div>
          <h2>Eesti Ronimisliit</h2>
          <h1>Julgestajakaardi register</h1>
        </div>
        <p>Logi sisse andmete sisestamiseks</p>
        <div class="form-field">
          <label>Kasutajanimi</label>
          <input
            type="text"
            v-model.trim="loginData.username"
            placeholder="kasutaja"
          />
        </div>
        <div class="form-field">
          <label>Parool</label>
          <input
            type="password"
            v-model="loginData.password"
            placeholder="parool"
          />
        </div>
        <div v-if="loginError" class="error-message">{{ loginError }}</div>
        <button :disabled="isLoginDisabled">
          <img
            class="loading-spinner"
            v-if="isLoggingIn"
            src="/assets/Rolling-1s-200px.svg"
          />
          {{ isLoggingIn ? "" : "LOGI SISSE" }}
        </button>
      </form>
      <!-- Main Form -->
      <form v-if="isAuthenticated" id="form" @submit.prevent="submit">
        <div>
          <h2>Eesti Ronimisliit</h2>
          <h1>Julgestajakaardi register</h1>
          <button type="button" @click="logout" class="logout-button">
            Logi välja
          </button>
        </div>
        <p>Sisesta andmed registrisse</p>
        <div class="form-field">
          <label>Isikukood</label>
          <input
            type="text"
            v-model.trim="formData.idCode"
            placeholder="12345678901"
            maxlength="11"
            id="idCode"
          />
        </div>
        <div class="form-field">
          <label>Ronija nimi</label>
          <input
            type="text"
            v-model.trim="formData.name"
            placeholder="Ees Perekonnanimi"
          />
        </div>
        <div class="form-field">
          <label>Ronija e-mail</label>
          <input
            type="email"
            v-model.trim="formData.email"
            placeholder="ronija@email.ee"
          />
        </div>
        <div class="form-field">
          <label>Kaardi tüüp</label>
          <select v-model="formData.cardType" class="card-type-select">
            <option value="">Vali kaardi tüüp</option>
            <option value="green" class="green-option">Roheline</option>
            <option value="red" class="red-option">Punane</option>
          </select>
        </div>
        <div class="form-field">
          <label>Eksami toimumise kuupäev</label>
          <input type="date" v-model="formData.examDate" />
        </div>
        <div class="form-field">
          <label>Kommentaar</label>
          <textarea
            v-model.trim="formData.comment"
            placeholder="Lisainfo või märkused..."
            rows="3"
          ></textarea>
        </div>
        <button :disabled="isSubmitDisabled">
          <img
            class="loading-spinner"
            v-if="isLoading"
            src="/assets/Rolling-1s-200px.svg"
          />
          {{ isLoading ? "" : "SISESTA" }}
        </button>
      </form>
      <div
        @click="toggleMobileInstructions"
        class="mobile"
        id="mobile-instructions-link"
      >
        <a>Vajad abi? Loe kasutusjuhendit siit</a>
        <img src="/assets/chevron-right.svg" />
      </div>
    </div>

    <div id="right" class="desktop">
      <div class="centered-content">
        <template v-if="submittedData != null">
          <div id="result">
            <div class="green header">ANDMED SISESTATUD</div>
            <div id="result-content">
              <div class="row">
                <p class="heading">ISIKUKOOD</p>
                <p class="content">{{ submittedData.idCode }}</p>
              </div>
              <div class="row">
                <p class="heading">RONIJA NIMI</p>
                <p class="content">{{ submittedData.name }}</p>
              </div>
              <div class="row">
                <p class="heading">E-MAIL</p>
                <p class="content">{{ submittedData.email }}</p>
              </div>
              <div class="row">
                <p class="heading">KAARDI TÜÜP</p>
                <p class="content" :class="submittedData.cardType + '-text'">
                  {{ getCardTypeName(submittedData.cardType) }}
                </p>
              </div>
              <div class="row">
                <p class="heading">EKSAMI KUUPÄEV</p>
                <p class="content">{{ formatDate(submittedData.examDate) }}</p>
              </div>
              <div class="row" v-if="submittedData.comment">
                <p class="heading">KOMMENTAAR</p>
                <p class="content">{{ submittedData.comment }}</p>
              </div>
              <p class="description">
                Andmed on edukalt registrisse sisestatud.
              </p>
            </div>
          </div>
          <p class="warning">Veendu, et andmed on õiged</p>
        </template>
        <div v-if="submittedData == null" class="instructions">
          <div class="row">
            <div class="row-number-wrapper">
              <div class="row-number">1</div>
            </div>
            <p>Täida kõik nõutud väljad</p>
          </div>
          <div class="row">
            <div class="row-number-wrapper">
              <div class="row-number">3</div>
            </div>
            <p>Vali õige kaardi tüüp</p>
          </div>
          <div class="row">
            <div class="row-number-wrapper">
              <div class="row-number">4</div>
            </div>
            <p>Kontrolli andmeid ja vajuta "SISESTA"</p>
          </div>
        </div>
      </div>

      <div
        v-if="showMobileInstructions && submittedData == null"
        class="mobile"
        id="mobile-instructions"
      >
        <div @click="toggleMobileInstructions" class="back-button">
          <img src="/assets/chevron-left.svg" />Tagasi
        </div>
        <h1>Andmete sisestamine</h1>
        <div class="instructions">
          <div class="row">
            <div class="row-number-wrapper">
              <div class="row-number">1</div>
            </div>
            <p>Täida kõik nõutud väljad</p>
          </div>
          <div class="row">
            <div class="row-number-wrapper">
              <div class="row-number">3</div>
            </div>
            <p>Vali õige kaardi tüüp</p>
          </div>
          <div class="row">
            <div class="row-number-wrapper">
              <div class="row-number">4</div>
            </div>
            <p>Kontrolli andmeid ja vajuta "SISESTA"</p>
          </div>
        </div>
      </div>

      <div id="mobile-results" v-if="submittedData != null" class="mobile">
        <div class="centered-content">
          <div @click="goBack" class="back-button">
            <img src="/assets/chevron-left.svg" />Tagasi
          </div>
          <div id="result">
            <div class="green header">ANDMED SISESTATUD</div>
            <div id="result-content">
              <div class="row">
                <p class="heading">ISIKUKOOD</p>
                <p class="content">{{ submittedData.idCode }}</p>
              </div>
              <div class="row">
                <p class="heading">RONIJA NIMI</p>
                <p class="content">{{ submittedData.name }}</p>
              </div>
              <div class="row">
                <p class="heading">E-MAIL</p>
                <p class="content">{{ submittedData.email }}</p>
              </div>
              <div class="row">
                <p class="heading">KAARDI TÜÜP</p>
                <p class="content" :class="submittedData.cardType + '-text'">
                  {{ getCardTypeName(submittedData.cardType) }}
                </p>
              </div>
              <div class="row">
                <p class="heading">EKSAMI KUUPÄEV</p>
                <p class="content">{{ formatDate(submittedData.examDate) }}</p>
              </div>
              <div class="row" v-if="submittedData.comment">
                <p class="heading">KOMMENTAAR</p>
                <p class="content">{{ submittedData.comment }}</p>
              </div>
              <p class="description">
                Andmed on edukalt registrisse sisestatud.
              </p>
            </div>
          </div>
          <p class="warning">Veendu, et andmed on õiged</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
  width: 100%;
}

select {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  gap: 10px;
  background: #f1faff;
  border: 1px solid #183642;
  border-radius: 24px;
  flex: none;
  flex-grow: 0;
}

textarea {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 16px;
  gap: 10px;
  background: #f1faff;
  border: 1px solid #183642;
  border-radius: 24px;
  flex: none;
  flex-grow: 0;
  resize: vertical;
  min-height: 80px;
}

.card-type-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23183642' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 48px;
}

.green-option {
  color: #388659;
}

.red-option {
  color: #ae3939;
}

.green-text {
  color: #388659 !important;
  font-weight: 600;
}

.red-text {
  color: #ae3939 !important;
  font-weight: 600;
}

.error-message {
  color: #ae3939;
  font-size: 14px;
  text-align: center;
  padding: 8px 0;
}

.logout-button {
  background: none;
  border: 1px solid #183642;
  color: #183642;
  padding: 8px 16px;
  font-size: 12px;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 8px;
}

.logout-button:hover {
  background: #183642;
  color: white;
}
</style>
