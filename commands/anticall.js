/**
 * CHUTI WA BOT - AntiCall Command
 * By: ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀn
 * Owner: 94726800969
 */

const fs = require("fs");

const ANTICALL_PATH = "./data/anticall.json";

function readState() {
  try {
    if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
    const raw = fs.readFileSync(ANTICALL_PATH, "utf8");
    const data = JSON.parse(raw || "{}");
    return { enabled: !!data.enabled };
  } catch {
    return { enabled: false };
  }
}

function writeState(enabled) {
  try {
    if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });
    fs.writeFileSync(
      ANTICALL_PATH,
      JSON.stringify({ enabled: !!enabled }, null, 2)
    );
  } catch {}
}

async function anticallCommand(sock, chatId, message, args) {
  const state = readState();
  const sub = (args || "").trim().toLowerCase();

  if (!sub || (sub !== "on" && sub !== "off" && sub !== "status")) {
    await sock.sendMessage(
      chatId,
      {
        text:
          "╭═══✦〔 *ᴀɴᴛɪᴄᴀʟʟ සැකසුම්* 〕✦═╮\n│\n" +
          "│ *.anticall on* - ඇමතුම් ස්වයංක්‍රීයව විසන්ධි කිරීම සක්‍රිය කරයි\n" +
          "│ *.anticall off* - anticall අක්‍රිය කරයි\n" +
          "│ *.anticall status* - වත්මන් තත්ත්වය පරීක්ෂා කරයි\n│\n" +
          "╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯",
      },
      { quoted: message }
    );
    return;
  }

  if (sub === "status") {
    await sock.sendMessage(
      chatId,
      {
        text: `Anticall දැනට *${
          state.enabled ? "සක්‍රියයි (ඇමතුම් ප්‍රතික්ෂේප කරනු ලැබේ)" : "අක්‍රියයි"
        }*.`,
      },
      { quoted: message }
    );
    return;
  }

  const enable = sub === "on";
  writeState(enable);
  await sock.sendMessage(
    chatId,
    { text: `Anticall දැන් *${enable ? "සක්‍රියයි (ENABLED)" : "අක්‍රියයි (DISABLED)"}*.` },
    { quoted: message }
  );
}

/**
 * 🔔 Call handler: rejects incoming calls when anticall is ON
 */
async function handleIncomingCall(sock, call) {
  const state = readState();
  if (!state.enabled) return;

  try {
    // Reject the call without blocking the caller
    await sock.rejectCall(call.id, call.from);
    console.log("[anticall] Rejected call from:", call.from);

    // Optional: Notify the caller once per call
    await sock.sendMessage(call.from, {
      text: "📵 ඇමතුම් ලබා ගැනීමට නොහැක. කරුණාකර පණිවිඩයක් (Message) එවන්න.",
    });
  } catch (err) {
    console.error("[anticall] Error rejecting call:", err);
  }
}

module.exports = { anticallCommand, readState, handleIncomingCall };
