const fs = require('fs');
const path = require('path');

// JSON ගොනුවෙන් දත්ත පූරණය කිරීමේ ශ්‍රිතය
function loadUserGroupData() {
    try {
        const dataPath = path.join(__dirname, '../data/userGroupData.json');
        if (!fs.existsSync(dataPath)) {
            const defaultData = {
                antibadword: {},
                antilink: {},
                antitag: {},
                welcome: {},
                goodbye: {},
                chatbot: {},
                warnings: {},
                sudo: []
            };
            fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        return data;
    } catch (error) {
        console.error('දත්ත පූරණය කිරීමේ දෝෂයකි:', error);
        return {
            antibadword: {},
            antilink: {},
            antitag: {},
            welcome: {},
            goodbye: {},
            chatbot: {},
            warnings: {}
        };
    }
}

// දත්ත JSON ගොනුවට සුරැකීමේ ශ්‍රිතය
function saveUserGroupData(data) {
    try {
        const dataPath = path.join(__dirname, '../data/userGroupData.json');
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('දත්ත සුරැකීමේ දෝෂයකි:', error);
        return false;
    }
}

// Antilink සැකසුම්
async function setAntilink(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink) data.antilink = {};
        data.antilink[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function getAntilink(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antilink || !data.antilink[groupId]) return null;
        return type === 'on' ? data.antilink[groupId] : null;
    } catch (error) {
        return null;
    }
}

async function removeAntilink(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antilink && data.antilink[groupId]) {
            delete data.antilink[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Antitag සැකසුම්
async function setAntitag(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag) data.antitag = {};
        data.antitag[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function getAntitag(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antitag || !data.antitag[groupId]) return null;
        return type === 'on' ? data.antitag[groupId] : null;
    } catch (error) {
        return null;
    }
}

async function removeAntitag(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antitag && data.antitag[groupId]) {
            delete data.antitag[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

// අවවාද කිරීමේ පද්ධතිය (Warning System)
async function incrementWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (!data.warnings) data.warnings = {};
        if (!data.warnings[groupId]) data.warnings[groupId] = {};
        if (!data.warnings[groupId][userId]) data.warnings[groupId][userId] = 0;
        data.warnings[groupId][userId]++;
        saveUserGroupData(data);
        return data.warnings[groupId][userId];
    } catch (error) {
        return 0;
    }
}

async function resetWarningCount(groupId, userId) {
    try {
        const data = loadUserGroupData();
        if (data.warnings && data.warnings[groupId] && data.warnings[groupId][userId]) {
            data.warnings[groupId][userId] = 0;
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Sudo පරිශීලකයින් කළමනාකරණය
async function isSudo(userId) {
    try {
        const data = loadUserGroupData();
        return data.sudo && data.sudo.includes(userId);
    } catch (error) {
        return false;
    }
}

async function addSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        if (!data.sudo.includes(userJid)) {
            data.sudo.push(userJid);
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

async function removeSudo(userJid) {
    try {
        const data = loadUserGroupData();
        if (!data.sudo) data.sudo = [];
        const idx = data.sudo.indexOf(userJid);
        if (idx !== -1) {
            data.sudo.splice(idx, 1);
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

async function getSudoList() {
    try {
        const data = loadUserGroupData();
        return Array.isArray(data.sudo) ? data.sudo : [];
    } catch (error) {
        return [];
    }
}

// Welcome සහ Goodbye සැකසුම් (ඔබගේ JID එක ඇතුළත් කර ඇත)
async function addWelcome(jid, enabled, message) {
    try {
        const data = loadUserGroupData();
        if (!data.welcome) data.welcome = {};
        data.welcome[jid] = {
            enabled: enabled,
            message: message || '╔═⚔️ සාදරයෙන් පිළිගනිමු ⚔️═╗\n║ 🛡️ පරිශීලක: {user}\n║ 🏰 සමූහය: {group}\n╠═══════════════╣\n║ 📜 විස්තරය:\n║ {description}\n╚═══════════════╝',
            channelId: '120363419075720962@newsletter'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function delWelcome(jid) {
    try {
        const data = loadUserGroupData();
        if (data.welcome && data.welcome[jid]) {
            delete data.welcome[jid];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

async function isWelcomeOn(jid) {
    try {
        const data = loadUserGroupData();
        return data.welcome && data.welcome[jid] && data.welcome[jid].enabled;
    } catch (error) {
        return false;
    }
}

async function addGoodbye(jid, enabled, message) {
    try {
        const data = loadUserGroupData();
        if (!data.goodbye) data.goodbye = {};
        data.goodbye[jid] = {
            enabled: enabled,
            message: message || '╔═⚔️ සමුගනිමු ⚔️═╗\n║ 🛡️ පරිශීලක: {user}\n║ 🏰 සමූහය: {group}\n╠═══════════════╣\n║ ⚰️ නැවත හමුවෙමු!\n╚═══════════════╝',
            channelId: '120363419075720962@newsletter'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function delGoodBye(jid) {
    try {
        const data = loadUserGroupData();
        if (data.goodbye && data.goodbye[jid]) {
            delete data.goodbye[jid];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

async function isGoodByeOn(jid) {
    try {
        const data = loadUserGroupData();
        return data.goodbye && data.goodbye[jid] && data.goodbye[jid].enabled;
    } catch (error) {
        return false;
    }
}

// Antibadword සැකසුම්
async function setAntiBadword(groupId, type, action) {
    try {
        const data = loadUserGroupData();
        if (!data.antibadword) data.antibadword = {};
        data.antibadword[groupId] = {
            enabled: type === 'on',
            action: action || 'delete'
        };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function getAntiBadword(groupId, type) {
    try {
        const data = loadUserGroupData();
        if (!data.antibadword || !data.antibadword[groupId]) return null;
        return type === 'on' ? data.antibadword[groupId] : null;
    } catch (error) {
        return null;
    }
}

async function removeAntiBadword(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.antibadword && data.antibadword[groupId]) {
            delete data.antibadword[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

// Chatbot සැකසුම්
async function setChatbot(groupId, enabled) {
    try {
        const data = loadUserGroupData();
        if (!data.chatbot) data.chatbot = {};
        data.chatbot[groupId] = { enabled: enabled };
        saveUserGroupData(data);
        return true;
    } catch (error) {
        return false;
    }
}

async function getChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        return data.chatbot?.[groupId] || null;
    } catch (error) {
        return null;
    }
}

async function removeChatbot(groupId) {
    try {
        const data = loadUserGroupData();
        if (data.chatbot && data.chatbot[groupId]) {
            delete data.chatbot[groupId];
            saveUserGroupData(data);
        }
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    setAntilink,
    getAntilink,
    removeAntilink,
    setAntitag,
    getAntitag,
    removeAntitag,
    incrementWarningCount,
    resetWarningCount,
    isSudo,
    addSudo,
    removeSudo,
    getSudoList,
    addWelcome,
    delWelcome,
    isWelcomeOn,
    addGoodbye,
    delGoodBye,
    isGoodByeOn,
    setAntiBadword,
    getAntiBadword,
    removeAntiBadword,
    setChatbot,
    getChatbot,
    removeChatbot,
};
