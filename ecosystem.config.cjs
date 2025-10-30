module.exports = {
    apps: [
      {
        name: "cfb",
        script: ".output/server/index.mjs",
        interpreter: "node",
        cwd: "/var/www/cfb-nuxt",
        env: {
          NITRO_HOST: "127.0.0.1",
          NITRO_PORT: "3001",
          NODE_ENV: "production"
          // Add your app env vars here, e.g. API_URL, etc.
        }
      }
    ]
  }