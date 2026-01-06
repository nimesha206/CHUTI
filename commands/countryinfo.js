// commands/countryinfo.js
const axios = require("axios");
const ctx = require('../helpers/context');

async function countryinfoCommand(sock, chatId, message, q) {
  try {
    if (!q) {
      return await sock.sendMessage(
        chatId,
        { text: "❎ කරුණාකර රටේ නම ඇතුලත් කරන්න.\n\n📌 උදාහරණ: `.countryinfo Srilanka`",
        contextInfo: ctx },
        { quoted: message }
      );
    }

    const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fullText=true`;
    const { data } = await axios.get(apiUrl);

    if (!Array.isArray(data) || data.length === 0) {
      return await sock.sendMessage(
        chatId,
        { text: `❌ තොරතුරු කිසිවක් හමු නොවුනි *${q}*. කරුණාකර රටේ නම පරීක්ෂා කරන්න.`,
        contextInfo: ctx },
        { quoted: message }
      );
    }

    const info = data[0];

    const name = info.name?.common || q;
    const capital = info.capital ? info.capital.join(", ") : "N/A";
    const continent = info.continents ? info.continents.join(", ") : "N/A";
    const phoneCode = info.idd?.root
      ? info.idd.root + (info.idd.suffixes ? info.idd.suffixes[0] : "")
      : "N/A";
    const areaKm = info.area ? `${info.area.toLocaleString()} km²` : "N/A";
    const currency = info.currencies
      ? Object.values(info.currencies)
          .map((c) => `${c.name} (${c.symbol})`)
          .join(", ")
      : "N/A";
    const languages = info.languages
      ? Object.values(info.languages).join(", ")
      : "N/A";
    const drivingSide = info.car?.side || "N/A";
    const isoCodes = info.cca2 ? `${info.cca2}, ${info.cca3}` : "N/A";
    const tld = info.tld ? info.tld.join(", ") : "N/A";
    const borders =
      info.borders && info.borders.length > 0
        ? info.borders.join(", ")
        : "No neighboring countries found.";

    const text =
      `🌍 *Country Information: ${name}* 🌍\n\n` +
      `🏛 *Capital:* ${capital}\n` +
      `📍 *Continent:* ${continent}\n` +
      `📞 *Phone Code:* ${phoneCode}\n` +
      `📏 *Area:* ${areaKm}\n` +
      `🚗 *Driving Side:* ${drivingSide}\n` +
      `💱 *Currency:* ${currency}\n` +
      `🔤 *Languages:* ${languages}\n` +
      `🌍 *ISO Codes:* ${isoCodes}\n` +
      `🌎 *Internet TLD:* ${tld}\n\n` +
      `🔗 *Neighbors:* ${borders}`;

    const flagUrl = info.flags?.png || info.flags?.svg || null;

    // ✅ Safely resolve sender
    const senderJid =
      message.key?.participant || message.key?.remoteJid || undefined;

    if (flagUrl) {
      await sock.sendMessage(
        chatId,
        {
          image: { url: flagUrl },
          caption: text,
          contextInfo: senderJid ? { mentionedJid: [senderJid] } : {},
        },
        { quoted: message }
      );
    } else {
      await sock.sendMessage(
        chatId,
        { text },
        { quoted: message }
      );
    }
  } catch (err) {
    console.error("countryinfoCommand error:", err);
    await sock.sendMessage(
      chatId,
      {
        text: `❌ සමාවන්න අසමත් උණි.\n\nDebug: ${String(
          err.message || err
        )}`,
      },
      { quoted: message }
    );
  }
}

module.exports = countryinfoCommand;
