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
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Contexto base con datos reales
const context = `
Megafincas Alicante es una empresa especializada en la administración de fincas, comunidades y propiedades en la provincia de Alicante.
Ofrece servicios de gestión integral de comunidades, mantenimiento, asesoría jurídica y contable, seguros, gestión de incidencias y atención personalizada.
Más información en https://www.megafincas.io

📍 Dirección:
SAN BARTOLOMÉ 174
EL CAMPELLO, ALICANTE (03560)

📞 Teléfono: +34 965 63 70 05
✉️ Correo: alc@megafincas.io

Pepe Gutiérrez es un experto reconocido en administración de fincas, conferenciante y formador.
Más detalles en https://www.pepegutierrez.guru
`;

// 🧩 FAQs definidas manualmente
const faqs = [
  {
    q: "qué es megafincas",
    a: "Megafincas Alicante es una empresa dedicada a la administración de fincas, comunidades y propiedades en la provincia de Alicante. Más información en https://www.megafincas.io",
  },
  {
    q: "quién es pepe gutiérrez",
    a: "Pepe Gutiérrez es un experto reconocido en administración de fincas, conferenciante y formador. Más información en https://www.pepegutierrez.guru",
  },
  {
    q: "cómo contactar con megafincas",
    a: "Puedes contactar con Megafincas Alicante desde su web oficial en https://www.megafincas.io/#contacto, llamando al teléfono +34 965 63 70 05 o escribiendo al correo alc@megafincas.io.",
  },
  {
    q: "qué servicios ofrece megafincas",
    a: "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios.",
  },
];

// 🧠 Función para detectar si la pregunta es una FAQ
function getFAQAnswer(prompt) {
  const p = prompt.toLowerCase();
  for (const faq of faqs) {
    if (p.includes(faq.q)) return faq.a;
  }
  return null;
}

// 🔥 Endpoint principal del asistente
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    // Verificar si es una FAQ
    const faqAnswer = getFAQAnswer(prompt);
    if (faqAnswer) {
      return res.json({ response: faqAnswer });
    }

    // Si no es una FAQ → Respuesta en tiempo real (OpenRouter o OpenAI)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente útil, preciso y conectado a la actualidad en tiempo real." },
        { role: "user", content: `${prompt}. Responde en español y usa información actualizada o en tiempo real si aplica.` },
      ],
    });

    const answer = completion.choices[0]?.message?.content || "No se pudo generar respuesta.";
    res.json({ response: answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// 🚀 Verificación del servidor
app.get("/", (req, res) => {
  res.send("🚀 Servidor de Megafincas funcionando correctamente");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
