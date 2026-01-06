/**
 * CHUTI WA BOT - AntiLink System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```මෙය සමූහයේ පරිපාලකවරුන්ට (Admins) පමණක් කළ හැක!```' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `\`\`\`ANTILINK සැකසුම්\n\n${prefix}antilink on\n${prefix}antilink set delete | kick | warn\n${prefix}antilink off\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antilink දැනටමත් සක්‍රියයි_*' }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antilink සාර්ථකව සක්‍රිය කරන ලදී_*' : '*_Antilink සක්‍රිය කිරීම අසාර්ථක විය_*' 
                },{ quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: '*_Antilink සාර්ථකව අක්‍රිය කරන ලදී_*' }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_කරුණාකර ක්‍රියාමාර්ගයක් තෝරන්න: ${prefix}antilink set delete | kick | warn_*` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*_වලංගු නොවන ක්‍රියාමාර්ගයකි. delete, kick, හෝ warn තෝරන්න._*' 
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antilink ක්‍රියාමාර්ගය ${setAction} ලෙස සකසන ලදී_*` : '*_Antilink ක්‍රියාමාර්ගය සැකසීම අසාර්ථක විය_*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntilink(chatId, 'on');
                const actionConfig = await getAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `*_Antilink වින්‍යාසය:_* \nතත්ත්වය: ${status ? 'සක්‍රියයි (ON)' : 'අක්‍රියයි (OFF)'}\nක්‍රියාමාර්ගය: ${actionConfig ? actionConfig.action : 'සකසා නැත'}` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_භාවිතය බැලීමට ${prefix}antilink ලෙස ටයිප් කරන්න._*` });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: '*_Antilink විධානය ක්‍රියාත්මක කිරීමේදී දෝෂයක් සිදු විය_*' });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    // Note: getAntilinkSetting should be defined or imported correctly
    const antilinkSetting = getAntilinkSetting(chatId);
    if (antilinkSetting === 'off') return;

    let shouldDelete = false;

    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/,
        telegram: /t\.me\/[A-Za-z0-9_]+/,
        allLinks: /https?:\/\/[^\s]+/,
    };

    if (antilinkSetting === 'whatsappGroup') {
        if (linkPatterns.whatsappGroup.test(userMessage)) {
            shouldDelete = true;
        }
    } else if (antilinkSetting === 'whatsappChannel' && linkPatterns.whatsappChannel.test(userMessage)) {
        shouldDelete = true;
    } else if (antilinkSetting === 'telegram' && linkPatterns.telegram.test(userMessage)) {
        shouldDelete = true;
    } else if (antilinkSetting === 'allLinks' && linkPatterns.allLinks.test(userMessage)) {
        shouldDelete = true;
    }

    if (shouldDelete) {
        const quotedMessageId = message.key.id;
        const quotedParticipant = message.key.participant || senderId;

        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: quotedMessageId, participant: quotedParticipant },
            });
        } catch (error) {
            console.error('Failed to delete message:', error);
        }

        const mentionedJidList = [senderId];
        await sock.sendMessage(chatId, { 
            text: `අවවාදයයි! @${senderId.split('@')[0]}, සමූහය තුළ ලින්ක් (Links) පළ කිරීම තහනම්.`, 
            mentions: mentionedJidList 
        });
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};
