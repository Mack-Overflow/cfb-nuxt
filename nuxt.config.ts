export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  pinia: {
    autoImports: ['defineStore'],
  },
  runtimeConfig: {
    public: { apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000' }
  }
  // css: ['@/assets/tailwind.css'], // add if not present
})
