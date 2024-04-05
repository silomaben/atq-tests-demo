const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    embeddedScreenshots: true,
    html:true,
    json:true,
    inlineAssets: true,
    saveAllAttempts: false
  },
  e2e: {
    baseUrl: "http://ui-app-service.filetracker",
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
