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

// 🧠 Base de conocimiento fija (para FAQs)
const faqs = [
  {
    question: "Qué es Megafincas",
    answer:
      "Megafincas Alicante es una empresa especializada en la administración de fincas, comunidades y propiedades en la provincia de Alicante. Ofrece gestión integral de comunidades, mantenimiento, asesoría jurídica y contable, seguros y atención personalizada. Más información en https://www.megafincas.io.",
  },
  {
    question: "Quién es Pepe Gutiérrez",
    answer:
      "Pepe Gutiérrez es el CEO y fundador de Megafincas Alicante, con amplia experiencia en administración de fincas y gestión inmobiliaria. Puedes conocer más sobre él en https://www.pepegutierrez.guru.",
  },
  {
    question: "Cómo contactar con Megafincas",
    answer:
      "Puedes contactar con Megafincas Alicante desde su web oficial en https://www.megafincas.io/#contacto, llamando al teléfono 965 20 96 35 o escribiendo al correo info@megafincas.io.",
  },
  {
    question: "Qué servicios ofrece Megafincas",
    answer:
      "Megafincas ofrece administración de comunidades, mantenimiento de fincas, asesoría jurídica y contable, seguros, gestión de incidencias y atención personalizada a propietarios. Consulta más en https://www.megafincas.io.",
  },
];

// 🧩 Ruta principal del asistente
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // 🧭 1. Busca si la pregunta coincide con alguna FAQ
    const matchedFAQ = faqs.find(f => prompt.toLowerCase().includes(f.question.toLowerCase()));
    if (matchedFAQ) {
      return res.json({ response: matchedFAQ.answer });
    }

    // 🕐 2. Si no coincide, usa OpenAI (respuestas en tiempo real)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente útil y amable llamado Asistente Virtual de Megafincas. Responde de forma clara, profesional y directa. Si te preguntan sobre clima, transporte o noticias, da una respuesta informativa en tiempo real como ChatGPT.",
        },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ response: reply });
  } catch (error) {
    console.error("❌ Error en /ask:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// 🌐 Ruta base de prueba
app.get("/", (req, res) => {
  res.send("Servidor del asistente funcionando 🚀");
});

// 🚀 Puerto para Render o local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
