/**
 * CHUTI WA BOT - Clear Messages System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

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

async function clearCommand(sock, chatId) {
    try {
        // පළමුව පණිවිඩය යැවීම
        const message = await sock.sendMessage(chatId, { 
            text: '🧹 බොට්ගේ පණිවිඩ ඉවත් කරමින් පවතී...',
            ...channelInfo
        });

        // තත්පර කිහිපයකට පසු එම පණිවිඩය මැකීම
        setTimeout(async () => {
            await sock.sendMessage(chatId, { 
                delete: { 
                    remoteJid: chatId, 
                    id: message.key.id, 
                    fromMe: true 
                } 
            });
        }, 2000);

    } catch (error) {
        console.error('Error clearing messages:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ පණිවිඩ ඉවත් කිරීමේදී දෝෂයක් සිදු විය.',
            ...channelInfo
        });
    }
}

module.exports = { clearCommand };
