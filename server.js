import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";
import cheerio from "cheerio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Historial de conversación en memoria
let chatHistory = [];

// Función para obtener FAQs desde la web
async function fetchFAQs() {
  const sources = [
    { url: "https://www.megafincas.io", prefix: "Megafincas" },
    { url: "https://www.pepegutierrez.guru", prefix: "Pepe Gutiérrez" }
  ];

  const faqs = [];

  for (const src of sources) {
    try {
      const res = await fetch(src.url);
      const html = await res.text();
      const $ = cheerio.load(html);

      // Aquí sacamos <h2> o <h3> como preguntas y el siguiente <p> como respuesta
      $("h2, h3").each((i, el) => {
        const question = $(el).text().trim();
        const answer = $(el).next("p").text().trim() || "Más info en " + src.url;
        if (question && answer) faqs.push({ question, answer });
      });
    } catch (err) {
      console.error(`Error cargando ${src.url}:`, err);
    }
  }
  return faqs;
}

// Endpoint de FAQs
app.get("/faqs", async (req, res) => {
  const faqs = await fetchFAQs();
  res.json(faqs);
});

// Endpoint principal del chat
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    chatHistory.push({ role: "user", content: prompt });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatHistory,
    });

    const response = completion.choices[0].message.content;
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
