#!/usr/bin/env node
/**
 * BCV Rate API Server
 *
 * Simple Express API that extracts exchange rates from Banco Central de Venezuela (BCV)
 * Website: https://www.bcv.org.ve/
 */

import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

const app = express();
const PORT = process.env.PORT || 3000;
const BCV_URL = "https://www.bcv.org.ve/";

// Middleware para parsear JSON
app.use(express.json());

// Middleware para CORS (permitir acceso desde cualquier origen)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/**
 * Extrae las tasas del BCV desde la página web
 * @returns {Promise<Object>} Objeto con las tasas de cambio
 */
async function extractBCVRates() {
  try {
    // Configurar agente HTTPS para manejar problemas de certificados SSL
    // NOTA: En producción, deberías usar certificados válidos
    // Esta configuración permite conexiones con certificados no verificados (solo para desarrollo)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Permite certificados no verificados
    });

    // Realizar petición HTTP a la página del BCV
    const response = await axios.get(BCV_URL, {
      httpsAgent: httpsAgent, // Usar el agente HTTPS configurado
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-VE,es;q=0.9,en;q=0.8",
      },
      timeout: 15000, // 15 segundos de timeout
    });

    // Cargar el HTML en cheerio para parsearlo
    const $ = cheerio.load(response.data);

    // Objeto para almacenar las tasas encontradas
    const rates = {};

    // Estrategia 1: Buscar en la vista de tipo de cambio oficial del BCV
    // El BCV suele usar clases como 'view-tipo-de-cambio-oficial-del-bcv'
    $(
      ".view-tipo-de-cambio-oficial-del-bcv .field-content, .tipo-cambio .field-content"
    ).each((i, element) => {
      const text = $(element).text().trim();
      // Buscar USD
      const usdMatch = text.match(/USD[:\s]*([\d,]+(?:\.[\d]+)?)/i);
      if (usdMatch && !rates.USD) {
        rates.USD = parseFloat(usdMatch[1].replace(",", "."));
      }
      // Buscar EUR
      const eurMatch = text.match(/EUR[:\s]*([\d,]+(?:\.[\d]+)?)/i);
      if (eurMatch && !rates.EUR) {
        rates.EUR = parseFloat(eurMatch[1].replace(",", "."));
      }
    });

    // Estrategia 2: Buscar elementos con IDs o clases específicas comunes
    const selectors = [
      "#dolar",
      ".dolar",
      '[id*="dolar"]',
      '[class*="dolar"]',
      "#usd",
      ".usd",
      '[id*="usd"]',
      '[class*="usd"]',
      "#euro",
      ".euro",
      '[id*="euro"]',
      '[class*="euro"]',
      "#eur",
      ".eur",
      '[id*="eur"]',
      '[class*="eur"]',
    ];

    selectors.forEach((selector) => {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim();
        // Extraer número del texto
        const numberMatch = text.match(/([\d,]+(?:\.[\d]+)?)/);
        if (numberMatch) {
          const value = parseFloat(numberMatch[1].replace(",", "."));
          if (selector.includes("dolar") || selector.includes("usd")) {
            if (!rates.USD) rates.USD = value;
          } else if (selector.includes("euro") || selector.includes("eur")) {
            if (!rates.EUR) rates.EUR = value;
          }
        }
      }
    });

    // Estrategia 3: Buscar en tablas de tasas de cambio
    $("table, .table").each((i, table) => {
      const rows = $(table).find("tr");
      rows.each((j, row) => {
        const cells = $(row).find("td, th");
        if (cells.length >= 2) {
          const currencyText = $(cells[0]).text().trim().toUpperCase();
          const valueText = $(cells[1]).text().trim();

          if (currencyText.includes("USD") || currencyText.includes("DÓLAR")) {
            const match = valueText.match(/([\d,]+(?:\.[\d]+)?)/);
            if (match && !rates.USD) {
              rates.USD = parseFloat(match[1].replace(",", "."));
            }
          }
          if (currencyText.includes("EUR") || currencyText.includes("EURO")) {
            const match = valueText.match(/([\d,]+(?:\.[\d]+)?)/);
            if (match && !rates.EUR) {
              rates.EUR = parseFloat(match[1].replace(",", "."));
            }
          }
        }
      });
    });

    // Estrategia 4: Búsqueda por texto completo en la página (último recurso)
    if (!rates.USD || !rates.EUR) {
      const pageText = $("body").text();

      // Buscar USD con diferentes patrones
      if (!rates.USD) {
        const usdPatterns = [
          /USD[:\s]*([\d,]+(?:\.[\d]+)?)/i,
          /DÓLAR[:\s]*([\d,]+(?:\.[\d]+)?)/i,
          /\$[:\s]*([\d,]+(?:\.[\d]+)?)/i,
        ];
        for (const pattern of usdPatterns) {
          const match = pageText.match(pattern);
          if (match) {
            rates.USD = parseFloat(match[1].replace(",", "."));
            break;
          }
        }
      }

      // Buscar EUR con diferentes patrones
      if (!rates.EUR) {
        const eurPatterns = [
          /EUR[:\s]*([\d,]+(?:\.[\d]+)?)/i,
          /EURO[:\s]*([\d,]+(?:\.[\d]+)?)/i,
        ];
        for (const pattern of eurPatterns) {
          const match = pageText.match(pattern);
          if (match) {
            rates.EUR = parseFloat(match[1].replace(",", "."));
            break;
          }
        }
      }
    }

    // Extraer fecha de actualización
    let dateText = "";
    const dateSelectors = [
      '[class*="fecha"]',
      '[id*="fecha"]',
      ".date",
      "#date",
      '[class*="actualizacion"]',
      '[id*="actualizacion"]',
    ];

    for (const selector of dateSelectors) {
      const dateElement = $(selector).first();
      if (dateElement.length) {
        dateText = dateElement.text().trim();
        if (dateText) break;
      }
    }

    // Si no encontramos fecha, usar la fecha actual
    const date = dateText || new Date().toISOString().split("T")[0];

    return {
      success: true,
      date: date,
      rates: rates,
      source: BCV_URL,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error extracting BCV rates:", error.message);
    throw error;
  }
}

/**
 * Ruta principal - información de la API
 */
app.get("/", (req, res) => {
  res.json({
    message: "BCV Rate API",
    version: "1.0.0",
    endpoints: {
      "/api/rates": "GET - Obtiene las tasas de cambio del BCV",
      "/health": "GET - Health check",
    },
  });
});

/**
 * Ruta de health check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Ruta principal para obtener las tasas del BCV
 * GET /api/rates
 */
app.get("/api/rates", async (req, res) => {
  try {
    const rates = await extractBCVRates();
    res.json(rates);
  } catch (error) {
    console.error("Error in /api/rates:", error);
    res.status(500).json({
      success: false,
      error: "Error al extraer las tasas del BCV",
      message: error.message,
    });
  }
});

/**
 * Manejo de rutas no encontradas
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    path: req.path,
  });
});

/**
 * Manejo de errores global
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    message: err.message,
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 BCV Rate API server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoint: http://localhost:${PORT}/api/rates`);
});
