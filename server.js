HEAD

// server.js
aa5be578273b809747bc69680851f3296cb13728
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { getFAQResponse, getRealTimeResponse } = require("./apis");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

HEAD
app.get("/", (req, res) => {
  res.send("Servidor del asistente activo ✅");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    let reply = await getFAQResponse(message);

    if (!reply) {
      reply = await getRealTimeResponse(message);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);

// Ruta principal (solo para probar en el navegador)
app.get("/", (req, res) => {
  res.send("✅ Servidor del asistente funcionando correctamente");
});

// Ruta del chat
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Primero revisa si hay respuesta predefinida
    const faqResponse = getFAQResponse(userMessage);
    if (faqResponse) {
      return res.json({ reply: faqResponse });
    }

    // Si no, usa OpenAI en tiempo real
    const aiResponse = await getRealTimeResponse(userMessage);
    return res.json({ reply: aiResponse });
  } catch (error) {
    console.error("❌ Error en /chat:", error);
aa5be578273b809747bc69680851f3296cb13728
    res.status(500).json({ reply: "⚠️ Error al conectar con el asistente." });
  }
});

const PORT = process.env.PORT || 3000;
 HEAD
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

app.listen(PORT, () => {
  console.log(`🚀 Servidor del asistente activo en http://localhost:${PORT}`);
});
 aa5be578273b809747bc69680851f3296cb13728
