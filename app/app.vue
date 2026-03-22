<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { loggedIn, user, clear } = useUserSession();

const items = computed<NavigationMenuItem[]>(() => [
  { label: "Kaardi otsing", to: "/" },
  { label: "Kaardi väljastamine", to: "/physical-cards" },
  { label: "Eksami registreerimine", to: "/register-exam" },
]);
</script>

<template>
  <UApp>
    <UHeader title="Julgestajakaardi register">
      <UNavigationMenu :items="items" />

      <template v-if="loggedIn" #right>
        <div class="hidden lg:block">
          {{ user.name }}
          <UButton variant="subtle" @click="clear">Logi välja</UButton>
        </div>
      </template>

      <template #body>
        {{ user.name }}
        <UButton variant="subtle" @click="clear">Logi välja</UButton>
        <UNavigationMenu :items="items" orientation="vertical" />
      </template>
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

.centered-content {
  margin: 24px;
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
