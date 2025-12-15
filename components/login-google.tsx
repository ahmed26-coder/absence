"use client"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export default function LoginGoogle() {
    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <>
            <div className="flex items-center gap-2 my-2">
                <hr className="flex-1 border-t border-gray-300" />
                <p className="text-gray-500 whitespace-nowrap px-2">أو تابع مع</p>
                <hr className="flex-1 border-t border-gray-300" />
            </div>

            <button
                onClick={signInWithGoogle}
                className="px-4 w-full cursor-pointer py-1 border-2 rounded"
            >
                تسجيل بجوجل
                <Image priority src="/google.svg" width={25} height={25} alt="Google" className=" mr-2 inline-block" />
            </button>
        </>

    )
}
