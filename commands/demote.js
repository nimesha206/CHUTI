const isAdmin = require('../lib/isAdmin');

async function demoteCommand(sock, chatId, mentionedJids, message) {
    try {
        // First check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: 'මෙම විධානය සමූහයක පමණක් භාවිතා කල හැක!'
            });
            return;
        }

        // Check admin status first, before any other operations
        try {
            const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);
            
            if (!adminStatus.isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '❌ කරුණාකර මා හට *ඇඩ්මින්* තනතුර ලබාදෙන්න.'
                });
                return;
            }

            if (!adminStatus.isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '❌ මෙම විධනය භාවිතා කල හැක්කෙ ඇඩ්මින් වරුන් හට පමණි.'
                });
                return;
            }
        } catch (adminError) {
            console.error('Error checking admin status:', adminError);
            await sock.sendMessage(chatId, { 
                text: '❌ අසාර්ථකයි. කරුණාකර පරීක්ෂා කරන්න මා හට ඇඩ්මින් ලබාදී ඇත්දැයි.'
            });
            return;
        }

        let userToDemote = [];
        
        // Check for mentioned users
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        // If no user found through either method
        if (userToDemote.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ කරුණාකර පරිශීලකයා හෝ පණිවිඩය තෝරා එවන්න!'
            });
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");
        
        // Get usernames for each demoted user
        const usernames = await Promise.all(userToDemote.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `╭══✦〔 *『 තනතුරු ඉවත් කිරීම 』* 〕✦═╮\n│ \n` +
            `│ 👤 *තනතුරු ඉවත් කරන ලදි${userToDemote.length > 1 ? 's' : ''}:*\n` +
            `${usernames.map(name => `• ${name}`).join('\n')}\n│ \n` +
            `│ 👑 *ඉවත් කලේ:* @${message.key.participant ? message.key.participant.split('@')[0] : message.key.remoteJid.split('@')[0]}\n│ \n` +
            `│ 📅 *දිනය:* ${new Date().toLocaleString()}\n│ \n` +
            `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`;
        
        await sock.sendMessage(chatId, { 
            text: demotionMessage,
            mentions: [...userToDemote, message.key.participant || message.key.remoteJid]
        });
    } catch (error) {
        console.error('Error in demote command:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: '❌ Rate limit reached ප්‍රෂ්නයකි. කරුණාකර තප්පර 5කින් පසුව නැවත උත්සහ කරන්න.'
                });
            } catch (retryError) {
                console.error('Error sending retry message:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: '❌ තනතුර ඉවත් කිරීම අසාර්ථකයි. මා හට ඇඩින් තනතුර දී ඇත්දැයි පරීක්ෂා කරන්න.'
                });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}

// Function to handle automatic demotion detection
async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!groupId || !participants) {
            console.log('Invalid groupId or participants:', { groupId, participants });
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get usernames for demoted participants
        const demotedUsernames = await Promise.all(participants.map(async jid => {
            return `@${jid.split('@')[0]}`;
        }));

        let demotedBy;
        let mentionList = [...participants];

        if (author && author.length > 0) {
            // Ensure author has the correct format
            const authorJid = author;
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        } else {
            demotedBy = 'System';
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `╭══✦〔 *『 තනතුරු ඉවත් කිරීමෙ විධාන 』* 〕✦═╮\n│ \n` +
            `│ 👤 *තනතුර ඉවත් කරන ලදි${participants.length > 1 ? 's' : ''}:*\n` +
            `${demotedUsernames.map(name => `• ${name}`).join('\n')}\n│ \n` +
            `│ 👑 *ඉවත් කලේ:* ${demotedBy}\n│ \n` +
            `│ 📅 *දිනය:* ${new Date().toLocaleString()}\n` +
            `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`;
        
        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

module.exports = { demoteCommand, handleDemotionEvent };
