// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["nuxt-auth-utils", "@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Ronimisliidu registri otsing",
      htmlAttrs: {
        lang: "et",
      },
    },
  },
});
