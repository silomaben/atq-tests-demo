#!/bin/sh

echo "** Starting container..."
# Run Cypress tests
npm run cy:run


echo "** Copying test reports..."
# Copy files after tests run
cp -r /app/cypress /shared
ls -la /app
ls -la /app/cypress
ls -la /app/cypress/reports
ls -la /app/cypress/reports/html

echo "** Copying complete."

echo "** Container execution finished."