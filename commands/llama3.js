// commands/llama3.js
const axios = require("axios");

async function llama3Command(sock, chatId, message, q) {
  try {
    if (!q) {
      return await sock.sendMessage(
        chatId,
        { text: "⚠️ Please provide a query.\n\n📌 Example:\n.llama3 Explain quantum computing" },
        { quoted: message }
      );
    }

    // React ⏳ while processing
    await sock.sendMessage(chatId, { react: { text: "⏳", key: message.key } });

    const apiUrl = `https://api.davidcyriltech.my.id/ai/llama3?text=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    let aiResponse;
    if (typeof response.data === "string") {
      aiResponse = response.data.trim();
    } else if (typeof response.data === "object") {
      aiResponse = response.data.response || response.data.result || JSON.stringify(response.data);
    } else {
      aiResponse = "❌ Unable to process Llama3 response.";
    }

    const AI_IMG = "https://files.catbox.moe/lzph4f.jpg";

    await sock.sendMessage(
      chatId,
      {
        image: { url: AI_IMG },
        caption: `🤖 *Llama3 AI Response:*\n\n${aiResponse}`,
        contextInfo: { mentionedJid: [message.sender] },
      },
      { quoted: message }
    );

    // React ✅ on success
    await sock.sendMessage(chatId, { react: { text: "✅", key: message.key } });
  } catch (error) {
    console.error("llama3Command error:", error);

    await sock.sendMessage(
      chatId,
      { text: `❌ Failed to fetch Llama3 AI response.\n\n🛠 Error: ${error.message}` },
      { quoted: message }
    );

    // React ❌ on error
    await sock.sendMessage(chatId, { react: { text: "❌", key: message.key } });
  }
}

module.exports = llama3Command;
