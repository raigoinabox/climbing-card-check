<script setup lang="ts">
import { ref } from "vue";

defineProps<{ showResults: boolean }>();
const emit = defineEmits<{ goBack: [] }>();

const showMobileInstructions = ref(false);

const toggleMobileInstructions = () => {
  showMobileInstructions.value = !showMobileInstructions.value;
};
const goBack = () => {
  showMobileInstructions.value = false;
  emit("goBack");
};
</script>

<template>
  <div id="left-background"></div>
  <div id="left" :class="showResults ? 'desktop' : ''">
    <div id="form">
      <div>
        <h2>Eesti Ronimisliit</h2>
        <h1>Julgestajakaardi register</h1>
      </div>
      <slot name="form"></slot>
    </div>
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
      <slot name="results"></slot>
      <div v-if="!showResults" class="instructions">
        <slot name="instructions"></slot>
      </div>
    </div>
  </div>
  <div
    v-if="showMobileInstructions && !showResults"
    class="mobile"
    id="mobile-instructions"
  >
    <div @click="toggleMobileInstructions" class="back-button">
      <img src="/assets/chevron-left.svg" />Tagasi
    </div>
    <h1><slot name="instructions-header"></slot></h1>
    <div class="instructions">
      <slot name="instructions"></slot>
    </div>
  </div>
  <div id="mobile-results" v-if="showResults" class="mobile">
    <div class="centered-content">
      <div @click="goBack" class="back-button">
        <img src="/assets/chevron-left.svg" />Tagasi
      </div>
      <slot name="results"></slot>
    </div>
  </div>
</template>

<style scoped>
#left-background {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1;
  display: block;
  background-image: url("/assets/stock-photo.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
  -webkit-filter: blur(4px);
  -moz-filter: blur(4px);
  -o-filter: blur(4px);
  -ms-filter: blur(4px);
  filter: blur(4px);
}

#left {
  z-index: 9999;
  width: 50%;
  height: 100%;
  display: flex;
  background: linear-gradient(
    0deg,
    rgba(39, 154, 241, 0.3),
    rgba(39, 154, 241, 0.3)
  );
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 24px;
}

#right {
  z-index: 9999;
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f7ff;
}

@media only screen and (max-width: 56rem) {
  .desktop {
    display: none !important;
  }
  #left {
    width: 100%;
    padding-top: 48px;
    justify-content: space-between;
  }
}
</style>
