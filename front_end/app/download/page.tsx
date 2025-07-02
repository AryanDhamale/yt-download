import { cookies } from "next/headers";
import DownloadCon from "@/component/download-com/download-com";

async function Download() {
    const CookieStore = await cookies(); // clear only in server action or route handlers // 
    const getLink = CookieStore.get('meta_data');
    let link,video_title,format; // only if getlink != undefined // 
    
    if(getLink) {
       let val = JSON.parse(getLink.value);
       link=val.link;
       video_title = val.video_title;
       format=val.format;
    }


    if (!link || !video_title || !format) {
        return (
            <div className="w-full h-[80vh] text-slate-700 drop-shadow-lg font-medium flex flex-col items-center justify-center gap-y-5">
                <h1 className="text-xl">404 - Unauthorized!</h1>
                <h2 className="text-lg">You dont have access to direct Root</h2>
            </div>
        );
    }

    return <DownloadCon video_url={link} video_title={video_title} stream_type={format}/>
}

export default Download