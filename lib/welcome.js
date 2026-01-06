/**
 * CHUTI WA BOT - WhatsApp Bot
 * Copyright (c) 2026 NIMESHA MADHUSHAN
 * * Credits:
 * - CHUTI WA BOT Created by NIMESHA MADHUSHAN
 * - Telegram: t.me/nimesha_editz
 */

const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╭══✦〔📥 *පිළිගැනීමේ පණිවිඩ සැකසුම්* 〕✦═╮\n│ \n│ ✅ *.welcome on* — පිළිගැනීමේ පණිවිඩ සක්‍රිය කිරීමට\n│ 🛠️ *.welcome set [මැසේජ් එක]* — අලුත් මැසේජ් එකක් සැකසීමට\n│ 🚫 *.welcome off* — පිළිගැනීමේ පණිවිඩ අක්‍රිය කිරීමට\n│ \n│ *භාවිතා කළ හැකි වචන:*\n│ • {user} - සාමාජිකයාගේ නම\n│ • {group} - සමූහයේ නම\n│ • {description} - සමූහයේ විස්තරය\n│\n╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ පිළිගැනීමේ පණිවිඩ දැනටමත් *සක්‍රියයි*.', quoted: message });
        }
        await addWelcome(chatId, true, 'සාදරයෙන් පිළිගන්නවා {user}, {group} සමූහයට! 🎉');
        return sock.sendMessage(chatId, { text: '✅ පිළිගැනීමේ පණිවිඩ *සක්‍රිය කරන ලදී*. වෙනස් කිරීමට *.welcome set [මැසේජ් එක]* භාවිතා කරන්න.', quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ පිළිගැනීමේ පණිවිඩ දැනටමත් *අක්‍රියයි*.', quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { text: '✅ පිළิගැනීමේ පණිවිඩ මෙම සමූහය සඳහා *අක්‍රිය කරන ලදී*.', quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ කරුණාකර අලුත් මැසේජ් එක ඇතුළත් කරන්න. උදා: *.welcome set සාදරයෙන් පිළිගන්නවා {user}*', quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ පිළිගැනීමේ පණිවිඩය *සාර්ථකව යාවත්කාලීන කළා*.', quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ වැරදි විධානයකි. භාවිතා කරන්න:\n*.welcome on*\n*.welcome set [මැසේජ් එක]*\n*.welcome off*`,
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╭══✦〔📤 *සමුගැනීමේ පණිවිඩ සැකසුම්* 〕✦═╮\n│ \n│ ✅ *.goodbye on* — සමුගැනීමේ පණිවිඩ සක්‍රිය කිරීමට\n│ 🛠️ *.goodbye set [මැසේජ් එක]* — අලුත් මැසේජ් එකක් සැකසීමට\n│ 🚫 *.goodbye off* — සමුගැනීමේ පණිවිඩ අක්‍රිය කිරීමට\n│ \n│ *භාවිතා කළ හැකි වචන:*\n│ • {user} - සාමාජිකයාගේ නම\n│\n╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`,
            quoted: message
        });
    }

    const lower = match.toLowerCase();

    if (lower === 'on') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { text: '⚠️ සමුගැනීමේ පණිවිඩ දැනටමත් *සක්‍රියයි*.', quoted: message });
        }
        await addGoodbye(chatId, true, 'ගිහින් එන්න {user} 👋');
        return sock.sendMessage(chatId, { text: '✅ සමුගැනීමේ පණිවිඩ *සක්‍රිය කරන ලදී*.', quoted: message });
    }

    if (lower === 'off') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { text: '⚠️ සමුගැනීමේ පණිවිඩ දැනටමත් *අක්‍රියයි*.', quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { text: '✅ සමුගැනීමේ පණිවිඩ මෙම සමූහය සඳහා *අක්‍රිය කරන ලදී*.', quoted: message });
    }

    if (lower.startsWith('set ')) {
        const customMessage = match.substring(4);
        if (!customMessage) {
            return sock.sendMessage(chatId, { text: '⚠️ කරුණාකර අලුත් සමුගැනීමේ පණිවිඩය ඇතුළත් කරන්න.', quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { text: '✅ සමුගැනීමේ පණිවිඩය *සාර්ථකව යාවත්කාලීන කළා*.', quoted: message });
    }

    return sock.sendMessage(chatId, {\n        text: `❌ වැරදි විධානයකි. භාවිතා කරන්න:\n*.goodbye on*\n*.goodbye set [මැසේජ් එක]*\n*.goodbye off*`,\n        quoted: message\n    });
}

module.exports = { handleWelcome, handleGoodbye };
