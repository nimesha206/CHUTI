/**
 * CHUTI WA BOT - Ban System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const fs = require('fs');
const path = require('path');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363419075720962@newsletter',
            newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
            serverMessageId: -1
        }
    }
};

async function banCommand(sock, chatId, message) {
    let userToBan;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: '⚠️ කරුණාකර තහනම් කිරීමට (Ban) අවශ්‍ය පුද්ගලයාව Mention කරන්න හෝ ඔහුගේ පණිවිඩයකට Reply කරන්න!', 
            ...channelInfo 
        });
        return;
    }

    const bannedPath = './data/banned.json';

    try {
        // Ensure data directory and banned.json exist
        if (!fs.existsSync('./data')) fs.mkdirSync('./data');
        if (!fs.existsSync(bannedPath)) fs.writeFileSync(bannedPath, JSON.stringify([]));

        // Add user to banned list
        const bannedUsers = JSON.parse(fs.readFileSync(bannedPath));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync(bannedPath, JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `✅ @${userToBan.split('@')[0]} සාර්ථකව තහනම් (Ban) කරන ලදී!`,
                mentions: [userToBan],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ @${userToBan.split('@')[0]} දැනටමත් තහනම් කර ඇත!`,
                mentions: [userToBan],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { text: '❌ පරිශීලකයා තහනම් කිරීම අසාර්ථක විය!', ...channelInfo });
    }
}

module.exports = banCommand;
