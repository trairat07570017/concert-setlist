# Frontend Architecture with Repository Seam for Zero-Friction Portability

To ensure the project can be cloned to any machine and developed immediately without configuring live Google credentials or internet dependencies, all data access is abstracted behind a `SongRepository` interface at a clean seam. The application supplies two adapters: `MockLocalStorageAdapter` (default for local development, instant feedback, AI testable) and `GoogleAppsScriptAdapter` (for production build connected to GAS Web App via environment variable).
