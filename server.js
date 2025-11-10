// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { fetchMegafincasContact, fetchPepeInfo } from "./apis.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
if (!OPENAI_API_KEY) {
  console.warn("🔑 OPENAI_API_KEY no definido en variables de entorno.");
}

// Cache de FAQs (refrescable)
let cachedFaqs = null;
let lastFaqFetch = 0;
const FAQ_CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutos

async function refreshFaqsIfNeeded() {
  const now = Date.now();
  if (cachedFaqs && (now - lastFaqFetch) < FAQ_CACHE_TTL_MS) return cachedFaqs;

  // intenta obtener datos reales
  const megac = await fetchMegafincasContact();
  const pepe = await fetchPepeInfo();

  cachedFaqs = [
    {
      key: "qué es megafincas",
      answer:
        "Megafincas Alicante es una empresa especializada en la administración de fincas urbanas y comunidades de propietarios. Ofrece gestión integral de comunidades, mantenimiento, asesoría jurídica y contable, seguros y atención personalizada. Más información en https://www.megafincas.io/"
    },
    {
      key: "quién es pepe gutiérrez",
      answer:
        `${pepe.title} — ${pepe.description} Más: https://www.pepegutierrez.guru/`
    },
    {
      key: "cómo contactar con megafincas",
      answer:
        `UBICACIÓN: ${megac.address}\nTEL: ${megac.phone}\nEMAIL: ${megac.email}\nWEB: ${megac.contactoUrl}`
    },
    {
      key: "qué servicios ofrece megafincas",
      answer:
        "Administración de comunidades, mantenimiento de fincas, asesoría jurídica y contable, seguros, gestión de incidencias y atención personalizada. Ver https://www.megafincas.io/ para detalles."
    }
  ];

  lastFaqFetch = now;
  return cachedFaqs;
}

// Endpoint para preguntar
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta 'prompt' en body" });

    // 1) refrescar FAQs si hace falta
    const faqs = await refreshFaqsIfNeeded();

    // 2) comprobación simple: si la pregunta coincide con alguna FAQ -> devolverla
    const normalized = (prompt || "").toLowerCase();
    const match = faqs.find(f => normalized.includes(f.key));
    if (match) {
      return res.json({ reply: match.answer });
    }

    // 3) si pregunta por fecha/hora -> devolver hora real en zona Madrid
    if (/(qué dia|qué fecha|qué hora|hora es)/i.test(prompt)) {
      const now = new Date();
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
      const madrid = now.toLocaleString("es-ES", { timeZone: "Europe/Madrid", ...options });
      return res.json({ reply: `📅 Hoy es ${madrid}` });
    }

    // 4) Para todo lo demás -> llamar a OpenAI (respuesta en "tiempo real")
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ reply: "⚠️ Error: clave OpenAI no configurada en el servidor." });
    }

    // Usamos la API REST para compatibilidad sencilla
    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente útil, profesional y claro. Responde conciso y con tono amable." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    const openRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body),
      timeout: 60000
    });

    if (!openRes.ok) {
      const errText = await openRes.text();
      console.error("Error OpenAI:", openRes.status, errText);
      return res.status(502).json({ reply: "⚠️ Error al contactar con OpenAI." });
    }

    const openJson = await openRes.json();
    const reply = openJson.choices?.[0]?.message?.content || "⚠️ No se recibió respuesta del modelo.";
    return res.json({ reply });
  } catch (err) {
    console.error("Error /ask:", err);
    res.status(500).json({ reply: "⚠️ Error interno del servidor." });
  }
});

// Health
app.get("/healthz", (req, res) => res.send("OK"));

// Home
app.get("/", (req, res) => res.send("Servidor del asistente funcionando 🚀"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
