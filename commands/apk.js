/**
 * CHUTI WA BOT - APK Downloader
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀන්
 * Owner: 94726800969
 */

const axios = require('axios');

async function apkCommand(sock, chatId, message) {
  try {
    // Extract the user message
    const userMessage =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      '';
    const appName = userMessage.split(' ').slice(1).join(' ');

    if (!appName) {
      await sock.sendMessage(
        chatId,
        { text: '⚠️ කරුණාකර ඇප් එකේ නම ඇතුළත් කරන්න. උදාහරණ: `.apk whatsapp`' },
        { quoted: message }
      );
      return;
    }

    // React with hourglass while processing
    await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

    // API call to NexOracle
    const apiUrl = 'https://api.nexoracle.com/downloader/apk';
    const params = {
      apikey: 'free_key@maher_apis', 
      q: appName,
    };

    const response = await axios.get(apiUrl, { params });

    if (!response.data || response.data.status !== 200 || !response.data.result) {
      await sock.sendMessage(
        chatId,
        { text: '❌ අදාළ APK එක සොයා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.' },
        { quoted: message }
      );
      return;
    }

    const { name, lastup, package, size, icon, dllink } = response.data.result;

    // Send thumbnail preview
    await sock.sendMessage(
      chatId,
      {
        image: { url: icon },
        caption: `📦 *${name} බාගත වෙමින් පවතී... කරුණාකර රැඳී සිටින්න.*`,
      },
      { quoted: message }
    );

    // Download APK file
    const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
    if (!apkResponse.data) {
      await sock.sendMessage(
        chatId,
        { text: '❌ APK එක බාගත කිරීම අසාර්ථක විය. පසුව උත්සාහ කරන්න.' },
        { quoted: message }
      );
      return;
    }

    const apkBuffer = Buffer.from(apkResponse.data, 'binary');

    // Format message with details
    const details = `📦 *APK විස්තර* 📦\n\n` +
      `🔖 *නම*: ${name}\n` +
      `📅 *අවසන් යාවත්කාලීනය*: ${lastup}\n` +
      `📦 *පැකේජය*: ${package}\n` +
      `📏 *ප්‍රමාණය*: ${size}\n\n` +
      `> © ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ | ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀන්`;

    // Send APK as document
    await sock.sendMessage(
      chatId,
      {
        document: apkBuffer,
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        caption: details
        
      },
      { quoted: message }
    );

    // Success reaction
    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

  } catch (error) {
    console.error('❌ Error in apkCommand:', error);

    await sock.sendMessage(
      chatId,
      { text: '❌ APK දත්ත ලබා ගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.' },
      { quoted: message }
    );

    // Failure reaction
    await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
  }
}

module.exports = apkCommand;
