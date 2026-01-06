/**
 * CHUTI WA BOT - AutoRecording System
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀන්
 * Owner: 94726800969
 */

const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecording.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        if (!fs.existsSync(path.dirname(configPath))) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autorecording feature
async function autorecordingCommand(sock, chatId, message) {
    try {
        // Check if sender is the owner
        if (!message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ මෙම විධානය භාවිතා කළ හැක්කේ බොට්ගේ අයිතිකරුට පමණි!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363419075720962@newsletter',
                        newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Initialize or read config
        const config = initConfig();
        
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                config.enabled = true;
            } else if (action === 'off' || action === 'disable') {
                config.enabled = false;
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ වලංගු නොවන විධානයකි! භාවිතය: .autorecording on/off',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363419075720962@newsletter',
                            newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
        } else {
            // Toggle current state
            config.enabled = !config.enabled;
        }
        
        // Save updated configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        // Send confirmation message
        await sock.sendMessage(chatId, {
            text: `✅ Auto-recording (හඬ පටිගත කිරීමේ තත්ත්වය) දැන් ${config.enabled ? 'සක්‍රියයි' : 'අක්‍රියයි'}!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419075720962@newsletter',
                    newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('Error in autorecording command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ දෝෂයක් සිදු විය! පසුව උත්සාහ කරන්න.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419075720962@newsletter',
                    newsletterName: 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Function to check if autorecording is enabled
function isAutorecordingEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        return false;
    }
}

// Function to handle autorecording for regular messages
async function handleAutorecordingForMessage(sock, chatId, userMessage) {
    if (isAutorecordingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await sock.sendPresenceUpdate('recording', chatId);
            const recordingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, recordingDelay));
            
            await sock.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (error) {
            return false;
        }
    }
    return false;
}

// Function to show recording status AFTER command execution
async function showRecordingAfterCommand(sock, chatId) {
    if (isAutorecordingEnabled()) {
        try {
            await sock.presenceSubscribe(chatId);
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 3000));
            await sock.sendPresenceUpdate('paused', chatId);
            return true;
        } catch (error) {
            return false;
        }
    }
    return false;
}

module.exports = {
    autorecordingCommand,
    isAutorecordingEnabled,
    handleAutorecordingForMessage,
    showRecordingAfterCommand
};
