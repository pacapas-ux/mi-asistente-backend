 HEAD
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const OpenAI = require("openai");
// apis.js
const { OpenAI } = require("openai");
aa5be578273b809747bc69680851f3296cb13728
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

HEAD
// --- RESPUESTAS FIJAS ---
async function getFAQResponse(question) {
  const q = question.toLowerCase();

  // MEGAFINCAS
  if (q.includes("qué es megafincas")) {
    return "🏢 **Megafincas** es una empresa dedicada a la administración de fincas y comunidades. Puedes ver más en [https://www.megafincas.io](https://www.megafincas.io)";
  }

  if (q.includes("cómo contactar con megafincas")) {
    return "📞 Puedes contactar con **Megafincas** a través de su web oficial [https://www.megafincas.io](https://www.megafincas.io).";
  }

  // PEPE GUTIÉRREZ
  if (q.includes("quién es pepe gutiérrez")) {
    return "👨‍🏫 **Pepe Gutiérrez** es consultor inmobiliario y autor del blog [https://www.pepegutierrez.guru](https://www.pepegutierrez.guru).";
  }

  return null;
}

// --- RESPUESTAS EN TIEMPO REAL ---
// Respuestas fijas para FAQs
function getFAQResponse(question) {
  const q = question.toLowerCase();
  if (q.includes("qué es megafincas")) {
    return "🏢 **Megafincas** es una empresa líder en administración de fincas urbanas y comunidades de propietarios. Más información en 👉 [https://www.megafincas.io](https://www.megafincas.io)";
  }
  if (q.includes("cómo contactar con megafincas")) {
    return "📞 **Contacto Megafincas:**\n- 🌐 [https://www.megafincas.io](https://www.megafincas.io)\n- 📧 info@megafincas.io\n- ☎️ +34 965 14 28 11\n- 📍 Av. Aguilera 47, 03007 Alicante, España";
  }
  if (q.includes("quién es pepe gutiérrez")) {
    return "👨‍🏫 **Pepe Gutiérrez** es consultor inmobiliario, formador y autor del blog 👉 [https://www.pepegutierrez.guru](https://www.pepegutierrez.guru)";
  }
  return null;
}

// Respuesta en tiempo real con OpenAI
aa5be578273b809747bc69680851f3296cb13728
async function getRealTimeResponse(question) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: question }],
  });
HEAD


aa5be578273b809747bc69680851f3296cb13728
  return completion.choices[0].message.content;
}

module.exports = { getFAQResponse, getRealTimeResponse };
