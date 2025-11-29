<template>
  <Link rel="preconnect" href="https://fonts.googleapis.com" />
  <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <Link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap"
    rel="stylesheet"
  />

  <div id="app">
    <NuxtPage />
  </div>
</template>

<style>
/*
  1. Use a more-intuitive box-sizing model.
*/

*,
*::before,
*::after {
  box-sizing: border-box;
}

/*
  2. Remove default margin
*/

* {
  margin: 0;
}

html {
  font-family: "Poppins", system-ui, sans-serif;
}

/*
  3. Allow percentage-based heights in the application
*/

html,
body,
body > #__nuxt {
  height: 100%;
}

/*
  Typographic tweaks!
  4. Add accessible line-height
  5. Improve text rendering
*/

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

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
  7. Remove built-in form typography styles
*/

input,
button,
textarea,
select {
  font: inherit;
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

button {
  border: none;
}

.hidden {
  display: none !important;
}

#app {
  height: 100%;
  display: flex;
}

label {
  font-weight: 500;
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
}

button {
  padding: 16px 10px;
  background: linear-gradient(86.59deg, #26408b 22.05%, #279af1 172.51%);
  border-radius: 24px;
  font-weight: 600;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.09em;
  color: #ffffff;
  width: 100%;
  transition: box-shadow 100ms ease-in-out;
}

button:hover {
  background:
    linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    linear-gradient(87.31deg, #26408b -29.47%, #279af1 170.76%);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

button:focus {
  background:
    linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    linear-gradient(86.59deg, #26408b 22.05%, #279af1 172.51%);
}

button:disabled {
  background: linear-gradient(
    86.59deg,
    rgba(38, 64, 139, 0.4) 22.05%,
    rgba(39, 154, 241, 0.4) 172.51%
  );
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
  padding-bottom: 1em;
  padding-left: 1em;
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
  #mobile-instructions {
    height: 100%;
    width: 100%;
    z-index: 9999;
    position: absolute;
    background: #f4f7ff;
    padding: 24px;
  }
  #mobile-instructions h1 {
    text-align: center;
    padding-bottom: 24px;
  }
}

/* Desktop only */

@media only screen and (min-width: 56rem) {
  .mobile {
    display: none !important;
  }
}
</style>
