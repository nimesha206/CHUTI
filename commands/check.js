/**
 * CHUTI WA BOT - Country Code Checker
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const axios = require("axios");

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363419075720962@newsletter',
            newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
            serverMessageId: -1
        },
        externalAdReply: {
            title: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
            body: 'ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ',
            thumbnailUrl: 'https://ibb.co/zWRYD9sr',
            sourceUrl: 'https://chat.whatsapp.com/HLBP338VvUC0ms5NqCkSSO',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
};

// Convert ISO code (LK, US, etc.) to flag emoji
function getFlagEmoji(code) {
  if (!code) return "";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

async function checkCommand(sock, chatId, message, q) {
  try {
    if (!q) {
      return await sock.sendMessage(
        chatId,
        { 
            text: "⚠️ කරුණාකර රටේ කේතය (Country Code) ඇතුළත් කරන්න.\n\n📝 උදාහරණ: `.check 94`",
            ...channelInfo
        },
        { quoted: message }
      );
    }

    const code = q.replace(/\D/g, ""); // ඉලක්කම් පමණක් තබා ගැනීම

    // Fetching country data
    const { data } = await axios.get("https://restcountries.com/v3.1/all");

    const matches = [];
    for (const c of data) {
      if (c.idd?.root && c.idd?.suffixes?.length) {
        const root = c.idd.root.replace("+", "");
        for (const suf of c.idd.suffixes) {
          const candidate = (root + suf).replace(/\D/g, "");
          if (candidate === code) {
            matches.push({
              name: c.name?.common || "නොදනී",
              flag: getFlagEmoji(c.cca2),
              fullCode: `+${candidate}`,
            });
          }
        }
      }
    }

    if (!matches.length) {
      return await sock.sendMessage(
        chatId,
        { 
            text: `❌ +${code} කේතයට අදාළ කිසිදු රටක් හමු නොවීය.`,
            ...channelInfo
        },
        { quoted: message }
      );
    }

    const resultText = `✅ *රටේ විස්තර හමු විය!* (+${code})\n\n` +
      matches.map((m, i) => `${i + 1}. ${m.flag} ${m.name} (${m.fullCode})`).join("\n") +
      `\n\n> © ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ | ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ`;

    await sock.sendMessage(chatId, { 
        text: resultText,
        ...channelInfo
    }, { quoted: message });

  } catch (err) {
    console.error("[check] error:", err.message);
    await sock.sendMessage(
      chatId,
      {
        text: `❌ දත්ත ලබා ගැනීමේදී දෝෂයක් සිදු විය.\nපසුව උත්සාහ කරන්න.`,
        ...channelInfo
      },
      { quoted: message }
    );
  }
}

module.exports = checkCommand;
