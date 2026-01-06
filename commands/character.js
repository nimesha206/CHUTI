/**
 * CHUTI WA BOT - Character Analysis System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ
 * Owner: 94726800969
 */

const axios = require('axios');

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

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: '⚠️ කරුණාකර චරිතය විශ්ලේෂණය කිරීමට අවශ්‍ය පුද්ගලයාව Mention කරන්න හෝ ඔහුගේ පණිවිඩයකට Reply කරන්න!', 
            ...channelInfo 
        });
        return;
    }

    try {
        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        const traits = [
            "බුද්ධිමත්", "නිර්මාණශීලී", "අධිෂ්ඨානශීලී", "අභිලාෂකාමී", "කරුණාවන්ත",
            "ආකර්ශනීය", "විශ්වාසවන්ත", "සංවේදී", "ක්‍රියාශීලී", "මිත්‍රශීලී",
            "ත්‍යාගශීලී", "අවංක", "විනෝදකාමී", "ස්වාධීන", "ඉවසීම ඇති",
            "විශ්වාසවන්ත", "නුවණැති", "තර්කානුකූල", "සාධාරණ", "උද්යෝගිමත්"
        ];

        // Get 3-5 random traits
        const numTraits = Math.floor(Math.random() * 3) + 3;
        const selectedTraits = [];
        while (selectedTraits.length < numTraits) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) {
                selectedTraits.push(randomTrait);
            }
        }

        // Calculate random percentages
        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60; // 60-100%
            return `│ ✨ ${trait}: ${percentage}%`;
        });

        // Create character analysis message
        const analysis = `╭══✦〔🔮 *චරිත විශ්ලේෂණය* 🔮〕✦═╮\n│ \n` +
            `│ 👤 *පරිශීලක:* @${userToAnalyze.split('@')[0]}\n│ \n` +
            `│ 🎯 *ප්‍රධාන ගතිගුණ:*\n${traitPercentages.join('\n')}\n│ \n` +
            `│ 🏆 *සමස්ත තක්සේරුව:* ${Math.floor(Math.random() * 21) + 80}%\n│ \n` +
            `│ ɴᴏᴛᴇ: මෙය විනෝදය සඳහා පමණක් සිදු කරන්නකි!\n│ \n` +
            `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯\n\n> © ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ | ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ`;

        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze],
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in character command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ විශ්ලේෂණය අසාර්ථක විය! පසුව උත්සාහ කරන්න.',
            ...channelInfo 
        });
    }
}

module.exports = characterCommand;
