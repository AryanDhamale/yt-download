"use client";
import Image from "next/image";
import { useState } from "react";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {Flip, ToastContainer, toast } from "react-toastify";

interface metaDataobj {
    title?: string;
    thumbnail?: string;
    duration?: number;
    download_format?: { [pixel: string]: number }
}

function MetaDataCom() {
    const [link, setLink] = useState<string>('');
    const [isError, setisError] = useState<string>('');
    const [metaData, setMetadata] = useState<metaDataobj | null>(null);
    const [isLoading, setisLoading] = useState<boolean>(false);
    const router = useRouter();
    const { isSignedIn } = useAuth();


    const fetch_metaData = async (): Promise<void> => {
        try {
            if (!isSignedIn) {
                generateToast('SignIn is Required!',toast.info);
                return;
            }
            if (!link) {
                // error here // 
                generateToast('Link/URL is required for meta_data!',toast.success);
                return;
            }

            const meta_url: string = process.env.NODE_ENV=='development' ? 'http://localhost:8080/api/meta-data' :  (process.env.NEXT_PUBLIC_SERVER_URL + 'api/meta-data');
            const fetchOptions = {
                method: 'POST',
                body: JSON.stringify({ video_url: link }),
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_X_API_KEY!,
                }
            }
            // start loading // 
            setisLoading(() => true);
            const response: Response = await fetch(meta_url, fetchOptions); // resolved or rejected - > still here ,not catch in catch(err) but show in console // 
            const responseData = await response.json();

            // if error accured! // 
            if (!response.ok) {
                throw new Error(responseData?.error || 'something went wrong!');
            }

            setMetadata(responseData);
            setisLoading(() => false);

            if (isError) {
                setisError('');
            }
            // stop loading // 

        }
        catch (err) {
            setisError((err as Error)?.message);
            setisLoading(() => false);
            console.log('error-', err);
        }
    }

    const st_downloading = (format: string): void => {
        if (isLoading) {
            generateToast('you cant terminate current Process like this!',toast.warn);
            return;
        }
        Cookies.set('meta_data', JSON.stringify({ link, video_title: metaData?.title, format }));
        router.push(`/download`);
    }


    const generateToast = (message:string,type:any): void => {
        type(message, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Flip,
        })
    }

    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="light"
                transition={Flip}
            />
            <div className="w-4/5 mx-auto min-h-[100vh] bg-white flex flex-col gap-y-5 items-center py-10">
                {/* heading + input seach box */}
                <div className="box-content py-10  min-w-2xl">
                    <h1 className="mb-7 text-center text-2xl font-medium text-slate-700 drop-shadow-lg">Download Video and Audio from youtube, instagram </h1>
                    <div className="flex items-center gap-x-2">
                        <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full border-2 border-slate-100 rounded-md outline-0 px-3 py-3 " type="text" placeholder="enter the url" />
                        <button disabled={isLoading} onClick={fetch_metaData} className={`cursor-pointer ${isLoading ? 'bg-slate-800/50' : 'bg-slate-800'} text-white px-6 py-3  rounded-md font-medium`}>{isLoading ? 'loading...' : 'search'}</button>
                    </div>
                </div>

                {/* meta data + downlaod options */}
                <div className="box-content py-10 min-w-2xl">

                    {/* introduction div */}
                    {(!metaData && !isError) && <div className="flex flex-col gap-y-5 text-lg font-medium drop-shadow-lg text-slate-700 text-center">
                        <h1>Simply copy and past the video url that you want to download, also you can download only one video/audio at a time.</h1>
                        <h1>Download and enjoy your video or audio with high quality</h1>
                        <h1>If you find any error, Please let us know on <span className="text-blue-400">aryandhamale07@gmail.com</span> </h1>

                    </div>}

                    {/* for meta + downlaod */}
                    {(metaData && !isError) && <div className="grid grid-cols-2 gap-x-8">
                        {/* Thumbnail */}
                        <div className="flex flex-col gap-y-5 items-center justify-center">
                            <Image className="w-sm h-[350px] object-cover rounded-md" width={480} height={360} src={metaData.thumbnail!} alt="This is a Thumbnail" />
                            <h3 className="text-slate-700 font-medium text-center">{metaData.title} - <span>{metaData.duration}sec</span> </h3>
                        </div>
                        {/* options */}
                        <div className="flex flex-col gap-y-5">
                            <h1 className="w-full text-center font-medium text-slate-700 drop-shadow-2xl">Available download options</h1>

                            {metaData.download_format && Object.entries(metaData.download_format).map(([key, value], idx) => <div key={`${key}-${idx}`} className="flex items-center justify-center gap-x-2">
                                <button onClick={() => st_downloading(`${value}`)} className="w-[100px] text-center py-2 rounded-md cursor-pointer bg-green-400 hover:bg-green-400/90 text-white">{value}px</button>
                                <h2 className="text-sm font-medium ">For <span className="text-rose-500">.mp4</span> only</h2>
                            </div>)}

                            <div className="flex items-center justify-center gap-x-2">
                                <button onClick={() => st_downloading('bestaudio')} className="w-[100px] text-center py-2 rounded-md cursor-pointer bg-green-400 hover:bg-green-400/90 text-white">audio</button>
                                <h2 className="text-sm font-medium ">For <span className="text-rose-500">.mp3</span> only</h2>
                            </div>


                        </div>
                    </div>}

                    {/* for error */}
                    {(isError) && <div className=" border drop-shadow-lg rounded-lg border-red-400 box-content py-10 w-2xl flex items-center justify-center">
                        <h1 className="text-center text-red-500 font-medium text-lg">{isError}</h1>
                    </div>}

                </div>

            </div>
        </>
    );
}

export default MetaDataCom;