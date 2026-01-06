/**
 * CHUTI WA BOT - WhatsApp Bot
 * Copyright (c) 2026 NIMESHA MADHUSHAN
 * * Credits:
 * - CHUTI WA BOT Created by NIMESHA MADHUSHAN
 * - YouTube Downloader Module
 * - Telegram: t.me/nimesha_editz
 */

const ytdl = require('@distube/ytdl-core');
const yts = require('youtube-yts');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg')
const NodeID3 = require('node-id3')
const fs = require('fs');
const { fetchBuffer } = require("./myfunc2")
const ytM = require('node-youtube-music')
const { randomBytes } = require('crypto')
const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
const path = require('path');

class YTDownloader {
    constructor() {
        this.tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(this.tmpDir)) {
            fs.mkdirSync(this.tmpDir, { recursive: true });
        }
    }

    /**
     * YouTube ලින්ක් එකක්දැයි පරීක්ෂා කිරීම
     */
    static isYTUrl = (url) => {
        return ytIdRegex.test(url)
    }

    /**
     * URL එකෙන් VideoID එක ලබා ගැනීම
     */
    static getVideoID = (url) => {
        if (!this.isYTUrl(url)) throw new Error('මෙය නිවැරදි YouTube URL එකක් නොවේ')
        return ytIdRegex.exec(url)[1]
    }

    /**
     * ගොනුවට Metadata (Tags) ඇතුළත් කිරීම
     */
    static WriteTags = async (filePath, Metadata) => {
        NodeID3.write(
            {
                title: Metadata.Title,
                artist: Metadata.Artist,
                originalArtist: Metadata.Artist,
                image: {
                    mime: 'jpeg',
                    type: {
                        id: 3,
                        name: 'front cover',
                    },
                    imageBuffer: (await fetchBuffer(Metadata.Image)).buffer,
                    description: `Cover of ${Metadata.Title}`,
                },
                album: Metadata.Album,
                year: Metadata.Year || ''
            },
            filePath
        );
    }

    static search = async (query, options = {}) => {
        const search = await yts.search({ query, hl: 'si', gl: 'LK', ...options })
        return search.videos
    }

    /**
     * සංගීතය බාගත කිරීම (Metadata සමඟ)
     */
    static downloadMusic = async (query) => {
        try {
            const getTrack = Array.isArray(query) ? query : await this.searchTrack(query);
            const search = getTrack[0]
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + search.id, { lang: 'si' });
            let stream = ytdl(search.id, { filter: 'audioonly', quality: 140 });
            let songPath = `./XeonMedia/audio/${randomBytes(3).toString('hex')}.mp3`
            
            const file = await new Promise((resolve) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(128)
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(songPath)
                    .on('end', () => resolve(songPath))
            });
            await this.WriteTags(file, { Title: search.title, Artist: search.artist, Image: search.image, Album: search.album, Year: videoInfo.videoDetails.publishDate.split('-')[0] });
            return {
                meta: search,
                path: file,
                size: fs.statSync(songPath).size
            }
        } catch (error) {
            throw new Error('බාගත කිරීමේදී දෝෂයක් ඇති විය: ' + error)
        }
    }

    /**
     * MP4 වීඩියෝ ලබා ගැනීම
     */
    static mp4 = async (query, quality = 134) => {
        try {
            if (!query) throw new Error('වීඩියෝ ID හෝ URL එක අවශ්‍ය වේ')
            const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, { lang: 'si' });
            const format = ytdl.chooseFormat(videoInfo.formats, { format: quality, filter: 'videoandaudio' })
            return {
                title: videoInfo.videoDetails.title,
                thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0],
                date: videoInfo.videoDetails.publishDate,
                duration: videoInfo.videoDetails.lengthSeconds,
                channel: videoInfo.videoDetails.ownerChannelName,
                quality: format.qualityLabel,
                contentLength: format.contentLength,
                description:videoInfo.videoDetails.description,
                videoUrl: format.url
            }
        } catch (error) {
            throw error
        }
    }

    /**
     * YouTube MP3 බාගත කිරීම
     */
    static mp3 = async (url, metadata = {}, autoWriteTags = false) => {
        try {
            if (!url) throw new Error('URL එක අවශ්‍ය වේ')
            url = this.isYTUrl(url) ? 'https://www.youtube.com/watch?v=' + this.getVideoID(url) : url
            const { videoDetails } = await ytdl.getInfo(url, { lang: 'si' });
            let stream = ytdl(url, { filter: 'audioonly', quality: 140 });
            let songPath = `./XeonMedia/audio/${randomBytes(3).toString('hex')}.mp3`

            const file = await new Promise((resolve) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(128)
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(songPath)
                    .on('end', () => resolve(songPath))
            });
            
            if (autoWriteTags) {
                await this.WriteTags(file, { 
                    Title: videoDetails.title, 
                    Album: videoDetails.author.name, 
                    Year: videoDetails.publishDate.split('-')[0], 
                    Image: videoDetails.thumbnails.slice(-1)[0].url 
                })
            }
            
            return {
                meta: {
                    title: videoDetails.title,
                    channel: videoDetails.author.name,
                    seconds: videoDetails.lengthSeconds,
                    image: videoDetails.thumbnails.slice(-1)[0].url
                },
                path: file,
                size: fs.statSync(songPath).size
            }
        } catch (error) {
            throw error
        }
    }
}

module.exports = new YTDownloader();
