"use client";
import Link from "next/link";
import {SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

function Navbar() {
    return (
        <nav className="sticky z-[100] top-0 h-17 border-b-1 drop-shadow-md bg-white border-slate-100 flex items-center justify-between px-10">
            <div>
                <h1 className="text-2xl text-slate-700 font-bold tracking-wide italic drop-shadow-lg"> <Link href={'/'}>Dynamide</Link> </h1>
            </div>
            <div className="flex items-center gap-x-3">
                <SignedOut>
                    <SignInButton>
                        <button className="bg-slate-800 text-white rounded-full font-medium text-sm  py-2 px-5 cursor-pointer">Sign In</button>
                    </SignInButton>
                    <SignUpButton>
                        <button className="bg-slate-800 text-white rounded-full font-medium text-sm  py-2 px-5 cursor-pointer">Sign Up</button>
                    </SignUpButton>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                    <button className="bg-slate-800 text-white rounded-full font-medium text-sm  py-2 px-5 cursor-pointer">history</button>
                </SignedIn>
            </div>
        </nav>
    );
}

export default Navbar;