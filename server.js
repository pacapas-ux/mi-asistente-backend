import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Inicializa OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧩 Función para obtener contenido de una web (FAQs)
async function obtenerInfo(url, selector = "body") {
  try {
    const respuesta = await fetch(url);
    const html = await respuesta.text();
    const $ = cheerio.load(html);
    return $(selector).text().trim().slice(0, 2000);
  } catch (e) {
    console.error("❌ Error al obtener datos de la web:", e);
    return null;
  }
}

// 🎯 Detecta si es una pregunta frecuente
function esFAQ(pregunta) {
  const q = pregunta.toLowerCase();
  if (q.includes("qué es megafincas")) return "megafincas_info";
  if (q.includes("cómo contactar") && q.includes("megafincas")) return "megafincas_contacto";
  if (q.includes("quién es pepe") || q.includes("gutiérrez")) return "pepe_info";
  if (q.includes("qué servicios ofrece") && q.includes("megafincas")) return "megafincas_servicios";
  return null;
}

// 📡 Endpoint principal
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    const tipo = esFAQ(prompt);
    let contexto = "";

    if (tipo) {
      console.log(`📘 Pregunta FAQ detectada: ${tipo}`);

      switch (tipo) {
        case "megafincas_info":
          contexto = await obtenerInfo("https://www.megafincas.io");
          break;
        case "megafincas_contacto":
          contexto = await obtenerInfo("https://www.megafincas.io/contacto");
          break;
        case "megafincas_servicios":
          contexto = await obtenerInfo("https://www.megafincas.io/servicios");
          break;
        case "pepe_info":
          contexto = await obtenerInfo("https://www.pepegutierrez.guru");
          break;
      }
    }

    const mensajes = [
      {
        role: "system",
        content:
          "Eres un asistente profesional y amable. Si se trata de una pregunta frecuente, responde brevemente usando la información proporcionada del sitio web. Si es una pregunta general, responde con conocimiento actual, como un asistente moderno en tiempo real.",
      },
      {
        role: "user",
        content: tipo
          ? `Usa la siguiente información del sitio web para responder: ${contexto}`
          : prompt,
      },
    ];

    // 🚀 Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: mensajes,
      max_tokens: 600,
      temperature: 0.7,
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ response: respuesta });
  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

// 🌐 Endpoint de prueba
app.get("/", (req, res) => {
  res.send("Servidor del asistente funcionando 🚀");
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
