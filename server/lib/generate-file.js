import youtubedl from 'youtube-dl-exec';

const { exec } = youtubedl;

async function generateFile(video_url, stream_type, tempFilePath) {
    try {
        if (!video_url || !stream_type || !tempFilePath) {
            throw new Error('credential are required!');
        }
        await exec(video_url, {
            format: stream_type,
            output: tempFilePath,
            noCheckCertificates: true,
            noWarnings: true,
            quiet: true,
        });
    }

    catch (err) {
        console.log(err);
        return err.message;
    }
}

export default generateFile;