const fs = require('fs');
const path = require('path');

// විධානයන් සඳහා භාවිතා කරන ප්‍රතික්‍රියා ලැයිස්තුව
const commandEmojis = ['⏳'];

// ස්වයංක්‍රීය ප්‍රතික්‍රියා තත්ත්වය ගබඩා කරන ස්ථානය
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// ගොනුවෙන් ස්වයංක්‍රීය ප්‍රතික්‍රියා තත්ත්වය ලබා ගැනීම
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || false;
        }
    } catch (error) {
        console.error('ස්වයංක්‍රීය ප්‍රතික්‍රියා දත්ත ලබා ගැනීමේ දෝෂයක්:', error);
    }
    return false;
}

// ස්වයංක්‍රීය ප්‍රතික්‍රියා තත්ත්වය ගොනුවේ සුරැකීම
function saveAutoReactionState(state) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('ස්වයංක්‍රීය ප්‍රතික්‍රියා දත්ත සුරැකීමේ දෝෂයක්:', error);
    }
}

// වත්මන් ස්වයංක්‍රීය ප්‍රතික්‍රියා තත්ත්වය
let isAutoReactionEnabled = loadAutoReactionState();

function getRandomEmoji() {
    return commandEmojis[0];
}

// විධානයක් ලැබුණු විට ප්‍රතික්‍රියාවක් එක් කිරීමේ කාර්යය
async function addCommandReaction(sock, message) {
    try {
        if (!isAutoReactionEnabled || !message?.key?.id) return;
        
        const emoji = getRandomEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('ප්‍රතික්‍රියා එක් කිරීමේ දෝෂයක්:', error);
    }
}

// .areact විධානය හැසිරවීමේ කාර්යය
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ මේ විධානය භාවිතා කළ හැක්කේ බොට්ගේ හිමිකරුට (Owner) පමණයි!',
                quoted: message
            });
            return;
        }

        const args = message.message?.conversation?.split(' ') || [];
        const action = args[1]?.toLowerCase();

        if (action === 'on') {
            isAutoReactionEnabled = true;
            saveAutoReactionState(true);
            await sock.sendMessage(chatId, { 
                text: '✅ ස්වයංක්‍රීය ප්‍රතික්‍රියා (Auto-reactions) සාර්ථකව ක්‍රියාත්මක කරන ලදී.',
                quoted: message
            });
        } else if (action === 'off') {
            isAutoReactionEnabled = false;
            saveAutoReactionState(false);
            await sock.sendMessage(chatId, { 
                text: '✅ ස්වයංක්‍රීය ප්‍රතික්‍රියා (Auto-reactions) සාර්ථකව අක්‍රිය කරන ලදී.',
                quoted: message
            });
        } else {
            const currentState = isAutoReactionEnabled ? 'සක්‍රියයි' : 'අක්‍රියයි';
            await sock.sendMessage(chatId, { 
                text: `╭══✦〔 *ස්වයංක්‍රීය ප්‍රතික්‍රියා වාර්තාව* 〕✦═╮\n│ \n│ දැනට ස්වයංක්‍රීය ප්‍රතික්‍රියා: *${currentState}* \n│ \n│ භාවිතා කරන ආකාරය:\n│ .areact on - සක්‍රිය කිරීමට\n│ .areact off - අක්‍රිය කිරීමට\n│ \n╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('areact විධානය හැසිරවීමේ දෝෂයක්:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ ස්වයංක්‍රීය ප්‍රතික්‍රියා පාලනය කිරීමේදී දෝෂයක් ඇති විය.',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand
};
