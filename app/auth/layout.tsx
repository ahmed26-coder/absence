import { Ta2seelLogo } from "@/components/ta2seel-logo"
import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-muted/30 p-5">
            <div className="w-full max-w-md ">
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="mb-3 flex flex-col items-center">
                        <Ta2seelLogo animated size="max" />
                    </Link>
                </div>

                {children}

                <div className="text-center mt-5 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary underline underline-offset-4">
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
            </div>
        </div>
    )
}
