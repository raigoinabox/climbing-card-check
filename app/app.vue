<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = computed<NavigationMenuItem[]>(() => [
  { label: "Otsing", to: "/" },
  { label: "Väljastamine", to: "/physical_cards" },
]);
</script>

<template>
  <UApp>
    <UHeader title="Julgestajakaardi register">
      <UNavigationMenu :items="items" />
      <template #body
        ><UNavigationMenu :items="items" orientation="vertical"
      /></template>
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>

<style>
/*
  6. Improve media defaults
*/

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

/*
  8. Avoid text overflows
*/

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

/*
  9. Create a root stacking context
*/

#root,
#__next {
  isolation: isolate;
}

label {
  font-weight: 500;
  width: 100%;
}

input {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  gap: 10px;
  background: #f1faff;
  border: 1px solid #183642;
  border-radius: 24px;
  /* Inside auto layout */
  flex: none;
  flex-grow: 0;
  font-weight: 400;
}

.centered-content {
  margin: 24px;
}

#result {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.15));
  gap: 16px;
  background: #f5f5f5;
  border-radius: 16px 16px 16px 16px;
}

#result .header {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  border-radius: 16px 16px 0px 0px;
  padding: 1em;
  font-weight: 700;
  font-size: 28px;
  line-height: 24px;
  letter-spacing: 0.02em;
  color: #ffffff;
}

.header.green {
  background: linear-gradient(89.6deg, #388659 29.54%, #3eae6e 99.65%);
}

.header.red {
  background: linear-gradient(88.84deg, #ae3939 20.82%, #d13333 97.63%);
}

.header.gray {
  justify-content: center;
  background: linear-gradient(89.14deg, #4d4d4d 28.5%, #8e8e8e 131.48%);
}

#result-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px 32px 24px;
  gap: 16px;
}

#result-content .heading {
  font-size: 12px;
  letter-spacing: 0.02em;
  color: #183642;
}

#result-content .content {
  font-size: 24px;
}

#result-content .description {
  font-size: 16px;
  color: #6f6f6f;
}

.warning {
  color: black;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 8px;
  padding-top: 16px;
}

.warning::before {
  content: "!";
  width: 24px;
  height: 24px;
  background: #f79f79;
  border-radius: 1000px;
  font-weight: 700;
  font-size: 14px;
  line-height: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.instructions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 32px;
}

.instructions .row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  font-size: 24px;
  line-height: 32px;
}

.instructions .row-number-wrapper {
  flex: 1;
}

.instructions .row-number {
  display: table-cell !important;
  min-width: 74px;
  height: 74px;
  border-radius: 50%;
  color: #284bb1;
  vertical-align: middle;
  text-align: center;
  background: #d4dbef;
  gap: 10px;
}
.instructions .row-number {
  background-color: #279af1;
}
.instructions .row-number:first-child {
  background: #d4dbef;
}
.loading-spinner {
  height: 24px;
  margin: 0 auto;
}

#form {
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
#form h1,
#form h2 {
  color: #183642;
  text-align: center;
}
#form h1 {
  font-size: 24px;
}
#form h2 {
  font-size: 16px;
}
#form p {
  font-weight: 400;
  font-size: 24px;
  line-height: 1.33;
  text-align: center;
  color: #183642;
  margin-bottom: 12px;
}

/* Mobile only*/

@media only screen and (max-width: 56rem) {
  #mobile-results {
    background: #f4f7ff;
    z-index: 9999;
    width: 100%;
    min-height: calc(100vh - var(--ui-header-height));
    height: 100%;
    display: flex;
    justify-content: center;
  }
  .centered-content {
    max-width: 500px;
  }
  #mobile-results #result {
    min-width: 100%;
  }
  .back-button {
    display: flex;
    flex-direction: row;
    gap: 4px;
    color: #284bb1;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.02em;
    margin-bottom: 20px;
    cursor: pointer;
  }
}

/* Desktop only */

@media only screen and (min-width: 56rem) {
  .mobile {
    display: none !important;
  }
}
</style>
