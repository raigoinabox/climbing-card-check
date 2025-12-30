// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["nuxt-auth-utils", "@nuxt/ui", "@nuxt/eslint"],
  css: ["~/assets/css/main.css"],
  app: {
    head: { title: "Ronimisliidu registri otsing", htmlAttrs: { lang: "et" } },
  },
  typescript: { typeCheck: true },
  imports: { scan: false },
});
