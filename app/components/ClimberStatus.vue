<script setup lang="ts">
const { climber } = defineProps<{
  climber: { id: string; certificate: "none" } | ClimberDto;
}>();

const certificate = computed(() => {
  if (climber.certificate == "none") {
    return climber.certificate;
  } else {
    return invalidateCertificateIfExpired(climber);
  }
});
const resultCardHeaderContent = computed(() => {
  switch (certificate.value) {
    case "green":
      return "ROHELINE KAART";
    case "red":
      return "PUNANE KAART";
    default:
      return null;
  }
});
const certificateDescription = computed(() => {
  switch (certificate.value) {
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

const noAccessReason = computed(() => {
  if (certificate.value === "expired")
    return "Selle isiku julgestajakaart on aegnud.";
  return "Seda isikukoodi ei ole registrisse lisatud.";
});

function isClimberCertified(
  climber: { id: string; certificate: "none" } | ClimberDto,
): climber is ClimberDto {
  return ["green", "red"].includes(certificate.value);
}

const formattedExamTime = computed(() => {
  if ("examTime" in climber) {
    return climber.examTime.replaceAll("-", "/") || "N/A";
  } else {
    return "";
  }
});
const invalidateCertificateIfExpired = (climberData: ClimberDto) => {
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
  <template v-if="isClimberCertified(climber)">
    <div id="result">
      <div :class="certificate + ' header'">
        {{ resultCardHeaderContent }}
      </div>
      <div id="result-content">
        <div class="row">
          <p class="heading">ISIKUKOOD</p>
          <p class="content">{{ climber.id }}</p>
        </div>
        <div class="row">
          <p class="heading">TÄISNIMI</p>
          <p class="content">{{ climber.name }}</p>
        </div>
        <div class="row">
          <p class="heading">KEHTIV KUNI</p>
          <p class="content">
            {{ climber.expiryTime?.replaceAll("-", "/") }}
          </p>
        </div>
        <slot name="information" />
        <p class="description">{{ certificateDescription }}</p>
        <div class="additional-info">
          <p>EKSAMI AEG: {{ formattedExamTime }}</p>
          <p>EKSAMINEERIJA: {{ climber.examiner }}</p>
        </div>
      </div>
    </div>
    <p class="warning">Veendu, et ronija on isikut tõendava dokumendi omanik</p>
  </template>
  <div v-else id="no-access-result">
    <h1>Ligipääs keelatud</h1>
    <p>
      ISIKUKOOD: <b>{{ climber.id }}</b>
    </p>
    <p class="no-access-reason">Põhjus: {{ noAccessReason }}</p>
    <img src="/assets/NoAccesToWall.svg" />
    <div class="no-access-explanation">
      <img src="/assets/exclamation.svg" />
      <p>Sellel isikul ei ole lubatud seinal viibida ilma instruktorita.</p>
    </div>
  </div>
</template>

<style scoped>
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
