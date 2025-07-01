import { cookies } from "next/headers";
import DownloadCon from "@/component/download-com/download-com";

async function Download({ params }: any) {
    const { format } = await params;
    const CookieStore = await cookies();
    const getLink = CookieStore.get('video_url');

    const { link , video_title} = getLink && JSON.parse(getLink.value);

    if (!link || !format) {
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