import { createApp } from './app.js';

// Create the Express app (includes CORS, JSON, routes)
const app = createApp();

// Read PORT from env or default to 5000; bind to 0.0.0.0 by default for cloud hosts
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Start the server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// Export the app (and server) for testing if needed
export { app, server };
