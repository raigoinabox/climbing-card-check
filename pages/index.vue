<script lang="ts">
export default {
  data: () => ({
    currentClimber: null,
    idCode: "",
    isLoading: false,
    showMobileInstructions: false,
  }),
  computed: {
    isSubmitDisabled() {
      return !this.idCode || this.idCode.length !== 11;
    },
    resultCardHeaderContent() {
      if (!this.currentClimber) return null;
      switch (this.currentClimber.certificate) {
        case "green":
          return "ROHELINE KAART";
        case "red":
          return "PUNANE KAART";
        default:
          return null;
      }
    },
    certificateDescription() {
      if (!this.currentClimber) return null;
      switch (this.currentClimber.certificate) {
        case "green":
          return "Sellel isikul on õigus iseseisvalt ülaltjulgestuses ronida ja julgestada.";
        case "red":
          return "Sellel isikul on õigus iseseisvalt altjulgestuses ronida ja julgestada.";
        case "expired":
          return "Selle isiku julgestajakaart on aegnud. Tal ei ole õigust iseseisvalt ronida enne kaardi uuendamist.";
        default:
          return "Seda isikukoodi ei ole registrisse lisatud. Tal ei ole õigust iseseisvalt ronida.";
      }
    },
    showNoInfo() {
      return !this.currentClimber;
    },
    isClimberCertified() {
      return (
        this.currentClimber &&
        ["green", "red"].includes(this.currentClimber.certificate)
      );
    },
    noAccessReason() {
      if (this.currentClimber?.certificate === "expired")
        return "Selle isiku julgestajakaart on aegnud.";
      return "Seda isikukoodi ei ole registrisse lisatud.";
    },
  },
  methods: {
    fetchClimberData: function (id) {
      return fetch(`/api/check?id=${id}`)
        .then((response) => {
          console.log(response);
          if (!response.ok) {
            throw new Error("Request error: " + response.statusText);
          }
          return response.json();
        })
        .then((response) => {
          if (!response) {
            return null;
          }
          if (response.success) {
            return this.formatClimberData(response);
          }
          return {
            id,
            certificate: "none",
          };
        });
    },
    submit: function () {
      if (!this.idCode) return;
      this.isLoading = true;
      this.fetchClimberData(this.idCode)
        .then((data) => {
          this.currentClimber = data;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    goBack: function () {
      this.currentClimber = null;
      this.showMobileInstructions = false;
    },
    formatClimberData: function (raw) {
      let result = raw;
      result.formattedExamTime = result.examTime?.replaceAll("-", "/") || "N/A";
      result.certificate = this.invalidateCertificateIfExpired(result);
      return result;
    },
    toggleMobileInstructions: function () {
      this.showMobileInstructions = !this.showMobileInstructions;
    },
    invalidateCertificateIfExpired: function (climberData) {
      if (Date.parse(climberData.expiryTime) < Date.now()) {
        // If expiry time is in the past and there's no exam time it means that
        // the record was never updated from application to the real certificate
        // it that case we will rather show "no certificate" than "expired"
        if (!climberData.examTime) {
          return "none";
        }
        return "expired";
      }
      return climberData.certificate;
    },
  },
};
</script>

<template>
  <Title>Julgestajakaardi registri otsing</Title>
  
  <div id="app">
    <div id="left-background"></div>
    <div id="left" :class="currentClimber ? 'desktop' : ''">
      <form id="form" @submit.prevent="submit">
        <div>
          <h2>Eesti Ronimisliit</h2>
          <h1>Julgestajakaardi register</h1>
        </div>
        <p>Kontrolli ronimisõigust isikukoodi alusel</p>
        <div id="id-input">
          <label>Isikukood</label>
          <input
            type="text"
            v-model.trim="idCode"
            maxlength="11"
            placeholder="12345678901"
          />
          <button :disabled="isSubmitDisabled">
            <img
              class="loading-spinner"
              v-if="isLoading"
              src="/assets/Rolling-1s-200px.svg"
            />{{ isLoading ? "" : "KONTROLLI" }}
          </button>
        </div>
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
        <template v-if="isClimberCertified">
          <div id="result">
            <div :class="currentClimber.certificate + ' header'">
              {{ resultCardHeaderContent }}
            </div>
            <div id="result-content">
              <div class="row">
                <p class="heading">ISIKUKOOD</p>
                <p class="content">{{ currentClimber.id }}</p>
              </div>
              <div class="row">
                <p class="heading">TÄISNIMI</p>
                <p class="content">{{ currentClimber.name }}</p>
              </div>
              <div class="row">
                <p class="heading">KEHTIV KUNI</p>
                <p class="content">
                  {{ currentClimber.expiryTime?.replaceAll("-", "/") }}
                </p>
              </div>
              <p class="description">{{ certificateDescription }}</p>
              <div class="additional-info">
                <p>EKSAMI AEG: {{ currentClimber.formattedExamTime }}</p>
                <p>EKSAMINEERIJA: {{ currentClimber.examiner }}</p>
              </div>
            </div>
          </div>
          <p class="warning">
            Veendu, et ronija on isikut tõendava dokumendi omanik
          </p>
        </template>
        <div v-if="currentClimber && !isClimberCertified" id="no-access-result">
          <h1>Ligipääs keelatud</h1>
          <p>
            ISIKUKOOD: <b>{{ currentClimber.id }}</b>
          </p>
          <p class="no-access-reason">Põhjus: {{ noAccessReason }}</p>
          <img src="/assets/NoAccesToWall.svg" />
          <div class="no-access-explanation">
            <img src="/assets/exclamation.svg" />
            <p>
              Sellel isikul ei ole lubatud seinal viibida ilma instruktorita.
            </p>
          </div>
        </div>
        <div v-if="!currentClimber" class="instructions">
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
        </div>
      </div>
    </div>

    <div
      v-if="showMobileInstructions && !currentClimber"
      class="mobile"
      id="mobile-instructions"
    >
      <div @click="toggleMobileInstructions" class="back-button">
        <img src="/assets/chevron-left.svg" />Tagasi
      </div>
      <h1>Ronimisõiguse kontrolline</h1>
      <div class="instructions">
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
      </div>
    </div>

    <div id="mobile-results" v-if="currentClimber" class="mobile">
      <div class="centered-content">
        <div @click="goBack" class="back-button">
          <img src="/assets/chevron-left.svg" />Tagasi
        </div>
        <template v-if="isClimberCertified">
          <div id="result">
            <div :class="currentClimber.certificate + ' header'">
              {{ resultCardHeaderContent }}
            </div>
            <div id="result-content">
              <div class="row">
                <p class="heading">ISIKUKOOD</p>
                <p class="content">{{ currentClimber.id }}</p>
              </div>
              <div class="row">
                <p class="heading">TÄISNIMI</p>
                <p class="content">{{ currentClimber.name }}</p>
              </div>
              <div class="row">
                <p class="heading">KEHTIV KUNI</p>
                <p class="content">
                  {{ currentClimber.expiryTime?.replaceAll("-", "/") }}
                </p>
              </div>
              <p class="description">{{ certificateDescription }}</p>
              <div class="additional-info">
                <p>EKSAMI AEG: {{ currentClimber.formattedExamTime }}</p>
                <p>EKSAMINEERIJA: {{ currentClimber.examiner }}</p>
              </div>
            </div>
          </div>
          <p class="warning">
            Veendu, et ronija on isikut tõendava dokumendi omanik
          </p>
        </template>
        <div v-if="currentClimber && !isClimberCertified" id="no-access-result">
          <h1>Ligipääs keelatud</h1>
          <p>
            ISIKUKOOD: <b>{{ currentClimber.id }}</b>
          </p>
          <p class="no-access-reason">Põhjus: {{ noAccessReason }}</p>
          <img src="/assets/NoAccesToWall.svg" />
          <div class="no-access-explanation">
            <img src="/assets/exclamation.svg" />
            <p>
              Sellel isikul ei ole lubatud seinal viibida ilma instruktorita.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
