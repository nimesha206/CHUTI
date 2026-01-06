/**
 * CHUTI WA BOT - WhatsApp Bot
 * Copyright (c) 2026 NIMESHA MADHUSHAN
 * * Credits:
 * - CHUTI WA BOT Created by NIMESHA MADHUSHAN
 * - Telegram: t.me/nimesha_editz
 * - GitHub: github.com/nimesha206/CHUTI
 */

const fetch = require('node-fetch');
const FormData = require('form-data');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');

/**
 * රූප හෝ ගොනු අන්තර්ජාලයට උඩුගත කිරීම (qu.ax හරහා)
 * @param {Buffer} buffer File Buffer
 * @return {Promise<string>}
 */
async function uploadImage(buffer) {
    try {
        // තාවකාලික ගොනු ගබඩා කිරීමට 'tmp' ෆෝල්ඩරය පරීක්ෂා කිරීම
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        // ගොනුවේ වර්ගය (Mime Type) හඳුනා ගැනීම
        const fileType = await FileType.fromBuffer(buffer);
        const { ext, mime } = fileType || { ext: 'png', mime: 'image/png' };
        const tempFile = path.join(tmpDir, `temp_${Date.now()}.${ext}`);

        // බෆරය තාවකාලික ගොනුවක් ලෙස සුරැකීම
        fs.writeFileSync(tempFile, buffer);

        // Form Data සකස් කිරීම
        const form = new FormData();
        form.append('files[]', fs.createReadStream(tempFile));

        // qu.ax වෙත උඩුගත කිරීම
        const response = await fetch('https://qu.ax/upload.php', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        // තාවකාලික ගොනුව මකා දැමීම
        fs.unlinkSync(tempFile);

        const result = await response.json();
        if (result && result.success) {
            return result.files[0].url;
        } else {
            // qu.ax අසාර්ථක වුවහොත් telegra.ph භාවිතා කිරීම (Fallback)
            const telegraphForm = new FormData();
            telegraphForm.append('file', buffer, {
                filename: `upload.${ext}`,
                contentType: mime
            });

            const telegraphResponse = await fetch('https://telegra.ph/upload', {
                method: 'POST',
                body: telegraphForm
            });

            const img = await telegraphResponse.json();
            if (img[0]?.src) {
                return 'https://telegra.ph' + img[0].src;
            }
            
            throw new Error('සේවා දෙකම හරහා ගොනුව උඩුගත කිරීම අසාර්ථක විය.');
        }
    } catch (error) {
        console.error('උඩුගත කිරීමේ දෝෂය:', error);
        throw error;
    }
}

module.exports = { uploadImage };
