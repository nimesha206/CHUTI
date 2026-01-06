/**
 * CHUTI WA BOT - Block/Unblock System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const settings = require('../settings');

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
            body: 'ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜan', 
            thumbnailUrl: 'https://ibb.co/zWRYD9sr',
            sourceUrl: 'https://chat.whatsapp.com/HLBP338VvUC0ms5NqCkSSO',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
};

function digitsOnly(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

function getOwnersNormalized() {
  const raw = settings.ownerNumber;
  const owners = Array.isArray(raw) ? raw : String(raw).split?.(',') || [raw];
  return owners.map(o => digitsOnly(o));
}

async function blockUnblockCommand(sock, chatId, message, q) {
  try {
    const commandText = message.message?.conversation
      || message.message?.extendedTextMessage?.text
      || message.message?.imageMessage?.caption
      || message.message?.videoMessage?.caption
      || '';
    const command = commandText.trim().split(/\s+/)[0].toLowerCase().replace('.', '');

    if (!['block', 'unblock'].includes(command)) return;

    const rawSenderJid = message.key?.participant || message.key?.remoteJid || '';
    const senderDigits = digitsOnly(rawSenderJid);
    const owners = getOwnersNormalized();

    if (!owners.includes(senderDigits) && !message.key?.fromMe) {
      return await sock.sendMessage(chatId, {
        text: `❌ මෙම විධානය භාවිතා කළ හැක්කේ බොට්ගේ අයිතිකරුට පමණි!`,
        ...channelInfo
      }, { quoted: message });
    }

    let jid;

    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = message.message.extendedTextMessage.contextInfo;
      jid = quoted?.participant || quoted?.quotedMessage?.sender || quoted?.quotedMessage?.key?.participant || quoted?.quotedMessage?.key?.remoteJid;
    }

    if (!jid) {
      const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
        || message.message?.extendedTextMessage?.mentionedJid
        || [];
      if (mentioned.length > 0) jid = mentioned[0];
    }

    if (!jid && q) {
      const arg = q.trim();
      if (arg.includes('@')) {
        jid = arg.replace(/\s/g, '');
      } else {
        const num = digitsOnly(arg);
        if (num.length >= 6 && num.length <= 15) {
          jid = `${num}@s.whatsapp.net`;
        }
      }
    }

    if (!jid) {
      return await sock.sendMessage(chatId, { 
          text: '⚠️ කරුණාකර අදාළ පුද්ගලයාව Mention කරන්න, පණිවිඩයට Reply කරන්න හෝ දුරකථන අංකය ලබා දෙන්න.',
          ...channelInfo
      }, { quoted: message });
    }

    jid = String(jid).replace(/\s/g, '');
    if (!jid.includes('@')) jid = `${digitsOnly(jid)}@s.whatsapp.net`;

    await sock.updateBlockStatus(jid, command);

    await sock.sendMessage(chatId, {
      text: `✅ @${jid.split('@')[0]} සාර්ථකව ${command === 'block' ? 'Block (අවහිර)' : 'Unblock (විවෘත)'} කරන ලදී.`,
      mentions: [jid],
      ...channelInfo
    }, { quoted: message });

  } catch (err) {
    console.error('Block/Unblock error:', err);
    await sock.sendMessage(chatId, { 
        text: '❌ Block/Unblock ක්‍රියාවලිය අසාර්ථක විය!',
        ...channelInfo
    }, { quoted: message });
  }
}

module.exports = blockUnblockCommand;
