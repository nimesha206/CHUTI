/**
 * CHUTI WA BOT - Session Cleaner System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
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

async function clearSessionCommand(sock, chatId, msg) {
    try {
        // අයිතිකරුදැයි පරීක්ෂා කිරීම (Check if sender is owner)
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ මෙම විධානය භාවිතා කළ හැක්කේ බොට්ගේ අයිතිකරුට පමණි!',
                ...channelInfo
            });
            return;
        }

        // සෙෂන් ෆෝල්ඩරය හඳුනාගැනීම
        const sessionDir = path.join(__dirname, '../session');

        if (!fs.existsSync(sessionDir)) {
            await sock.sendMessage(chatId, { 
                text: '❌ Session ෆෝල්ඩරය හමු නොවීය!',
                ...channelInfo
            });
            return;
        }

        let filesCleared = 0;
        let errors = 0;
        let errorDetails = [];

        // ආරම්භක පණිවිඩය
        await sock.sendMessage(chatId, { 
            text: `🔍 බොට්ගේ ක්‍රියාකාරිත්වය වැඩි කිරීමට අනවශ්‍ය Session ගොනු ඉවත් කරමින් පවතී...`,
            ...channelInfo
        });

        const files = fs.readdirSync(sessionDir);
        
        let appStateSyncCount = 0;
        let preKeyCount = 0;

        for (const file of files) {
            if (file.startsWith('app-state-sync-')) appStateSyncCount++;
            if (file.startsWith('pre-key-')) preKeyCount++;
        }

        // ගොනු මැකීමේ ක්‍රියාවලිය
        for (const file of files) {
            // creds.json මැකීමෙන් වලකින්න (Don't delete credentials)
            if (file === 'creds.json') {
                continue;
            }
            try {
                const filePath = path.join(sessionDir, file);
                fs.unlinkSync(filePath);
                filesCleared++;
            } catch (error) {
                errors++;
                errorDetails.push(`මැකීමට නොහැකි විය: ${file}: ${error.message}`);
            }
        }

        // අවසාන පණිවිඩය
        const message = `╭══✦〔 *ශුද්ධ කිරීම සාර්ථකයි* 〕✦═╮:\n│ \n` +
                       `┊⭘ 📊 *සංඛ්‍යාලේඛන:* \n` +
                       `┊⭘ ඉවත් කළ මුළු ගොනු ගණන: *${filesCleared}*\n` +
                       `┊⭘ App State Sync ගොනු: *${appStateSyncCount}*\n` +
                       `┊⭘ Pre-Key ගොනු: *${preKeyCount}*\n` +
                       `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯` +
                       (errors > 0 ? `\n⚠️ දෝෂ: ${errors}\n${errorDetails.join('\n')}` : '') +
                       `\n\n> © ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ | ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ`;

        await sock.sendMessage(chatId, { 
            text: message,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in clearsession command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Session ගොනු ඉවත් කිරීම අසාර්ථක විය!',
            ...channelInfo
        });
    }
}

module.exports = clearSessionCommand;
