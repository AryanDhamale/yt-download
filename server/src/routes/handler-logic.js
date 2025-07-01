import express from 'express'
import youtubedl from 'youtube-dl-exec';
import path from 'path';
import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';
import fs from 'fs';

const { exec } = youtubedl;
const router = express.Router();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


// for meta data // 

router.post('/meta-data', async function (request, response) {
    try {

        const { video_url = null } = request.body;

        if (!video_url) {
            return response.status(400).json({ msg: 'video url is required!' });
        }

        if (typeof video_url !== 'string') {
            return response.status(400).json({ msg: 'invalid credentials!' });
        }

        let { title, thumbnail, duration, formats } = await youtubedl(video_url, { // directly validate // 
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });

        //formats = formats.map((el) => ({ id: el.format_id, ext: el.ext, res: el.resolution, node: el.format_note }))

        return response.status(200).json({ title, thumbnail, duration });
    }
    catch (err) {
        console.log(`error-41 : ${err}`);
        return response.status(503).json({ error: err.message });
    }
});


// start downloading // 

router.post('/st-downloading', async function (request, response) {

    try {

        const { video_url = null, video_title = null, stream_type = null } = request.body;

        if (!video_title || !video_url || !stream_type) {
            return response.status(400).json({ msg: 'credentials are missing' });
        }

        const required_stream=['best','bestaudio','bestvideo','bestvideo+bestaudio'];

        if(!required_stream.includes(stream_type)) {
            return response.status(400).json({msg:'invalid streaming type!'});
        }

        // start streaming // 

        // Sanitize title to make it safe for a filename
        const safeTitle = video_title.replace(/[\/\\?%*:|"<>]/g, '-');
        const isAudio = stream_type=='bestaudio' ? true : false ; 
        const stream = new PassThrough();

        const ytdlp = exec(video_url, {
            format: stream_type,
            output: '-',
            quiet: true,
            noCheckCertificates: true,
            noWarnings: true
        }, { stdio: ['ignore', 'pipe', 'ignore'] });

        ytdlp.stdout.pipe(stream);

        // Set appropriate headers
        response.setHeader(
            'Content-Disposition',
            `attachment; filename="${safeTitle}.${isAudio ? 'mp3' : 'mp4'}"`
        );
        response.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');

        stream.pipe(response);

        // end streaming here // 

    }
    catch (err) {
        console.log(`error-67 : ${err}`);
        return response.status(503).json({ error: err.message });
    }

})


export default router;