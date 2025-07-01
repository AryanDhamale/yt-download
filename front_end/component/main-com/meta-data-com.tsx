"use client";
import Image from "next/image";
import { useState } from "react";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

interface metaDataobj { 
    title? : string ;
    thumbnail?: string ; 
    duration? : number;
}

function MetaDataCom() {
    const [link, setLink] = useState<string>('');
    const [isError, setisError] = useState<string>('');
    const [metaData,setMetadata] = useState<metaDataobj | null>(null);
    const [isLoading,setisLoading] = useState<boolean>(false);
    const router = useRouter();

    const fetch_metaData = async (): Promise<void> => {
        try {
            if (!link) {
                // error here // 
                setisError('Link / Url is required!');
                return;
            }

            const meta_url: string = 'http://localhost:8080/api/meta-data';
            const fetchOptions = {
                method: 'POST',
                body : JSON.stringify({video_url:link}),
                headers : {
                    'content-type' : 'application/json',
                    'x-api-key' : '12345678'
                }
            }
            // start loading // 
            setisLoading(()=>true);
            const response : Response = await fetch(meta_url,fetchOptions); // resolved or rejected - > still here ,not catch in catch(err) but show in console // 
            const responseData = await response.json();
            
            // if error accured! // 
            if(!response.ok) { 
                throw new Error(responseData?.error || 'something went wrong!');
            }
 
            setMetadata(responseData);
            setisLoading(()=>false);
            
            if(isError) {
                setisError('');
            }
            // stop loading // 
            
        }
        catch (err) {
            setisError((err as Error)?.message);
            setisLoading(()=>false);
            console.log('error-',err);
        }
    }

    const st_downloading = (format:string):void=>{
        Cookies.set('video_url',JSON.stringify({link,video_title:metaData?.title}));
        router.push(`/download/${format}`);
    }

    return (
        <div className="w-4/5 mx-auto min-h-[100vh] bg-white flex flex-col gap-y-5 items-center py-10">
            {/* heading + input seach box */}
            <div className="box-content py-10  min-w-2xl">
                <h1 className="mb-7 text-center text-2xl font-medium text-slate-700 drop-shadow-lg">Download Video and Audio from youtube, instagram </h1>
                <div className="flex items-center gap-x-2">
                    <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full border-2 border-slate-100 rounded-md outline-0 px-3 py-3 " type="text" placeholder="enter the url" />
                    <button disabled={isLoading} onClick={fetch_metaData} className={`cursor-pointer ${isLoading ? 'bg-slate-800/50' : 'bg-slate-800'} text-white px-6 py-3  rounded-md font-medium`}>{ isLoading ? 'loading...' : 'search'}</button>
                </div>
            </div>

            {/* meta data + downlaod options */}
            <div className="box-content py-10 min-w-2xl">

                {/* introduction div */}
               {(!metaData && !isError) &&  <div className="flex flex-col gap-y-5 text-lg font-medium drop-shadow-lg text-slate-700 text-center">
                    <h1>Simply copy and past the video url that you want to download, also you can download only one video/audio at a time.</h1>
                    <h1>Download and enjoy your video or audio with high quality</h1>
                    <h1>If you find any error, Please let us know on <span className="text-blue-400">aryandhamale07@gmail.com</span> </h1>

                </div>}

                {/* for meta + downlaod */}
                {(metaData && !isError) && <div className="grid grid-cols-2 gap-x-8">
                    {/* Thumbnail */}
                    <div className="">
                        <Image className="w-sm h-[350px] object-cover rounded-md" width={480} height={360} src={metaData.thumbnail!} alt="This is a Thumbnail" />
                        <h3 className="mt-5 text-slate-700 font-medium">{metaData.title} - <span>{metaData.duration}sec</span> </h3>

                    </div>
                    {/* options */}
                    <div className="flex flex-col items-start gap-y-5">
                        <h1 className="w-full text-center font-medium text-slate-700 drop-shadow-2xl">Available download options</h1>

                        <div className="flex items-center gap-x-2">
                            <button onClick={()=>st_downloading('bestaudio')} className="w-[100px] text-center py-2 rounded-md cursor-pointer bg-green-400 hover:bg-green-400/90 text-white">BestAudio</button>
                            <h2 className="text-sm font-medium ">For download best <span className="text-rose-500">audio</span> only</h2>
                        </div>

                        <div className="flex items-center gap-x-2">
                            <button onClick={()=>st_downloading('bestvideo')} className="w-[100px] text-center py-2 rounded-md cursor-pointer bg-green-400 hover:bg-green-400/90 text-white">BestVideo</button>
                            <h2 className="text-sm font-medium ">For download best <span className="text-rose-500">video</span> only</h2>
                        </div>

                        <div className="flex items-center gap-x-2">
                            <button onClick={()=>st_downloading('best')} className="w-[100px] text-center py-2 rounded-md cursor-pointer bg-green-400 hover:bg-green-400/90 text-white">Best</button>
                            <h2 className="text-sm font-medium ">For download best <span className="text-rose-500">(audio + video)</span> only</h2>
                        </div>

                    </div>
                </div>}

                {/* for error */}
                {(isError) && <div className=" border drop-shadow-lg rounded-lg border-red-400 box-content py-10 w-2xl flex items-center justify-center">
                    <h1 className="text-center text-red-500 font-medium text-lg">{isError}</h1>
                </div>}

            </div>

        </div>
    );
}

export default MetaDataCom;