const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function setProfilePicture(sock, chatId, msg) {
    try {
        // Check if user is owner
        const isOwner = msg.key.fromMe;
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ මෙය අයිතිකරුට පමණක් භාවිතා කල හැකි විධානයකි!' 
            });
            return;
        }

        // Check if message is a reply
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ කරුණාකර .setpp යනුවෙන් අවශ්‍ය පින්තූරයට රිප්ලයි කරන්න!' 
            });
            return;
        }

        // Check if quoted message contains an image
        const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
        if (!imageMessage) {
            await sock.sendMessage(chatId, { 
                text: '❌ පින්තූරය හමු නොවුනි!' 
            });
            return;
        }

        // Create tmp directory if it doesn't exist
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // Download the image
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
        
        // Save the image
        fs.writeFileSync(imagePath, buffer);

        // Set the profile picture
        await sock.updateProfilePicture(sock.user.id, { url: imagePath });

        // Clean up the temporary file
        fs.unlinkSync(imagePath);

        await sock.sendMessage(chatId, { 
            text: '✅ පින්තූරය අළුත් කරන ලදි!' 
        });

    } catch (error) {
        console.error('Error in setpp command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ පින්තූරය අළුත් කිරීම අසාර්ථකයි!' 
        });
    }
}

module.exports = setProfilePicture; 