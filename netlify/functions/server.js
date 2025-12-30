/**
 * Netlify Serverless Function
 *
 * This function wraps the Express app for Netlify deployment
 * All routes are handled through this single serverless function
 */

import serverless from "serverless-http";
import app from "../../app.js";

// Exportar la función serverless que envuelve la app Express
export const handler = serverless(app);

