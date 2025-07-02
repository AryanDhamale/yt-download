import express from 'express'
import youtubedl from 'youtube-dl-exec';
import path from 'path';
import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import generateFile from '../../lib/generate-file.js';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import isValidateStreamType from '../../lib/is-validate-stream-type.js';

const { exec } = youtubedl;
const router = express.Router();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


// for meta data // 

router.post('/meta-data', async function (request, response) {
    try {
        const { video_url = null } = request.body;

        if (!video_url) {
            return response.status(400).json({error: 'video url is required!' });
        }

        if (typeof video_url !== 'string') {
            return response.status(400).json({ error: 'invalid credentials!' });
        }

        let { title, thumbnail, duration, formats } = await youtubedl(video_url, { // directly validate // 
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });

    
        // find available formates for download // 
        const download_format={};
        formats.forEach((f)=>{
            if(f.ext=='mp4' && f.acodec=='none' && f.vcodec!='none') {
                if(!download_format[String(f.height)]) {
                    download_format[String(f.height)] = f.height;
                }
            }
        })

        return response.status(200).json({ title, thumbnail, duration,download_format});
    }
    catch (err) {
        console.log(`error-41 : ${err}`);
        return response.status(503).json({ error: err.message });
    }
});


// start downloading // 

router.post('/st-downloading', async function (request, response) {
    try {

        const { video_url = null, stream_type = null } = request.body;

        if (!video_url || !stream_type) {
            return response.status(400).json({ error: 'credentials are missing' });
        }

        // pre default merging not possible // 
        if (!isValidateStreamType(stream_type)) {
            return response.status(400).json({ error: 'invalid streaming type!' });
        }


        const isAudio = stream_type == 'bestaudio' ? true : false;
        // audio streaming only // 
        if (isAudio) {
            const stream = new PassThrough();

            const ytdlp = exec(video_url, {
                format: stream_type,
                output: '-',
                quiet: true,
                noCheckCertificates: true,
                noWarnings: true
            }, { stdio: ['ignore', 'pipe', 'ignore'] });

            ytdlp.stdout.pipe(stream);

            response.setHeader('Content-Type','audio/mpeg');

            stream.pipe(response);
        }
        // create (audio and video)-> merage - > streaming only // 
        else {
            const commonID = uuidv4();
            const videoFile = `${commonID}.mp4`;
            const videoFilePath = path.join(__dirname, 'temp', videoFile);
            const audioFile = `${commonID}.mp3`;
            const audioFilePath = path.join(__dirname, 'temp', audioFile);
            const outputPath = path.join(__dirname, 'temp', 'final.mp4');

            // generating audio + video by requiredment // 
            await generateFile(video_url, stream_type, videoFilePath); 
            await generateFile(video_url, 'bestaudio', audioFilePath);

            // start mergin // 

            const ffmpeg = spawn(ffmpegPath, [
                '-i', videoFilePath,
                '-i', audioFilePath,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-strict', 'experimental',
                outputPath,
            ], { stdio: ['ignore', 'pipe', 'ignore'] });

            // end mergin //


            // send header for browser // 
            response.setHeader('Content-Type', 'video/mp4');
            response.setHeader('Content-Disposition', 'attachment; filename="merged.mp4"');

            // check merging completed or not ? // 
            ffmpeg.on('close', (code) => {
                if (code !== 0) {
                    console.error(`FFmpeg exited with code ${code}`);
                    return response.status(500).json({error:'Merging failed'});
                }
                else {
                    // start streaming // 
                    const fileStream = fs.createReadStream(outputPath);
                    fileStream.pipe(response);
                    fileStream.on('end', () => {
                        fs.unlink(outputPath, (err) => {if(err) console.log(`output-fs:${err}`) });
                        fs.unlink(videoFilePath, (err) => {if(err) console.log(`output-fs:${err}`) });
                        fs.unlink(audioFilePath, (err) => {if(err) console.log(`output-fs:${err}`) });
                    });
                }
            });

        }
    }
    catch (err) {
        console.log(`error-catch: ${err}`);
        return response.status(503).json({ error: err.message });
    }

})


export default router;