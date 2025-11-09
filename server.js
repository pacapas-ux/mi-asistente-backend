import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔹 FAQs base
const faqs = [
  {
    question: "Qué es Megafincas",
    answer: "Megafincas es una empresa dedicada a la gestión integral de comunidades de propietarios, con sede en Alicante. Puedes saber más en https://www.megafincas.io"
  },
  {
    question: "Quién es Pepe Gutiérrez",
    answer: "Pepe Gutiérrez es un experto en administración de fincas y gestión inmobiliaria. Más información en https://www.pepegutierrez.guru"
  },
  {
    question: "Cómo contactar con Megafincas",
    answer: "Puedes contactar con Megafincas desde su web oficial https://www.megafincas.io/contacto o llamando al número indicado en su página."
  },
  {
    question: "Qué servicios ofrece Megafincas",
    answer: "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría jurídica y servicios inmobiliarios. Detalles en https://www.megafincas.io"
  }
];

// 🔹 Endpoint principal
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // Comprueba si el prompt coincide con alguna FAQ
    const found = faqs.find(f => prompt.toLowerCase().includes(f.question.toLowerCase()));
    if (found) {
      return res.json({ response: found.answer });
    }

    // 🔹 Si no es una FAQ, usa OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente útil y con acceso a información en tiempo real si se te pregunta por noticias, clima o transporte." },
        { role: "user", content: prompt }
      ]
    });

    const response = completion.choices[0].message.content;
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
