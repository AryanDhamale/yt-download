"use client"
import { useState } from "react";

function DownloadCon({ video_url, video_title, stream_type }: { video_url: string, video_title: string, stream_type: string }) {
    const [error,setError]=useState<string>('');
    const [isLoading,setisLoading]=useState<boolean>(false);

    async function st_downloading(): Promise<void> {
        try {
            setisLoading(()=>true);
            const st_url = 'http://localhost:8080/api/st-downloading';
            const fetchOptions = {
                method: 'POST',
                body: JSON.stringify({ video_url, stream_type, video_title }),
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': '12345678'
                }
            }

            const response = await fetch(st_url, fetchOptions);

            if(!response.ok) {
                const responseData=await response.json();
                throw new Error(responseData?.error || 'downloading failed!');
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');

            // const content_disposition = response.headers.get('Content-Disposition');
            // const match = content_disposition?.match(/filename="(.+)"/);
            
            const fileName = video_title+(stream_type=='bestaudio' ? '.mp3' : '.mp4' ) ;
            a.href=downloadUrl;
            a.download=fileName;

            document.body.appendChild(a);
            a.click();
            a.remove();
            
            window.URL.revokeObjectURL(downloadUrl);
            setisLoading(()=>false);
            
        }
        catch (err) {
            console.log(err);
            setisLoading(()=>false);
            setError( (err as Error)?.message); 
        }
    }

    return (
        <div className="w-full h-[80vh] text-slate-700 drop-shadow-lg font-medium flex flex-col items-center justify-center gap-y-5">
            <h1>your download is ready , now you can download the stream (video/audio)</h1>
            <button disabled={isLoading} onClick={st_downloading} className={`py-3 px-4 ${isLoading ? 'bg-slate-700/50' : 'bg-slate-700'} text-white rounded-md`}>{isLoading ? 'downloading...' : 'start Downloading'}</button>
            <h2>hope you will enjoy it! &#128513;</h2>
            <h1 className="text-red-500">{error}</h1>
        </div>
    );
}

export default DownloadCon;