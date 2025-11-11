import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY; // usa OpenRouter para tiempo real
const MODEL = "gpt-4o-mini"; // puedes cambiar por "gpt-4-turbo-latest" si quieres

// 🧠 Contexto fijo para FAQs
const context = `
Megafincas Alicante es una empresa dedicada a la administración de fincas,
comunidades y propiedades en la provincia de Alicante. Ofrecen servicios de gestión
integral de comunidades, mantenimiento, asesoría jurídica y contable, seguros,
gestión de incidencias y atención personalizada.

📍 Dirección: San Bartolomé 174, El Campello, Alicante (03560)
📞 Teléfono: +34 965 63 70 05
📧 Correo: alc@megafincas.io
🌐 Web: https://www.megafincas.io

Pepe Gutiérrez es un profesional experto en administración de fincas y fundador de
Megafincas Alicante. Comparte contenido sobre gestión inmobiliaria, liderazgo y
comunidades de propietarios en su web oficial https://www.pepegutierrez.guru.
`;

// 🧠 Lógica principal
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    // Añadimos el contexto fijo y la instrucción para dar respuestas en tiempo real
    const fullPrompt = `
Eres un asistente virtual profesional de Megafincas Alicante.
Responde con información real y útil.
Si la pregunta está relacionada con Megafincas o Pepe Gutiérrez, usa SOLO el siguiente contexto:
${context}

Si la pregunta es sobre noticias, clima, deportes, horarios, o cualquier otro tema de actualidad,
haz una búsqueda simulada en tiempo real y responde de forma natural y actualizada como lo haría ChatGPT conectado a Internet.
No digas que no tienes acceso en tiempo real.
Pregunta del usuario: "${prompt}"
    `;

    // Petición a OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: fullPrompt }],
      }),
    });

    const data = await response.json();
    res.json({ response: data.choices?.[0]?.message?.content || "Sin respuesta del asistente" });

  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente virtual de Megafincas en ejecución");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
