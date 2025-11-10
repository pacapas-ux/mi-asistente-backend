import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧩 FAQs fijas de Megafincas y Pepe Gutiérrez
const faqs = [
  {
    question: "Qué es Megafincas",
    answer: "Megafincas Alicante es una empresa especializada en administración de fincas, comunidades y propiedades en la provincia de Alicante. Ofrecen servicios de gestión integral, mantenimiento, asesoría jurídica, contable, seguros y atención personalizada. Más info en https://www.megafincas.io.",
  },
  {
    question: "Quién es Pepe Gutiérrez",
    answer: "Pepe Gutiérrez es un experto en gestión inmobiliaria y administración de fincas en España, fundador de Megafincas Alicante y colaborador en proyectos de innovación inmobiliaria. Más información en https://www.pepegutierrez.guru.",
  },
  {
    question: "Cómo contactar con Megafincas",
    answer: "Puedes contactar con Megafincas Alicante en https://www.megafincas.io/contacto o llamando al teléfono que aparece en su web oficial.",
  },
  {
    question: "Qué servicios ofrece Megafincas",
    answer: "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios.",
  },
];

// 🚀 Endpoint principal de preguntas
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // 1️⃣ Comprobar si coincide con una FAQ fija
    const faqMatch = faqs.find((f) =>
      prompt.toLowerCase().includes(f.question.toLowerCase())
    );
    if (faqMatch) {
      return res.json({ response: faqMatch.answer });
    }

    // 2️⃣ Si no es una FAQ, usar OpenAI con búsqueda web en tiempo real
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente útil y actualizado en tiempo real. Usa información actual de internet (noticias, clima, trenes, resultados deportivos, reservas, etc.) cuando te lo pidan.",
        },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "web_search",
          name: "real_time_search",
          description: "Permite buscar información en tiempo real (web, clima, deportes, trenes, etc.)",
        },
      ],
      tool_choice: "auto",
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// 🌐 Endpoint raíz
app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente funcionando con FAQs + búsqueda en tiempo real.");
});

// 🧩 Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
