# Use Google Apps Script and Google Sheets as Serverless Backend and Database

The application needs zero-cost hosting, simple tabular data management that band members can inspect directly, and no server maintenance. We decided to use Google Sheets as the database and deploy a Google Apps Script (GAS) Web App exposing JSON endpoints (`doGet` and `doPost`). This trade-off accepts GAS execution latency (~1-2s cold starts and 302 redirects) in exchange for free hosting, zero backend infrastructure setup, and direct spreadsheet access.
