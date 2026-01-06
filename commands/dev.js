// commands/dev.js
async function devCommand(sock, chatId, message, q) {
  try {
    const senderJid = message.key?.participant || message.key?.remoteJid || message.sender || '';
    const pushname =
      message.pushName ||
      message.message?.pushName ||
      (senderJid ? senderJid.split('@')[0] : 'there');

    const name = pushname || 'there';

    const caption = `
╭─⌈ *👨‍💻 ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇʀ* ⌋─
│
│ 👋 හායි, *${name}*!
│
│ 🤖 මම ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ
│
│ 👨‍💻 *ᴅᴇᴠ ɪɴꜰᴏ:*
│ ──────────
│ 🧠 *නම:* ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
│ 🎂 *වයස:* +20
│ 📞 *සම්බන්ධ කරගැනීමට:* wa.me/94726800969
│ 📺 *යූටියුබ්:* ɴɪᴍᴇsʜᴀ
│     https://youtube.com/@NIMESHA_editz
│
╰─────────

>⚡Powered By ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ
    `.trim();

    const contextInfo = {
      mentionedJid: senderJid ? [senderJid] : [],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363419075720962@newsletter",
        newsletterName: "CHUTI",
        serverMessageId: 143
      },
      externalAdReply: {
        title: "ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ",
        body: "Created with ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ",
        thumbnailUrl: "https://ibb.co/KpwtGSsV",
        mediaType: 1,
        renderSmallerThumbnail: true,
        showAdAttribution: true,
        mediaUrl: "https://youtube.com/@NIMESHA_editz",
        sourceUrl: "https://youtube.com/@NIMESHA_editz"
      }
    };

    await sock.sendMessage(
      chatId,
      {
        image: { url: "https://ibb.co/KpwtGSsV" },
        caption,
        contextInfo
      },
      { quoted: message }
    );
  } catch (err) {
    console.error("devCommand error:", err);
    await sock.sendMessage(chatId, { text: `❌ තොරතුරු ලබා දීම අසාර්ථකයි.: ${err.message}` }, { quoted: message });
  }
}

module.exports = devCommand;
