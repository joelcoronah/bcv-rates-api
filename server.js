#!/usr/bin/env node
/**
 * BCV Rate API Server
 *
 * Local development server
 * For Netlify deployment, see netlify/functions/server.js
 */

import app from "./app.js";

const PORT = process.env.PORT || 3000;

// Iniciar el servidor para desarrollo local
app.listen(PORT, () => {
  console.log(`🚀 BCV Rate API server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoint: http://localhost:${PORT}/api/rates`);
});
