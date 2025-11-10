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

// FAQs personalizadas de Megafincas
const faqs = [
  {
    q: "qué es megafincas",
    a: "Megafincas Alicante es una empresa especializada en la administración de comunidades, gestión de fincas y asesoría integral de propiedades. Ofrece servicios de mantenimiento, contabilidad, seguros y atención personalizada. Más información en https://www.megafincas.io."
  },
  {
    q: "quién es pepe gutiérrez",
    a: "Pepe Gutiérrez es un experto en gestión inmobiliaria y administración de fincas en España, colaborador de Megafincas y conferencista habitual en temas de vivienda y propiedad horizontal. Puedes conocer más en https://www.pepegutierrez.guru."
  },
  {
    q: "cómo contactar con megafincas",
    a: "Puedes contactar con Megafincas Alicante desde su web oficial en https://www.megafincas.io/#contacto, llamando al teléfono +34 965 63 70 05, o visitando sus oficinas en San Bartolomé 174, El Campello, Alicante (03560). También puedes escribir a alc@megafincas.io."
  },
  {
    q: "qué servicios ofrece megafincas",
    a: "Megafincas ofrece administración de comunidades, gestión de incidencias, asesoría contable y jurídica, mantenimiento, seguros y atención personalizada. Más en https://www.megafincas.io."
  }
];

app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    // Busca si la pregunta coincide con alguna FAQ
    const faqMatch = faqs.find(f => prompt.toLowerCase().includes(f.q));
    if (faqMatch) {
      return res.json({ response: faqMatch.a });
    }

    // Si no coincide, consulta a OpenAI (respuestas actuales y realistas)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asistente virtual llamado Megabot. 
          Tu objetivo es responder con información actual y útil sobre cualquier tema (noticias, clima, transporte, TV, etc.), 
          como lo haría ChatGPT con acceso a internet.
          Si no sabes algo, indica cómo el usuario puede consultarlo.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    res.json({ response: completion.choices[0].message.content.trim() });
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
