const { setAntiBadword, getAntiBadword, removeAntiBadword, incrementWarningCount, resetWarningCount } = require('../lib/index');
const fs = require('fs');
const path = require('path');

// Load antibadword config
function loadAntibadwordConfig(groupId) {
    try {
        const configPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(configPath)) {
            return {};
        }
        const data = JSON.parse(fs.readFileSync(configPath));
        return data.antibadword?.[groupId] || {};
    } catch (error) {
        console.error('❌ antibadword වින්‍යාසය පූරණය කිරීමේ දෝෂයකි:', error.message);
        return {};
    }
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╭══✦〔 *ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ sᴇᴛᴜᴘ* 〕✦═╮\n│ \n│ *.antibadword on*\n│ අසභ්‍ය වචන හඳුනාගැනීම සක්‍රිය කරන්න\n│ \n│ *.antibadword set <action>*\n│ ක්‍රියාමාර්ගය සකසන්න: delete/kick/warn\n│ \n│ *.antibadword off*\n│ මෙම සමූහය සඳහා අක්‍රිය කරන්න\n│ \n╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`
        }, { quoted: message });
    }

    if (match === 'on') {
        const existingConfig = await getAntiBadword(chatId, 'on');
        if (existingConfig?.enabled) {
            return sock.sendMessage(chatId, { text: '*මෙම සමූහය සඳහා AntiBadword දැනටමත් සක්‍රිය කර ඇත*' });
        }
        await setAntiBadword(chatId, 'on', 'delete');
        return sock.sendMessage(chatId, { text: '*AntiBadword සක්‍රිය කරන ලදී. ක්‍රියාමාර්ගය වෙනස් කිරීමට .antibadword set <action> භාවිතා කරන්න*' }, { quoted: message });
    }

    if (match === 'off') {
        const config = await getAntiBadword(chatId, 'on');
        if (!config?.enabled) {
            return sock.sendMessage(chatId, { text: '*මෙම සමූහය සඳහා AntiBadword දැනටමත් අක්‍රිය කර ඇත*' }, { quoted: message } );
        }
        await removeAntiBadword(chatId);
        return sock.sendMessage(chatId, { text: '*මෙම සමූහය සඳහා AntiBadword අක්‍රිය කරන ලදී*' }, { quoted: message } );
    }

    if (match.startsWith('set')) {
        const action = match.split(' ')[1];
        if (!action || !['delete', 'kick', 'warn'].includes(action)) {
            return sock.sendMessage(chatId, { text: '*වලංගු නොවන ක්‍රියාමාර්ගයකි. තෝරාගන්න: delete, kick, හෝ warn*' }, { quoted: message } );
        }
        await setAntiBadword(chatId, 'on', action);
        return sock.sendMessage(chatId, { text: `*AntiBadword ක්‍රියාමාර්ගය ${action} ලෙස සකසන ලදී*` }, { quoted: message } );
    }

    return sock.sendMessage(chatId, { text: '*වලංගු නොවන විධානයකි. භාවිතය බැලීමට .antibadword භාවිතා කරන්න*' }, { quoted: message } );
}

async function handleBadwordDetection(sock, chatId, message, userMessage, senderId) {
    const config = loadAntibadwordConfig(chatId);
    if (!config.enabled) return;

    // Skip if not group
    if (!chatId.endsWith('@g.us')) return;

    // Skip if message is from bot
    if (message.key.fromMe) return;

    // Get antibadword config first
    const antiBadwordConfig = await getAntiBadword(chatId, 'on');
    if (!antiBadwordConfig?.enabled) {
        return;
    }

    // Convert message to lowercase and clean it
    const cleanMessage = userMessage.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // List of bad words
    const badWords = [
        'gandu', 'madarchod', 'bhosdike', 'bsdk', 'fucker', 'bhosda', 
        'lauda', 'laude', 'betichod', 'chutiya', 'maa ki chut', 'behenchod', 
        'behen ki chut', 'randi', 'chuchi', 'boobs', 'boobies', 'tits', 'idiot', 'nigga', 'fuck', 
        'dick', 'bitch', 'bastard', 'asshole', 'asu', 'awyu', 'teri ma ki chut', 
        'teri maa ki', 'lund', 'mc', 'lodu', 'benchod', 'shit', 'damn', 'hell', 'piss', 'crap', 'slut', 'whore', 'prick',
        'motherfucker', 'cock', 'cunt', 'pussy', 'twat', 'wanker', 'douchebag', 'jackass', 
        'moron', 'retard', 'scumbag', 'skank', 'slutty', 'arse', 'bugger', 'chut', 'harami', 'randi ki aulad', 'gaand mara', 'chodu', 'lund le', 'gandu saala',
        'kameena', 'haramzada', 'chudai', 'fck', 'fckr', 'fcker', 'fuk', 'fukk', 'fcuk', 'btch', 'bch', 'bsdk', 'f*ck', 'assclown',
        'a**hole', 'f@ck', 'b!tch', 'd!ck', 'n!gga', 'f***er', 's***head', 'a$$', 'l0du', 'lund69', 'spic', 'chink', 'cracker', 'towelhead', 'gook', 'kike', 'paki', 'honky', 
        'wetback', 'raghead', 'jungle bunny', 'sand nigger', 'beaner', 'blowjob', 'handjob', 'cum', 'cumshot', 'jizz', 'deepthroat', 'fap', 
        'hentai', 'MILF', 'anal', 'orgasm', 'dildo', 'vibrator', 'gangbang', 
        'threesome', 'porn', 'sex', 'xxx', 'fag', 'faggot', 'dyke', 'tranny', 'homo', 'sissy', 'fairy', 'lesbo', 'weed', 'pot', 'coke', 'heroin', 'meth', 'crack', 'dope', 'bong', 'kush', 
        'hash', 'trip', 'rolling'
    ];
    
    // Split message into words
    const messageWords = cleanMessage.split(' ');
    let containsBadWord = false;

    for (const word of messageWords) {
        if (word.length < 2) continue;
        if (badWords.includes(word)) {
            containsBadWord = true;
            break;
        }
        for (const badWord of badWords) {
            if (badWord.includes(' ')) {
                if (cleanMessage.includes(badWord)) {
                    containsBadWord = true;
                    break;
                }
            }
        }
        if (containsBadWord) break;
    }

    if (!containsBadWord) return;

    const groupMetadata = await sock.groupMetadata(chatId);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const bot = groupMetadata.participants.find(p => p.id === botId);
    if (!bot?.admin) {
        return;
    }

    const participant = groupMetadata.participants.find(p => p.id === senderId);
    if (participant?.admin) {
        return;
    }

    try {
        await sock.sendMessage(chatId, { 
            delete: message.key
        });
    } catch (err) {
        console.error('පණිවිඩය මකාදැමීමේ දෝෂයකි:', err);
        return;
    }

    switch (antiBadwordConfig.action) {
        case 'delete':
            await sock.sendMessage(chatId, {
                text: `*@${senderId.split('@')[0]} මෙහි අසභ්‍ය වචන භාවිතා කිරීම තහනම්*`,
                mentions: [senderId]
            });
            break;

        case 'kick':
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} අසභ්‍ය වචන භාවිතා කිරීම හේතුවෙන් ඉවත් කරන ලදී*`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('පරිශීලකයා ඉවත් කිරීමේ දෝෂයකි:', error);
            }
            break;

        case 'warn':
            const warningCount = await incrementWarningCount(chatId, senderId);
            if (warningCount >= 3) {
                try {
                    await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    await resetWarningCount(chatId, senderId);
                    await sock.sendMessage(chatId, {
                        text: `*@${senderId.split('@')[0]} අවවාද 3කට පසු ඉවත් කරන ලදී*`,
                        mentions: [senderId]
                    });
                } catch (error) {
                    console.error('අවවාද කිරීමෙන් පසු ඉවත් කිරීමේ දෝෂයකි:', error);
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: `*@${senderId.split('@')[0]} අසභ්‍ය වචන සඳහා අවවාදයයි ${warningCount}/3*`,
                    mentions: [senderId]
                });
            }
            break;
    }
}

module.exports = {
    handleAntiBadwordCommand,
    handleBadwordDetection
};
