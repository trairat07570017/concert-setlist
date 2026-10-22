# Use Google Apps Script as CORS Proxy for DoChord Retrieval

The client application hosted on GitHub Pages cannot fetch chord sheets directly from `dochord.com` due to browser Cross-Origin Resource Sharing (CORS) security policies. We decided to implement a proxy endpoint in Google Apps Script using `UrlFetchApp.fetch()`. This allows fetching and sanitizing chord content server-side without requiring a separate Node.js server or commercial proxy service.
