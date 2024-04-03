const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    embeddedScreenshots: true,
    html:true,
    inlineAssets: true,
    saveAllAttempts: false,
    log: true, 
    quest: true
  },
  e2e: {
    baseUrl: "http://ui-app-service.filetracker",
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
