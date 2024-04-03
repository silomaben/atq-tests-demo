#!/bin/sh

echo "** Starting container..."
# Run Cypress tests
npm run cy:run


echo "** Copying test reports..."
# Copy files after tests run
cp -r /app/cypress/reports /shared/cypress

ls -la /app
ls -la /app/cypress
ls -la /app/cypress/reports

echo "** Copying complete."

echo "** Container execution finished."