// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "nuxt-auth-utils",
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
  ],
  css: ["~/assets/css/main.css"],
  app: { head: { title: "Ronimisliidu register", htmlAttrs: { lang: "et" } } },
  imports: { scan: false },
});
