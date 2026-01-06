/**
 * CHUTI WA BOT - AntiTag System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const { setAntitag, getAntitag, removeAntitag } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```මෙය සමූහයේ පරිපාලකවරුන්ට (Admins) පමණක් කළ හැක!```' },{quoted :message});
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `\`\`\`ANTITAG සැකසුම්\n\n${prefix}antitag on\n${prefix}antitag set delete | kick\n${prefix}antitag off\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage },{quoted :message});
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antitag දැනටමත් සක්‍රියයි_*' },{quoted :message});
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antitag සාර්ථකව සක්‍රිය කරන ලදී_*' : '*_Antitag සක්‍රිය කිරීම අසාර්ථක විය_*' 
                },{quoted :message});
                break;

            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { text: '*_Antitag සාර්ථකව අක්‍රිය කරන ලදී_*' },{quoted :message});
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_කරුණාකර ක්‍රියාමාර්ගයක් තෝරන්න: ${prefix}antitag set delete | kick_*` 
                    },{quoted :message});
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*_වලංගු නොවන ක්‍රියාමාර්ගයකි. delete හෝ kick තෝරන්න._*' 
                    },{quoted :message});
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antitag ක්‍රියාමාර්ගය ${setAction} ලෙස සකසන ලදී_*` : '*_Antitag ක්‍රියාමාර්ගය සැකසීම අසාර්ථක විය_*' 
                },{quoted :message});
                break;

            case 'get':
                const status = await getAntitag(chatId, 'on');
                const actionConfig = await getAntitag(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `*_Antitag වින්‍යාසය:_* \nතත්ත්වය: ${status ? 'සක්‍රියයි (ON)' : 'අක්‍රියයි (OFF)'}\nක්‍රියාමාර්ගය: ${actionConfig ? actionConfig.action : 'සකසා නැත'}` 
                },{quoted :message});
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_භාවිතය බැලීමට ${prefix}antitag ලෙස ටයිප් කරන්න._*` },{quoted :message});
        }
    } catch (error) {
        console.error('Error in antitag command:', error);
        await sock.sendMessage(chatId, { text: '*_Antitag විධානය ක්‍රියාත්මක කිරීමේදී දෝෂයක් සිදු විය_*' },{quoted :message});
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.enabled) return;

        // Check if message contains mentions
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || 
                        message.message?.conversation?.match(/@\d+/g) ||
                        [];

        // Check if it's a group message and has multiple mentions
        if (mentions.length > 0 && mentions.length >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            
            // If mentions are more than 50% of group members, consider it as tagall
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            
            if (mentions.length >= mentionThreshold) {
                const action = antitagSetting.action || 'delete';
                
                if (action === 'delete') {
                    // Delete the message
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    
                    // Send warning
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *Tagall පණිවිඩයක් හමු විය!* \nසමූහයේ සියලුම සාමාජිකයින් Tag කිරීම මෙහි තහනම් කර ඇත.`
                    }, { quoted: message });
                    
                } else if (action === 'kick') {
                    // Kick the user
                    await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                    
                    // Send notification
                    await sock.sendMessage(chatId, {
                        text: `🚫 *සාමාජිකයෙකු ඉවත් කරන ලදී!*\n\nසමූහයේ සියලුම සාමාජිකයින් Tag කිරීම හේතුවෙන් @${senderId.split('@')[0]} ඉවත් කරන ලදී.`
                    },{quoted :message});
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    handleAntitagCommand,
    handleTagDetection
};
