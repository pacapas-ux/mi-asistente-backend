import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// URL base de la API de OpenRouter
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "perplexity/llama-3.1-sonar-small-online",
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual de Megafincas Alicante.
Responde de la siguiente forma:
1️⃣ Si la pregunta está relacionada con Megafincas o Pepe Gutiérrez, usa información de:
   - https://www.megafincas.io
   - https://www.pepegutierrez.guru
   Ejemplo de contacto:
   📍 Dirección: San Bartolomé 174, El Campello, Alicante (03560)
   ☎️ Teléfono: +34 965 63 70 05
   📧 Email: alc@megafincas.io

2️⃣ Si la pregunta es de otro tema (clima, noticias, trenes, deportes, TV, etc.),
usa información en tiempo real de internet. Contesta con datos actuales y naturales,
como si fueras ChatGPT con acceso web.
          `,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    res.json({
      response: data.choices?.[0]?.message?.content || "⚠️ Sin respuesta del asistente.",
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente Megafincas funcionando correctamente");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
