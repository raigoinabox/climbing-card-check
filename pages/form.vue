<script lang="ts">
export default {
  data: () => ({
    // Authentication state
    isAuthenticated: false,
    authCredentials: null,
    loginData: {
      username: "",
      password: "",
    },
    loginError: "",
    isLoggingIn: false,

    // Form data
    formData: {
      idCode: "",
      name: "",
      email: "",
      cardType: "",
      examDate: new Date().toISOString().split("T")[0],
      comment: "",
    },
    submitted: false,
    submittedData: null,
    isLoading: false,
    showMobileInstructions: false,
  }),
  computed: {
    isLoginDisabled() {
      return (
        !this.loginData.username || !this.loginData.password || this.isLoggingIn
      );
    },
    isSubmitDisabled() {
      return (
        !this.formData.idCode ||
        this.formData.idCode.length !== 11 ||
        !this.formData.name ||
        !this.formData.email ||
        !this.formData.cardType ||
        !this.formData.examDate ||
        !this.isValidEmail(this.formData.email) ||
        this.isLoading
      );
    },
  },
  methods: {
    login: function () {
      if (this.isLoginDisabled) return;

      this.isLoggingIn = true;
      this.loginError = "";

      fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.loginData),
      })
        .then(async (response) => ({ response, body: await response.json() }))
        .then(({ response, body }) => {
          if (body.success) {
            this.isAuthenticated = true;
            this.authCredentials = { ...this.loginData };
            this.loginData = { username: "", password: "" };
            this.$nextTick(() => {
              document.getElementById("idCode")?.focus();
            });
          } else {
            this.loginError =
              response.status === 401 || !body.error
                ? "Vale kasutajanimi või parool"
                : body.error;
          }
        })
        .catch(() => {
          this.loginError = "Sisselogimine ebaõnnestus";
        })
        .finally(() => {
          this.isLoggingIn = false;
        });
    },
    logout: function () {
      this.isAuthenticated = false;
      this.authCredentials = null;
      this.submitted = false;
      this.submittedData = null;
      this.resetForm();
    },
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    submit: function () {
      if (this.isSubmitDisabled) return;

      this.isLoading = true;

      const payload = {
        ...this.formData,
        ...this.authCredentials,
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
            this.submittedData = { ...this.formData };
            this.submitted = true;
            this.resetForm();
            this.$nextTick(() => {
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
          this.isLoading = false;
        });
    },
    goBack: function () {
      this.submitted = false;
      this.submittedData = null;
      this.showMobileInstructions = false;
      this.resetForm();
    },
    addAnother: function () {
      this.submitted = false;
      this.submittedData = null;
      this.resetForm();
    },
    resetForm: function () {
      this.formData = {
        idCode: "",
        name: "",
        email: "",
        cardType: "",
        examDate: new Date().toISOString().split("T")[0],
        comment: "",
      };
    },
    toggleMobileInstructions: function () {
      this.showMobileInstructions = !this.showMobileInstructions;
    },
    getCardTypeName: function (cardType) {
      switch (cardType) {
        case "green":
          return "Roheline";
        case "red":
          return "Punane";
        default:
          return cardType;
      }
    },
    formatDate: function (dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("et-EE");
    },
  },
};
</script>

<template>
  <Title>Julgestajakaardi registri vorm</Title>
  
  <div id="app">
    <div id="left-background"></div>
    <div id="left" v-if="!submitted">
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
        <template v-if="submitted">
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
        <div v-if="!submitted" class="instructions">
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
    </div>

    <div
      v-if="showMobileInstructions && !submitted"
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

    <div id="mobile-results" v-if="submitted" class="mobile">
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
            <p class="description">Andmed on edukalt registrisse sisestatud.</p>
          </div>
        </div>
        <p class="warning">Veendu, et andmed on õiged</p>
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
