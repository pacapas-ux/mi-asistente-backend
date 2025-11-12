// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa cliente OpenAI (asegúrate de tener OPENAI_API_KEY en Render / .env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Contexto estático / FAQs (respuestas fiables sacadas de las webs)
const faqs = [
  {
    q: "qué es megafincas",
    a:
      "Megafincas Alicante es una empresa dedicada a la administración de fincas, comunidades y propiedades en la provincia de Alicante. Más información en https://www.megafincas.io",
  },
  {
    q: "quién es pepe gutiérrez",
    a:
      "Pepe Gutiérrez es un experto en administración de fincas y autor del blog https://www.pepegutierrez.guru.",
  },
  {
    q: "cómo contactar con megafincas",
    a:
      "Puedes contactar con Megafincas Alicante en https://www.megafincas.io/#contacto. Dirección: SAN BARTOLOMÉ 174, EL CAMPELLO (03560). Tel: +34 965 63 70 05. Email: alc@megafincas.io",
  },
  {
    q: "qué servicios ofrece megafincas",
    a:
      "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios.",
  },
];

function getFAQAnswer(prompt) {
  const p = (prompt || "").toLowerCase();
  for (const faq of faqs) {
    if (p.includes(faq.q)) return faq.a;
  }
  return null;
}

// Formatea fecha/hora en timezone Europe/Madrid
function getMadridDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return { date, time, iso: now.toISOString() };
}

// Endpoint principal
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // 1) Responder FAQs con respuestas fijas (rápido y fiable)
    const faq = getFAQAnswer(prompt);
    if (faq) {
      return res.json({ response: faq, source: "faq" });
    }

    // 2) Para todo lo demás: incluir fecha/hora actual en el prompt para que el modelo la use
    const { date, time, iso } = getMadridDateTime();

    const systemMessage = `
Eres un asistente útil, profesional y conciso que responde en español.
Información importante para esta petición:
- Fecha actual (Europe/Madrid): ${date}
- Hora actual (Europe/Madrid): ${time}
- Timestamp ISO: ${iso}
Si el usuario pide información en tiempo real (horarios de tren, resultados de partidos, noticias), aclara si necesitas consultar una API externa y, mientras tanto, intenta dar orientación práctica y enlaces útiles.
Responde claramente y en español.
`;

    // Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const answer = completion.choices?.[0]?.message?.content || "No se pudo generar respuesta.";
    return res.json({ response: answer, source: "openai", metadata: { date, time } });
  } catch (err) {
    console.error("Error en /ask:", err);
    // detecta si el fallo fue por clave vacía
    if (err?.message?.includes("OPENAI_API_KEY")) {
      return res.status(500).json({ error: "Clave OpenAI ausente o inválida en el servidor." });
    }
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor de Megafincas operativo 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
