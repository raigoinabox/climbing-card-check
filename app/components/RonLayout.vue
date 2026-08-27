<script setup lang="ts">
import { ref } from "vue";
import LayoutInstructions from "./LayoutInstructions.vue";

defineProps<{
  showResults: boolean;
  wider?: boolean;
  instructions?: string[];
}>();
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
  <UMain class="layout-container">
    <div class="left-background">
      <div class="left-background2" />
    </div>
    <div
      class="left"
      :class="{
        desktop: showResults || showMobileInstructions,
        fullLeft: instructions == null,
      }"
    >
      <div class="form" :class="{ widerForm: wider }">
        <div>
          <h2 style="font-weight: bold">Eesti Ronimisliit</h2>
          <h1 style="font-weight: bold">Julgestajakaardi register</h1>
        </div>
        <slot name="form" />
      </div>
      <div
        v-if="instructions != null"
        id="mobile-instructions-link"
        class="mobile"
        @click="toggleMobileInstructions"
      >
        <a>Vajad abi? Loe kasutusjuhendit siit</a>
        <img src="/assets/chevron-right.svg" />
      </div>
    </div>
    <div v-if="instructions != null" id="right" class="desktop">
      <div class="centered-content">
        <slot name="results" />
        <LayoutInstructions v-if="!showResults" :instructions="instructions" />
      </div>
    </div>
    <div
      v-if="showMobileInstructions && !showResults && instructions != null"
      id="mobile-instructions"
      class="mobile"
    >
      <div class="back-button" @click="toggleMobileInstructions">
        <img src="/assets/chevron-left.svg" />Tagasi
      </div>
      <h1><slot name="instructions-header" /></h1>
      <LayoutInstructions :instructions="instructions" />
    </div>
    <div v-if="showResults" id="mobile-results" class="mobile">
      <div class="centered-content">
        <div class="back-button" @click="goBack">
          <img src="/assets/chevron-left.svg" />Tagasi
        </div>
        <slot name="results" />
      </div>
    </div>
  </UMain>
</template>

<style scoped>
.layout-container {
  display: flex;
}
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
  height: calc(100lvh - var(--ui-header-height));
  filter: blur(4px);
}
.left-background2 {
  height: 100%;
  background: rgba(39, 154, 241, 0.3);
}

.left {
  width: 50%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
  padding: 24px;
}
.fullLeft {
  width: 100%;
}

.form {
  margin: 24px;
  background: white;
  max-width: 500px;
  display: flex;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 24px;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  gap: 32px;
}
.form h1,
.form h2 {
  color: #183642;
  text-align: center;
}
.form h1 {
  font-size: 24px;
}
.form h2 {
  font-size: 16px;
}
.widerForm {
  max-width: 700px;
  width: 100%;
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
  .left {
    width: 100%;
  }
  #mobile-instructions {
    min-height: calc(100vh - var(--ui-header-height));
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
