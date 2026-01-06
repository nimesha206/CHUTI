/**
 * CHUTI WA BOT - Smart AI Chatbot System
 * ඹ්y: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// In-memory storage for chat history
const chatMemory = {
    messages: new Map(),
    userInfo: new Map()
};

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

function loadUserGroupData() {
    try {
        if (!fs.existsSync(path.dirname(USER_GROUP_DATA))) {
            fs.mkdirSync(path.dirname(USER_GROUP_DATA), { recursive: true });
        }
        if (!fs.existsSync(USER_GROUP_DATA)) {
            fs.writeFileSync(USER_GROUP_DATA, JSON.stringify({ groups: [], chatbot: {} }));
        }
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA));
    } catch (error) {
        return { groups: [], chatbot: {} };
    }
}

function saveUserGroupData(data) {
    try {
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving data:', error.message);
    }
}

function getRandomDelay() {
    return Math.floor(Math.random() * 2000) + 1000;
}

async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
    } catch (error) {}
}

async function handleChatbotCommand(sock, chatId, message, match) {
    const data = loadUserGroupData();
    const senderId = message.key.participant || message.key.remoteJid;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isOwner = senderId.includes('94726800969') || message.key.fromMe;

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╭══✦〔 *ᴄʜᴀᴛʙᴏᴛ සැකසුම්* 〕✦═╮\n│ \n│ *.chatbot on* - සක්‍රිය කරන්න\n│ *.chatbot off* - අක්‍රිය කරන්න\n│ \n╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`,
            ...channelInfo
        }, { quoted: message });
    }

    if (match === 'on') {
        data.chatbot[chatId] = true;
        saveUserGroupData(data);
        return sock.sendMessage(chatId, { text: '✅ *Chatbot මෙම සමූහය සඳහා සක්‍රිය කරන ලදී!*', ...channelInfo }, { quoted: message });
    }

    if (match === 'off') {
        delete data.chatbot[chatId];
        saveUserGroupData(data);
        return sock.sendMessage(chatId, { text: '❌ *Chatbot මෙම සමූහය සඳහා අක්‍රිය කරන ලදී!*', ...channelInfo }, { quoted: message });
    }
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();
    if (!data.chatbot[chatId]) return;

    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotMentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botNumber);
    const isReplyToBot = message.message?.extendedTextMessage?.contextInfo?.participant === botNumber;

    if (!isBotMentioned && !isReplyToBot && chatId.endsWith('@g.us')) return;

    try {
        await showTyping(sock, chatId);
        
        if (!chatMemory.messages.has(senderId)) chatMemory.messages.set(senderId, []);
        const history = chatMemory.messages.get(senderId);
        history.push(userMessage);
        if (history.length > 10) history.shift();

        const response = await getAIResponse(userMessage, history);
        
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
        await sock.sendMessage(chatId, { text: response }, { quoted: message });

    } catch (error) {
        console.error('Chatbot error:', error);
    }
}

async function getAIResponse(userMessage, history) {
    try {
        const prompt = `
You are CHUTI WA BOT, a real human-like friend created by NIMESHA MADHUSHAN.
Chat naturally in Sinhala and English (Singlish).
- Be casual, cool, and funny.
- If someone is rude, reply savagely with emojis.
- If they are nice, be a good friend.
- Your owner is NIMESHA MADHUSHAN.
- Keep responses short (1-2 lines).
- Use emojis like 😂, 😅, 😎, 🙄.

Context: ${history.join(' | ')}
User: ${userMessage}
Assistant:`.trim();

        const res = await fetch("https://api.dreaded.site/api/chatgpt?text=" + encodeURIComponent(prompt));
        const json = await res.json();
        return json.result?.prompt || "මොකක්ද කිව්වේ? ආයෙත් කියන්න බලන්න.. 🤔";
    } catch (error) {
        return "පොඩ්ඩක් ඉන්න, මගේ ඔළුව ටිකක් අවුල් වුණා.. 😅";
    }
}

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse
};
