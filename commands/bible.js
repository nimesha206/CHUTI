/**
 * CHUTI WA BOT - Bible Verse Finder
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const axios = require("axios");

async function bibleCommand(sock, chatId, message, q) {
  try {
    if (!q) {
      return await sock.sendMessage(
        chatId,
        {
          text: `⚠️ *කරුණාකර බයිබල් යොමුවක් (Reference) ලබා දෙන්න.*\n\n📝 *උදාහරණ:*\n.bible John 1:1`
        },
        { quoted: message }
      );
    }

    const apiUrl = `https://bible-api.com/${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.status === 200 && response.data.text) {
      const { reference, translation_name, verses } = response.data;

      // Pull details from the first verse object
      const verseData = verses?.[0] || {};
      const book = verseData.book_name || "Unknown";
      const chapter = verseData.chapter || "Unknown";
      const verse = verseData.verse || "Unknown";
      const text = verseData.text || response.data.text;

      const verseMessage =
        `📜 *බයිබල් පාඨය හමු විය!* 📜\n\n` +
        `📖 *යොමුව:* ${reference}\n` +
        `📚 *පොත:* ${book}\n` +
        `🔢 *පරිච්ඡේදය:* ${chapter}\n` +
        `🔤 *පදය:* ${verse}\n\n` +
        `📖 *පෙළ:* ${text.trim()}\n\n` +
        `🗂️ *පරිවර්තනය:* ${translation_name}\n\n` +
        `> © ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ | ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ`;

      await sock.sendMessage(chatId, { 
          text: verseMessage,
          contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363419075720962@newsletter',
                  newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
                  serverMessageId: -1
              }
          }
      }, { quoted: message });
    } else {
      await sock.sendMessage(
        chatId,
        { text: "❌ *මෙම පාඨය සොයා ගැනීමට නොහැකි විය.* කරුණාකර නැවත පරීක්ෂා කර බලන්න." },
        { quoted: message }
      );
    }
  } catch (error) {
    console.error("Bible command error:", error.message || error);
    await sock.sendMessage(
      chatId,
      { text: "⚠️ *දත්ත ලබා ගැනීමේදී දෝෂයක් සිදු විය.* පසුව උත්සාහ කරන්න." },
      { quoted: message }
    );
  }
}

module.exports = bibleCommand;
