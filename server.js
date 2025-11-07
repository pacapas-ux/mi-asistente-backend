import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar OpenAI con tu API key del entorno
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ Servidor del asistente funcionando correctamente en Render");
});

// Ruta principal del chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Falta el mensaje en la solicitud" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error en /chat:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});

