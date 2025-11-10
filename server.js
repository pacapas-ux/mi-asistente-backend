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

// 🌍 Contexto fijo con información real de las webs
const contextoMegafincas = `
Megafincas Alicante es una empresa dedicada a la administración de fincas,
comunidades y propiedades en la provincia de Alicante. Ofrecen servicios de
gestión integral de comunidades, mantenimiento, asesoría jurídica y contable,
seguros, gestión de incidencias y atención personalizada. Más información en https://www.megafincas.io
`;

const contextoPepe = `
Pepe Gutiérrez es un experto en gestión inmobiliaria y administración de fincas
con amplia experiencia en el sector. Es conferenciante, autor y colaborador habitual
en temas relacionados con la administración de comunidades. Más información en https://www.pepegutierrez.guru
`;

const faqs = [
  { q: "Qué es Megafincas", a: contextoMegafincas },
  { q: "Quién es Pepe Gutiérrez", a: contextoPepe },
  { q: "Cómo contactar con Megafincas", a: "Puedes contactar con Megafincas Alicante a través del sitio web oficial https://www.megafincas.io/contacto o por teléfono al número indicado en su página de contacto." },
  { q: "Qué servicios ofrece Megafincas", a: "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada a propietarios." }
];

// 🔹 Endpoint principal del asistente
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // Comprobamos si es una pregunta frecuente
    const faq = faqs.find(f => prompt.toLowerCase().includes(f.q.toLowerCase()));
    if (faq) {
      return res.json({ response: faq.a });
    }

    // Si no, pregunta a OpenAI con contexto
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `Eres un asistente útil que responde con información actualizada y en tiempo real si es posible. Usa el contexto siguiente:
        ${contextoMegafincas}
        ${contextoPepe}` },
        { role: "user", content: prompt }
      ]
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error en /ask:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Servidor del asistente funcionando correctamente con FAQs y respuestas reales.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
