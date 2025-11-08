import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Historial de conversaciones en memoria (para cada sesión)
let chatHistory = [];

// Preguntas frecuentes
const faqs = [
  {
    question: "Que es Megafincas",
    answer: "Megafincas es una plataforma de gestión de fincas y alojamientos, ofreciendo servicios de reservas, transporte y experiencias en el sector rural y turístico. Más info: www.megafincas.io"
  },
  {
    question: "Quien es Pepe Gutiérrez",
    answer: "Pepe Gutiérrez es el fundador y gestor de Megafincas. Más info: www.pepegutierrez.guru"
  },
  {
    question: "Como contactar con Megafincas",
    answer: "Puedes contactar con Megafincas a través de su web www.megafincas.io o sus redes sociales."
  },
  {
    question: "Que servicios ofrece Megafincas",
    answer: "Megafincas ofrece reservas de alojamiento y transporte, experiencias rurales, gestión de fincas, y asistencia personalizada."
  }
];

// Endpoint de Preguntas Frecuentes
app.get("/faqs", (req, res) => {
  res.json(faqs);
});

// Endpoint principal del chat
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    // Agregar al historial
    chatHistory.push({ role: "user", content: prompt });

    // Solicitud a OpenAI con historial completo
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatHistory,
    });

    const response = completion.choices[0].message.content;

    // Guardar la respuesta en el historial
    chatHistory.push({ role: "assistant", content: response });

    res.json({ response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor del asistente funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
