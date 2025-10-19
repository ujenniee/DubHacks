const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*", methods: ["POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage?.trim()) return res.status(400).json({ error: "Message cannot be empty." });

  try {
    const response = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2:7b-chat",
        messages: [
          {
            role: "system",
            content: `
You are a helpful assistant. 
Answer in 1 short sentence. 
Never write more than 20 words. 
Do not explain anything further.
`
          },
          { role: "user", content: userMessage }
        ],
        max_tokens: 40
      })
    });

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || "No response from local AI.";

    // enforce 1 sentence
    reply = reply.split("\n")[0];
    if (reply.includes(".")) reply = reply.split(".")[0] + ".";

    res.json({ reply });

  } catch (err) {
    console.error("💥 Local AI error:", err);
    res.status(500).json({ error: "Failed to get local AI response." });
  }
});

app.listen(3000, () => console.log("🚀 Node server running on http://localhost:3000"));
