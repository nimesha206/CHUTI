/**
 * CHUTI WA BOT - WhatsApp Bot
 * Copyright (c) 2026 NIMESHA MADHUSHAN
 * * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * * Credits:
 * - CHUTI WA BOT Created by NIMESHA MADHUSHAN
 * - Developed for CHUTI WA Community
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawn } = require('child_process')
const { fileTypeFromBuffer } = require('file-type')
const webp = require('node-webpmux')
const fetch = require('node-fetch')
const ffmpeg = require('fluent-ffmpeg')
const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const { writeExifImg } = require('./exif')

const tmp = path.join(__dirname, '../tmp')

/**
 * Image to Sticker
 * @param {Buffer} img Image Buffer
 * @param {String} url Image URL
 */
function sticker2(img, url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw await res.text()
        img = await res.buffer()
      }
      let inp = path.join(tmp, +new Date + '.jpeg')
      await fs.promises.writeFile(inp, img)
      let ff = spawn('ffmpeg', [
        '-y',
        '-i', inp,
        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
        '-f', 'png',
        '-'
      ])
      ff.on('error', reject)
      ff.on('close', async () => {
        await fs.promises.unlink(inp)
      })
      let bufs = []
      const [_spawnprocess, ..._spawnargs] = [...(module.exports.support.gm ? ['gm'] : module.exports.magick ? ['magick'] : []), 'convert', 'png:-', 'webp:-']
      let im = spawn(_spawnprocess, _spawnargs)
      im.on('error', e => console.error(e))
      im.stdout.on('data', chunk => bufs.push(chunk))
      ff.stdout.pipe(im.stdin)
      im.on('exit', () => {
        resolve(Buffer.concat(bufs))
      })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Convert media to WebP and add metadata
 * @param {Buffer} inputBuffer Image Buffer
 * @param {String} url Image URL
 * @param {String} packname EXIF Packname
 * @param {String} author EXIF Author
 */
async function sticker(isImage, url, packname, author) {
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();
        
        // නිර්මාණකරුගේ විස්තර මෙහි ඇතුළත් වේ
        const stickerBuffer = await writeExifImg(buffer, {
            packname: packname || 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ',
            author: author || 'ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ'
        });
        
        return stickerBuffer;
    } catch (error) {
        console.error('ස්ටිකර් නිර්මාණය කිරීමේදී දෝෂයක්:', error);
        return null;
    }
}

async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString('hex');
  const json = { 
    'sticker-pack-id': stickerPackId, 
    'sticker-pack-name': packname || 'ᴄʜᴜᴛɪ ᴡᴀ ʙᴏᴛ', 
    'sticker-pack-publisher': author || 'ɴɪᴍᴇsʜᴀ ᴍᴀᴅʜᴜsʜᴀɴ', 
    'emojis': categories, 
    ...extra 
  };
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  let exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
}

module.exports = {
  sticker,
  sticker2,
  addExif,
  support
}
