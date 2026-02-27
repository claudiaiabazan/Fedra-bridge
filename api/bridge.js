const BOT_ID = "97851eee-f3d7-4223-a700-8a00e29f97cf";
const BOTPRESS_URL = `https://chat.botpress.cloud/${BOT_ID}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, userId } = req.body;
    const conversationId = userId || "default-user";

    const convRes = await fetch(`${BOTPRESS_URL}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId }),
    });

    await fetch(`${BOTPRESS_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        payload: { type: "text", text: message },
      }),
    });

    await new Promise((r) => setTimeout(r, 3000));

    const msgRes = await fetch(`${BOTPRESS_URL}/conversations/${conversationId}/messages`, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await msgRes.json();
    const messages = data.messages || [];
    const botMessages = messages.filter((m) => m.direction === "outgoing");
    const lastBot = botMessages[botMessages.length - 1];
    const reply = lastBot?.payload?.text || "No pude obtener respuesta.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
