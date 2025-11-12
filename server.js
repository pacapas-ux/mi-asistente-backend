import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // ✅ Import correcto para Node 18+ y Render
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Configuración del cliente OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// 🗣️ Endpoint principal del asistente
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // Preguntas frecuentes de Megafincas
    const faqs = {
      "qué es megafincas":
        "Megafincas Alicante es una empresa dedicada a la administración de fincas, comunidades y propiedades en la provincia de Alicante. Más información en https://www.megafincas.io",
      "quién es pepe gutiérrez":
        "Pepe Gutiérrez es un experto reconocido en administración de fincas, conferenciante y formador. Más información en https://www.pepegutierrez.guru",
      "cómo contactar con megafincas":
        "Puedes contactar con Megafincas Alicante desde su web oficial en https://www.megafincas.io/#contacto, llamando al teléfono +34 965 63 70 05 o escribiendo al correo alc@megafincas.io. Su oficina está en SAN BARTOLOMÉ 174, EL CAMPELLO, ALICANTE (03560).",
      "qué servicios ofrece megafincas":
        "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios.",
    };

    // 🔍 Si la pregunta coincide con una FAQ
    const lowerPrompt = prompt.toLowerCase();
    for (const key in faqs) {
      if (lowerPrompt.includes(key)) {
        return res.json({ response: faqs[key] });
      }
    }

    // 🧠 Si no es una FAQ → respuesta inteligente y actualizada
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente virtual que responde con información actual y en tiempo real, como si fueras ChatGPT, usando fuentes actualizadas de OpenRouter.",
        },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "No se recibió respuesta del asistente.";
    res.json({ response: reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// 🟢 Endpoint de prueba
app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente Megafincas funcionando correctamente");
});

// 🔊 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
