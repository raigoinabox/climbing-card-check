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
  <div style="display: flex">
    <div class="left-background">
      <div class="left-background2" />
    </div>
    <div id="left" :class="showResults ? 'desktop' : ''">
      <div id="form">
        <div>
          <h2>Eesti Ronimisliit</h2>
          <h1>Julgestajakaardi register</h1>
        </div>
        <slot name="form" />
      </div>
      <div
        id="mobile-instructions-link"
        class="mobile"
        @click="toggleMobileInstructions"
      >
        <a>Vajad abi? Loe kasutusjuhendit siit</a>
        <img src="/assets/chevron-right.svg" />
      </div>
    </div>
    <div id="right" class="desktop">
      <div class="centered-content">
        <slot name="results" />
        <div v-if="!showResults" class="instructions">
          <slot name="instructions" />
        </div>
      </div>
    </div>
    <div
      v-if="showMobileInstructions && !showResults"
      id="mobile-instructions"
      class="mobile"
    >
      <div class="back-button" @click="toggleMobileInstructions">
        <img src="/assets/chevron-left.svg" />Tagasi
      </div>
      <h1><slot name="instructions-header" /></h1>
      <div class="instructions">
        <slot name="instructions" />
      </div>
    </div>
    <div v-if="showResults" id="mobile-results" class="mobile">
      <div class="centered-content">
        <div class="back-button" @click="goBack">
          <img src="/assets/chevron-left.svg" />Tagasi
        </div>
        <slot name="results" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-background {
  position: fixed;
  left: 0;
  right: 0;
  z-index: -1;
  display: block;
  background-image: url("/assets/stock-photo.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
  filter: blur(4px);
}
.left-background2 {
  height: 100%;
  background: rgba(39, 154, 241, 0.3);
}

#left {
  min-height: calc(100vh - var(--ui-header-height));
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 24px;
}

#right {
  width: 50%;
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
    padding-top: 48px;
    width: 100%;
    justify-content: space-evenly;
  }
  #mobile-instructions {
    height: 100%;
    width: 100%;
    position: absolute;
    background: #f4f7ff;
    padding: 24px;
  }
  #mobile-instructions h1 {
    text-align: center;
    padding-bottom: 24px;
  }
  #mobile-instructions-link {
    background: #f4f7ff;
    border-radius: 16px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    gap: 10px;
    color: #284bb1;
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.02em;
    width: 100%;
    max-width: 500px;
    cursor: pointer;
  }
  #mobile-instructions-link img {
    height: 1em;
  }
}
</style>
