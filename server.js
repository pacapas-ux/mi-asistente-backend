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

// FAQs base de Megafincas
const faqAnswers = {
  "qué es megafincas": `Megafincas Alicante es una empresa especializada en la administración de fincas, comunidades y propiedades en la provincia de Alicante. Ofrecen servicios de gestión integral, mantenimiento, asesoría jurídica y contable, seguros, y atención personalizada. Más información en https://www.megafincas.io`,
  
  "quién es pepe gutiérrez": `Pepe Gutiérrez es el fundador y gerente de Megafincas Alicante, un profesional con amplia experiencia en administración de comunidades y gestión inmobiliaria. Puedes conocer más sobre él en https://www.pepegutierrez.guru`,

  "cómo contactar con megafincas": `Puedes contactar con Megafincas Alicante desde su web oficial https://www.megafincas.io/#contacto, 
por teléfono al +34 965 63 70 05, 
por correo electrónico a alc@megafincas.io, 
o visitar su oficina en SAN BARTOLOMÉ 174, EL CAMPELLO, ALICANTE (03560).`,

  "qué servicios ofrece megafincas": `Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros, atención personalizada a propietarios y gestión integral de fincas.`,
};

app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    const lowerPrompt = prompt.toLowerCase().trim();

    // 📚 FAQs predefinidas
    for (const key of Object.keys(faqAnswers)) {
      if (lowerPrompt.includes(key)) {
        return res.json({ reply: faqAnswers[key] });
      }
    }

    // 📅 Fecha actual (dinámica)
    if (lowerPrompt.includes("qué día es hoy") || lowerPrompt.includes("que dia es hoy")) {
      const fecha = new Date();
      const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const fechaTexto = fecha.toLocaleDateString("es-ES", opciones);
      return res.json({ reply: `Hoy es ${fechaTexto}.` });
    }

    // 🌍 Consultas generales con OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asistente útil llamado "Asistente Virtual de Megafincas". 
          Si te preguntan por Megafincas o Pepe Gutiérrez, responde con la información verificada de las webs:
          - https://www.megafincas.io
          - https://www.pepegutierrez.guru
          Si te preguntan sobre clima, noticias, resultados deportivos o transporte, ofrece una respuesta realista y actual basada en tu conocimiento hasta el momento actual.`,
        },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "Lo siento, no tengo una respuesta para eso.";
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error en /ask:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Servidor del Asistente Virtual de Megafincas funcionando correctamente.");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
