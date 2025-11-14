<script setup lang="ts">
interface Climber {
  id: string;
  name: string;
  certificate: string;
  examTime: string;
  formattedExamTime: string;
  expiryTime: string;
  examiner: string;
}

const currentClimber = ref<
  { id: string; certificate: "none" } | Climber | null
>(null);
const idCode = ref("");
const isLoading = ref(false);
const showMobileInstructions = ref(false);

const isSubmitDisabled = computed(() => {
  return !idCode.value || idCode.value.length !== 11;
});
const resultCardHeaderContent = computed(() => {
  if (!currentClimber.value) return null;
  switch (currentClimber.value.certificate) {
    case "green":
      return "ROHELINE KAART";
    case "red":
      return "PUNANE KAART";
    default:
      return null;
  }
});
const certificateDescription = computed(() => {
  if (!currentClimber.value) return null;
  switch (currentClimber.value.certificate) {
    case "green":
      return "Sellel isikul on õigus iseseisvalt ülaltjulgestuses ronida ja julgestada.";
    case "red":
      return "Sellel isikul on õigus iseseisvalt altjulgestuses ronida ja julgestada.";
    case "expired":
      return "Selle isiku julgestajakaart on aegnud. Tal ei ole õigust iseseisvalt ronida enne kaardi uuendamist.";
    default:
      return "Seda isikukoodi ei ole registrisse lisatud. Tal ei ole õigust iseseisvalt ronida.";
  }
});

function isClimberCertified(
  climber: { id: string; certificate: "none" } | Climber | null,
): climber is Climber {
  return climber != null && ["green", "red"].includes(climber.certificate);
}

const noAccessReason = computed(() => {
  if (currentClimber.value?.certificate === "expired")
    return "Selle isiku julgestajakaart on aegnud.";
  return "Seda isikukoodi ei ole registrisse lisatud.";
});

const fetchClimberData = async (id: string) => {
  const response = await fetch(`/api/check?id=${id}`);
  if (!response.ok) {
    throw new Error("Request error: " + response.statusText);
  }
  const body = await response.json();
  if (!body) {
    return null;
  }
  if (body.success) {
    return formatClimberData(body);
  }
  return {
    id,
    certificate: "none",
  } as const;
};
const submit = () => {
  if (!idCode.value) return;
  isLoading.value = true;
  fetchClimberData(idCode.value)
    .then((data) => {
      currentClimber.value = data;
    })
    .finally(() => {
      isLoading.value = false;
    });
};
const goBack = () => {
  currentClimber.value = null;
  showMobileInstructions.value = false;
};
const formatClimberData = (raw: Climber) => {
  let result = raw;
  result.formattedExamTime = result.examTime?.replaceAll("-", "/") || "N/A";
  result.certificate = invalidateCertificateIfExpired(result);
  return result;
};
const toggleMobileInstructions = () => {
  showMobileInstructions.value = !showMobileInstructions.value;
};
const invalidateCertificateIfExpired = (climberData: Climber) => {
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
};
</script>

<template>
  <Title>Julgestajakaardi registri otsing</Title>

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
      <template v-if="isClimberCertified(currentClimber)">
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
          <p>Sellel isikul ei ole lubatud seinal viibida ilma instruktorita.</p>
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
      <template v-if="isClimberCertified(currentClimber)">
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
          <p>Sellel isikul ei ole lubatud seinal viibida ilma instruktorita.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#id-input {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 16px;
}
.additional-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  letter-spacing: 0.02em;
}
#no-access-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 32px;
  text-align: center;
}
#no-access-result h1 {
  font-weight: 700;
  color: #db4141;
}
.no-access-reason {
  font-size: 20px;
}
.no-access-explanation {
  display: flex;
  text-align: left;
  gap: 6px;
  align-items: center;
}
.no-access-explanation img {
  height: 1.5em;
}
</style>
