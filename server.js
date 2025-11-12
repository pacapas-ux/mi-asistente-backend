import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN OPENROUTER (GPT-4 nivel ChatGPT con acceso web) ---
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// FAQs de Megafincas y Pepe Gutiérrez
const faqResponses = {
  "qué es megafincas": "Megafincas Alicante es una empresa especializada en la administración de fincas, comunidades y propiedades en la provincia de Alicante. Ofrecen gestión integral, mantenimiento, asesoría jurídica y contable, seguros, y atención personalizada. Más información en https://www.megafincas.io",
  "qué servicios ofrece megafincas": "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios. Más detalles en https://www.megafincas.io",
  "quién es pepe gutiérrez": "Pepe Gutiérrez es un reconocido experto en administración de fincas, conferenciante y formador del sector inmobiliario. Puedes conocer más sobre él en https://www.pepegutierrez.guru",
  "cómo contactar con megafincas": "Puedes contactar con Megafincas Alicante desde su web oficial en https://www.megafincas.io/#contacto, llamando al teléfono +34 965 63 70 05, o escribiendo al correo alc@megafincas.io. Su oficina está en San Bartolomé 174, El Campello, Alicante (03560)."
};

// --- FUNCIÓN PRINCIPAL DE RESPUESTA ---
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    const lowerPrompt = prompt.toLowerCase();

    // 1️⃣ Si es una pregunta frecuente, responde con datos fijos
    for (const key in faqResponses) {
      if (lowerPrompt.includes(key)) {
        return res.json({ response: faqResponses[key] });
      }
    }

    // 2️⃣ Si no, usar OpenRouter (modelo GPT-4 con datos actuales)
    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual llamado MegafincasBot. 
            Responde en español, con información actualizada y útil. 
            Si te preguntan por fechas, clima, noticias, resultados deportivos o transporte, 
            proporciona la información como si tuvieras acceso en tiempo real.`,
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await completion.json();
    const reply = data?.choices?.[0]?.message?.content || "⚠️ No se obtuvo respuesta del asistente.";
    res.json({ response: reply });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// Ruta base
app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente Megafincas funcionando correctamente");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
