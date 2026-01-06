const settings = require("../settings");

/**
 * CHUTI WA BOT - Alive Command
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 */

async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `╭══✦〔 🤖 *ᴀᴍ ᴀʟɪᴠᴇ..!* 〕✦═╮\n│\n` +
                       `│ 🚀 *ᴠᴇʀsɪᴏɴ* : ${settings.version}\n` +
                       `│ ⛳ *ꜱᴛᴀᴛᴜꜱ* : Online\n` +
                       `│ 🌍 *ᴍᴏᴅᴇ* : Public\n│\n` +
                       `│ 🌟 *ꜰᴇᴀᴛᴜʀᴇꜱ*:\n` +
                       `│  ➟ ᴠɪᴇᴡ ᴏɴᴄᴇ\n` +
                       `│  ➟ ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ\n` +
                       `│  ➟ ᴀɴᴛɪʟɪɴᴋ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ\n` +
                       `│  ➟ ꜰᴜɴ ᴄᴏᴍᴍᴀɴᴅꜱ\n` +
                       `│  ➟ ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ ᴠɪᴇᴡ\n` +
                       `│  ➟ ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ ʀᴇᴀᴄᴛ \n` +
                       `│  ➟ ᴀɴᴅ ᴍᴏʀᴇ!\n` +
                       `│☄❤️ස්තූතියි පිරික්සා බැලුවට\n│\n` +
                       `│ ලියන්න *.menu* සියලුම විධාන බලන්න\n` +
                       `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419075720962@newsletter',
                    newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'Bot is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;
