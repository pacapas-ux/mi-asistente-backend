import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// --- Ruta de prueba ---
app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente Megafincas funcionando correctamente");
});

// --- Ruta principal del chat ---
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres un asistente virtual de Megafincas Alicante. 
            Usa la información de https://www.megafincas.io y https://www.pepegutierrez.guru 
            para responder preguntas sobre esos temas.
            Para otras consultas (noticias, clima, deportes, horarios, TV, etc.), responde como un asistente actualizado 
            con información real y actualizada, como si fueras ChatGPT en tiempo real.`,
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      throw new Error("Respuesta inválida del modelo");
    }

    res.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error en /ask:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Servidor escuchando en puerto ${PORT}`)
);
