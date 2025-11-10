import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Inicializa cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📚 FAQs con contenido real y actualizado
const faqs = [
  {
    question: "Qué es Megafincas",
    answer:
      "Megafincas Alicante es una empresa especializada en administración de fincas, comunidades y propiedades en la provincia de Alicante. Ofrecen servicios de gestión integral, mantenimiento, asesoría jurídica, contable, seguros y atención personalizada. Más información en https://www.megafincas.io.",
  },
  {
    question: "Quién es Pepe Gutiérrez",
    answer:
      "Pepe Gutiérrez es experto en gestión inmobiliaria y administración de fincas en España, fundador de Megafincas Alicante y colaborador en proyectos de innovación inmobiliaria. Más información en https://www.pepegutierrez.guru.",
  },
  {
    question: "Cómo contactar con Megafincas",
    answer:
      "Puedes contactar con Megafincas Alicante a través de su web oficial https://www.megafincas.io/contacto, por teléfono al 965 26 66 66 o visitando sus oficinas en Avenida de Aguilera, 47 – Entresuelo Izquierda, 03007 Alicante, España.",
  },
  {
    question: "Qué servicios ofrece Megafincas",
    answer:
      "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios.",
  },
];

// 🚀 Endpoint principal
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // 🔍 Comprobar si es una pregunta frecuente
    const faqMatch = faqs.find((f) =>
      prompt.toLowerCase().includes(f.question.toLowerCase())
    );
    if (faqMatch) {
      return res.json({ response: faqMatch.answer });
    }

    // 🌐 Si no es FAQ, obtener respuesta en tiempo real desde OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente virtual conectado a la web que puede proporcionar respuestas en tiempo real sobre clima, deportes, horarios de trenes, noticias, y más. Si se pide información local, responde en español.",
        },
        { role: "user", content: prompt },
      ],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "⚠️ No se recibió respuesta del asistente." });
  }
});

// 🌍 Endpoint raíz
app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente funcionando con FAQs + tiempo real activo.");
});

// ⚙️ Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor escuchando en puerto ${PORT}`)
);
